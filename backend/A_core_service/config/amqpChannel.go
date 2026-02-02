package config

type AmqpQueueCycle struct {
	DstExchangeQueueName string
	DstExchangeName      string
	SrcQueueName         string
}
