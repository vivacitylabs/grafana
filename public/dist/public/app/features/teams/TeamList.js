import { __awaiter, __extends, __generator } from "tslib";
import React, { PureComponent } from 'react';
import Page from 'app/core/components/Page/Page';
import { DeleteButton, LinkButton, FilterInput } from '@grafana/ui';
import EmptyListCTA from 'app/core/components/EmptyListCTA/EmptyListCTA';
import { OrgRole } from 'app/types';
import { deleteTeam, loadTeams } from './state/actions';
import { getSearchQuery, getTeams, getTeamsCount, isPermissionTeamAdmin } from './state/selectors';
import { getNavModel } from 'app/core/selectors/navModel';
import { config } from 'app/core/config';
import { contextSrv } from 'app/core/services/context_srv';
import { connectWithCleanUp } from '../../core/components/connectWithCleanUp';
import { setSearchQuery } from './state/reducers';
var TeamList = /** @class */ (function (_super) {
    __extends(TeamList, _super);
    function TeamList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.deleteTeam = function (team) {
            _this.props.deleteTeam(team.id);
        };
        _this.onSearchQueryChange = function (value) {
            _this.props.setSearchQuery(value);
        };
        return _this;
    }
    TeamList.prototype.componentDidMount = function () {
        this.fetchTeams();
    };
    TeamList.prototype.fetchTeams = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.props.loadTeams()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    TeamList.prototype.renderTeam = function (team) {
        var _this = this;
        var _a;
        var _b = this.props, editorsCanAdmin = _b.editorsCanAdmin, signedInUser = _b.signedInUser;
        var permission = team.permission;
        var teamUrl = "org/teams/edit/" + team.id;
        var canDelete = isPermissionTeamAdmin({ permission: permission, editorsCanAdmin: editorsCanAdmin, signedInUser: signedInUser });
        return (React.createElement("tr", { key: team.id },
            React.createElement("td", { className: "width-4 text-center link-td" },
                React.createElement("a", { href: teamUrl },
                    React.createElement("img", { className: "filter-table__avatar", src: team.avatarUrl, alt: "Team avatar" }))),
            React.createElement("td", { className: "link-td" },
                React.createElement("a", { href: teamUrl }, team.name)),
            React.createElement("td", { className: "link-td" },
                React.createElement("a", { href: teamUrl, "aria-label": ((_a = team.email) === null || _a === void 0 ? void 0 : _a.length) > 0 ? undefined : 'Empty email cell' }, team.email)),
            React.createElement("td", { className: "link-td" },
                React.createElement("a", { href: teamUrl }, team.memberCount)),
            React.createElement("td", { className: "text-right" },
                React.createElement(DeleteButton, { "aria-label": "Delete team", size: "sm", disabled: !canDelete, onConfirm: function () { return _this.deleteTeam(team); } }))));
    };
    TeamList.prototype.renderEmptyList = function () {
        return (React.createElement(EmptyListCTA, { title: "You haven't created any teams yet.", buttonIcon: "users-alt", buttonLink: "org/teams/new", buttonTitle: " New team", proTip: "Assign folder and dashboard permissions to teams instead of users to ease administration.", proTipLink: "", proTipLinkTitle: "", proTipTarget: "_blank" }));
    };
    TeamList.prototype.renderTeamList = function () {
        var _this = this;
        var _a = this.props, teams = _a.teams, searchQuery = _a.searchQuery, editorsCanAdmin = _a.editorsCanAdmin, signedInUser = _a.signedInUser;
        var isCanAdminAndViewer = editorsCanAdmin && signedInUser.orgRole === OrgRole.Viewer;
        var disabledClass = isCanAdminAndViewer ? ' disabled' : '';
        var newTeamHref = isCanAdminAndViewer ? '#' : 'org/teams/new';
        return (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "page-action-bar" },
                React.createElement("div", { className: "gf-form gf-form--grow" },
                    React.createElement(FilterInput, { placeholder: "Search teams", value: searchQuery, onChange: this.onSearchQueryChange })),
                React.createElement(LinkButton, { className: disabledClass, href: newTeamHref }, "New Team")),
            React.createElement("div", { className: "admin-list-table" },
                React.createElement("table", { className: "filter-table filter-table--hover form-inline" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", null),
                            React.createElement("th", null, "Name"),
                            React.createElement("th", null, "Email"),
                            React.createElement("th", null, "Members"),
                            React.createElement("th", { style: { width: '1%' } }))),
                    React.createElement("tbody", null, teams.map(function (team) { return _this.renderTeam(team); }))))));
    };
    TeamList.prototype.renderList = function () {
        var _a = this.props, teamsCount = _a.teamsCount, hasFetched = _a.hasFetched;
        if (!hasFetched) {
            return null;
        }
        if (teamsCount > 0) {
            return this.renderTeamList();
        }
        else {
            return this.renderEmptyList();
        }
    };
    TeamList.prototype.render = function () {
        var _a = this.props, hasFetched = _a.hasFetched, navModel = _a.navModel;
        return (React.createElement(Page, { navModel: navModel },
            React.createElement(Page.Contents, { isLoading: !hasFetched }, this.renderList())));
    };
    return TeamList;
}(PureComponent));
export { TeamList };
function mapStateToProps(state) {
    return {
        navModel: getNavModel(state.navIndex, 'teams'),
        teams: getTeams(state.teams),
        searchQuery: getSearchQuery(state.teams),
        teamsCount: getTeamsCount(state.teams),
        hasFetched: state.teams.hasFetched,
        editorsCanAdmin: config.editorsCanAdmin,
        signedInUser: contextSrv.user, // this makes the feature toggle mockable/controllable from tests,
    };
}
var mapDispatchToProps = {
    loadTeams: loadTeams,
    deleteTeam: deleteTeam,
    setSearchQuery: setSearchQuery,
};
export default connectWithCleanUp(mapStateToProps, mapDispatchToProps, function (state) { return state.teams; })(TeamList);
//# sourceMappingURL=TeamList.js.map