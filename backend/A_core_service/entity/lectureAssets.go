package entity

type LectureAsset struct {
	Model
	LectureID int64 `gorm:"not null"`
	FileID    int64 `gorm:"not null"`

	// relations
	Lecture Lecture
	File    File
}
