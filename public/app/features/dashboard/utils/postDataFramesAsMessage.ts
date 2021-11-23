import { PanelData, DataFrame, Field } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { UrlQueryMap, UrlQueryValue } from '../../../../../packages/grafana-data/src';

const DOWNLOAD_ID_KEY = 'downloadId';
const MESSAGE_TARGET_DOMAIN_KEY = 'messageTargetDomain';
interface IframeMessage {
  downloadId: UrlQueryValue;
  series: DataFrame[];
}

export const postDataFramesAsMessage = (data: PanelData) => {
  const variables: UrlQueryMap = locationService.getSearchObject();
  const downloadIdVariable = getDownloadIdVariable(variables);
  const messageTargetDomain = getTargetDomainVariable(variables);
  if (window.parent && downloadIdVariable) {
    const series = cleanDataOfUnsendableProperties(data);
    const iframeMessage: IframeMessage = {
      downloadId: downloadIdVariable,
      series: series,
    };
    const targetOrigin = messageTargetDomain ? `https://${messageTargetDomain}` : '*';
    window.parent.postMessage(iframeMessage, targetOrigin);
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

const getDownloadIdVariable = (variables: UrlQueryMap): UrlQueryValue | undefined => {
  return variables[DOWNLOAD_ID_KEY];
};

const getTargetDomainVariable = (variables: UrlQueryMap): UrlQueryValue | undefined => {
  return variables[MESSAGE_TARGET_DOMAIN_KEY];
};
