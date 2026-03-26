package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FileKind string
type FileStatus string
type FileKindList []FileKind
type FileStatusList []FileStatus

const (
	FileKindImage FileKind = "Image"
	FileKindVideo FileKind = "Video"
	FileKindOther FileKind = "Other"
)

func (v FileKind) IsValid() bool {
	return v == FileKindImage || v == FileKindVideo || v == FileKindOther
}
func (list FileKindList) IsValid() bool {
	for _, v := range list {
		if !v.IsValid() {
			return false
		}
	}
	return true
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
func (list FileStatusList) IsValid() bool {
	for _, v := range list {
		if !v.IsValid() {
			return false
		}
	}
	return true
}

type FileSortBy string

const (
	FileSortByDate FileSortBy = "date"
	FileSortByName FileSortBy = "name"
	FileSortBySize FileSortBy = "size"
	FileSortByUser FileSortBy = "user"
)

func (s FileSortBy) IsValid() bool {
	return FileSortByDate == s ||
		FileSortByName == s ||
		FileSortBySize == s ||
		FileSortByUser == s
}
func (s FileSortBy) Column() string {
	switch s {
	case FileSortByDate:
		return "created_at"
	case FileSortByName:
		return "original_name"
	case FileSortBySize:
		return "file_size"
	case FileSortByUser:
		return "user_id"
	}
	return ""
}

type File struct {
	entitycommon.Model
	UpdatedAt    time.Time `gorm:"type:timestamptz;default:now()"`
	UserID       entitycommon.Id
	CourseID     entitycommon.Id
	Kind         FileKind   `gorm:"type:FileKind"`
	Status       FileStatus `gorm:"type:FileStatus;default:'Pending'"`
	OriginalName string
	RawFileName  string
	FileSize     int64
	Metadata     datatypes.JSON `gorm:"type:jsonb;default:'{}'::jsonb"`

	// relations
	Videos []LectureVideo `gorm:"foreignKey:FileID"`
	Assets []LectureAsset `gorm:"goreginKey:FileID"`
	User   *User          `gorm:"foreignKey:UserID"`
	Course *Course        `gorm:"foreignKey:CourseID"`
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
