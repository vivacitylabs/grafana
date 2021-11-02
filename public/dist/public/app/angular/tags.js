import angular from 'angular';
import { getTagColorsFromName } from '@grafana/ui';
import $ from 'jquery';
import coreModule from '../core/core_module';
import 'vendor/tagsinput/bootstrap-tagsinput.js';
function setColor(name, element) {
    var _a = getTagColorsFromName(name), color = _a.color, borderColor = _a.borderColor;
    element.css('background-color', color);
    element.css('border-color', borderColor);
}
function tagColorFromName() {
    return {
        scope: { tagColorFromName: '=' },
        link: function (scope, element) {
            setColor(scope.tagColorFromName, element);
        },
    };
}
function bootstrapTagsinput() {
    function getItemProperty(scope, property) {
        if (!property) {
            return undefined;
        }
        if (angular.isFunction(scope.$parent[property])) {
            return scope.$parent[property];
        }
        return function (item) {
            return item[property];
        };
    }
    return {
        restrict: 'EA',
        scope: {
            model: '=ngModel',
            onTagsUpdated: '&',
        },
        template: '<select multiple></select>',
        replace: false,
        link: function (scope, element, attrs) {
            var _this = this;
            if (!angular.isArray(scope.model)) {
                scope.model = [];
            }
            var select = $('select', element);
            if (attrs.placeholder) {
                select.attr('placeholder', attrs.placeholder);
            }
            select.tagsinput({
                typeahead: {
                    source: angular.isFunction(scope.$parent[attrs.typeaheadSource])
                        ? scope.$parent[attrs.typeaheadSource]
                        : null,
                },
                widthClass: attrs.widthClass,
                itemValue: getItemProperty(scope, attrs.itemvalue),
                itemText: getItemProperty(scope, attrs.itemtext),
                tagClass: angular.isFunction(scope.$parent[attrs.tagclass])
                    ? scope.$parent[attrs.tagclass]
                    : function () {
                        return attrs.tagclass;
                    },
            });
            select.on('itemAdded', function (event) {
                if (scope.model.indexOf(event.item) === -1) {
                    scope.model.push(event.item);
                    if (scope.onTagsUpdated) {
                        scope.onTagsUpdated();
                    }
                }
                var tagElement = select
                    .next()
                    .children('span')
                    .filter(function () {
                    return $(_this).text() === event.item;
                });
                setColor(event.item, tagElement);
            });
            select.on('itemRemoved', function (event) {
                var idx = scope.model.indexOf(event.item);
                if (idx !== -1) {
                    scope.model.splice(idx, 1);
                    if (scope.onTagsUpdated) {
                        scope.onTagsUpdated();
                    }
                }
            });
            scope.$watch('model', function () {
                if (!angular.isArray(scope.model)) {
                    scope.model = [];
                }
                select.tagsinput('removeAll');
                for (var i = 0; i < scope.model.length; i++) {
                    select.tagsinput('add', scope.model[i]);
                }
            }, true);
        },
    };
}
coreModule.directive('tagColorFromName', tagColorFromName);
coreModule.directive('bootstrapTagsinput', bootstrapTagsinput);
//# sourceMappingURL=tags.js.map