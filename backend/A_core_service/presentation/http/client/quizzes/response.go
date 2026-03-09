package quizzes

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	"gorm.io/datatypes"
)

type StartQuizAttemptResponse struct {
	AttemptId              int64                              `json:"attemptId"`
	TimeLimitSecs          *int32                             `json:"timeLimitSecs"`
	ExpiresAt              *time.Time                         `json:"expiresAt"`
	PassingScorePercentage int32                              `json:"passingScorePercentage"`
	ShowCorrectAnswers     bool                               `json:"showCorrectAnswers"`
	CreatedAt              time.Time                          `json:"createdAt"`
	QuestionsAmount        int32                              `json:"questionsAmount"`
	PublicQuestionsAmount  int32                              `json:"publicQuestionsAmount"`
	Questions              []StartQuizAttemptResponseQuestion `json:"questions"`
}
type StartQuizAttemptResponseQuestion struct {
	Id           int64                   `json:"id"`
	Position     int32                   `json:"position"`
	Kind         entity.QuizQuestionKind `json:"kind"`
	QuestionText string                  `json:"questionText"`
	Points       int32                   `json:"points"`
	Options      any                     `json:"options"`
	Answer       any                     `json:"answer"`
}

type GetQuizAttemptDetailsResponse struct {
	Id                     int64                                   `json:"id"`
	PointsEarned           float64                                 `json:"pointsEarned"`
	MaxPoints              float64                                 `json:"maxPoints"`
	ScorePercentage        float64                                 `json:"scorePercentage"`
	PassingScorePercentage int32                                   `json:"passingScorePercentage"`
	Passed                 bool                                    `json:"passed"`
	CompletedAt            *time.Time                              `json:"completedAt"`
	CreatedAt              time.Time                               `json:"createdAt"`
	Questions              []GetQuizAttemptDetailsResponseQuestion `json:"questions"`
}
type GetQuizAttemptDetailsResponseQuestion struct {
	Id           int64                   `json:"id"`
	Position     int32                   `json:"position"`
	QuestionText string                  `json:"questionText"`
	Kind         entity.QuizQuestionKind `json:"kind"`
	MaxPoints    int32                   `json:"maxPoints"`
	PointsEarned float64                 `json:"pointsEarned"`
	Answer       any                     `json:"answer"`
	Correction   any                     `json:"correction"`
	Explanation  *string                 `json:"explanation"`
}

type StartQuizAttemptResponseOptionBoolMultiple struct {
	Choices []struct {
		Text string `json:"text"`
		Id   string `json:"id"`
	} `json:"choices"`
}

type StartQuizAttemptResponseOptionBoolSingle struct {
	Choices []struct {
		Text string `json:"text"`
		Id   string `json:"id"`
	} `json:"choices"`
}

type StartQuizAttemptResponseOptionTextMultiple struct {
	TotalKeywords int32 `json:"totalKeywords"`
}

type StartQuizAttemptResponseOptionTextSingle struct{}

type StartQuizAttemptResponseOptionMatch struct {
	Keys []struct {
		Value string `json:"value"`
		Id    string `json:"id"`
	} `json:"keys"`
	Values []struct {
		Value string `json:"value"`
		Id    string `json:"id"`
	} `json:"values"`
}

type StartQuizAttemptResponseOptionOrdering struct {
	Items []struct {
		Value string `json:"value"`
		Id    string `json:"id"`
	} `json:"items"`
}

// --- Correction structs ---

type CorrectionKindBoolMultiple struct {
	CorrectChoicesId []string `json:"correctChoicesId"`
}

type CorrectionKindBoolSingle struct {
	CorrectChoiceId string `json:"correctChoiceId"`
}

type CorrectionKindTextMultiple struct {
	Keywords []struct {
		Value string `json:"value"`
		Id    string `json:"id"`
	} `json:"keywords"`
}

type CorrectionKindTextSingle struct {
	CorrectAnswer string `json:"correctAnswer"`
}

type CorrectionKindMatch struct {
	Pairs []struct {
		KeyId   string `json:"keyId"`
		ValueId string `json:"valueId"`
	} `json:"pairs"`
}

type CorrectionKindOrdering struct {
	CorrectOrder []string `json:"correctOrder"`
}

