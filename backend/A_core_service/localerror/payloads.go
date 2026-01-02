package localerror

type PayloadValidationRejection struct {
	Fields map[string][]string `json:"fields"`
}

type PayloadRouteNotFound struct {
	URI    string `json:"uri"`
	Method string `json:"method"`
}

type PayloadVideoResolutionTooLow struct {
	Resolution []int `json:"resolution"`
	Min        []int `json:"min"`
}

type PayloadJsonRejection string

type PayloadQueryRejection string

type PayloadBytesRejection string

type PayloadPathRejection string

type PayloadWebSocketUpgradeRejection string

type PayloadMultipartRejection string
