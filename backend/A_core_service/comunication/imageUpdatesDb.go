package comunication

import (
	"context"
	"encoding/json"
	"strconv"

	"github.com/2jairo/courses_app/backend/A_core_service/comunication/messages"
	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/entity"
	entitycommon "github.com/2jairo/courses_app/backend/A_core_service/entity/entityCommon"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
	amqp "github.com/rabbitmq/amqp091-go"
)

type ImageUpdatesDB struct {
	State *state.AppState
	Dbs   *db.DatabasesConnection
	CtrlC context.Context
}

func (self *ImageUpdatesDB) StartImageUpdateConsumer() error {
	ch, err := self.Dbs.AmqpConn.Channel()
	if err != nil {
		return err
	}

	q, err := ch.QueueDeclare("image.updates.db", true, false, false, false, nil)
	if err != nil {
		return err
	}

	if err := ch.QueueBind(q.Name, "", "image.updates", false, nil); err != nil {
		return err
	}

	msgs, err := ch.Consume(q.Name, "a_core_service", false, false, false, false, nil)
	if err != nil {
		return err
	}

	for {
		select {
		case <-self.CtrlC.Done():
			return nil
		case msg := <-msgs:
			if err := self.handleMsg(msg); err != nil {
				msg.Reject(false)
			} else {
				msg.Ack(false)
			}
		}
	}
}

func (self *ImageUpdatesDB) handleMsg(msg amqp.Delivery) error {
	correlationId, _ := strconv.ParseInt(msg.CorrelationId, 10, 64)

	data := &messages.CServiceProcessImageResponse{}
	if err := data.UnmarshalJSON(msg.Body); err != nil {
		return err
	}

	file := &entity.File{Model: entitycommon.Model{ID: correlationId}}
	if err := self.State.FileRepository.FindOne(
		file,
		entity.FilePreloadOptions{},
	); err != nil {
		return err
	}

	metadataValues := make(map[string]any)
	if err := json.Unmarshal(file.Metadata, &metadataValues); err != nil {
		return err
	}

	newFileStatus := entity.FileStatusProcessing

	switch data.Variant {

	case messages.CServiceProcessImageVariantEnumResolutions:
		body := data.Body.(messages.CServiceProcessImageVariantResolutions)
		metadataValues["resolutions"] = body.Resolutions
		newFileStatus = entity.FileStatusReady

	case messages.CServiceProcessImageVariantEnumError:
		body := data.Body.(messages.CServiceProcessImageVariantError)
		metadataValues["error"] = body.Error
		newFileStatus = entity.FileStatusFailed
	}

	newMetadata, _ := json.Marshal(metadataValues)

	findBy := &entity.File{Model: entitycommon.Model{ID: correlationId}}
	update := &entity.File{Metadata: newMetadata, Status: newFileStatus}

	if err := self.State.FileRepository.UpdateOne(findBy, update); err != nil {
		return err
	}

	return nil
}
