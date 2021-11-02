import React from 'react';
import { standardTransformersRegistry } from '@grafana/data';
import { TransformationOperationRow } from './TransformationOperationRow';
export var TransformationOperationRows = function (_a) {
    var data = _a.data, onChange = _a.onChange, onRemove = _a.onRemove, configs = _a.configs;
    return (React.createElement(React.Fragment, null, configs.map(function (t, i) {
        var uiConfig = standardTransformersRegistry.getIfExists(t.transformation.id);
        if (!uiConfig) {
            return null;
        }
        return (React.createElement(TransformationOperationRow, { index: i, id: "" + t.id, key: "" + t.id, data: data, configs: configs, uiConfig: uiConfig, onRemove: onRemove, onChange: onChange }));
    })));
};
//# sourceMappingURL=TransformationOperationRows.js.map