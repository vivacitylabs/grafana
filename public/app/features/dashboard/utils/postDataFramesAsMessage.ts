import { PanelData, DataFrame, Field } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { UrlQueryMap, UrlQueryValue } from '../../../../../packages/grafana-data/src';

const DOWNLOAD_ID_KEY = 'downloadId';
const MESSAGE_TARGET_ORIGIN_KEY = 'messageTargetOrigin';
interface IframeMessage {
  downloadId: UrlQueryValue;
  series: DataFrame[];
}

export const postDataFramesAsMessage = (data: PanelData) => {
  const urlQueryParams: UrlQueryMap = locationService.getSearchObject();
  const downloadIdVariable = getDownloadIdParam(urlQueryParams);
  const messageTargetOrigin = getTargetOriginParam(urlQueryParams);
  if (window.parent && downloadIdVariable && messageTargetOrigin && typeof messageTargetOrigin === 'string') {
    const series = cleanDataOfUnsendableProperties(data);
    const iframeMessage: IframeMessage = {
      downloadId: downloadIdVariable,
      series: series,
    };
    window.parent.postMessage(iframeMessage, messageTargetOrigin);
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

const getDownloadIdParam = (urlQueryParams: UrlQueryMap): UrlQueryValue | undefined => {
  return urlQueryParams[DOWNLOAD_ID_KEY];
};

const getTargetOriginParam = (urlQueryParams: UrlQueryMap): UrlQueryValue | undefined => {
  return urlQueryParams[MESSAGE_TARGET_ORIGIN_KEY];
};