func getOptions(question *entity.QuizQuestion) any {
	switch question.Kind {
	case entity.QuizQuestionKindBoolMultiple:
		var opts entity.QuestionOptionsKindBoolMultiple
		json.Unmarshal(question.Options, &opts)
		choices := make([]struct {
			Text string `json:"text"`
			Id   string `json:"id"`
		}, len(opts.Choices))
		for j, c := range opts.Choices {
			choices[j].Text = c.Text
			choices[j].Id = c.Id
		}
		return StartQuizAttemptResponseOptionBoolMultiple{Choices: choices}

	case entity.QuizQuestionKindBoolSingle:
		var opts entity.QuestionOptionsKindBoolSingle
		json.Unmarshal(question.Options, &opts)
		choices := make([]struct {
			Text string `json:"text"`
			Id   string `json:"id"`
		}, len(opts.Choices))
		for j, c := range opts.Choices {
			choices[j].Text = c.Text
			choices[j].Id = c.Id
		}
		return StartQuizAttemptResponseOptionBoolSingle{Choices: choices}

	case entity.QuizQuestionKindTextMultiple:
		var opts entity.QuestionOptionsKindTextMultiple
		json.Unmarshal(question.Options, &opts)
		return StartQuizAttemptResponseOptionTextMultiple{TotalKeywords: int32(len(opts.Keywords))}

	case entity.QuizQuestionKindTextSingle:
		return StartQuizAttemptResponseOptionTextSingle{}

	case entity.QuizQuestionKindMatch:
		var opts entity.QuestionOptionsKindMatch
		json.Unmarshal(question.Options, &opts)
		keys := make([]struct {
			Value string `json:"value"`
			Id    string `json:"id"`
		}, len(opts.Pairs))
		values := make([]struct {
			Value string `json:"value"`
			Id    string `json:"id"`
		}, len(opts.Pairs))
		for j, p := range opts.Pairs {
			keys[j].Value = p.Key
			keys[j].Id = p.KeyId
			values[j].Value = p.Value
			values[j].Id = p.ValueId
		}
		utils.ShuffleSlice(values)
		utils.ShuffleSlice(keys)
		return StartQuizAttemptResponseOptionMatch{Keys: keys, Values: values}

	case entity.QuizQuestionKindOrdering:
		var opts entity.QuestionOptionsKindOrdering
		json.Unmarshal(question.Options, &opts)
		items := make([]struct {
			Value string `json:"value"`
			Id    string `json:"id"`
		}, len(opts.Items))
		for j, item := range opts.Items {
			items[j].Value = item.Value
			items[j].Id = item.Id
		}
		utils.ShuffleSlice(items)
		return StartQuizAttemptResponseOptionOrdering{Items: items}
	}

	return nil
}

func getCorrection(question *entity.QuizQuestion) any {
	switch question.Kind {
	case entity.QuizQuestionKindBoolMultiple:
		var opts entity.QuestionOptionsKindBoolMultiple
		json.Unmarshal(question.Options, &opts)
		correctIds := []string{}
		for _, c := range opts.Choices {
			if c.Correct {
				correctIds = append(correctIds, c.Id)
			}
		}
		return CorrectionKindBoolMultiple{CorrectChoicesId: correctIds}

	case entity.QuizQuestionKindBoolSingle:
		var opts entity.QuestionOptionsKindBoolSingle
		json.Unmarshal(question.Options, &opts)
		correctId := ""
		for _, c := range opts.Choices {
			if c.Correct {
				correctId = c.Id
				break
			}
		}
		return CorrectionKindBoolSingle{CorrectChoiceId: correctId}

	case entity.QuizQuestionKindTextMultiple:
		var opts entity.QuestionOptionsKindTextMultiple
		json.Unmarshal(question.Options, &opts)
		keywords := make([]struct {
			Value string `json:"value"`
			Id    string `json:"id"`
		}, len(opts.Keywords))
		for j, k := range opts.Keywords {
			keywords[j].Value = k.Value
			keywords[j].Id = k.Id
		}
		return CorrectionKindTextMultiple{Keywords: keywords}

	case entity.QuizQuestionKindTextSingle:
		var opts entity.QuestionOptionsKindTextSingle
		json.Unmarshal(question.Options, &opts)
		return CorrectionKindTextSingle{CorrectAnswer: opts.CorrectAnswer}

	case entity.QuizQuestionKindMatch:
		var opts entity.QuestionOptionsKindMatch
		json.Unmarshal(question.Options, &opts)
		pairs := make([]struct {
			KeyId   string `json:"keyId"`
			ValueId string `json:"valueId"`
		}, len(opts.Pairs))
		for j, p := range opts.Pairs {
			pairs[j].KeyId = p.KeyId
			pairs[j].ValueId = p.ValueId
		}
		return CorrectionKindMatch{Pairs: pairs}

	case entity.QuizQuestionKindOrdering:
		var opts entity.QuestionOptionsKindOrdering
		json.Unmarshal(question.Options, &opts)
		order := make([]string, len(opts.Items))
		for j, item := range opts.Items {
			order[j] = item.Id
		}
		return CorrectionKindOrdering{CorrectOrder: order}
	}

	return nil
}

