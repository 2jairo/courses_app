package quizzes

import (
	"encoding/json"
	"time"

	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
)

type StartQuizAttemptResponse struct {
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

func getResponse(
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
		var options any

		switch q.Kind {
		case entity.QuizQuestionKindBoolMultiple:
			var opts entity.QuestionOptionsKindBoolMultiple
			json.Unmarshal(q.Options, &opts)
			choices := make([]struct {
				Text string `json:"text"`
				Id   string `json:"id"`
			}, len(opts.Choices))
			for j, c := range opts.Choices {
				choices[j].Text = c.Text
				choices[j].Id = c.Id
			}
			options = StartQuizAttemptResponseOptionBoolMultiple{Choices: choices}

		case entity.QuizQuestionKindBoolSingle:
			var opts entity.QuestionOptionsKindBoolSingle
			json.Unmarshal(q.Options, &opts)
			choices := make([]struct {
				Text string `json:"text"`
				Id   string `json:"id"`
			}, len(opts.Choices))
			for j, c := range opts.Choices {
				choices[j].Text = c.Text
				choices[j].Id = c.Id
			}
			options = StartQuizAttemptResponseOptionBoolSingle{Choices: choices}

		case entity.QuizQuestionKindTextMultiple:
			var opts entity.QuestionOptionsKindTextMultiple
			json.Unmarshal(q.Options, &opts)
			options = StartQuizAttemptResponseOptionTextMultiple{TotalKeywords: int32(len(opts.Keywords))}

		case entity.QuizQuestionKindTextSingle:
			options = StartQuizAttemptResponseOptionTextSingle{}

		case entity.QuizQuestionKindMatch:
			var opts entity.QuestionOptionsKindMatch
			json.Unmarshal(q.Options, &opts)
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
			options = StartQuizAttemptResponseOptionMatch{Keys: keys, Values: values}

		case entity.QuizQuestionKindOrdering:
			var opts entity.QuestionOptionsKindOrdering
			json.Unmarshal(q.Options, &opts)
			items := make([]struct {
				Value string `json:"value"`
				Id    string `json:"id"`
			}, len(opts.Items))
			for j, item := range opts.Items {
				items[j].Value = item.Value
				items[j].Id = item.Id
			}
			utils.ShuffleSlice(items)
			options = StartQuizAttemptResponseOptionOrdering{Items: items}
		}

		questions[i] = StartQuizAttemptResponseQuestion{
			Id:           int64(q.ID),
			Position:     q.Position,
			Kind:         q.Kind,
			QuestionText: q.QuestionText,
			Points:       q.Points,
			Options:      options,
			Answer:       answersMap[q.ID],
		}
	}

	if quiz.ShuffleQuestions {
		utils.ShuffleSlice(questions)
	}

	return &StartQuizAttemptResponse{
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
	return getResponse(quiz, attempt)
}
