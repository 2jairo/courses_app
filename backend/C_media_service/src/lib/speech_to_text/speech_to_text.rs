use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperError, WhisperState};
use crate::lib::{speech_to_text::AudioExtractor, utils::paths::VideoPathStructure, video_images::vtt::VttSubtitles};

pub const LANGUAGES: [&str; 3] = [
    "en",
    "es",
    "fr",
];


pub struct SpeechToText<'a> {
    paths: &'a VideoPathStructure,
    state: WhisperState,
    data: Vec<f32>,
}
impl<'a> SpeechToText<'a> {
    pub fn new(ctx: &WhisperContext, paths: &'a VideoPathStructure) -> Result<Self, WhisperError> {
        Ok(Self {
            paths,
            data: vec![],
            state: ctx.create_state()?,
        })
    }

    pub fn load_file(&mut self) -> anyhow::Result<()> {
        let audio_extractor = AudioExtractor::new(self.paths);
        self.data = audio_extractor.extract_audio()?;

        Ok(())
    }

    pub fn detect_language(&mut self) -> Result<i32, WhisperError> {
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 0 });
        params.set_detect_language(true);

        params.set_print_progress(false);
        params.set_print_timestamps(false);

        self.state.pcm_to_mel(&self.data, 1)?;
        let (lang, _) = self.state.lang_detect(0, 1)?;

        Ok(lang)
    }

    pub fn transcript(&mut self, lang: &str) -> anyhow::Result<()> {
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 0 });
        params.set_print_progress(false);
        params.set_print_timestamps(false);

        // if !is_lang_native {
        //     params.set_translate(true);
        // }
        params.set_language(Some(lang));

        self.state.full(params, &self.data)?;
        
        
        let mut vtt = VttSubtitles::new(&self.paths.root_subtitles_langvtt(lang))?;
        for segment in self.state.as_iter() {
            let start = segment.start_timestamp() as f32 / 100.0;
            let end = segment.end_timestamp() as f32 / 100.0;

            vtt.write_subtitle(start, end, &segment.to_string())?;
        }
        Ok(())
    }
}