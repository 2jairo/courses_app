package entity

type VideoVisibility string

const (
	VideoVisibilityPrivate VideoVisibility = "Private"
	VideoVisibilityLink    VideoVisibility = "Link"
	VideoVisibilityPublic  VideoVisibility = "Public"
)

type VideoProcessingStatus string

const (
	VideoProcessingStatusUploaded    VideoProcessingStatus = "Uploaded"
	VideoProcessingStatusResolutions VideoProcessingStatus = "Resolutions"
	VideoProcessingStatusImages      VideoProcessingStatus = "Images"
	VideoProcessingStatusText        VideoProcessingStatus = "Text"
	VideoProcessingStatusReady       VideoProcessingStatus = "Ready"
	VideoProcessingStatusFailed      VideoProcessingStatus = "Failed"
)

type Video struct {
	Model
	Name          string                `gorm:"type:text;not null"`
	Duration      float64               `gorm:"type:float;not null"`
	Visibility    VideoVisibility       `gorm:"type:VideoVisibility;not null;default:'Private'"`
	Status        VideoProcessingStatus `gorm:"type:VideoProcessingStatus;not null;default:'Uploaded'"`
	FailureReason *string               `gorm:"type:text"`
}
