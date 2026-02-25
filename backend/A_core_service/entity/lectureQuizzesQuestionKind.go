package entity

// OPTIONS

type QuestionOptionsKindBoolMultiple struct {
	Choices []struct {
		Text    string `json:"text"    validate:"required,min=1,max=500"`
		Correct bool   `json:"correct"`
		Id      string `json:"id"      validate:"required"`
	} `json:"choices" validate:"required,min=1,dive"`
}

type QuestionOptionsKindBoolSingle struct {
	Choices []struct {
		Text    string `json:"text"    validate:"required,min=1,max=500"`
		Correct bool   `json:"correct"`
		Id      string `json:"id"      validate:"required"`
	} `json:"choices" validate:"required,min=2,dive"`
}

type QuestionOptionsKindTextMultiple struct {
	Keywords []struct {
		Value string `json:"value" validate:"required,min=1,max=500"`
		Id    string `json:"id"    validate:"required"`
	} `json:"keywords" validate:"required,min=1,dive"`
}

type QuestionOptionsKindTextSingle struct {
	CorrectAnswer string `json:"correctAnswer" validate:"required,min=1,max=500"`
}

type QuestionOptionsKindMatch struct {
	Pairs []struct {
		Key     string `json:"key"     validate:"required,min=1,max=500"`
		KeyId   string `json:"keyId"   validate:"required"`
		Value   string `json:"value"   validate:"required,min=1,max=500"`
		ValueId string `json:"valueId" validate:"required"`
	} `json:"pairs" validate:"required,min=1,dive"`
}

type QuestionOptionsKindOrdering struct {
	Items []struct {
		Value string `json:"value" validate:"required,min=1,max=500"`
		Id    string `json:"id"    validate:"required"`
	} `json:"items" validate:"required,min=2,dive"`
}

// ANSWERS

type AnswerOptionsKindBoolMultiple struct {
	ChoicesId []string `json:"choicesId" validate:"required,min=1,dive,required,min=1"`
}

type AnswerOptionsKindBoolSingle struct {
	ChoiceId string `json:"choiceId" validate:"required"`
}

type AnswerOptionsKindTextMultiple struct {
	ChoicesId []string `json:"choicesId" validate:"required,min=1,dive,required,min=1"`
}

type AnswerOptionsKindTextSingle struct {
	Choice string `json:"choice" validate:"required,min=1"`
}

type AnswerOptionsKindMatch struct {
	Choices []AnswerOptionsKindMatchChoice `json:"choices" validate:"required,min=1,dive"`
}

type AnswerOptionsKindMatchChoice struct {
	KeyId   string `json:"keyId"   validate:"required"`
	ValueId string `json:"valueId" validate:"required"`
}

type AnswerOptionsKindOrdering struct {
	ChoicesId []string `json:"choicesId" validate:"required,min=1,dive,required,min=1"`
}
