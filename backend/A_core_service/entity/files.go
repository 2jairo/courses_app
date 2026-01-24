package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FileKind string
type FileStatus string

const (
	FileKindImage FileKind = "Image"
	FileKindVideo FileKind = "Video"
	FileKindOther FileKind = "Other"
)

func (v FileKind) IsValid() bool {
	return v == FileKindImage || v == FileKindVideo || v == FileKindOther
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
	entitycommon.Model
	UpdatedAt    time.Time      `gorm:"type:timestamptz;not null;default:now()"`
	UserID       int64          `gorm:"not null"`
	CourseID     int64          `gorm:"not null"`
	Kind         FileKind       `gorm:"type:FileKind;not null"`
	Status       FileStatus     `gorm:"type:FileStatus;not null;default:'Pending'"`
	OriginalName string         `gorm:"type:varchar(255);not null"`
	RawFileName  string         `gorm:"type:varchar(50);not null"`
	FileSize     int64          `gorm:"not null"`
	Metadata     datatypes.JSON `gorm:"type:jsonb;not null;default:'{}'::jsonb"`

	// relations
	Videos []LectureVideo `gorm:"foreignKey:FileID"`
	Assets []LectureAsset `gorm:"goreginKey:FileID"`
	User   User
	Course Course
}

type FilePreloadOptions struct {
	Videos bool
	User   bool
	Course bool
	Assets bool
	LectureAssetPreloadOptions
}

func (p *FilePreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Videos {
		query.Preload(prefix + "Videos")
	}
	if p.User {
		query.Preload(prefix + "User")
	}
	if p.Course {
		query.Preload(prefix + "Course")
	}
	if p.Assets {
		query.Preload(prefix + "Assets")
		p.LectureAssetPreloadOptions.Preload(query, prefix+"Assets.")
	}
}
