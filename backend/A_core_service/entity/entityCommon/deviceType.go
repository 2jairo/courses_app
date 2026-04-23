package entitycommon

import "database/sql/driver"

type DeviceType string

const (
	DeviceTypeDesktop DeviceType = "Desktop"
	DeviceTypeMobile  DeviceType = "Mobile"
	DeviceTypeTablet  DeviceType = "Tablet"
	DeviceTypeSmartTv DeviceType = "SmartTv"
	DeviceTypeOther   DeviceType = "Other"
)

func (v DeviceType) IsValid() bool {
	return v == DeviceTypeDesktop ||
		v == DeviceTypeMobile ||
		v == DeviceTypeTablet ||
		v == DeviceTypeSmartTv ||
		v == DeviceTypeOther
}

func (v DeviceType) Value() (driver.Value, error) {
	return string(v), nil
}
