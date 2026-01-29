package comunication

import (
	"context"

	"github.com/2jairo/courses_app/backend/A_core_service/db"
	"github.com/2jairo/courses_app/backend/A_core_service/state"
)

type QueueConsumer struct {
}

func NewQueueConsumer(
	ctx context.Context,
	state *state.AppState,
	dbs *db.DatabasesConnection,
) {
	go func() {
		v := VideoUpdatesDB{State: state, Dbs: dbs, CtrlC: ctx}
		v.StartVideoUpdateConsumer()
	}()
	go func() {
		i := ImageUpdatesDB{State: state, Dbs: dbs, CtrlC: ctx}
		i.StartImageUpdateConsumer()
	}()
}
