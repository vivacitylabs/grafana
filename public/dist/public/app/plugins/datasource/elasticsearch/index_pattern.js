import { toUtc, dateTime } from '@grafana/data';
var intervalMap = {
    Hourly: { startOf: 'hour', amount: 'hours' },
    Daily: { startOf: 'day', amount: 'days' },
    Weekly: { startOf: 'isoWeek', amount: 'weeks' },
    Monthly: { startOf: 'month', amount: 'months' },
    Yearly: { startOf: 'year', amount: 'years' },
};
var IndexPattern = /** @class */ (function () {
    function IndexPattern(pattern, interval) {
        this.pattern = pattern;
        this.interval = interval;
        this.dateLocale = 'en';
    }
    IndexPattern.prototype.getIndexForToday = function () {
        if (this.interval) {
            return toUtc().locale(this.dateLocale).format(this.pattern);
        }
        else {
            return this.pattern;
        }
    };
    IndexPattern.prototype.getIndexList = function (from, to) {
        // When no `from` or `to` is provided, we request data from 7 subsequent/previous indices
        // for the provided index pattern.
        // This is useful when requesting log context where the only time data we have is the log
        // timestamp.
        var indexOffset = 7;
        if (!this.interval) {
            return this.pattern;
        }
        var intervalInfo = intervalMap[this.interval];
        var start = dateTime(from || dateTime(to).add(-indexOffset, intervalInfo.amount))
            .utc()
            .startOf(intervalInfo.startOf);
        var endEpoch = dateTime(to || dateTime(from).add(indexOffset, intervalInfo.amount))
            .utc()
            .startOf(intervalInfo.startOf)
            .valueOf();
        var indexList = [];
        while (start.valueOf() <= endEpoch) {
            indexList.push(start.locale(this.dateLocale).format(this.pattern));
            start.add(1, intervalInfo.amount);
        }
        return indexList;
    };
    return IndexPattern;
}());
export { IndexPattern };
//# sourceMappingURL=index_pattern.js.map