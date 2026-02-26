use utoipa::OpenApi;


#[derive(OpenApi)]
#[openapi(
    paths(
        // auth
        crate::presentation::api::endpoints::auth::register,
        crate::presentation::api::endpoints::auth::login,
        crate::presentation::api::endpoints::auth::get_user_profile,
        crate::presentation::api::endpoints::auth::refresh_access_token,
        crate::presentation::api::endpoints::auth::logout,

        // user
        crate::presentation::api::endpoints::user::get_users_by_prefix,

        // auth_internal
        crate::presentation::internal::endpoints::auth_internal::authenticate_client_access_token,

        // user_internal
        crate::presentation::internal::endpoints::user_internal::get_user_info,
    )
)]
pub struct ApiDocs;