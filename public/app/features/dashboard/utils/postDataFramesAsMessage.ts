import { PanelData, DataFrame, Field } from '@grafana/data';
import { VariableWithOptions } from 'app/features/variables/types';
import { DashboardModel, PanelModel } from '../state';

const DOWNLOAD_ID_KEY = 'downloadID';
interface IframeMessage {
  downloadId: string | string[];
  series: DataFrame[];
}

export const postDataFramesAsMessage = (data: PanelData, dashboard: DashboardModel) => {
  const downloadIdVariable = getDownloadIdVariable(dashboard);
  if (window.parent && downloadIdVariable) {
    const series = cleanDataOfUnsendableProperties(data);
    const iframeMessage: IframeMessage = {
      downloadId: downloadIdVariable.current.value,
      series: series,
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

const getDownloadIdVariable = (dashboard: DashboardModel): VariableWithOptions | undefined => {
  const variables = dashboard.getVariables() as VariableWithOptions[];
  const downloadIdVariable = variables.filter((variable) => variable.id === DOWNLOAD_ID_KEY);
  if (downloadIdVariable.length !== 1) {
    return undefined;
  }
  return downloadIdVariable[0];
};
