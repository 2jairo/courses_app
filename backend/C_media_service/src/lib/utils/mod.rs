pub mod video_path;
pub mod image_path;
pub mod other_path;

pub fn resized_dimensions(w: u32, h: u32, to: u32) -> (u32, u32) {
    match w >= h {
        true => {
            let new_w = ((to as f32 * w as f32 / h as f32).round()) as u32;
            (new_w, to)
        }
        false => {
            let new_h = ((to as f32 * h as f32 / w as f32).round()) as u32;
            (to, new_h)
        }
    }
}