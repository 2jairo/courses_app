use utoipa::OpenApi;



#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::endpoints::auth::register,
        crate::routes::endpoints::auth::login,
        crate::routes::endpoints::auth::get_user_profile,
        crate::routes::endpoints::auth::refresh_access_token,
        crate::routes::endpoints::auth::logout,

        crate::routes::endpoints::auth_internal::authenticate_client_access_token,

        crate::routes::endpoints::user::get_users_by_prefix,
    )
)]
pub struct ApiDocs;