package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

func getString(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		panic(fmt.Sprintf("Environment variable `%s` is not set", key))
	}
	return value
}

func getNumber(key string) uint64 {
	str := getString(key)
	n, err := strconv.ParseUint(str, 10, 64)
	if err != nil {
		panic(fmt.Sprintf("%s: `%s` is not a valid integer", key, str))
	}

	return n
}

func GetEnv() {
	switch os.Getenv("APP_ENV") {
	case EnvironmentProduction:
		Env = EnvironmentProduction
	default:
		Env = EnvironmentDevelopment
	}

	godotenv.Load(fmt.Sprintf(".env.%s", Env))

	RabbitmqUrl = getString("RABBITMQ_URL")
	PostgresUrl = getString("POSTGRES_URL")
	Socket = getString("LISTEN_SOCKET")
	S2SJwtSecret = getString("S2S_JWT_SECRET")
	S2SJwtHours = getNumber("S2S_JWT_HOURS")
}

const (
	EnvironmentDevelopment string = "development"
	EnvironmentProduction  string = "production"
)

var Env string
var RabbitmqUrl string
var PostgresUrl string
var Socket string
var S2SJwtSecret string
var S2SJwtHours uint64
