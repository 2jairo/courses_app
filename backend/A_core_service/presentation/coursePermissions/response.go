package coursepermissions

import "github.com/2jairo/courses_app/backend/A_core_service/entity"

type GetCourseIntegrantsResponse struct {
	Role     entity.CoursePermissionsRole `json:"role"`
	Username string                       `json:"username"`
	Avatar   *string                      `json:"avatar"`
}

func (self *GetCourseIntegrantsRequest) getResponse(permissions []entity.CoursePermissions) []GetCourseIntegrantsResponse {
	resp := make([]GetCourseIntegrantsResponse, len(permissions))

	for i, p := range permissions {
		var avatar *string = nil
		if p.User.Avatar != nil {
			path := p.User.Avatar.CdnImageUrl()
			avatar = &path
		}
		resp[i] = GetCourseIntegrantsResponse{
			Role:     p.Role,
			Username: p.User.Username,
			Avatar:   avatar,
		}
	}

	return resp
}
