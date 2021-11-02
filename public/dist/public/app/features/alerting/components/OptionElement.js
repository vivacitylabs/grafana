import { __assign, __rest } from "tslib";
import React from 'react';
import { Input, InputControl, Select, TextArea } from '@grafana/ui';
export var OptionElement = function (_a) {
    var control = _a.control, option = _a.option, register = _a.register, invalid = _a.invalid;
    var modelValue = option.secure ? "secureSettings." + option.propertyName : "settings." + option.propertyName;
    switch (option.element) {
        case 'input':
            return (React.createElement(Input, __assign({}, register("" + modelValue, {
                required: option.required ? 'Required' : false,
                validate: function (v) { return (option.validationRule !== '' ? validateOption(v, option.validationRule) : true); },
            }), { invalid: invalid, type: option.inputType, placeholder: option.placeholder })));
        case 'select':
            return (React.createElement(InputControl, { control: control, name: "" + modelValue, render: function (_a) {
                    var _b;
                    var _c = _a.field, ref = _c.ref, field = __rest(_c, ["ref"]);
                    return (React.createElement(Select, __assign({ menuShouldPortal: true }, field, { options: (_b = option.selectOptions) !== null && _b !== void 0 ? _b : undefined, invalid: invalid })));
                } }));
        case 'textarea':
            return (React.createElement(TextArea, __assign({ invalid: invalid }, register("" + modelValue, {
                required: option.required ? 'Required' : false,
                validate: function (v) { return (option.validationRule !== '' ? validateOption(v, option.validationRule) : true); },
            }))));
        default:
            console.error('Element not supported', option.element);
            return null;
    }
};
var validateOption = function (value, validationRule) {
    return RegExp(validationRule).test(value) ? true : 'Invalid format';
};
//# sourceMappingURL=OptionElement.js.map