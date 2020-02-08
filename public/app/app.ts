import 'core-js/stable';
import 'regenerator-runtime/runtime';

import 'whatwg-fetch'; // fetch polyfill needed for PhantomJs rendering
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'; // fetch polyfill needed for PhantomJs rendering
// @ts-ignore
import ttiPolyfill from 'tti-polyfill';

import 'file-saver';
import 'lodash';
import 'jquery';
import 'angular';
import 'angular-route';
import 'angular-sanitize';
import 'angular-native-dragdrop';
import 'angular-bindonce';
import 'react';
import 'react-dom';

import 'vendor/bootstrap/bootstrap';
import 'vendor/angular-other/angular-strap';

import $ from 'jquery';
import angular from 'angular';
import config from 'app/core/config';
// @ts-ignore ignoring this for now, otherwise we would have to extend _ interface with move
import _ from 'lodash';
import { setLocale, setMarkdownOptions, AppEvents } from '@grafana/data';
import { addClassIfNoOverlayScrollbar } from 'app/core/utils/scrollbar';
import { checkBrowserCompatibility } from 'app/core/utils/browser';
import { importPluginModule } from 'app/features/plugins/plugin_loader';
import { angularModules, coreModule } from 'app/core/core_module';
import { registerAngularDirectives, appEvents } from 'app/core/core';
// import { setupAngularRoutes } from 'app/routes/routes';
import { registerEchoBackend, setEchoSrv } from '@grafana/runtime';
import { Echo } from './core/services/echo/Echo';
import { reportPerformance } from './core/services/echo/EchoSrv';
import { PerformanceBackend } from './core/services/echo/backends/PerformanceBackend';

import 'app/routes/GrafanaCtrl';
import 'app/features/all';
import bridgeReactAngularRouting from './core/navigation/bridgeAngularReactRouting';
import ReactDOM from 'react-dom';
import React from 'react';
import AppWrapper from './core/navigation/AppWrapper';
import { LoadDashboardCtrl, NewDashboardCtrl } from './routes/dashboard_loaders';
import { configureStore } from './store/configureStore';

// add move to lodash for backward compatabiltiy
// @ts-ignore
_.move = (array: [], fromIndex: number, toIndex: number) => {
  array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
  return array;
};

// import symlinked extensions
const extensionsIndex = (require as any).context('.', true, /extensions\/index.ts/);
extensionsIndex.keys().forEach((key: any) => {
  extensionsIndex(key);
});

export class GrafanaApp {
  registerFunctions: any;
  ngModuleDependencies: any[];
  preBootModules: any[] | null;

  constructor() {
    addClassIfNoOverlayScrollbar('no-overlay-scrollbar');
    this.preBootModules = [];
    this.registerFunctions = {};
    this.ngModuleDependencies = [];
  }

  useModule(module: angular.IModule) {
    if (this.preBootModules) {
      this.preBootModules.push(module);
    } else {
      _.extend(module, this.registerFunctions);
    }
    this.ngModuleDependencies.push(module.name);
    return module;
  }

  init() {
    const app = angular.module('grafana', []);

    setLocale(config.bootData.user.locale);

    setMarkdownOptions({ sanitize: !config.disableSanitizeHtml });
    configureStore();
    app.config(
      (
        $locationProvider: angular.ILocationProvider,
        $controllerProvider: angular.IControllerProvider,
        $compileProvider: angular.ICompileProvider,
        $filterProvider: angular.IFilterProvider,
        $httpProvider: angular.IHttpProvider,
        $provide: angular.auto.IProvideService
      ) => {
        // pre assing bindings before constructor calls
        $compileProvider.preAssignBindingsEnabled(true);

        if (config.buildInfo.env !== 'development') {
          $compileProvider.debugInfoEnabled(false);
        }

        $httpProvider.useApplyAsync(true);

        this.registerFunctions.controller = $controllerProvider.register;
        this.registerFunctions.directive = $compileProvider.directive;
        this.registerFunctions.factory = $provide.factory;
        this.registerFunctions.service = $provide.service;
        this.registerFunctions.filter = $filterProvider.register;

        $provide.decorator('$http', [
          '$delegate',
          '$templateCache',
          ($delegate: any, $templateCache: any) => {
            const get = $delegate.get;
            $delegate.get = (url: string, config: any) => {
              if (url.match(/\.html$/)) {
                // some template's already exist in the cache
                if (!$templateCache.get(url)) {
                  url += '?v=' + new Date().getTime();
                }
              }
              return get(url, config);
            };
            return $delegate;
          },
        ]);
      }
    );

    this.ngModuleDependencies = [
      'grafana.core',
      // 'ngRoute',
      'ngSanitize',
      '$strap.directives',
      'ang-drag-drop',
      'grafana',
      'pasvaz.bindonce',
      'react',
    ];

    // makes it possible to add dynamic stuff
    _.each(angularModules, (m: angular.IModule) => {
      this.useModule(m);
    });

    // register react angular wrappers
    // coreModule.config(setupAngularRoutes);
    coreModule.controller('LoadDashboardCtrl', LoadDashboardCtrl);
    coreModule.controller('NewDashboardCtrl', NewDashboardCtrl);
    registerAngularDirectives();
    bridgeReactAngularRouting();

    // disable tool tip animation
    $.fn.tooltip.defaults.animation = false;

    // bootstrap the app
    const injector = angular.bootstrap(document, this.ngModuleDependencies);
    injector.invoke(() => {
      _.each(this.preBootModules, (module: angular.IModule) => {
        _.extend(module, this.registerFunctions);
      });

      this.preBootModules = null;

      if (!checkBrowserCompatibility()) {
        setTimeout(() => {
          appEvents.emit(AppEvents.alertWarning, [
            'Your browser is not fully supported',
            'A newer browser version is recommended',
          ]);
        }, 1000);
      }

      // return () => {}
    });
    const promises = [];
    for (const modulePath of config.pluginsToPreload) {
      promises.push(importPluginModule(modulePath));
    }
    Promise.all(promises).then(() => {
      ReactDOM.render(
        React.createElement(AppWrapper, {
          injector,
        }),
        document.getElementById('reactRoot')
      );
    });
    // console.log(config.pluginsToPreload);
    // Preload selected app plugins
  }

  initEchoSrv() {
    setEchoSrv(new Echo({ debug: process.env.NODE_ENV === 'development' }));

    ttiPolyfill.getFirstConsistentlyInteractive().then((tti: any) => {
      // Collecting paint metrics first
      const paintMetrics = performance && performance.getEntriesByType ? performance.getEntriesByType('paint') : [];

      for (const metric of paintMetrics) {
        reportPerformance(metric.name, Math.round(metric.startTime + metric.duration));
      }
      reportPerformance('tti', tti);
    });

    registerEchoBackend(new PerformanceBackend({}));

    window.addEventListener('DOMContentLoaded', () => {
      reportPerformance('dcl', Math.round(performance.now()));
    });
  }
}

export default new GrafanaApp();
