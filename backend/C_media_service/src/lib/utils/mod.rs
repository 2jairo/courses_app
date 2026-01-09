pub mod paths;
use gstreamer::ClockTime;

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

pub fn split_clock_time(t: &ClockTime) -> (u64, u64, u64) {
    let secs = t.seconds();

    let hours = secs / 3600;
    let mins = (secs % 3600) / 60;
    let seconds = secs % 60;

    (seconds, mins, hours)
}
