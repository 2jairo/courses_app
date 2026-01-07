package entity

type LectureVideo struct {
	Model
	VideoID int64 `gorm:"not null"`

	// relations
	Video File
}
