import React from 'react';
import { Badge } from '@grafana/ui';
import { PluginState } from '@grafana/data';
export var PluginStateInfo = function (props) {
    var display = getFeatureStateInfo(props.state);
    if (!display) {
        return null;
    }
    return React.createElement(Badge, { color: display.color, title: display.tooltip, text: display.text, icon: display.icon });
};
function getFeatureStateInfo(state) {
    switch (state) {
        case PluginState.deprecated:
            return {
                text: 'Deprecated',
                color: 'red',
                tooltip: "This feature is deprecated and will be removed in a future release",
            };
        case PluginState.alpha:
            return {
                text: 'Alpha',
                color: 'blue',
                tooltip: "This feature is experimental and future updates might not be backward compatible",
            };
        case PluginState.beta:
            return {
                text: 'Beta',
                color: 'blue',
                tooltip: "This feature is close to complete but not fully tested",
            };
        default:
            return null;
    }
}
//# sourceMappingURL=PluginStateInfo.js.map