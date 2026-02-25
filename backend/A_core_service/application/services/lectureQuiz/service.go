package lecturequiz

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/infrastructure"
	"github.com/2jairo/courses_app/backend/A_core_service/localerror"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type LectureQuizService struct {
	Repo  *infrastructure.AppRepositories
	Utils *utils.AppUtils
}

// GetQuizCourseId returns the CourseId for a given QuizId (via lecture) for permission checking
func (s *LectureQuizService) GetQuizCourseId(quizId entitycommon.Id) (entitycommon.Id, error) {
	// quiz ID == q.Data, find q by Data field
	q := &entity.LectureQuiz{Model: entitycommon.Model{ID: quizId}}
	if err := s.Repo.LectureQuiz.FindOne(q, entity.LectureQuizPreloadOptions{}); err != nil {
		return 0, err
	}
	return q.CourseID, nil
}

// GetQuestionCourseId returns the CourseId for a given QuestionId (via quiz -> lecture) for permission checking
func (s *LectureQuizService) GetQuestionCourseId(questionId entitycommon.Id) (entitycommon.Id, error) {
	question := &entity.QuizQuestion{Model: entitycommon.Model{ID: questionId}}
	if err := s.Repo.QuizQuestion.FindOne(question, entity.QuizQuestionPreloadOptions{}); err != nil {
		return 0, err
	}
	return s.GetQuizCourseId(question.QuizID)
}

// GetLectureCourseId returns the CourseId for a given LectureId for permission checking
func (s *LectureQuizService) GetLectureCourseId(lectureId entitycommon.Id) (entitycommon.Id, error) {
	lecture := &entity.Lecture{Model: entitycommon.Model{ID: lectureId}}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{CourseSection: true}); err != nil {
		return 0, err
	}
	return lecture.CourseSection.CourseID, nil
}

// CreateQuiz creates a new quiz
func (s *LectureQuizService) CreateQuiz(input CreateQuizInput) (*CreateQuizOutput, error) {
	quiz := &entity.LectureQuiz{
		CourseID: input.CourseId,
		Title:    input.Title,
	}
	if input.TimeLimitSecs != nil {
		quiz.TimeLimitSecs = input.TimeLimitSecs
	}
	if input.PassingScorePercentage != nil {
		quiz.PassingScorePercentage = *input.PassingScorePercentage
	}
	if input.ShuffleQuestions != nil {
		quiz.ShuffleQuestions = *input.ShuffleQuestions
	}
	if input.ShowCorrectAnswers != nil {
		quiz.ShowCorrectAnswers = *input.ShowCorrectAnswers
	}

	if err := s.Repo.LectureQuiz.Create(quiz, entity.LectureQuizPreloadOptions{}); err != nil {
		return nil, err
	}
	return &CreateQuizOutput{Quiz: quiz}, nil
}

// DeleteQuiz deletes a quiz and all its questions
func (s *LectureQuizService) DeleteQuiz(input DeleteQuizInput) error {
	quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: input.QuizID}}
	if err := s.Repo.LectureQuiz.FindOne(quiz, entity.LectureQuizPreloadOptions{}); err != nil {
		return err
	}

	return s.Repo.LectureQuiz.Delete(quiz)
}

// GetQuizzesByCourse retrieves all quizzes for a course with pagination and filters
func (s *LectureQuizService) GetQuizzesByCourse(input GetQuizzesInput) ([]entity.LectureQuiz, error) {
	q := ""
	if len(input.QueryByTitle) >= 3 {
		q = input.QueryByTitle
	}
	return s.Repo.LectureQuiz.FindByCourse(
		input.CourseId,
		entity.LectureQuizPreloadOptions{},
		input.Pagination,
		q,
		input.SortOrder,
		input.SortBy,
	)
}

