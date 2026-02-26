use uuid::Uuid;
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};

pub fn generate_uuid() -> String {
    let uuid = Uuid::now_v7();
    URL_SAFE_NO_PAD.encode(uuid.as_bytes())
}