package entity

// Metadata video
type FileMetadataKindVideo struct {
	Duration      float32                          `json:"duration"`
	Resolutions   [][]int32                        `json:"resolutions"`
	MediaPlaylist string                           `json:"mediaPlaylist"`
	Poster        string                           `json:"poster"`
	Thumbnails    string                           `json:"thumbnails"`
	Subtitles     []FileMetadataKindVideoSubtitles `json:"subtitles"`
}
type FileMetadataKindVideoSubtitles struct {
	Native   bool   `json:"native"`
	Language string `json:"language"`
	Path     string `json:"path"`
}