// GetQuizDetails retrieves a single quiz by ID
func (s *LectureQuizService) GetQuizDetails(quizId entitycommon.Id) (*entity.LectureQuiz, error) {
	quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: quizId}}
	if err := s.Repo.LectureQuiz.FindOne(
		quiz,
		entity.LectureQuizPreloadOptions{Questions: true},
	); err != nil {
		return nil, err
	}
	return quiz, nil
}

// CreateQuestion creates a new question in a quiz
func (s *LectureQuizService) CreateQuestion(input CreateQuestionInput) (*CreateQuestionOutput, error) {
	// Verify quiz exists
	quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: input.QuizID}}
	if err := s.Repo.LectureQuiz.FindOne(quiz, entity.LectureQuizPreloadOptions{Questions: true}); err != nil {
		return nil, err
	}

	question := &entity.QuizQuestion{
		QuizID:       input.QuizID,
		Position:     int32(len(quiz.Questions)) + 1,
		Kind:         input.Kind,
		Status:       input.Status,
		QuestionText: input.QuestionText,
		Options:      input.Options,
		Explanation:  input.Explanation,
		Points:       input.Points,
	}

	if err := s.Repo.QuizQuestion.Create(question, entity.QuizQuestionPreloadOptions{}); err != nil {
		return nil, err
	}

	return &CreateQuestionOutput{Question: question}, nil
}

// UpdateQuestion updates a question. If Kind or Options changed, deletes the old record and creates
// a new one (preserving analytics history). Otherwise updates the existing record in-place.
func (s *LectureQuizService) UpdateQuestion(input UpdateQuestionInput) (*CreateQuestionOutput, error) {
	// Find existing question
	oldQuestion := &entity.QuizQuestion{Model: entitycommon.Model{ID: input.QuestionID}}
	if err := s.Repo.QuizQuestion.FindOne(oldQuestion, entity.QuizQuestionPreloadOptions{}); err != nil {
		return nil, err
	}

	// Resolve fields: use provided values or fall back to existing
	status := oldQuestion.Status
	if input.Status != nil {
		status = *input.Status
	}
	kind := oldQuestion.Kind
	if input.Kind != nil {
		kind = *input.Kind
	}
	questionText := oldQuestion.QuestionText
	if input.QuestionText != nil {
		questionText = *input.QuestionText
	}
	options := oldQuestion.Options
	if input.Options != nil {
		options = *input.Options
	}
	explanation := oldQuestion.Explanation
	if input.Explanation != nil {
		explanation = input.Explanation
	}
	points := oldQuestion.Points
	if input.Points != nil {
		points = *input.Points
	}

	kindChanged := input.Kind != nil && *input.Kind != oldQuestion.Kind
	optionsChanged := input.Options != nil && string(*input.Options) != string(oldQuestion.Options)

	if kindChanged || optionsChanged {
		// Delete old and create new to preserve analytics history
		if err := s.Repo.QuizQuestion.Delete(oldQuestion); err != nil {
			return nil, err
		}

		newQuestion := &entity.QuizQuestion{
			QuizID:       oldQuestion.QuizID,
			Position:     oldQuestion.Position,
			Status:       status,
			Kind:         kind,
			QuestionText: questionText,
			Options:      options,
			Explanation:  explanation,
			Points:       points,
		}

		if err := s.Repo.QuizQuestion.Create(newQuestion, entity.QuizQuestionPreloadOptions{}); err != nil {
			return nil, err
		}

		return &CreateQuestionOutput{Question: newQuestion}, nil
	}

	// Update in-place
	updated, err := s.Repo.QuizQuestion.Update(
		&entity.QuizQuestion{Model: entitycommon.Model{ID: oldQuestion.ID}},
		&entity.QuizQuestion{
			Status:       status,
			QuestionText: questionText,
			Explanation:  explanation,
			Points:       points,
		},
	)
	if err != nil {
		return nil, err
	}

	return &CreateQuestionOutput{Question: updated}, nil
}

