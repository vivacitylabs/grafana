import { isArray } from 'lodash';
import coreModule from '../core/core_module';
export function arrayJoin() {
    'use strict';
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attr, ngModel) {
            function split_array(text) {
                return (text || '').split(',');
            }
            function join_array(text) {
                if (isArray(text)) {
                    return (text || '').join(',');
                }
                else {
                    return text;
                }
            }
            ngModel.$parsers.push(split_array);
            ngModel.$formatters.push(join_array);
        },
    };
}
coreModule.directive('arrayJoin', arrayJoin);
//# sourceMappingURL=array_join.js.map