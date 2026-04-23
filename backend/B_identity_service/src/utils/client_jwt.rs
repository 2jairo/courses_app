use axum::http::StatusCode;
use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::Utc;
use ipinfo::IpDetails;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use utoipa::ToSchema;
use sea_orm::{ActiveModelTrait, ActiveValue::Set, ColumnTrait, Condition, EntityTrait, QueryFilter, QueryOrder};

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, LocalResult, MapErrPrint}, extract::ParsedUserAgent, models::{entity::{refresh_session, user::{self, UserSex}}, entitycommon::token_hash::TokenHash}, state::DatabasesConnection, utils::{generate_uuid::generate_uuid}};

#[derive(Serialize, Deserialize, Debug)]
pub struct ClientJwtClaims {
    exp: usize, // expiration time
    iat: usize, // issued at

    pub user_id: i64,
    pub session_version: i64,
    pub family_id: String,
    pub analytics: ClientJwtAnalytics   
}

#[derive(Deserialize, Serialize, Clone, Default, Debug, ToSchema)]
pub struct ClientJwtAnalytics {
    pub sex: UserSex,
    pub birth_date: chrono::DateTime<Utc>,
    pub city: String,
    pub country: String,
}

const USER_ACTIVE_WINDOW_SECONDS: u64 = 5 * 60; // 5min 

#[derive(Clone)]
pub struct ClientJwtRepository {
    dbs: DatabasesConnection
}
impl ClientJwtRepository {
    pub fn new(dbs: DatabasesConnection) -> Self {
        Self { dbs }
    }

