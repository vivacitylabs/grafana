import { __extends, __values } from "tslib";
import { clone, filter, find, findIndex, indexOf, map } from 'lodash';
import appEvents from 'app/core/app_events';
import { PostgresMetaQuery } from './meta_query';
import { QueryCtrl } from 'app/plugins/sdk';
import PostgresQueryModel from './postgres_query_model';
import sqlPart from './sql_part';
import { PanelEvents } from '@grafana/data';
import { ShowConfirmModalEvent } from 'app/types/events';
var defaultQuery = "SELECT\n  $__time(time_column),\n  value1\nFROM\n  metric_table\nWHERE\n  $__timeFilter(time_column)\n";
var PostgresQueryCtrl = /** @class */ (function (_super) {
    __extends(PostgresQueryCtrl, _super);
    /** @ngInject */
    function PostgresQueryCtrl($scope, $injector, templateSrv, uiSegmentSrv) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.templateSrv = templateSrv;
        _this.uiSegmentSrv = uiSegmentSrv;
        _this.showHelp = false;
        _this.selectMenu = [];
        _this.selectParts = [[]];
        _this.groupParts = [];
        _this.whereParts = [];
        _this.target = _this.target;
        _this.queryModel = new PostgresQueryModel(_this.target, templateSrv, _this.panel.scopedVars);
        _this.metaBuilder = new PostgresMetaQuery(_this.target, _this.queryModel);
        _this.updateProjection();
        _this.formats = [
            { text: 'Time series', value: 'time_series' },
            { text: 'Table', value: 'table' },
        ];
        if (!_this.target.rawSql) {
            // special handling when in table panel
            if (_this.panelCtrl.panel.type === 'table') {
                _this.target.format = 'table';
                _this.target.rawSql = 'SELECT 1';
                _this.target.rawQuery = true;
            }
            else {
                _this.target.rawSql = defaultQuery;
                _this.datasource.metricFindQuery(_this.metaBuilder.findMetricTable()).then(function (result) {
                    if (result.length > 0) {
                        _this.target.table = result[0].text;
                        var segment = _this.uiSegmentSrv.newSegment(_this.target.table);
                        _this.tableSegment.html = segment.html;
                        _this.tableSegment.value = segment.value;
                        _this.target.timeColumn = result[1].text;
                        segment = _this.uiSegmentSrv.newSegment(_this.target.timeColumn);
                        _this.timeColumnSegment.html = segment.html;
                        _this.timeColumnSegment.value = segment.value;
                        _this.target.timeColumnType = 'timestamp';
                        _this.target.select = [[{ type: 'column', params: [result[2].text] }]];
                        _this.updateProjection();
                        _this.updateRawSqlAndRefresh();
                    }
                });
            }
        }
        if (!_this.target.table) {
            _this.tableSegment = uiSegmentSrv.newSegment({ value: 'select table', fake: true });
        }
        else {
            _this.tableSegment = uiSegmentSrv.newSegment(_this.target.table);
        }
        _this.timeColumnSegment = uiSegmentSrv.newSegment(_this.target.timeColumn);
        _this.metricColumnSegment = uiSegmentSrv.newSegment(_this.target.metricColumn);
        _this.buildSelectMenu();
        _this.whereAdd = _this.uiSegmentSrv.newPlusButton();
        _this.groupAdd = _this.uiSegmentSrv.newPlusButton();
        _this.panelCtrl.events.on(PanelEvents.dataReceived, _this.onDataReceived.bind(_this), $scope);
        _this.panelCtrl.events.on(PanelEvents.dataError, _this.onDataError.bind(_this), $scope);
        return _this;
    }
    PostgresQueryCtrl.prototype.updateRawSqlAndRefresh = function () {
        if (!this.target.rawQuery) {
            this.target.rawSql = this.queryModel.buildQuery();
        }
        this.panelCtrl.refresh();
    };
    PostgresQueryCtrl.prototype.updateProjection = function () {
        this.selectParts = map(this.target.select, function (parts) {
            return map(parts, sqlPart.create).filter(function (n) { return n; });
        });
        this.whereParts = map(this.target.where, sqlPart.create).filter(function (n) { return n; });
        this.groupParts = map(this.target.group, sqlPart.create).filter(function (n) { return n; });
    };
    PostgresQueryCtrl.prototype.updatePersistedParts = function () {
        this.target.select = map(this.selectParts, function (selectParts) {
            return map(selectParts, function (part) {
                return { type: part.def.type, datatype: part.datatype, params: part.params };
            });
        });
        this.target.where = map(this.whereParts, function (part) {
            return { type: part.def.type, datatype: part.datatype, name: part.name, params: part.params };
        });
        this.target.group = map(this.groupParts, function (part) {
            return { type: part.def.type, datatype: part.datatype, params: part.params };
        });
    };
    PostgresQueryCtrl.prototype.buildSelectMenu = function () {
        this.selectMenu = [];
        var aggregates = {
            text: 'Aggregate Functions',
            value: 'aggregate',
            submenu: [
                { text: 'Average', value: 'avg' },
                { text: 'Count', value: 'count' },
                { text: 'Maximum', value: 'max' },
                { text: 'Minimum', value: 'min' },
                { text: 'Sum', value: 'sum' },
                { text: 'Standard deviation', value: 'stddev' },
                { text: 'Variance', value: 'variance' },
            ],
        };
        // first and last aggregate are timescaledb specific
        if (this.datasource.jsonData.timescaledb === true) {
            aggregates.submenu.push({ text: 'First', value: 'first' });
            aggregates.submenu.push({ text: 'Last', value: 'last' });
        }
        this.selectMenu.push(aggregates);
        // ordered set aggregates require postgres 9.4+
        if (this.datasource.jsonData.postgresVersion >= 904) {
            var aggregates2 = {
                text: 'Ordered-Set Aggregate Functions',
                value: 'percentile',
                submenu: [
                    { text: 'Percentile (continuous)', value: 'percentile_cont' },
                    { text: 'Percentile (discrete)', value: 'percentile_disc' },
                ],
            };
            this.selectMenu.push(aggregates2);
        }
        var windows = {
            text: 'Window Functions',
            value: 'window',
            submenu: [
                { text: 'Delta', value: 'delta' },
                { text: 'Increase', value: 'increase' },
                { text: 'Rate', value: 'rate' },
                { text: 'Sum', value: 'sum' },
                { text: 'Moving Average', value: 'avg', type: 'moving_window' },
            ],
        };
        this.selectMenu.push(windows);
        this.selectMenu.push({ text: 'Alias', value: 'alias' });
        this.selectMenu.push({ text: 'Column', value: 'column' });
    };
    PostgresQueryCtrl.prototype.toggleEditorMode = function () {
        var _this = this;
        if (this.target.rawQuery) {
            appEvents.publish(new ShowConfirmModalEvent({
                title: 'Warning',
                text2: 'Switching to query builder may overwrite your raw SQL.',
                icon: 'exclamation-triangle',
                yesText: 'Switch',
                onConfirm: function () {
                    // This could be called from React, so wrap in $evalAsync.
                    // Will then either run as part of the current digest cycle or trigger a new one.
                    _this.$scope.$evalAsync(function () {
                        _this.target.rawQuery = !_this.target.rawQuery;
                    });
                },
            }));
        }
        else {
            // This could be called from React, so wrap in $evalAsync.
            // Will then either run as part of the current digest cycle or trigger a new one.
            this.$scope.$evalAsync(function () {
                _this.target.rawQuery = !_this.target.rawQuery;
            });
        }
    };
    PostgresQueryCtrl.prototype.resetPlusButton = function (button) {
        var plusButton = this.uiSegmentSrv.newPlusButton();
        button.html = plusButton.html;
        button.value = plusButton.value;
        button.type = plusButton.type;
        button.fake = plusButton.fake;
    };
    PostgresQueryCtrl.prototype.getTableSegments = function () {
        return this.datasource
            .metricFindQuery(this.metaBuilder.buildTableQuery())
            .then(this.transformToSegments({}))
            .catch(this.handleQueryError.bind(this));
    };
    PostgresQueryCtrl.prototype.tableChanged = function () {
        var _this = this;
        this.target.table = this.tableSegment.value;
        this.target.where = [];
        this.target.group = [];
        this.updateProjection();
        var segment = this.uiSegmentSrv.newSegment('none');
        this.metricColumnSegment.html = segment.html;
        this.metricColumnSegment.value = segment.value;
        this.target.metricColumn = 'none';
        var task1 = this.datasource.metricFindQuery(this.metaBuilder.buildColumnQuery('time')).then(function (result) {
            // check if time column is still valid
            if (result.length > 0 && !find(result, function (r) { return r.text === _this.target.timeColumn; })) {
                var segment_1 = _this.uiSegmentSrv.newSegment(result[0].text);
                _this.timeColumnSegment.html = segment_1.html;
                _this.timeColumnSegment.value = segment_1.value;
            }
            return _this.timeColumnChanged(false);
        });
        var task2 = this.datasource.metricFindQuery(this.metaBuilder.buildColumnQuery('value')).then(function (result) {
            if (result.length > 0) {
                _this.target.select = [[{ type: 'column', params: [result[0].text] }]];
                _this.updateProjection();
            }
        });
        Promise.all([task1, task2]).then(function () {
            _this.updateRawSqlAndRefresh();
        });
    };
    PostgresQueryCtrl.prototype.getTimeColumnSegments = function () {
        return this.datasource
            .metricFindQuery(this.metaBuilder.buildColumnQuery('time'))
            .then(this.transformToSegments({}))
            .catch(this.handleQueryError.bind(this));
    };
    PostgresQueryCtrl.prototype.timeColumnChanged = function (refresh) {
        var _this = this;
        this.target.timeColumn = this.timeColumnSegment.value;
        return this.datasource
            .metricFindQuery(this.metaBuilder.buildDatatypeQuery(this.target.timeColumn))
            .then(function (result) {
            if (result.length === 1) {
                if (_this.target.timeColumnType !== result[0].text) {
                    _this.target.timeColumnType = result[0].text;
                }
                var partModel = void 0;
                if (_this.queryModel.hasUnixEpochTimecolumn()) {
                    partModel = sqlPart.create({ type: 'macro', name: '$__unixEpochFilter', params: [] });
                }
                else {
                    partModel = sqlPart.create({ type: 'macro', name: '$__timeFilter', params: [] });
                }
                if (_this.whereParts.length >= 1 && _this.whereParts[0].def.type === 'macro') {
                    // replace current macro
                    _this.whereParts[0] = partModel;
                }
                else {
                    _this.whereParts.splice(0, 0, partModel);
                }
            }
            _this.updatePersistedParts();
            if (refresh !== false) {
                _this.updateRawSqlAndRefresh();
            }
        });
    };
    PostgresQueryCtrl.prototype.getMetricColumnSegments = function () {
        return this.datasource
            .metricFindQuery(this.metaBuilder.buildColumnQuery('metric'))
            .then(this.transformToSegments({ addNone: true }))
            .catch(this.handleQueryError.bind(this));
    };
    PostgresQueryCtrl.prototype.metricColumnChanged = function () {
        this.target.metricColumn = this.metricColumnSegment.value;
        this.updateRawSqlAndRefresh();
    };
    PostgresQueryCtrl.prototype.onDataReceived = function (dataList) {
        var _a;
        this.lastQueryError = undefined;
        this.lastQueryMeta = (_a = dataList[0]) === null || _a === void 0 ? void 0 : _a.meta;
    };
    PostgresQueryCtrl.prototype.onDataError = function (err) {
        if (err.data && err.data.results) {
            var queryRes = err.data.results[this.target.refId];
            if (queryRes) {
                this.lastQueryError = queryRes.error;
            }
        }
    };
    PostgresQueryCtrl.prototype.transformToSegments = function (config) {
        var _this = this;
        return function (results) {
            var e_1, _a;
            var segments = map(results, function (segment) {
                return _this.uiSegmentSrv.newSegment({
                    value: segment.text,
                    expandable: segment.expandable,
                });
            });
            if (config.addTemplateVars) {
                try {
                    for (var _b = __values(_this.templateSrv.getVariables()), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var variable = _c.value;
                        var value = void 0;
                        value = '$' + variable.name;
                        if (config.templateQuoter && variable.multi === false) {
                            value = config.templateQuoter(value);
                        }
                        segments.unshift(_this.uiSegmentSrv.newSegment({
                            type: 'template',
                            value: value,
                            expandable: true,
                        }));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            if (config.addNone) {
                segments.unshift(_this.uiSegmentSrv.newSegment({ type: 'template', value: 'none', expandable: true }));
            }
            return segments;
        };
    };
    PostgresQueryCtrl.prototype.findAggregateIndex = function (selectParts) {
        return findIndex(selectParts, function (p) { return p.def.type === 'aggregate' || p.def.type === 'percentile'; });
    };
    PostgresQueryCtrl.prototype.findWindowIndex = function (selectParts) {
        return findIndex(selectParts, function (p) { return p.def.type === 'window' || p.def.type === 'moving_window'; });
    };
    PostgresQueryCtrl.prototype.addSelectPart = function (selectParts, item, subItem) {
        var partType = item.value;
        if (subItem && subItem.type) {
            partType = subItem.type;
        }
        var partModel = sqlPart.create({ type: partType });
        if (subItem) {
            partModel.params[0] = subItem.value;
        }
        var addAlias = false;
        switch (partType) {
            case 'column':
                var parts = map(selectParts, function (part) {
                    return sqlPart.create({ type: part.def.type, params: clone(part.params) });
                });
                this.selectParts.push(parts);
                break;
            case 'percentile':
            case 'aggregate':
                // add group by if no group by yet
                if (this.target.group.length === 0) {
                    this.addGroup('time', '$__interval');
                }
                var aggIndex = this.findAggregateIndex(selectParts);
                if (aggIndex !== -1) {
                    // replace current aggregation
                    selectParts[aggIndex] = partModel;
                }
                else {
                    selectParts.splice(1, 0, partModel);
                }
                if (!find(selectParts, function (p) { return p.def.type === 'alias'; })) {
                    addAlias = true;
                }
                break;
            case 'moving_window':
            case 'window':
                var windowIndex = this.findWindowIndex(selectParts);
                if (windowIndex !== -1) {
                    // replace current window function
                    selectParts[windowIndex] = partModel;
                }
                else {
                    var aggIndex_1 = this.findAggregateIndex(selectParts);
                    if (aggIndex_1 !== -1) {
                        selectParts.splice(aggIndex_1 + 1, 0, partModel);
                    }
                    else {
                        selectParts.splice(1, 0, partModel);
                    }
                }
                if (!find(selectParts, function (p) { return p.def.type === 'alias'; })) {
                    addAlias = true;
                }
                break;
            case 'alias':
                addAlias = true;
                break;
        }
        if (addAlias) {
            // set initial alias name to column name
            partModel = sqlPart.create({ type: 'alias', params: [selectParts[0].params[0].replace(/"/g, '')] });
            if (selectParts[selectParts.length - 1].def.type === 'alias') {
                selectParts[selectParts.length - 1] = partModel;
            }
            else {
                selectParts.push(partModel);
            }
        }
        this.updatePersistedParts();
        this.updateRawSqlAndRefresh();
    };
    PostgresQueryCtrl.prototype.removeSelectPart = function (selectParts, part) {
        if (part.def.type === 'column') {
            // remove all parts of column unless its last column
            if (this.selectParts.length > 1) {
                var modelsIndex = indexOf(this.selectParts, selectParts);
                this.selectParts.splice(modelsIndex, 1);
            }
        }
        else {
            var partIndex = indexOf(selectParts, part);
            selectParts.splice(partIndex, 1);
        }
        this.updatePersistedParts();
    };
    PostgresQueryCtrl.prototype.handleSelectPartEvent = function (selectParts, part, evt) {
        switch (evt.name) {
            case 'get-param-options': {
                switch (part.def.type) {
                    case 'aggregate':
                        return this.datasource
                            .metricFindQuery(this.metaBuilder.buildAggregateQuery())
                            .then(this.transformToSegments({}))
                            .catch(this.handleQueryError.bind(this));
                    case 'column':
                        return this.datasource
                            .metricFindQuery(this.metaBuilder.buildColumnQuery('value'))
                            .then(this.transformToSegments({}))
                            .catch(this.handleQueryError.bind(this));
                }
            }
            case 'part-param-changed': {
                this.updatePersistedParts();
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'action': {
                this.removeSelectPart(selectParts, part);
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'get-part-actions': {
                return Promise.resolve([{ text: 'Remove', value: 'remove-part' }]);
            }
        }
    };
    PostgresQueryCtrl.prototype.handleGroupPartEvent = function (part, index, evt) {
        switch (evt.name) {
            case 'get-param-options': {
                return this.datasource
                    .metricFindQuery(this.metaBuilder.buildColumnQuery())
                    .then(this.transformToSegments({}))
                    .catch(this.handleQueryError.bind(this));
            }
            case 'part-param-changed': {
                this.updatePersistedParts();
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'action': {
                this.removeGroup(part, index);
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'get-part-actions': {
                return Promise.resolve([{ text: 'Remove', value: 'remove-part' }]);
            }
        }
    };
    PostgresQueryCtrl.prototype.addGroup = function (partType, value) {
        var e_2, _a;
        var params = [value];
        if (partType === 'time') {
            params = ['$__interval', 'none'];
        }
        var partModel = sqlPart.create({ type: partType, params: params });
        if (partType === 'time') {
            // put timeGroup at start
            this.groupParts.splice(0, 0, partModel);
        }
        else {
            this.groupParts.push(partModel);
        }
        try {
            // add aggregates when adding group by
            for (var _b = __values(this.selectParts), _c = _b.next(); !_c.done; _c = _b.next()) {
                var selectParts = _c.value;
                if (!selectParts.some(function (part) { return part.def.type === 'aggregate'; })) {
                    var aggregate = sqlPart.create({ type: 'aggregate', params: ['avg'] });
                    selectParts.splice(1, 0, aggregate);
                    if (!selectParts.some(function (part) { return part.def.type === 'alias'; })) {
                        var alias = sqlPart.create({ type: 'alias', params: [selectParts[0].part.params[0]] });
                        selectParts.push(alias);
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this.updatePersistedParts();
    };
    PostgresQueryCtrl.prototype.removeGroup = function (part, index) {
        if (part.def.type === 'time') {
            // remove aggregations
            this.selectParts = map(this.selectParts, function (s) {
                return filter(s, function (part) {
                    if (part.def.type === 'aggregate' || part.def.type === 'percentile') {
                        return false;
                    }
                    return true;
                });
            });
        }
        this.groupParts.splice(index, 1);
        this.updatePersistedParts();
    };
    PostgresQueryCtrl.prototype.handleWherePartEvent = function (whereParts, part, evt, index) {
        var _this = this;
        switch (evt.name) {
            case 'get-param-options': {
                switch (evt.param.name) {
                    case 'left':
                        return this.datasource
                            .metricFindQuery(this.metaBuilder.buildColumnQuery())
                            .then(this.transformToSegments({}))
                            .catch(this.handleQueryError.bind(this));
                    case 'right':
                        if (['int4', 'int8', 'float4', 'float8', 'timestamp', 'timestamptz'].indexOf(part.datatype) > -1) {
                            // don't do value lookups for numerical fields
                            return Promise.resolve([]);
                        }
                        else {
                            return this.datasource
                                .metricFindQuery(this.metaBuilder.buildValueQuery(part.params[0]))
                                .then(this.transformToSegments({
                                addTemplateVars: true,
                                templateQuoter: function (v) {
                                    return _this.queryModel.quoteLiteral(v);
                                },
                            }))
                                .catch(this.handleQueryError.bind(this));
                        }
                    case 'op':
                        return Promise.resolve(this.uiSegmentSrv.newOperators(this.metaBuilder.getOperators(part.datatype)));
                    default:
                        return Promise.resolve([]);
                }
            }
            case 'part-param-changed': {
                this.updatePersistedParts();
                this.datasource.metricFindQuery(this.metaBuilder.buildDatatypeQuery(part.params[0])).then(function (d) {
                    if (d.length === 1) {
                        part.datatype = d[0].text;
                    }
                });
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'action': {
                // remove element
                whereParts.splice(index, 1);
                this.updatePersistedParts();
                this.updateRawSqlAndRefresh();
                break;
            }
            case 'get-part-actions': {
                return Promise.resolve([{ text: 'Remove', value: 'remove-part' }]);
            }
        }
    };
    PostgresQueryCtrl.prototype.getWhereOptions = function () {
        var options = [];
        if (this.queryModel.hasUnixEpochTimecolumn()) {
            options.push(this.uiSegmentSrv.newSegment({ type: 'macro', value: '$__unixEpochFilter' }));
        }
        else {
            options.push(this.uiSegmentSrv.newSegment({ type: 'macro', value: '$__timeFilter' }));
        }
        options.push(this.uiSegmentSrv.newSegment({ type: 'expression', value: 'Expression' }));
        return Promise.resolve(options);
    };
    PostgresQueryCtrl.prototype.addWhereAction = function (part, index) {
        switch (this.whereAdd.type) {
            case 'macro': {
                var partModel = sqlPart.create({ type: 'macro', name: this.whereAdd.value, params: [] });
                if (this.whereParts.length >= 1 && this.whereParts[0].def.type === 'macro') {
                    // replace current macro
                    this.whereParts[0] = partModel;
                }
                else {
                    this.whereParts.splice(0, 0, partModel);
                }
                break;
            }
            default: {
                this.whereParts.push(sqlPart.create({ type: 'expression', params: ['value', '=', 'value'] }));
            }
        }
        this.updatePersistedParts();
        this.resetPlusButton(this.whereAdd);
        this.updateRawSqlAndRefresh();
    };
    PostgresQueryCtrl.prototype.getGroupOptions = function () {
        var _this = this;
        return this.datasource
            .metricFindQuery(this.metaBuilder.buildColumnQuery('group'))
            .then(function (tags) {
            var e_3, _a;
            var options = [];
            if (!_this.queryModel.hasTimeGroup()) {
                options.push(_this.uiSegmentSrv.newSegment({ type: 'time', value: 'time($__interval,none)' }));
            }
            try {
                for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                    var tag = tags_1_1.value;
                    options.push(_this.uiSegmentSrv.newSegment({ type: 'column', value: tag.text }));
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return options;
        })
            .catch(this.handleQueryError.bind(this));
    };
    PostgresQueryCtrl.prototype.addGroupAction = function () {
        this.addGroup(this.groupAdd.type, this.groupAdd.value);
        this.resetPlusButton(this.groupAdd);
        this.updateRawSqlAndRefresh();
    };
    PostgresQueryCtrl.prototype.handleQueryError = function (err) {
        this.error = err.message || 'Failed to issue metric query';
        return [];
    };
    PostgresQueryCtrl.templateUrl = 'partials/query.editor.html';
    return PostgresQueryCtrl;
}(QueryCtrl));
export { PostgresQueryCtrl };
//# sourceMappingURL=query_ctrl.js.map