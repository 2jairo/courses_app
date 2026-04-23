package config

type AmqpQueueCycle struct {
	DstExchangeQueueName string
	DstExchangeName      string
	DstExchangeType      string
	DstRoutingKey        string
	SrcQueueName         string
}
