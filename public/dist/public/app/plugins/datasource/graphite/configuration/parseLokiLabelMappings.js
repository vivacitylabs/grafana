/**
 * Converts a simple string used in LokiLogsMappings component (e.g. "servers.(name).*")
 * to data model saved in data source configuration.
 */
export function fromString(text) {
    return {
        matchers: text.split('.').map(function (metricNode) {
            if (metricNode.startsWith('(') && metricNode.endsWith(')')) {
                return {
                    value: '*',
                    labelName: metricNode.slice(1, -1),
                };
            }
            else {
                return { value: metricNode };
            }
        }),
    };
}
/**
 * Coverts configuration stored in data source configuration into a string displayed in LokiLogsMappings component.
 */
export function toString(mapping) {
    return mapping.matchers
        .map(function (matcher) {
        return matcher.labelName ? "(" + matcher.labelName + ")" : "" + matcher.value;
    })
        .join('.');
}
//# sourceMappingURL=parseLokiLabelMappings.js.map