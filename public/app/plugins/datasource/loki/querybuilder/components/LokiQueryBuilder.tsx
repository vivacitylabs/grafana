import React from 'react';
import { LokiVisualQuery } from '../types';
import { LokiDatasource } from '../../datasource';
import { LabelFilters } from 'app/plugins/datasource/prometheus/querybuilder/shared/LabelFilters';
import { OperationList } from 'app/plugins/datasource/prometheus/querybuilder/shared/OperationList';
import { QueryBuilderLabelFilter } from 'app/plugins/datasource/prometheus/querybuilder/shared/types';
import { lokiQueryModeller } from '../LokiQueryModeller';
import { DataSourceApi, SelectableValue } from '@grafana/data';
import { EditorRow, EditorRows } from '@grafana/experimental';
import { QueryPreview } from './QueryPreview';

export interface Props {
  query: LokiVisualQuery;
  datasource: LokiDatasource;
  onChange: (update: LokiVisualQuery) => void;
  onRunQuery: () => void;
  nested?: boolean;
}

export const LokiQueryBuilder = React.memo<Props>(({ datasource, query, nested, onChange, onRunQuery }) => {
  const onChangeLabels = (labels: QueryBuilderLabelFilter[]) => {
    onChange({ ...query, labels });
  };

  const withTemplateVariableOptions = async (optionsPromise: Promise<string[]>): Promise<SelectableValue[]> => {
    const options = await optionsPromise;
    return [...datasource.getVariables(), ...options].map((value) => ({ label: value, value }));
  };

  const onGetLabelNames = async (forLabel: Partial<QueryBuilderLabelFilter>): Promise<any> => {
    const labelsToConsider = query.labels.filter((x) => x !== forLabel);

    if (labelsToConsider.length === 0) {
      await datasource.languageProvider.refreshLogLabels();
      return datasource.languageProvider.getLabelKeys();
    }

    const expr = lokiQueryModeller.renderLabels(labelsToConsider);
    return await datasource.languageProvider.fetchSeriesLabels(expr);
  };

  const onGetLabelValues = async (forLabel: Partial<QueryBuilderLabelFilter>) => {
    if (!forLabel.label) {
      return [];
    }

    const labelsToConsider = query.labels.filter((x) => x !== forLabel);
    if (labelsToConsider.length === 0) {
      return await datasource.languageProvider.fetchLabelValues(forLabel.label);
    }

    const expr = lokiQueryModeller.renderLabels(labelsToConsider);
    const result = await datasource.languageProvider.fetchSeriesLabels(expr);
    const forLabelInterpolated = datasource.interpolateString(forLabel.label);
    return result[forLabelInterpolated] ?? [];
  };

  return (
    <EditorRows>
      <EditorRow>
        <LabelFilters
          onGetLabelNames={(forLabel: Partial<QueryBuilderLabelFilter>) =>
            withTemplateVariableOptions(onGetLabelNames(forLabel))
          }
          onGetLabelValues={(forLabel: Partial<QueryBuilderLabelFilter>) =>
            withTemplateVariableOptions(onGetLabelValues(forLabel))
          }
          labelsFilters={query.labels}
          onChange={onChangeLabels}
        />
      </EditorRow>
      <EditorRow>
        <OperationList
          queryModeller={lokiQueryModeller}
          query={query}
          onChange={onChange}
          onRunQuery={onRunQuery}
          datasource={datasource as DataSourceApi}
        />
      </EditorRow>
      {!nested && (
        <EditorRow>
          <QueryPreview query={query} />
        </EditorRow>
      )}
    </EditorRows>
  );
});

LokiQueryBuilder.displayName = 'LokiQueryBuilder';
