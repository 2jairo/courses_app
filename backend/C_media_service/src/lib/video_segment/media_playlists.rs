use std::{collections::{HashMap, VecDeque}, fs::File, io::{self, Seek, Write}, path::PathBuf};

use crate::lib::video_segment::resolutions::ResFrameBitrate;

pub struct MediaPlaylists {
    file: File,
    segments_bandwith: HashMap<usize, Vec<u64>>,
    resolutions: VecDeque<String>
}
impl MediaPlaylists {
    const HEADER: &str = "#EXTM3U\n";

    pub fn new(media_playlists_path: &PathBuf) -> io::Result<Self> {
        let mut file = File::create(media_playlists_path)?;

        file.write_all(Self::HEADER.as_bytes())?;
       
        Ok(Self {
            file,
            segments_bandwith: HashMap::default(),
            resolutions: VecDeque::new()
        })
    }

    pub fn add_segment(&mut self, res_idx: usize, bytes: u64, ns: u64) {
        let secs = ns as f64 / 1_000_000_000.0;
        let bw = (bytes * 8) as f64 / secs as f64;

        self.segments_bandwith.entry(res_idx).or_default()
            .push(bw as u64);
    }

    pub fn write_resolution(&mut self, res_idx: usize, r: &ResFrameBitrate) -> io::Result<()> {
        let mut new_content = String::from("#EXT-X-STREAM-INF:");

        if let Some(segments) = self.segments_bandwith.remove(&res_idx) {
            if !segments.is_empty() {
                let max = *segments.iter().max().unwrap();
                let avg = segments.iter().sum::<u64>() / segments.len() as u64;
                
                new_content.push_str(&format!("BANDWIDTH={max},AVERAGE-BANDWIDTH={avg},"));
            }
        }
        new_content.push_str(&format!("RESOLUTION={}x{},FRAME-RATE={}\n", r.w, r.h, r.target_framerate));
        new_content.push_str(&format!("{}_{}/index.m3u8\n", r.h, r.target_framerate));
        self.resolutions.push_front(new_content);
        self.write()
    }

    fn write(&mut self) -> io::Result<()> {
        self.file.seek(io::SeekFrom::Start(0))?;
        self.file.write_all(Self::HEADER.as_bytes())?;

        for r in self.resolutions.iter() {
            self.file.write_all(r.as_bytes())?;
        }
        Ok(())
    } 
}