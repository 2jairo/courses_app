package coursetags

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

type TagResponse struct {
	ID   int64  `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

func tagResponse(tags []entity.Tag) []TagResponse {
	responses := make([]TagResponse, len(tags))
	for i, tag := range tags {
		responses[i] = TagResponse{
			ID:   int64(tag.ID),
			Slug: tag.Slug.Slug,
			Name: tag.Name,
		}
	}
	return responses
}

func (self *GetTagsRequest) getResponse(tags []entity.Tag) []TagResponse {
	return tagResponse(tags)
}
