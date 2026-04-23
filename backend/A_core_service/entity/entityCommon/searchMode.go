package entitycommon

import "database/sql/driver"

type SearchMode string

const (
	SearchModeAI  SearchMode = "ai"
	SearchModeFTS SearchMode = "fts"
)

func (m SearchMode) IsValid() bool {
	return m == SearchModeAI || m == SearchModeFTS
}

func (m SearchMode) Value() (driver.Value, error) {
	return string(m), nil
}
