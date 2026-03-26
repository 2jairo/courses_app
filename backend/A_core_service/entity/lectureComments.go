package entity

import (
	"time"

	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"gorm.io/gorm"
)

type LectureComment struct {
	entitycommon.Model
	UpdatedAt time.Time `gorm:"type:timestamptz;not null;default:now()"`

	LectureID       entitycommon.Id
	AuthorID        entitycommon.Id
	ParentCommentID *entitycommon.Id
	ReplyCount      int32
	ReplyFromStaff  bool
	AuthorIsStaff   bool
	Body            string `gorm:"type:text;not null"`

	Author        *User            `gorm:"foreignKey:AuthorID"`
	Lecture       *Lecture         `gorm:"foreignKey:LectureID"`
	ParentComment *LectureComment  `gorm:"foreignKey:ParentCommentID"`
	Replies       []LectureComment `gorm:"foreignKey:ParentCommentID"`
}

func (LectureComment) TableName() string {
	return "lecture_comments"
}

type LectureCommentPreloadOptions struct {
	Author        bool
	Lecture       bool
	ParentComment bool
	Replies       bool
}

func (p *LectureCommentPreloadOptions) Preload(query *gorm.DB, prefix string) {
	if p.Author {
		query.Preload(prefix + "Author")
	}
	if p.Lecture {
		query.Preload(prefix + "Lecture")
	}
	if p.ParentComment {
		query.Preload(prefix + "ParentComment")
	}
	if p.Replies {
		query.Preload(prefix + "Replies")
	}
}

func (l *LectureComment) BeforeDelete(tx *gorm.DB) error {
	if tx.Statement.Unscoped {
		return nil
	}

	if len(l.Replies) > 0 {
		if err := tx.Delete(&l.Replies).Error; err != nil {
			return err
		}
	}

	return nil
}
