import { PanelData, DataFrame, Field } from '@grafana/data';
import { DashboardModel, PanelModel } from '../state';

interface IframeMessage {
  panelId: number;
  dashboardId: number;
  series: DataFrame[];
  variables: Map<string, string[]>;
  timeRange: { to: number; from: number };
}

export const postDataFramesAsMessage = (data: PanelData, panel: PanelModel, dashboard: DashboardModel) => {
  if (window.parent) {
    const series = cleanDataOfUnsendableProperties(data);
    const variables = buildVariableMap(dashboard);
    const timeRange = getTimestamps(data);
    const iframeMessage: IframeMessage = {
      panelId: panel.id,
      dashboardId: dashboard.id,
      series: series,
      variables,
      timeRange,
    };
    window.parent.postMessage(iframeMessage);
  }
};

const cleanDataOfUnsendableProperties = (data: PanelData): DataFrame[] => {
  const { series } = data;
  series.forEach((singleSeries: DataFrame) =>
    singleSeries.fields.forEach((field: Field) => {
      delete field.getLinks;
      delete field.display;
      delete field.state;
    })
  );
  return series;
};

const buildVariableMap = (dashboard: DashboardModel): Map<string, string[]> => {
  const variables = dashboard.getVariables();
  const variableMap = new Map<string, string[]>();
  variables.forEach((variable: any) => {
    if (variable.current) {
      if (Array.isArray(variable.current.value)) {
        variableMap.set(variable.id, variable.current.value);
      } else {
        variableMap.set(variable.id, [variable.current.value]);
      }
    } else {
      variableMap.set(variable.id, []);
    }
  });
  return variableMap;
};

const getTimestamps = (data: PanelData) => {
  return {
    to: data.timeRange.to.valueOf(),
    from: data.timeRange.from.valueOf(),
  };
};
