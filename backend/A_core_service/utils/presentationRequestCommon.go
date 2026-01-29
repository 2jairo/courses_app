package utils

type Pagination struct {
	Page int `query:"page" json:"page" validate:"required,min=1"`
	Size int `query:"size" json:"size" validate:"required,min=1,max=100"`
}

func (p *Pagination) GetOffset() int {
	return (p.Page - 1) * p.Size
}
func (p *Pagination) GetLimit() int {
	return p.Size
}

type SortOrder string

const (
	SortOrderAsc  SortOrder = "asc"
	SortOrderDesc SortOrder = "desc"
)

func (s SortOrder) IsValid() bool {
	return SortOrderAsc == s || SortOrderDesc == s
}
