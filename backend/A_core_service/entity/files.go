package entity

import (
	"time"

	"gorm.io/datatypes"
)

type FileKind string
type FileStatus string

const (
	FileKindImage    FileKind = "Image"
	FileKindVideo    FileKind = "Video"
	FileKindDocument FileKind = "Document"
	FileKindOther    FileKind = "Other"
)

func (v FileKind) IsValid() bool {
	return v == FileKindImage || v == FileKindVideo || v == FileKindDocument || v == FileKindOther
}

const (
	FileStatusPending    FileStatus = "Pending"
	FileStatusProcessing FileStatus = "Processing"
	FileStatusReady      FileStatus = "Ready"
	FileStatusFailed     FileStatus = "Failed"
)

func (v FileStatus) IsValid() bool {
	return v == FileStatusPending || v == FileStatusProcessing || v == FileStatusReady || v == FileStatusFailed
}

type File struct {
	Model
	UpdatedAt    time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	UserID       int64          `gorm:"not null"`
	CourseID     int64          `gorm:"not null"`
	Kind         FileKind       `gorm:"type:FileKind;not null"`
	Status       FileStatus     `gorm:"type:FileStatus;not null;default:'Pending'"`
	OriginalName string         `gorm:"type:varchar(255);not null"`
	FilePath     string         `gorm:"type:varchar(255);not null"`
	FileSize     int64          `gorm:"not null"`
	Metadata     datatypes.JSON `gorm:"type:jsonb;not null;default:'{}'::jsonb"`

	// relations
	Videos []LectureVideo `gorm:"foreignKey:VideoID"`
	User   User
	Course Course
}