// DeleteQuestion deletes a question and adjusts positions
func (s *LectureQuizService) DeleteQuestion(input DeleteQuestionInput) error {
	question := &entity.QuizQuestion{Model: entitycommon.Model{ID: input.QuestionID}}
	if err := s.Repo.QuizQuestion.FindOne(question, entity.QuizQuestionPreloadOptions{}); err != nil {
		return err
	}

	deletedPosition := question.Position
	quizID := question.QuizID

	// Delete the question
	if err := s.Repo.QuizQuestion.Delete(question); err != nil {
		return err
	}

	// Adjust positions of remaining questions
	remaining, err := s.Repo.QuizQuestion.Find(
		&entity.QuizQuestion{QuizID: quizID},
		entity.QuizQuestionPreloadOptions{},
	)
	if err != nil {
		return err
	}

	positions := make([]utils.Positions, 0)
	for _, q := range remaining {
		if q.Position > deletedPosition {
			positions = append(positions, utils.Positions{
				ID:       int64(q.ID),
				Position: int(q.Position - 1),
			})
		}
	}

	if len(positions) > 0 {
		if err := s.Repo.QuizQuestion.UpdatePositions(positions); err != nil {
			return err
		}
	}

	return nil
}

// UpdateQuestionPosition updates the position of a question within a quiz
func (s *LectureQuizService) UpdateQuestionPosition(input UpdateQuestionPositionInput) error {
	// Get all questions for the quiz
	questions, err := s.Repo.QuizQuestion.Find(
		&entity.QuizQuestion{QuizID: input.QuizID},
		entity.QuizQuestionPreloadOptions{},
	)
	if err != nil {
		return err
	}

	// Find old position
	oldPosition := int32(-1)
	for _, q := range questions {
		if q.ID == input.QuestionID {
			oldPosition = q.Position
			break
		}
	}
	if oldPosition == -1 {
		return &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}
	if oldPosition == input.NewPosition {
		return nil
	}

	// Adjust positions
	if oldPosition < input.NewPosition {
		for i := range questions {
			if questions[i].Position > oldPosition && questions[i].Position <= input.NewPosition {
				questions[i].Position--
			}
		}
	} else {
		for i := range questions {
			if questions[i].Position >= input.NewPosition && questions[i].Position < oldPosition {
				questions[i].Position++
			}
		}
	}

	newPositions := make([]utils.Positions, len(questions))
	for i, q := range questions {
		if q.ID == input.QuestionID {
			newPositions[i] = utils.Positions{ID: int64(q.ID), Position: int(input.NewPosition)}
		} else {
			newPositions[i] = utils.Positions{ID: int64(q.ID), Position: int(q.Position)}
		}
	}

	return s.Repo.QuizQuestion.UpdatePositions(newPositions)
}

func (s *LectureQuizService) StartAttempt(input StartAttemptInput) (*StartAttemptOutput, error) {
	// 1. Find lecture by slug
	lecture := &entity.Lecture{Slug: input.LectureSlug}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return nil, err
	}

	// 2. Verify it's a quiz lecture
	if lecture.Kind != entity.LectureKindQuiz {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	// 3. Load quiz with public (non-draft) questions
	quiz := &entity.LectureQuiz{Model: entitycommon.Model{ID: lecture.Data}}
	if err := s.Repo.LectureQuiz.FindOne(quiz, entity.LectureQuizPreloadOptions{Questions: true}); err != nil {
		return nil, err
	}

	// 4. Try to find an existing active attempt
	attempt, err := s.Repo.QuizAttempt.FindActive(
		input.UserID,
		lecture.ID,
		entity.QuizAttemptPreloadOptions{Answers: true},
	)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, err
		}

		// No active attempt — create a new one
		attempt = &entity.QuizAttempt{
			UserID:    input.UserID,
			LectureID: lecture.ID,
		}
		if quiz.TimeLimitSecs != nil {
			expiresAt := time.Now().Add(time.Duration(*quiz.TimeLimitSecs) * time.Second)
			attempt.ExpiresAt = &expiresAt
		}
		if err := s.Repo.QuizAttempt.Create(attempt); err != nil {
			return nil, err
		}
	}

	return &StartAttemptOutput{Quiz: quiz, Lecture: lecture, Attempt: attempt}, nil
}

