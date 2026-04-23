package config

import (
	"fmt"
	"os"
	"strconv"

	global "github.com/2jairo/courses_app/backend/A_core_service_err_handler"
	"github.com/joho/godotenv"
)

func getString(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok {
		panic(fmt.Sprintf("Environment variable `%s` is not set", key))
	}
	return value
}

func getNumber(key string) int64 {
	str := getString(key)
	n, err := strconv.ParseInt(str, 10, 64)
	if err != nil {
		panic(fmt.Sprintf("%s: `%s` is not a valid integer", key, str))
	}

	return n
}

func GetEnv() {
	switch os.Getenv("APP_ENV") {
	case EnvironmentProduction:
		global.LogCaller = false
		Env = EnvironmentProduction
	default:
		global.LogCaller = true
		Env = EnvironmentDevelopment
	}
	fmt.Printf("APP_ENV: %v\n", Env)

	godotenv.Load(fmt.Sprintf(".env.%s", Env))

	RabbitmqUrl = getString("RABBITMQ_URL")
	PostgresUrl = getString("POSTGRES_URL")
	ClickhouseUrl = getString("CLICKHOUSE_URL")
	Socket = getString("LISTEN_SOCKET")
	S2SJwtSecret = []byte(getString("S2S_JWT_SECRET"))
	S2SJwtHours = getNumber("S2S_JWT_HOURS")
	BServiceUrl = BServiceURL{
		Base: getString("B_SERVICE_BASE_URL"),
	}
	CdnServiceUrl = CdnServiceURL{
		Base: getString("CDN_SERVICE_BASE_URL"),
	}
	FilesMultipartSizeLimit = getNumber("FILES_MULTIPART_SIZE_LIMIT")
	ProcessedFilesBasePath = getString("PROCESSED_FILES_BASE_PATH")
	RawFilesBasePath = getString("RAW_FILES_BASE_PATH")
	AmqpCServiceVideoQueueCycle = AmqpQueueCycle{
		SrcQueueName:         "video",
		DstExchangeName:      "video.updates",
		DstExchangeType:      "fanout",
		DstExchangeQueueName: "video.updates.db",
	}
	AmqpCServiceImageQueueCycle = AmqpQueueCycle{
		SrcQueueName:         "image",
		DstExchangeName:      "image.updates",
		DstExchangeType:      "fanout",
		DstExchangeQueueName: "image.updates.db",
	}
	AmqpCServiceOtherQueueCycle = AmqpQueueCycle{
		SrcQueueName:         "other",
		DstExchangeName:      "other.updates",
		DstExchangeType:      "fanout",
		DstExchangeQueueName: "other.updates.db",
	}
	AmqpClickhouseCourseStatsToTypesenseCycle = AmqpQueueCycle{
		SrcQueueName:         "course_stats", // Not used, just reads
		DstExchangeName:      "course_stats",
		DstExchangeType:      "direct",
		DstRoutingKey:        "course.stats.updated",
		DstExchangeQueueName: "course_stats.updated.db",
	}
	StripeApiSk = getString("STRIPE_API_SK")
	StripeApiWhSec = getString("STRIPE_API_WHSEC")
	IpInfoIoToken = getString("IP_INFO_IO_TOKEN")
	TypesenseUrl = getString("TYPESENSE_URL")
	TypesenseApiKey = getString("TYPESENSE_API_KEY")
	GatewayIASearchUrl = GatewayIASearchURL{
		Base: getString("GATEWAY_IA_SERACH_BASE_URL"),
	}
	TypesenseSystemPromptMaxFacetValues = getNumber("TYPESENSE_SYSTEM_PROMPT_MAX_FACET_VALUES")
	TypesenseSystemPromptRefreshInterval = getNumber("TYPESENSE_SYSTEM_PROMPT_REFRESH_INTERVAL")
	TypesenseNlQueryMaxMs = getNumber("TYPESENSE_NL_QUERY_MAX_MS")
}

const (
	EnvironmentDevelopment string = "development"
	EnvironmentProduction  string = "production"
)

var Env string
var RabbitmqUrl string
var PostgresUrl string
var ClickhouseUrl string
var Socket string
var S2SJwtSecret []byte
var S2SJwtHours int64
var BServiceUrl BServiceURL
var CdnServiceUrl CdnServiceURL
var FilesMultipartSizeLimit int64
var ProcessedFilesBasePath string
var RawFilesBasePath string
var AmqpCServiceVideoQueueCycle AmqpQueueCycle
var AmqpCServiceImageQueueCycle AmqpQueueCycle
var AmqpCServiceOtherQueueCycle AmqpQueueCycle
var AmqpClickhouseCourseStatsToTypesenseCycle AmqpQueueCycle
var TmpCurrency string = "EUR"
var StripeApiSk string
var StripeApiWhSec string
var IpInfoIoToken string
var TypesenseUrl string
var TypesenseApiKey string
var TypesenseSystemPromptMaxFacetValues int64
var TypesenseSystemPromptRefreshInterval int64
var TypesenseNlQueryMaxMs int64
var GatewayIASearchUrl GatewayIASearchURL
