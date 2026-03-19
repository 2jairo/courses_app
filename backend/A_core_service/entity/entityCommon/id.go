package entitycommon

import (
	"database/sql/driver"
)

type Id int64

func (id *Id) Value() (driver.Value, error) {
	if id == nil {
		return nil, nil
	}
	return int64(*id), nil
}
