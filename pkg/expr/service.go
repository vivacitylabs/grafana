package expr

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/setting"
)

// DatasourceType is the string constant used as the datasource when the property is in Datasource.Type.
// Type in requests is used to identify what type of data source plugin the request belongs to.
const DatasourceType = "__expr__"

// DatasourceUID is the string constant used as the datasource name in requests
// to identify it as an expression command when use in Datasource.UID.
const DatasourceUID = DatasourceType

// DatasourceID is the fake datasource id used in requests to identify it as an
// expression command.
const DatasourceID = -100

// OldDatasourceUID is the datasource uid used in requests to identify it as an
// expression command. It goes with the query root level datasourceUID property. It was accidentally
// set to the Id and is now kept for backwards compatibility. The newer Datasource.UID property
// should be used instead and should be set to "__expr__".
const OldDatasourceUID = "-100"

// Service is service representation for expression handling.
type Service struct {
	Cfg         *setting.Cfg
	DataService plugins.DataRequestHandler
}

func (s *Service) isDisabled() bool {
	if s.Cfg == nil {
		return true
	}
	return !s.Cfg.ExpressionsEnabled
}

// BuildPipeline builds a pipeline from a request.
func (s *Service) BuildPipeline(req *Request) (DataPipeline, error) {
	return s.buildPipeline(req)
}

// ExecutePipeline executes an expression pipeline and returns all the results.
func (s *Service) ExecutePipeline(ctx context.Context, pipeline DataPipeline) (*backend.QueryDataResponse, error) {
	res := backend.NewQueryDataResponse()
	vars, err := pipeline.execute(ctx, s)
	if err != nil {
		return nil, err
	}
	for refID, val := range vars {
		res.Responses[refID] = backend.DataResponse{
			Frames: val.Values.AsDataFrames(refID),
		}
	}
	return res, nil
}