func (s *LectureQuizService) SetAnswer(input SetAnswerInput) (*CheckAnswerOutput, error) {
	// 1. Find lecture
	lecture := &entity.Lecture{Slug: input.LectureSlug}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return nil, err
	}
	if lecture.Kind != entity.LectureKindQuiz {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	// 2. Verify active attempt exists
	attempt, err := s.Repo.QuizAttempt.FindActive(
		input.UserID,
		lecture.ID,
		entity.QuizAttemptPreloadOptions{},
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &localerror.LocalError{Err: localerror.ErrKindAttemptEnded, Status: fiber.StatusForbidden}
		}
		return nil, err
	}

	// 3. Load question and verify it belongs to this quiz
	question := &entity.QuizQuestion{Model: entitycommon.Model{ID: input.QuestionID}}
	if err := s.Repo.QuizQuestion.FindOne(question, entity.QuizQuestionPreloadOptions{}); err != nil {
		return nil, err
	}
	if question.QuizID != lecture.Data {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	// 4. Grade the answer
	pointsEarned, err := s.gradeAnswer(
		question.Kind,
		question.Options,
		input.Answer,
		question.Points,
	)
	if err != nil {
		return nil, err
	}
	isCorrect := pointsEarned > 0

	// 5. Upsert the QuizAttemptAnswer
	answerRecord := &entity.QuizAttemptAnswer{
		AttemptID:    attempt.ID,
		QuestionID:   input.QuestionID,
		IsCorrect:    isCorrect,
		PointsEarned: pointsEarned,
		Answer:       input.Answer,
	}
	if err := s.Repo.QuizAttemptAnswer.Upsert(answerRecord); err != nil {
		return nil, err
	}

	return &CheckAnswerOutput{
		IsCorrect:    isCorrect,
		PointsEarned: pointsEarned,
		Explanation:  question.Explanation,
	}, nil
}

func (s *LectureQuizService) FinishAttempt(input FinishAttemptInput) (*FinishAttemptOutput, error) {
	// 1. Find lecture by slug
	lecture := &entity.Lecture{Slug: input.LectureSlug}
	if err := s.Repo.Lecture.FindOne(lecture, entity.LecturePreloadOptions{}); err != nil {
		return nil, err
	}
	if lecture.Kind != entity.LectureKindQuiz {
		return nil, &localerror.LocalError{Err: localerror.ErrKindNotFound, Status: fiber.StatusNotFound}
	}

	// 2. Find active attempt with answers
	attempt, err := s.Repo.QuizAttempt.FindActive(
		input.UserID,
		lecture.ID,
		entity.QuizAttemptPreloadOptions{},
	)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &localerror.LocalError{Err: localerror.ErrKindAttemptEnded, Status: fiber.StatusForbidden}
		}
		return nil, err
	}

	// 3. Persist the completed attempt
	now := time.Now()
	attempt.CompletedAt = &now

	s.Repo.QuizAttempt.UpdateOne(
		&entity.QuizAttempt{Model: entitycommon.Model{ID: attempt.ID}},
		attempt,
	)

	return &FinishAttemptOutput{Attempt: attempt}, nil
}

