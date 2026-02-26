use std::collections::HashMap;

use axum::http::StatusCode;
use validator::Validate;

use crate::error::{LocalErr, LocalErrKind};

pub fn validate_helper<T: Validate>(value: &T) -> Result<(), (StatusCode, LocalErr)> {
    if let Err(v) = value.validate() {
        let mut fields = HashMap::with_capacity(v.field_errors().len());
        for (field, err) in v.field_errors() {
            let errors = err.iter().map(|e| e.code.to_string()).collect::<Vec<_>>();
            fields.insert(field.to_string(), errors);
        }
        
        let err = LocalErr::new(
            LocalErrKind::ValidationRejection { fields },
            StatusCode::UNPROCESSABLE_ENTITY,
        );
        return Err((StatusCode::UNPROCESSABLE_ENTITY, err));
    }

    Ok(())
}
