use std::net::SocketAddr;

use axum::{extract::{ConnectInfo, FromRequestParts}, http::{StatusCode, request::Parts}};
use ipinfo::IpDetails;

use crate::{config::CONFIG, error::{LocalErr, LocalErrKind, MapErrPrint}, state::AppState};

const X_FORWARDED_FOR: &str = "X-Forwarded-For";

pub struct GeoLocated(pub IpDetails);

impl FromRequestParts<AppState> for GeoLocated
{
    type Rejection = LocalErr;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let ip = match parts.headers.get(X_FORWARDED_FOR) {
            Some(h) => {
                h.to_str()
                    .map_err_print(|_| LocalErr::new(LocalErrKind::BadRequest, StatusCode::BAD_REQUEST))?
                    .to_string()
            },
            None => {
                let ConnectInfo(addr) = ConnectInfo::<SocketAddr>::from_request_parts(parts, state)
                    .await
                    .map_err_print(|_| LocalErr::new(LocalErrKind::BadRequest, StatusCode::BAD_REQUEST))?;

                addr.ip().to_string()
            }
        };

        let mut state = state.clone();
        let mut ip_details = state.ip_info.lookup(ip.as_str())
            .await
            .map_err_print(|_| LocalErr::new(LocalErrKind::Code500, StatusCode::INTERNAL_SERVER_ERROR))?;
        
        if ip_details.bogon.is_some_and(|b| b) {
            ip_details.country = CONFIG.ipinfoio_default_country.clone();
            ip_details.city = CONFIG.ipinfoio_default_city.clone()
        }

        Ok(Self(ip_details))
    }
}