use utoipa::OpenApi;



#[derive(OpenApi)]
#[openapi(
    paths(
        crate::routes::endpoints::auth::register,
        crate::routes::endpoints::auth::login,
        crate::routes::endpoints::auth::get_user_profile,
        crate::routes::endpoints::auth::refresh_access_token,
    )
)]
pub struct ApiDocs;