    pub async fn validate_access_token(&mut self, token_str: &str) -> LocalResult<ClientJwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());

        let claims = decode::<ClientJwtClaims>(token_str, &key, &Validation::default())
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))?
            .claims;

        let session_version: Option<i64> = self.dbs.rd.get(format!("at:{}", claims.family_id))
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        if let Some(sv) = session_version {
            if sv != claims.session_version {
                return Err(LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))
            }
        } else {
            return Err(LocalErr::new(LocalErrKind::InvalidAccessToken, StatusCode::UNAUTHORIZED))
        }

        let _: () = self.dbs.rd.set_ex(
            format!("at:{}:active", claims.family_id),
            1,
            USER_ACTIVE_WINDOW_SECONDS
        ).await.map_err_print(|_|
            LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR)
        )?;

        Ok(claims)
    }
    
    pub async fn validate_refresh_token(&self, token_str: &str, ua: ParsedUserAgent) -> LocalResult<ClientJwtClaims> {
        let key = DecodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        let claims = decode::<ClientJwtClaims>(token_str, &key, &Validation::default())
            .map_err_print(|_| LocalErr::new(LocalErrKind::InvalidRefreshToken, StatusCode::UNAUTHORIZED))?
            .claims;

        let condition = Condition::all()
            .add(refresh_session::Column::DeletedAt.is_null())
            .add(refresh_session::Column::FamilyId.eq(&claims.family_id))
            .add(refresh_session::Column::Revoked.eq(false));

        let refresh_sess = refresh_session::Entity::find()
            .filter(condition)
            .one(&self.dbs.pg)
            .await
            .map_err_print(|e| LocalErr::from(e))?
            .ok_or(LocalErr::new(LocalErrKind::InvalidRefreshToken, StatusCode::UNAUTHORIZED))?;

        if refresh_sess.os != ua.os || refresh_sess.browser != ua.browser || refresh_sess.device != ua.device {
            return Err(LocalErr::new(LocalErrKind::Unauthorized, StatusCode::UNAUTHORIZED))
        }
        refresh_sess.token_hash.compare(token_str)?;
        Ok(claims)
    }

    pub async fn generate_access_token_from_user(&mut self, user: &user::Model, session_version: i64, family_id: String, ip_details: IpDetails) -> LocalResult<String> {
        self.generate_access_token(user.id, session_version, family_id, ClientJwtAnalytics { 
            sex: user.sex,
            birth_date: user.birth_date.and_hms_opt(0, 0, 0).unwrap().and_utc(),
            city: ip_details.city,
            country: ip_details.country
        }).await
    }

    pub async fn generate_access_token(&mut self, user_id: i64, session_version: i64, family_id: String, analytics: ClientJwtAnalytics) -> LocalResult<String> {
        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_access_exp_time).timestamp() as usize;
        let claims = ClientJwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            family_id: family_id.clone(),
            analytics,
            session_version
        };
        let key = EncodingKey::from_secret(CONFIG.jwt_access_secret.as_bytes());

        let token = encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        let _: () = self.dbs.rd.set_ex(
            format!("at:{family_id}"),
            session_version,
            CONFIG.jwt_access_exp_time.num_seconds() as u64
        ).await.map_err_print(|_|
            LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR)
        )?;
        let _: () = self.dbs.rd.set_ex(
            format!("at:{family_id}:active"),
            1,
            USER_ACTIVE_WINDOW_SECONDS
        ).await.map_err_print(|_|
            LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR)
        )?;
        
        Ok(token)
    }

    pub async fn logout_current_session(&mut self, family_id: &String) -> LocalResult<Cookie<'static>> {
        // remove access
        let _: () = self.dbs.rd.del(format!("at:{family_id}"))
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        let _: () = self.dbs.rd.del(format!("at:{family_id}:active"))
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        // revoke refresh
        let session_active = refresh_session::ActiveModel {
            revoked: Set(true),
            ..Default::default()
        };

        let condition = Condition::all()
            .add(refresh_session::Column::DeletedAt.is_null())
            .add(refresh_session::Column::FamilyId.eq(family_id))
            .add(refresh_session::Column::Revoked.eq(false));

        refresh_session::Entity::update_many()
            .set(session_active)
            .filter(condition)
            .exec(&self.dbs.pg)
            .await?;

        Ok(Self::build_refresh_cookie(String::new()))
    }

    pub async fn logout_all_sessions(&mut self, user_id: i64) -> LocalResult<Cookie<'static>> {
        // revoke refreshes
        let session_active = refresh_session::ActiveModel {
            revoked: Set(true),
            ..Default::default()
        };

        let condition = Condition::all()
            .add(refresh_session::Column::DeletedAt.is_null())
            .add(refresh_session::Column::UserId.eq(user_id))
            .add(refresh_session::Column::Revoked.eq(false));

        let revoked_sessions_family_id = refresh_session::Entity::update_many()
            .set(session_active)
            .filter(condition)
            .exec_with_returning(&self.dbs.pg)
            .await?
            .into_iter()
            .flat_map(|model| [
                format!("at:{}", model.family_id),
                format!("at:{}:active", model.family_id),
            ])
            .collect::<Vec<_>>();

        let _: () = self.dbs.rd.del(revoked_sessions_family_id)
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        Ok(Self::build_refresh_cookie(String::new()))
    }

    pub async fn get_user_sessions(&self, user_id: i64) -> LocalResult<Vec<refresh_session::Model>> {
        let condition = Condition::all()
            .add(refresh_session::Column::DeletedAt.is_null())
            .add(refresh_session::Column::UserId.eq(user_id))
            .add(refresh_session::Column::Revoked.eq(false));

        refresh_session::Entity::find()
            .filter(condition)
            .order_by(refresh_session::Column::CreatedAt, sea_orm::Order::Desc)
            .all(&self.dbs.pg)
            .await
            .map_err_print(|e| LocalErr::from(e))
    }

    pub async fn is_online(&mut self, family_id: &String) -> LocalResult<bool> {
        self.dbs.rd.exists(format!("at:{family_id}:active"))
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))
    }

    pub async fn generate_refresh_token_from_user(
        &self, 
        user: &user::Model, 
        ua: ParsedUserAgent, 
        ip_details: IpDetails,
    ) -> LocalResult<(Cookie<'static>, refresh_session::Model)> {
        self.generate_refresh_token(user.id, ua, ClientJwtAnalytics { 
            sex: user.sex, 
            birth_date: user.birth_date.and_hms_opt(0, 0, 0).unwrap().and_utc(),
            city: ip_details.city.clone(),
            country: ip_details.country.clone(),
        }, ip_details).await
    }

    pub async fn generate_refresh_token(
        &self, 
        user_id: i64,
        ua: ParsedUserAgent, 
        analytics: ClientJwtAnalytics,
        ip_details: IpDetails,
    ) -> LocalResult<(Cookie<'static>, refresh_session::Model)> {
        let session_version = 0;
        let family_id = generate_uuid();

        let iat = Utc::now();
        let exp = (iat + CONFIG.jwt_refresh_exp_time).timestamp() as usize;
        let claims = ClientJwtClaims {
            exp, 
            iat: iat.timestamp() as usize,
            user_id,
            session_version,
            family_id: family_id.clone(),
            analytics
        };

        let key = EncodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        let token = encode(&Header::default(), &claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        let refresh_sess = refresh_session::ActiveModel {
            browser: Set(ua.browser),
            device: Set(ua.device),
            os: Set(ua.os),
            user_id: Set(user_id),
            token_hash: Set(TokenHash::new(token.as_str())),
            session_version: Set(session_version as i32),
            family_id: Set(family_id),
            city: Set(ip_details.city),
            country: Set(ip_details.country),
            ip: Set(ip_details.ip),
            ..Default::default()
        };
        let refresh_session = refresh_sess.insert(&self.dbs.pg)
            .await
            .map_err_print(|e| LocalErr::from(e))?;

        let cookie = Self::build_refresh_cookie(token);
        Ok((cookie, refresh_session))
    }

    pub async fn rotate_refresh_token(&mut self, old_claims: &ClientJwtClaims, ip_details: IpDetails) -> LocalResult<(Cookie<'static>, refresh_session::Model)> {
        let new_session_version = old_claims.session_version + 1;
        
        let new_claims = ClientJwtClaims {
            exp: old_claims.exp,
            iat: Utc::now().timestamp() as usize,
            user_id: old_claims.user_id,
            session_version: new_session_version,
            family_id: old_claims.family_id.clone(),
            analytics: old_claims.analytics.clone()
        };

        let key = EncodingKey::from_secret(CONFIG.jwt_refresh_secret.as_bytes());
        let token = encode(&Header::default(), &new_claims, &key)
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        // remove access
        let _: () = self.dbs.rd.del(&[
            format!("at:{}", old_claims.family_id), 
            format!("at:{}:active", old_claims.family_id)
        ])
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;

        // update refresh session
        let session_active = refresh_session::ActiveModel {
            token_hash: Set(TokenHash::new(token.as_str())),
            session_version: Set(new_session_version as i32),
            city: Set(ip_details.city),
            country: Set(ip_details.country),
            ip: Set(ip_details.ip),
            ..Default::default()
        };

        let condition = Condition::all()
            .add(refresh_session::Column::DeletedAt.is_null())
            .add(refresh_session::Column::FamilyId.eq(&old_claims.family_id))
            .add(refresh_session::Column::Revoked.eq(false));

        let refresh_session = refresh_session::Entity::update_many()
            .set(session_active)
            .filter(condition)
            .exec_with_returning(&self.dbs.pg)
            .await?
            .pop()
            .ok_or(LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;
        
        let cookie = Self::build_refresh_cookie(token);
        Ok((cookie, refresh_session))
    }

    fn build_refresh_cookie(token: String) -> Cookie<'static> {
        Cookie::build((CONFIG.jwt_refresh_cookie_name.clone(), token))
            .http_only(true)
            .expires(OffsetDateTime::now_utc() + time::Duration::days(CONFIG.jwt_refresh_exp_time.num_days()))
            .path("/")
            .domain(CONFIG.jwt_domain.clone())
            .secure(true)
            .same_site(SameSite::Lax)
            .build()
    }
}
