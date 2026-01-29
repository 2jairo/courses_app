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

type VideoUpdatesDB struct {
	State *state.AppState
	Dbs   *db.DatabasesConnection
	CtrlC context.Context
}

func (self *VideoUpdatesDB) StartVideoUpdateConsumer() error {
	ch, err := self.Dbs.AmqpConn.Channel()
	if err != nil {
		return err
	}

	q, err := ch.QueueDeclare("video.updates.db", true, false, false, false, nil)
	if err != nil {
		return err
	}

	if err := ch.QueueBind(q.Name, "", "video.updates", false, nil); err != nil {
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

func (self *VideoUpdatesDB) handleMsg(msg amqp.Delivery) error {
	correlationId, _ := strconv.ParseInt(msg.CorrelationId, 10, 64)
	data := &messages.CServiceProcessVideoResponse{}
	if err := data.UnmarshalJSON(msg.Body); err != nil {
		return err
	}

	// fmt.Printf("data: %+v\n", data)

	file := &entity.File{Model: entitycommon.Model{ID: correlationId}}
	if err := self.State.FileRepository.FindOne(file, entity.FilePreloadOptions{}); err != nil {
		return err
	}

	metadataValues := make(map[string]any)
	if err := json.Unmarshal(file.Metadata, &metadataValues); err != nil {
		return err
	}

	newFileStatus := entity.FileStatusProcessing

	switch data.Variant {
	case messages.CServiceProcessVideoVariantEnumInfo:
		body := data.Body.(messages.CServiceProcessVideoVariantInfo)
		metadataValues["duration"] = body.Duration

	case messages.CServiceProcessVideoVariantEnumResolutions:
		body := data.Body.(messages.CServiceProcessVideoVariantResolutions)
		metadataValues["resolutions"] = body.ResolutionsFramerate
		metadataValues["mediaPlaylist"] = body.MediaPlaylist

	case messages.CServiceProcessVideoVariantEnumPoster:
		body := data.Body.(messages.CServiceProcessVideoVariantPoster)
		metadataValues["poster"] = body.Path

	case messages.CServiceProcessVideoVariantEnumThumbnails:
		body := data.Body.(messages.CServiceProcessVideoVariantThumbnails)
		metadataValues["thumbnails"] = body.Path

	case messages.CServiceProcessVideoVariantEnumSpeechToText:
		body := data.Body.(messages.CServiceProcessVideoVariantSpeechToText)
		metadataValues["subtitles"] = body.Languages
		newFileStatus = entity.FileStatusReady

	case messages.CServiceProcessVideoVariantEnumError:
		body := data.Body.(messages.CServiceProcessVideoVariantError)
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
