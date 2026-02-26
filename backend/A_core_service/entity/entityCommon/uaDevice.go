package entitycommon

import "database/sql/driver"

type UADeviceType string

const (
	UADeviceTypeDesktop UADeviceType = "Desktop"
	UADeviceTypeMobile  UADeviceType = "Mobile"
	UADeviceTypeTablet  UADeviceType = "Tablet"
	UADeviceTypeSmartTv UADeviceType = "SmartTv"
	UADeviceTypeOther   UADeviceType = "Other"
)

func (v UADeviceType) IsValid() bool {
	return v == UADeviceTypeDesktop ||
		v == UADeviceTypeMobile ||
		v == UADeviceTypeTablet ||
		v == UADeviceTypeSmartTv ||
		v == UADeviceTypeOther
}

func (v UADeviceType) Value() (driver.Value, error) {
	return string(v), nil
}
