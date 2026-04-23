package global

import (
	"fmt"
	"runtime"
)

var LogCaller bool = true

func Err(err error) error {
	if err == nil {
		return nil
	}

	if LogCaller {
		// Skip 1 level to get the caller of Wrap
		_, file, line, ok := runtime.Caller(1)
		if !ok {
			return err
		}

		fmt.Printf("%s:%d: %v\n", file, line, err)
	}

	return err
}