func startQuizGetResponse(
	quiz *entity.LectureQuiz,
	attempt *entity.QuizAttempt,
) *StartQuizAttemptResponse {
	questions := make([]StartQuizAttemptResponseQuestion, len(quiz.Questions))
	answersMap := map[entitycommon.Id]any{}

	for _, a := range attempt.Answers {
		var ans any
		json.Unmarshal(a.Answer, &ans)
		answersMap[a.QuestionID] = ans
	}

	for i, q := range quiz.Questions {
		questions[i] = StartQuizAttemptResponseQuestion{
			Id:           int64(q.ID),
			Position:     q.Position,
			Kind:         q.Kind,
			QuestionText: q.QuestionText,
			Points:       q.Points,
			Options:      getOptions(&q),
			Answer:       answersMap[q.ID],
		}
	}

	if quiz.ShuffleQuestions {
		utils.ShuffleSlice(questions)
	}

	return &StartQuizAttemptResponse{
		AttemptId:              int64(attempt.ID),
		TimeLimitSecs:          quiz.TimeLimitSecs,
		ExpiresAt:              attempt.ExpiresAt,
		PassingScorePercentage: quiz.PassingScorePercentage,
		ShowCorrectAnswers:     quiz.ShowCorrectAnswers,
		CreatedAt:              quiz.CreatedAt,
		QuestionsAmount:        quiz.QuestionsAmount,
		PublicQuestionsAmount:  quiz.PublicQuestionsAmount,
		Questions:              questions,
	}
}

func (self *StartQuizAttemptRequest) getResponse(quiz *entity.LectureQuiz, attempt *entity.QuizAttempt) *StartQuizAttemptResponse {
	return startQuizGetResponse(quiz, attempt)
}

func buildAttemptDetailsResponse(attempt *entity.QuizAttempt, quiz *entity.LectureQuiz) *GetQuizAttemptDetailsResponse {
	questions := make([]GetQuizAttemptDetailsResponseQuestion, len(quiz.Questions))
	answersMap := make(map[entitycommon.Id]*entity.QuizAttemptAnswer)

	for _, answer := range attempt.Answers {
		answersMap[answer.QuestionID] = &answer
	}

	for i, question := range quiz.Questions {
		questionPointsEarned := float64(0)
		var userAnswer datatypes.JSON = nil

		if answer, ok := answersMap[question.ID]; ok {
			questionPointsEarned = answer.PointsEarned
			userAnswer = answer.Answer
		}
		var correction any
		if quiz.ShowCorrectAnswers {
			correction = getCorrection(&question)
		}

		questions[i] = GetQuizAttemptDetailsResponseQuestion{
			Id:           int64(question.ID),
			Position:     question.Position,
			QuestionText: question.QuestionText,
			Kind:         question.Kind,
			MaxPoints:    question.Points,
			PointsEarned: questionPointsEarned,
			Explanation:  question.Explanation,
			Correction:   correction,
			Answer:       userAnswer,
		}
	}

	scorePercentage := float64(0)
	if attempt.MaxPoints > 0 {
		scorePercentage = (attempt.PointsEarned / attempt.MaxPoints) * 100
	}

	return &GetQuizAttemptDetailsResponse{
		Id:                     int64(attempt.ID),
		CompletedAt:            attempt.CompletedAt,
		CreatedAt:              attempt.CreatedAt,
		Questions:              questions,
		PointsEarned:           attempt.PointsEarned,
		MaxPoints:              attempt.MaxPoints,
		ScorePercentage:        scorePercentage,
		PassingScorePercentage: quiz.PassingScorePercentage,
		Passed:                 scorePercentage >= float64(quiz.PassingScorePercentage),
	}
}

func (self *GetQuizAttemptDetailsRequest) getResponse(attempt *entity.QuizAttempt, quiz *entity.LectureQuiz) *GetQuizAttemptDetailsResponse {
	return buildAttemptDetailsResponse(attempt, quiz)
}
