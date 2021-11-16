import { PanelData, DataFrame, Field } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { UrlQueryMap, UrlQueryValue } from '../../../../../packages/grafana-data/src';

const DOWNLOAD_ID_KEY = 'var-downloadId';
interface IframeMessage {
  downloadId: UrlQueryValue;
  series: DataFrame[];
}

export const postDataFramesAsMessage = (data: PanelData) => {
  const downloadIdVariable = getDownloadIdVariable();
  if (window.parent && downloadIdVariable) {
    const series = cleanDataOfUnsendableProperties(data);
    const iframeMessage: IframeMessage = {
      downloadId: downloadIdVariable,
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

const getDownloadIdVariable = (): UrlQueryValue | undefined => {
  const variables: UrlQueryMap = locationService.getSearchObject();
  return variables[DOWNLOAD_ID_KEY];
};
