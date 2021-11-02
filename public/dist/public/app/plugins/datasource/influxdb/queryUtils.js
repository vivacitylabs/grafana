import { __assign, __read, __spreadArray } from "tslib";
import { cloneDeep } from 'lodash';
import InfluxQueryModel from './influx_query_model';
// FIXME: these functions are a beginning of a refactoring of influx_query_model.ts
// into a simpler approach with full typescript types.
// later we should be able to migrate the unit-tests
// that relate to these functions here, and then perhaps even move the implementation
// to this place
export function buildRawQuery(query) {
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    var model = new InfluxQueryModel(queryCopy);
    return model.render(false);
}
export function normalizeQuery(query) {
    // we return the original query if there is no need to update it
    if (query.policy !== undefined &&
        query.resultFormat !== undefined &&
        query.orderByTime !== undefined &&
        query.tags !== undefined &&
        query.groupBy !== undefined &&
        query.select !== undefined) {
        return query;
    }
    // FIXME: we should move the whole normalizeQuery logic here,
    // and then have influxQueryModel call this function,
    // to concentrate the whole logic here
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    return new InfluxQueryModel(queryCopy).target;
}
export function addNewSelectPart(query, type, index) {
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    var model = new InfluxQueryModel(queryCopy);
    model.addSelectPart(model.selectModels[index], type);
    return model.target;
}
export function removeSelectPart(query, partIndex, index) {
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    var model = new InfluxQueryModel(queryCopy);
    var selectModel = model.selectModels[index];
    model.removeSelectPart(selectModel, selectModel[partIndex]);
    return model.target;
}
export function changeSelectPart(query, listIndex, partIndex, newParams) {
    var _a;
    // we need to make shallow copy of `query.select` down to `query.select[listIndex][partIndex]`
    var newSel = __spreadArray([], __read(((_a = query.select) !== null && _a !== void 0 ? _a : [])), false);
    newSel[listIndex] = __spreadArray([], __read(newSel[listIndex]), false);
    newSel[listIndex][partIndex] = __assign(__assign({}, newSel[listIndex][partIndex]), { params: newParams });
    return __assign(__assign({}, query), { select: newSel });
}
export function addNewGroupByPart(query, type) {
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    var model = new InfluxQueryModel(queryCopy);
    model.addGroupBy(type);
    return model.target;
}
export function removeGroupByPart(query, partIndex) {
    var queryCopy = cloneDeep(query); // the query-model mutates the query
    var model = new InfluxQueryModel(queryCopy);
    model.removeGroupByPart(model.groupByParts[partIndex], partIndex);
    return model.target;
}
export function changeGroupByPart(query, partIndex, newParams) {
    var _a;
    // we need to make shallow copy of `query.groupBy` down to `query.groupBy[partIndex]`
    var newGroupBy = __spreadArray([], __read(((_a = query.groupBy) !== null && _a !== void 0 ? _a : [])), false);
    newGroupBy[partIndex] = __assign(__assign({}, newGroupBy[partIndex]), { params: newParams });
    return __assign(__assign({}, query), { groupBy: newGroupBy });
}
//# sourceMappingURL=queryUtils.js.map