package entitycommon

import (
	"database/sql/driver"
)

type Id int64

func (id Id) Value() (driver.Value, error) {
	return int64(id), nil
}
