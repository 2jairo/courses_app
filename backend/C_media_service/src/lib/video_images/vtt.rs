use std::{fs::File, io::{self, Write}, path::PathBuf};
use gstreamer::ClockTime;

use crate::lib::utils::split_clock_time;

pub struct VttThumbnails {
    file: File
}
impl VttThumbnails {
    pub fn new(vtt_file_path: &PathBuf) -> io::Result<Self> {
        let mut file= File::create_new(vtt_file_path)?;
        writeln!(file, "WEBVTT")?;

        Ok(Self { file })
    } 

    pub fn write_thumbnail(
        &mut self, 
        start: ClockTime, 
        end: ClockTime, 
        img_name: &String, 
        x: u32, 
        y: u32, 
        w: u32, 
        h: u32
    ) -> io::Result<()> {
        let (ss, sm, sh) = split_clock_time(&start);
        let (es, em, eh) = split_clock_time(&end);

        writeln!(self.file, "{sh}:{sm}:{ss}.0 --> {eh}:{em}:{es}.0")?;
        writeln!(self.file, "{img_name}#xywh={x},{y},{w},{h}\n")?;

        Ok(())
    }
}



pub struct VttSubtitles {
    file: File,
}

impl VttSubtitles {
    pub fn new(vtt_file_path: &PathBuf) -> io::Result<Self> {
        let mut file = File::create(vtt_file_path)?;

        writeln!(file, "WEBVTT\n")?;
        Ok(Self { file })
    }

    pub fn write_subtitle(
        &mut self,
        start: f32,
        end: f32,
        text: &str,
    ) -> io::Result<()> {
        writeln!(
            self.file,
            "{} --> {}",
            Self::format_time(start),
            Self::format_time(end)
        )?;
        writeln!(self.file, "{}\n", text.trim())?;
        Ok(())
    }

    // Convert seconds (f32) to HH:MM:SS.mmm string
    fn format_time(seconds: f32) -> String {
        let total_millis = (seconds * 1000.0).round() as u32;
        let hours = total_millis / 3_600_000;
        let minutes = (total_millis % 3_600_000) / 60_000;
        let secs = (total_millis % 60_000) / 1000;
        let millis = total_millis % 1000;
        format!("{:02}:{:02}:{:02}.{:03}", hours, minutes, secs, millis)
    }
}