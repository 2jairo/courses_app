package db

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"

	"github.com/2jairo/courses_app/backend/A_core_service/config"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	"github.com/2jairo/courses_app/backend/A_core_service/utils"
	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
)

type GatewayIASearchRole string

const (
	RoleSystem    GatewayIASearchRole = "system"
	RoleUser      GatewayIASearchRole = "user"
	RoleAssistant GatewayIASearchRole = "assistant"
)

type GatewayIASearchMessage struct {
	Role    GatewayIASearchRole `json:"role"`
	Content string              `json:"content"`
}

type GatewayIASearchGenreateRequest struct {
	MaxTokens   int32                    `json:"max_tokens,omitempty"`
	Messages    []GatewayIASearchMessage `json:"messages"`
	Temperature float64                  `json:"temperature,omitempty"`
}

type GatewayIaSearchGenerateResponse struct {
	Content string `json:"content"`
}

type GatewayIaSearchGenerateResponseFilters struct {
	Q                   string                  `json:"q"`
	LectureAccesibility []string                `json:"lectureAccesibility,omitempty"`
	Language            []entity.CourseLanguage `json:"language,omitempty" validate:"omitempty,dive,enum"`
	Tags                []string                `json:"tags,omitempty" validate:"omitempty,dive,required,min=2,max=30"`
	Author              []string                `json:"author,omitempty" validate:"omitempty,dive,required,min=3"`
	MinDiscountedPrice  int32                   `json:"minDiscountedPrice,omitempty"`
	MaxDiscountedPrice  int32                   `json:"maxDiscountedPrice,omitempty"`
	MinAvgRating        float64                 `json:"minAvgRating,omitempty" validate:"min=0.0,max=5.0"`
	SortBy              utils.SortOrder         `json:"sortBy,omitempty" validate:"omitempty,enum"`
	SortOrder           utils.SortOrder         `json:"sortOrder,omitempty" validate:"omitempty,enum"`
}

type GatewayIASearchClient struct {
	Client *http.Client
	Utils  *utils.AppUtils
}

func NewGatewayIASearchClient(u *utils.AppUtils) *GatewayIASearchClient {
	return &GatewayIASearchClient{
		Client: &http.Client{},
		Utils:  u,
	}
}

var JSON_BLOCK_REGEXP = regexp.MustCompile("(?s)```(?:json)?\\s*(\\{.*?\\})\\s*```")

func (c *GatewayIASearchClient) Generate(ctx context.Context, req GatewayIASearchGenreateRequest) (*GatewayIaSearchGenerateResponseFilters, error) {
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, global.Err(err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, config.GatewayIASearchUrl.Genreate(), bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, global.Err(err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.Client.Do(httpReq)
	if err != nil {
		return nil, global.Err(err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code %d: %s", resp.StatusCode, string(body))
	}

	var response GatewayIaSearchGenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, global.Err(err)
	}

	jsonString := response.Content
	if m := JSON_BLOCK_REGEXP.FindStringSubmatch(response.Content); m != nil {
		jsonString = m[1]
	}

	var filters GatewayIaSearchGenerateResponseFilters
	if err := json.Unmarshal([]byte(jsonString), &filters); err != nil {
		return nil, global.Err(err)
	}
	if err := c.Utils.Validator.Validate(&response); err != nil {
		return nil, global.Err(err)
	}

	return &filters, nil
}
