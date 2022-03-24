import React from 'react';
import { render, screen } from '@testing-library/react';
import { EnhancedStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';
import { fromPairs } from 'lodash';

import { DataSourceApi, DataSourceInstanceSettings, QueryEditorProps, ScopedVars } from '@grafana/data';
import { locationService, setDataSourceSrv, setEchoSrv } from '@grafana/runtime';
import { GrafanaRoute } from 'app/core/navigation/GrafanaRoute';
import { Echo } from 'app/core/services/echo/Echo';
import { configureStore } from 'app/store/configureStore';

import Wrapper from '../../Wrapper';
import { initialUserState } from '../../../profile/state/reducers';

import { LokiDatasource } from '../../../../plugins/datasource/loki/datasource';
import { LokiQuery } from '../../../../plugins/datasource/loki/types';

type DatasourceSetup = { settings: DataSourceInstanceSettings; api: DataSourceApi };

type SetupOptions = {
  // default true
  clearLocalStorage?: boolean;
  datasources?: DatasourceSetup[];
  urlParams?: { left: string; right?: string };
  searchParams?: string;
};

export function setupExplore(options?: SetupOptions): {
  datasources: { [name: string]: DataSourceApi };
  store: EnhancedStore;
  unmount: () => void;
} {
  // Clear this up otherwise it persists data source selection
  // TODO: probably add test for that too
  if (options?.clearLocalStorage !== false) {
    window.localStorage.clear();
  }

  // Create this here so any mocks are recreated on setup and don't retain state
  const defaultDatasources: DatasourceSetup[] = [
    makeDatasourceSetup(),
    makeDatasourceSetup({ name: 'elastic', id: 2 }),
  ];

  const dsSettings = options?.datasources || defaultDatasources;

  setDataSourceSrv({
    getList(): DataSourceInstanceSettings[] {
      return dsSettings.map((d) => d.settings);
    },
    getInstanceSettings(name: string) {
      return dsSettings.map((d) => d.settings).find((x) => x.name === name || x.uid === name);
    },
    get(name?: string | null, scopedVars?: ScopedVars): Promise<DataSourceApi> {
      return Promise.resolve(
        (name ? dsSettings.find((d) => d.api.name === name || d.api.uid === name) : dsSettings[0])!.api
      );
    },
  } as any);

  setEchoSrv(new Echo());

  const store = configureStore();
  store.getState().user = {
    ...initialUserState,
    orgId: 1,
    timeZone: 'utc',
  };

  store.getState().navIndex = {
    explore: {
      id: 'explore',
      text: 'Explore',
      subTitle: 'Explore your data',
      icon: 'compass',
      url: '/explore',
    },
  };

  locationService.push({ pathname: '/explore', search: options?.searchParams });

  if (options?.urlParams) {
    locationService.partial(options.urlParams);
  }

  const route = { component: Wrapper };

  const { unmount } = render(
    <Provider store={store}>
      <Router history={locationService.getHistory()}>
        <Route path="/explore" exact render={(props) => <GrafanaRoute {...props} route={route as any} />} />
      </Router>
    </Provider>
  );

  return { datasources: fromPairs(dsSettings.map((d) => [d.api.name, d.api])), store, unmount };
}

function makeDatasourceSetup({ name = 'loki', id = 1 }: { name?: string; id?: number } = {}): DatasourceSetup {
  const meta: any = {
    info: {
      logos: {
        small: '',
      },
    },
    id: id.toString(),
  };
  return {
    settings: {
      id,
      uid: name,
      type: 'logs',
      name,
      meta,
      access: 'proxy',
      jsonData: {},
    },
    api: {
      components: {
        QueryEditor(props: QueryEditorProps<LokiDatasource, LokiQuery>) {
          return (
            <div>
              <input
                aria-label="query"
                defaultValue={props.query.expr}
                onChange={(event) => {
                  props.onChange({ ...props.query, expr: event.target.value });
                }}
              />
              {name} Editor input: {props.query.expr}
            </div>
          );
        },
      },
      name: name,
      uid: name,
      query: jest.fn(),
      getRef: jest.fn(),
      meta,
    } as any,
  };
}

export const waitForExplore = async () => {
  await screen.findByText(/Editor/i);
};

export const tearDown = () => {
  window.localStorage.clear();
};