func (self *LectureQuizService) gradeAnswer(
	questionKind entity.QuizQuestionKind,
	questionOptions datatypes.JSON,
	answer json.RawMessage,
	maxPoints int32,
) (earned float64, err error) {
	switch questionKind {
	case entity.QuizQuestionKindBoolMultiple:
		var opts entity.QuestionOptionsKindBoolMultiple
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindBoolMultiple
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}
		ans.ChoicesId = utils.RemoveDuplicates(ans.ChoicesId)

		selectedSet := make(map[string]bool, len(ans.ChoicesId))
		for _, id := range ans.ChoicesId {
			selectedSet[id] = true
		}

		totalCorrect := 0
		correctGuessed := 0
		for _, c := range opts.Choices {
			if c.Correct {
				totalCorrect++
				if selectedSet[c.Id] {
					correctGuessed++
				}
			}
		}

		if totalCorrect > 0 {
			earned = math.Floor(float64(correctGuessed) / float64(totalCorrect) * float64(maxPoints))
		}
	case entity.QuizQuestionKindBoolSingle:
		var opts entity.QuestionOptionsKindBoolSingle
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindBoolSingle
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}
		for _, c := range opts.Choices {
			if c.Correct && c.Id == ans.ChoiceId {
				earned = float64(maxPoints)
				break
			}
		}
	case entity.QuizQuestionKindTextMultiple:
		var opts entity.QuestionOptionsKindTextMultiple
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindTextMultiple
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}
		ans.ChoicesId = utils.RemoveDuplicates(ans.ChoicesId)

		selectedSet := make(map[string]bool, len(ans.ChoicesId))
		for _, id := range ans.ChoicesId {
			selectedSet[id] = true
		}

		totalCorrect := len(opts.Keywords)
		correctGuessed := 0
		for _, c := range opts.Keywords {
			if selectedSet[c.Id] {
				correctGuessed++
			}
		}

		if totalCorrect > 0 {
			earned = float64(correctGuessed) / float64(totalCorrect) * float64(maxPoints)
		}
	case entity.QuizQuestionKindTextSingle:
		var opts entity.QuestionOptionsKindTextSingle
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindTextSingle
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}

		equal := strings.EqualFold(
			strings.TrimSpace(strings.ToLower(ans.Choice)),
			strings.TrimSpace(strings.ToLower(opts.CorrectAnswer)),
		)
		if equal {
			earned = float64(maxPoints)
		}
	case entity.QuizQuestionKindMatch:
		var opts entity.QuestionOptionsKindMatch
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindMatch
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}

		ans.Choices = utils.RemoveDuplicatesWithCb(
			ans.Choices,
			func(aokmc entity.AnswerOptionsKindMatchChoice) string {
				return aokmc.KeyId
			},
		)
		ans.Choices = utils.RemoveDuplicatesWithCb(
			ans.Choices,
			func(aokmc entity.AnswerOptionsKindMatchChoice) string {
				return aokmc.ValueId
			},
		)

		correctMap := make(map[string]string, len(opts.Pairs))
		for _, p := range opts.Pairs {
			correctMap[p.KeyId] = p.ValueId
		}

		matched := 0
		for _, c := range ans.Choices {
			if correctMap[c.KeyId] == c.ValueId {
				matched++
			}
		}

		total := len(opts.Pairs)

		fmt.Printf("matched: %v\n", matched)
		fmt.Printf("total: %v\n", total)

		if total > 0 {
			earned = float64(matched) / float64(total) * float64(maxPoints)
			fmt.Printf("earned: %v\n", earned)
		}
	case entity.QuizQuestionKindOrdering:
		var opts entity.QuestionOptionsKindOrdering
		json.Unmarshal(questionOptions, &opts)

		var ans entity.AnswerOptionsKindOrdering
		if e := json.Unmarshal(answer, &ans); e != nil {
			return 0, e
		}
		if e := self.Utils.Validator.Validate(&ans); e != nil {
			return 0, e
		}
		ans.ChoicesId = utils.RemoveDuplicates(ans.ChoicesId)

		if len(ans.ChoicesId) < len(opts.Items) {
			return 0, nil
		}

		matched := 0
		for i, item := range opts.Items {
			if ans.ChoicesId[i] == item.Id {
				matched++
			}
		}

		total := len(opts.Items)
		if total > 0 {
			earned = float64(matched) / float64(total) * float64(maxPoints)
		}
	}

	return earned, nil
}
