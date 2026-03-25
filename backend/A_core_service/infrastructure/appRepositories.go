package infrastructure

import (
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure/repository"
)

type AppRepositories struct {
	dbs      *db.DatabasesConnection
	txActive bool

	User              repository.UserRepository
	Course            repository.CourseRepository
	CoursePurchase    repository.CoursePurchaseRepository
	CoursePermissions repository.CoursePermissionsRepository
	CourseSection     repository.CourseSectionRepository
	CourseProgress    repository.CourseProgressRepository
	CourseReview      repository.CourseReviewRepository
	FavoriteCourse    repository.FavoriteCourseRepository
	PaymentMethod     repository.PaymentMethodRepository
	Lecture           repository.LectureRepository
	LectureComment    repository.LectureCommentRepository
	LectureVideo      repository.LectureVideoRepository
	LectureDocument   repository.LectureDocumentRepository
	LectureAsset      repository.LectureAssetRepository
	LectureQuiz       repository.LectureQuizRepository
	QuizQuestion      repository.QuizQuestionRepository
	QuizAttempt       repository.QuizAttemptRepository
	QuizAttemptAnswer repository.QuizAttemptAnswerRepository
	File              repository.FileRepository
	Analytics         repository.AnalyticsRepository
	ShoppingCart      repository.ShoppingCartRepository
	ShoppingCartItem  repository.ShoppingCartItemRepository
	Order             repository.OrderRepository
	OrderItem         repository.OrderItemRepository
	Payment           repository.PaymentRepository
	CourseGiftCode    repository.CourseGiftCodeRepository
}

func NewAppRepositories(dbs *db.DatabasesConnection, txActive bool) *AppRepositories {
	return &AppRepositories{
		dbs:      dbs,
		txActive: txActive,

		User:              repository.UserRepository{Db: dbs},
		Course:            repository.CourseRepository{Db: dbs},
		CoursePurchase:    repository.CoursePurchaseRepository{Db: dbs},
		CoursePermissions: repository.CoursePermissionsRepository{Db: dbs},
		CourseSection:     repository.CourseSectionRepository{Db: dbs},
		CourseProgress:    repository.CourseProgressRepository{Db: dbs},
		CourseReview:      repository.CourseReviewRepository{Db: dbs},
		FavoriteCourse:    repository.FavoriteCourseRepository{Db: dbs},
		PaymentMethod:     repository.PaymentMethodRepository{Db: dbs},
		Lecture:           repository.LectureRepository{Db: dbs},
		LectureComment:    repository.LectureCommentRepository{Db: dbs},
		LectureVideo:      repository.LectureVideoRepository{Db: dbs},
		LectureDocument:   repository.LectureDocumentRepository{Db: dbs},
		LectureAsset:      repository.LectureAssetRepository{Db: dbs},
		LectureQuiz:       repository.LectureQuizRepository{Db: dbs},
		QuizQuestion:      repository.QuizQuestionRepository{Db: dbs},
		QuizAttempt:       repository.QuizAttemptRepository{Db: dbs},
		QuizAttemptAnswer: repository.QuizAttemptAnswerRepository{Db: dbs},
		File:              repository.FileRepository{Db: dbs},
		Analytics:         repository.AnalyticsRepository{Db: dbs},
		ShoppingCart:      repository.ShoppingCartRepository{Db: dbs},
		ShoppingCartItem:  repository.ShoppingCartItemRepository{Db: dbs},
		Order:             repository.OrderRepository{Db: dbs},
		OrderItem:         repository.OrderItemRepository{Db: dbs},
		Payment:           repository.PaymentRepository{Db: dbs},
		CourseGiftCode:    repository.CourseGiftCodeRepository{Db: dbs},
	}
}

func (self *AppRepositories) BeginPgTx() (*AppRepositories, error) {
	if self.txActive {
		panic("Can't begin a transaction inside a transaction")
	}

	tx := self.dbs.Pg.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	newDbs := &db.DatabasesConnection{
		Pg:       tx,
		Ch:       self.dbs.Ch,
		Amqp:     self.dbs.Amqp,
		AmqpConn: self.dbs.AmqpConn,
		Stripe:   self.dbs.Stripe,
	}
	return NewAppRepositories(newDbs, true), nil

}

func (self *AppRepositories) BeginPgTxCallback(cb func(repo *AppRepositories) (any, error)) (any, error) {
	repo, err := self.BeginPgTx()
	if err != nil {
		return nil, err
	}

	resp, err := cb(repo)
	if err != nil {
		if err2 := repo.RollbackPgTx(); err2 != nil {
			return nil, err2
		}
		return nil, err
	}

	commitErr := repo.CommitPgTx()
	return resp, commitErr
}

func (self *AppRepositories) RollbackPgTx() error {
	if !self.txActive {
		panic("Can't rollback outside a transaction")
	}

	return self.dbs.Pg.Rollback().Error
}

func (self *AppRepositories) CommitPgTx() error {
	if !self.txActive {
		panic("Can't commit outside a transaction")
	}

	return self.dbs.Pg.Commit().Error
}
