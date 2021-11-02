import { __awaiter, __generator } from "tslib";
import { interval, of, throwError } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { OBSERVABLE_TEST_TIMEOUT_IN_MS } from './types';
describe('toEmitValues matcher', function () {
    describe('failing tests', function () {
        describe('passing null in expect', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = null;
                            rejects = expect(function () { return expect(observable).toEmitValues([1, 2, 3]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('passing undefined in expect', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = undefined;
                            rejects = expect(function () { return expect(observable).toEmitValues([1, 2, 3]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('passing number instead of Observable in expect', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = 1;
                            rejects = expect(function () { return expect(observable).toEmitValues([1, 2, 3]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('wrong number of emitted values', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(take(3));
                            rejects = expect(function () { return expect(observable).toEmitValues([0, 1]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('wrong emitted values', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(take(3));
                            rejects = expect(function () { return expect(observable).toEmitValues([1, 2, 3]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('wrong emitted value types', function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(take(3));
                            rejects = expect(function () { return expect(observable).toEmitValues(['0', '1', '2']); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe("observable that does not complete within " + OBSERVABLE_TEST_TIMEOUT_IN_MS + "ms", function () {
            it('should fail', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable, rejects;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(600);
                            rejects = expect(function () { return expect(observable).toEmitValues([0]); }).rejects;
                            return [4 /*yield*/, rejects.toThrow()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
    describe('passing tests', function () {
        describe('correct emitted values', function () {
            it('should pass with correct message', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(take(3));
                            return [4 /*yield*/, expect(observable).toEmitValues([0, 1, 2])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('using nested arrays', function () {
            it('should pass with correct message', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(map(function (interval) { return [{ text: interval.toString(), value: interval }]; }), take(3));
                            return [4 /*yield*/, expect(observable).toEmitValues([
                                    [{ text: '0', value: 0 }],
                                    [{ text: '1', value: 1 }],
                                    [{ text: '2', value: 2 }],
                                ])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('using nested objects', function () {
            it('should pass with correct message', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(map(function (interval) { return ({ inner: { text: interval.toString(), value: interval } }); }), take(3));
                            return [4 /*yield*/, expect(observable).toEmitValues([
                                    { inner: { text: '0', value: 0 } },
                                    { inner: { text: '1', value: 1 } },
                                    { inner: { text: '2', value: 2 } },
                                ])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('correct emitted values with throw', function () {
            it('should pass with correct message', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(map(function (interval) {
                                if (interval > 1) {
                                    throw 'an error';
                                }
                                return interval;
                            }));
                            return [4 /*yield*/, expect(observable).toEmitValues([0, 1, 'an error'])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('correct emitted values with throwError', function () {
            it('should pass with correct message', function () { return __awaiter(void 0, void 0, void 0, function () {
                var observable;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            observable = interval(10).pipe(mergeMap(function (interval) {
                                if (interval === 1) {
                                    return throwError('an error');
                                }
                                return of(interval);
                            }));
                            return [4 /*yield*/, expect(observable).toEmitValues([0, 'an error'])];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
//# sourceMappingURL=toEmitValues.test.js.map