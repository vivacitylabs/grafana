import { find, first, isArray, isString, escape } from 'lodash';
import { escapeStringForRegex, formattedValueToString, getValueFormat, stringStartsAsRegEx, stringToJsRegex, textUtil, unEscapeStringFromRegex, dateTimeFormatISO, dateTimeFormat, getColorForTheme, } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { ColumnOptionsCtrl } from './column_options';
var TableRenderer = /** @class */ (function () {
    function TableRenderer(panel, table, timeZone, sanitize, templateSrv, theme) {
        if (templateSrv === void 0) { templateSrv = getTemplateSrv(); }
        this.panel = panel;
        this.table = table;
        this.timeZone = timeZone;
        this.sanitize = sanitize;
        this.templateSrv = templateSrv;
        this.theme = theme;
        this.formatters = [];
        this.initColumns();
    }
    TableRenderer.prototype.setTable = function (table) {
        this.table = table;
        this.initColumns();
    };
    TableRenderer.prototype.initColumns = function () {
        this.formatters = [];
        this.colorState = {};
        for (var colIndex = 0; colIndex < this.table.columns.length; colIndex++) {
            var column = this.table.columns[colIndex];
            column.title = column.text;
            for (var i = 0; i < this.panel.styles.length; i++) {
                var style = this.panel.styles[i];
                var escapedPattern = stringStartsAsRegEx(style.pattern)
                    ? style.pattern
                    : escapeStringForRegex(unEscapeStringFromRegex(style.pattern));
                var regex = stringToJsRegex(escapedPattern);
                if (column.text.match(regex)) {
                    column.style = style;
                    if (style.alias) {
                        column.title = textUtil.escapeHtml(column.text.replace(regex, style.alias));
                    }
                    break;
                }
            }
            this.formatters[colIndex] = this.createColumnFormatter(column);
        }
    };
    TableRenderer.prototype.getColorForValue = function (value, style) {
        if (!style.thresholds || !style.colors) {
            return null;
        }
        for (var i = style.thresholds.length; i > 0; i--) {
            if (value >= style.thresholds[i - 1]) {
                return getColorForTheme(style.colors[i], this.theme);
            }
        }
        return getColorForTheme(first(style.colors), this.theme);
    };
    TableRenderer.prototype.defaultCellFormatter = function (v, style) {
        if (v === null || v === void 0 || v === undefined) {
            return '';
        }
        if (isArray(v)) {
            v = v.join(', ');
        }
        if (style && style.sanitize) {
            return this.sanitize(v);
        }
        else {
            return escape(v);
        }
    };
    TableRenderer.prototype.createColumnFormatter = function (column) {
        var _this = this;
        if (!column.style) {
            return this.defaultCellFormatter;
        }
        if (column.style.type === 'hidden') {
            return function (v) { return undefined; };
        }
        if (column.style.type === 'date') {
            return function (v) {
                if (v === undefined || v === null) {
                    return '-';
                }
                if (isArray(v)) {
                    v = v[0];
                }
                // if is an epoch (numeric string and len > 12)
                if (isString(v) && !isNaN(v) && v.length > 12) {
                    v = parseInt(v, 10);
                }
                if (!column.style.dateFormat) {
                    return dateTimeFormatISO(v, {
                        timeZone: _this.timeZone,
                    });
                }
                return dateTimeFormat(v, {
                    format: column.style.dateFormat,
                    timeZone: _this.timeZone,
                });
            };
        }
        if (column.style.type === 'string') {
            return function (v) {
                if (isArray(v)) {
                    v = v.join(', ');
                }
                var mappingType = column.style.mappingType || 0;
                if (mappingType === 1 && column.style.valueMaps) {
                    for (var i = 0; i < column.style.valueMaps.length; i++) {
                        var map = column.style.valueMaps[i];
                        if (v === null) {
                            if (map.value === 'null') {
                                return map.text;
                            }
                            continue;
                        }
                        // Allow both numeric and string values to be mapped
                        if ((!isString(v) && Number(map.value) === Number(v)) || map.value === v) {
                            _this.setColorState(v, column.style);
                            return _this.defaultCellFormatter(map.text, column.style);
                        }
                    }
                }
                if (mappingType === 2 && column.style.rangeMaps) {
                    for (var i = 0; i < column.style.rangeMaps.length; i++) {
                        var map = column.style.rangeMaps[i];
                        if (v === null) {
                            if (map.from === 'null' && map.to === 'null') {
                                return map.text;
                            }
                            continue;
                        }
                        if (Number(map.from) <= Number(v) && Number(map.to) >= Number(v)) {
                            _this.setColorState(v, column.style);
                            return _this.defaultCellFormatter(map.text, column.style);
                        }
                    }
                }
                if (v === null || v === void 0) {
                    return '-';
                }
                _this.setColorState(v, column.style);
                return _this.defaultCellFormatter(v, column.style);
            };
        }
        if (column.style.type === 'number') {
            var valueFormatter_1 = getValueFormat(column.unit || column.style.unit);
            return function (v) {
                if (v === null || v === void 0) {
                    return '-';
                }
                if (isNaN(v) || isArray(v)) {
                    return _this.defaultCellFormatter(v, column.style);
                }
                _this.setColorState(v, column.style);
                return formattedValueToString(valueFormatter_1(v, column.style.decimals, null));
            };
        }
        return function (value) {
            return _this.defaultCellFormatter(value, column.style);
        };
    };
    TableRenderer.prototype.setColorState = function (value, style) {
        if (!style.colorMode) {
            return;
        }
        if (value === null || value === void 0 || isArray(value)) {
            return;
        }
        var numericValue = Number(value);
        if (isNaN(numericValue)) {
            return;
        }
        this.colorState[style.colorMode] = this.getColorForValue(numericValue, style);
    };
    TableRenderer.prototype.renderRowVariables = function (rowIndex) {
        var scopedVars = {};
        var cellVariable;
        var row = this.table.rows[rowIndex];
        for (var i = 0; i < row.length; i++) {
            cellVariable = "__cell_" + i;
            scopedVars[cellVariable] = { value: row[i], text: row[i] ? row[i].toString() : '' };
        }
        return scopedVars;
    };
    TableRenderer.prototype.formatColumnValue = function (colIndex, value) {
        var fmt = this.formatters[colIndex];
        if (fmt) {
            return fmt(value);
        }
        return value;
    };
    TableRenderer.prototype.renderCell = function (columnIndex, rowIndex, value, addWidthHack) {
        if (addWidthHack === void 0) { addWidthHack = false; }
        value = this.formatColumnValue(columnIndex, value);
        var column = this.table.columns[columnIndex];
        var cellStyles = [];
        var cellStyle = '';
        var cellClasses = [];
        var cellClass = '';
        if (this.colorState.cell) {
            cellStyles.push('background-color:' + this.colorState.cell);
            cellClasses.push('table-panel-color-cell');
            this.colorState.cell = null;
        }
        else if (this.colorState.value) {
            cellStyles.push('color:' + this.colorState.value);
            this.colorState.value = null;
        }
        // because of the fixed table headers css only solution
        // there is an issue if header cell is wider the cell
        // this hack adds header content to cell (not visible)
        var columnHtml = '';
        if (addWidthHack) {
            columnHtml = '<div class="table-panel-width-hack">' + this.table.columns[columnIndex].title + '</div>';
        }
        if (value === undefined) {
            cellStyles.push('display:none');
            column.hidden = true;
        }
        else {
            column.hidden = false;
        }
        if (column.hidden === true) {
            return '';
        }
        if (column.style && column.style.preserveFormat) {
            cellClasses.push('table-panel-cell-pre');
        }
        if (column.style && column.style.align) {
            var textAlign = find(ColumnOptionsCtrl.alignTypesEnum, ['text', column.style.align]);
            if (textAlign && textAlign['value']) {
                cellStyles.push("text-align:" + textAlign['value']);
            }
        }
        if (cellStyles.length) {
            cellStyle = ' style="' + cellStyles.join(';') + '"';
        }
        if (column.style && column.style.link) {
            // Render cell as link
            var scopedVars = this.renderRowVariables(rowIndex);
            scopedVars['__cell'] = { value: value, text: value ? value.toString() : '' };
            var cellLink = this.templateSrv.replace(column.style.linkUrl, scopedVars, encodeURIComponent);
            var sanitizedCellLink = textUtil.sanitizeUrl(cellLink);
            var cellLinkTooltip = textUtil.escapeHtml(this.templateSrv.replace(column.style.linkTooltip, scopedVars));
            var cellTarget = column.style.linkTargetBlank ? '_blank' : '';
            cellClasses.push('table-panel-cell-link');
            columnHtml += "<a href=\"" + sanitizedCellLink + "\" target=\"" + cellTarget + "\" data-link-tooltip data-original-title=\"" + cellLinkTooltip + "\" data-placement=\"right\"" + cellStyle + ">";
            columnHtml += "" + value;
            columnHtml += "</a>";
        }
        else {
            columnHtml += value;
        }
        if (column.filterable) {
            cellClasses.push('table-panel-cell-filterable');
            columnHtml += "<a class=\"table-panel-filter-link\" data-link-tooltip data-original-title=\"Filter out value\" data-placement=\"bottom\"\n           data-row=\"" + rowIndex + "\" data-column=\"" + columnIndex + "\" data-operator=\"!=\">";
            columnHtml += "<i class=\"fa fa-search-minus\"></i>";
            columnHtml += "</a>";
            columnHtml += "<a class=\"table-panel-filter-link\" data-link-tooltip data-original-title=\"Filter for value\" data-placement=\"bottom\"\n           data-row=\"" + rowIndex + "\" data-column=\"" + columnIndex + "\" data-operator=\"=\">";
            columnHtml += "<i class=\"fa fa-search-plus\"></i>";
            columnHtml += "</a>";
        }
        if (cellClasses.length) {
            cellClass = ' class="' + cellClasses.join(' ') + '"';
        }
        columnHtml = '<td' + cellClass + cellStyle + '>' + columnHtml + '</td>';
        return columnHtml;
    };
    TableRenderer.prototype.render = function (page) {
        var pageSize = this.panel.pageSize || 100;
        var startPos = page * pageSize;
        var endPos = Math.min(startPos + pageSize, this.table.rows.length);
        var html = '';
        for (var y = startPos; y < endPos; y++) {
            var row = this.table.rows[y];
            var cellHtml = '';
            var rowStyle = '';
            var rowClasses = [];
            var rowClass = '';
            for (var i = 0; i < this.table.columns.length; i++) {
                cellHtml += this.renderCell(i, y, row[i], y === startPos);
            }
            if (this.colorState.row) {
                rowStyle = ' style="background-color:' + this.colorState.row + '"';
                rowClasses.push('table-panel-color-row');
                this.colorState.row = null;
            }
            if (rowClasses.length) {
                rowClass = ' class="' + rowClasses.join(' ') + '"';
            }
            html += '<tr ' + rowClass + rowStyle + '>' + cellHtml + '</tr>';
        }
        return html;
    };
    TableRenderer.prototype.render_values = function () {
        var rows = [];
        var visibleColumns = this.table.columns.filter(function (column) { return !column.hidden; });
        for (var y = 0; y < this.table.rows.length; y++) {
            var row = this.table.rows[y];
            var newRow = [];
            for (var i = 0; i < this.table.columns.length; i++) {
                if (!this.table.columns[i].hidden) {
                    newRow.push(this.formatColumnValue(i, row[i]));
                }
            }
            rows.push(newRow);
        }
        return {
            columns: visibleColumns,
            rows: rows,
        };
    };
    return TableRenderer;
}());
export { TableRenderer };
//# sourceMappingURL=renderer.js.map