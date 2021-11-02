import { find } from 'lodash';
import { createChangeHandler, createResetHandler, PasswordFieldEnum, } from '../../../features/datasources/utils/passwordHandlers';
var PostgresConfigCtrl = /** @class */ (function () {
    /** @ngInject */
    function PostgresConfigCtrl($scope, datasourceSrv) {
        // the value portion is derived from postgres server_version_num/100
        this.postgresVersions = [
            { name: '9.3', value: 903 },
            { name: '9.4', value: 904 },
            { name: '9.5', value: 905 },
            { name: '9.6', value: 906 },
            { name: '10', value: 1000 },
            { name: '11', value: 1100 },
            { name: '12+', value: 1200 },
        ];
        this.current = $scope.ctrl.current;
        this.datasourceSrv = datasourceSrv;
        this.current.jsonData.sslmode = this.current.jsonData.sslmode || 'verify-full';
        this.current.jsonData.tlsConfigurationMethod = this.current.jsonData.tlsConfigurationMethod || 'file-path';
        this.current.jsonData.postgresVersion = this.current.jsonData.postgresVersion || 903;
        this.showTimescaleDBHelp = false;
        this.autoDetectFeatures();
        this.onPasswordReset = createResetHandler(this, PasswordFieldEnum.Password);
        this.onPasswordChange = createChangeHandler(this, PasswordFieldEnum.Password);
        this.tlsModeMapping();
    }
    PostgresConfigCtrl.prototype.autoDetectFeatures = function () {
        var _this = this;
        if (!this.current.id) {
            return;
        }
        this.datasourceSrv.loadDatasource(this.current.name).then(function (ds) {
            return ds.getVersion().then(function (version) {
                version = Number(version[0].text);
                // timescaledb is only available for 9.6+
                if (version >= 906) {
                    ds.getTimescaleDBVersion().then(function (version) {
                        if (version.length === 1) {
                            _this.current.jsonData.timescaledb = true;
                        }
                    });
                }
                var major = Math.trunc(version / 100);
                var minor = version % 100;
                var name = String(major);
                if (version < 1000) {
                    name = String(major) + '.' + String(minor);
                }
                if (!find(_this.postgresVersions, function (p) { return p.value === version; })) {
                    _this.postgresVersions.push({ name: name, value: version });
                }
                _this.current.jsonData.postgresVersion = version;
            });
        });
    };
    PostgresConfigCtrl.prototype.toggleTimescaleDBHelp = function () {
        this.showTimescaleDBHelp = !this.showTimescaleDBHelp;
    };
    PostgresConfigCtrl.prototype.tlsModeMapping = function () {
        if (this.current.jsonData.sslmode === 'disable') {
            this.current.jsonData.tlsAuth = false;
            this.current.jsonData.tlsAuthWithCACert = false;
            this.current.jsonData.tlsSkipVerify = true;
        }
        else {
            this.current.jsonData.tlsAuth = true;
            this.current.jsonData.tlsAuthWithCACert = true;
            this.current.jsonData.tlsSkipVerify = false;
        }
    };
    PostgresConfigCtrl.templateUrl = 'partials/config.html';
    return PostgresConfigCtrl;
}());
export { PostgresConfigCtrl };
//# sourceMappingURL=config_ctrl.js.map