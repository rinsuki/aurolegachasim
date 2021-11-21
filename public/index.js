"use strict";
const { useState } = React;
const CrewSpecialRoles = ["サイエンティスト", "エンジニア"];
const ImpostorSpecialRoles = ["シェープシフター"];
const CrewRole = "クルー";
const ImpostorRole = "インポスター";
const SpecialRoles = [...CrewSpecialRoles, ...ImpostorSpecialRoles];
function isImpostorRole(role) {
    return ImpostorSpecialRoles.includes(role) || role === "インポスター";
}
class Player {
    constructor(name, role) {
        this.name = name;
        this.role = role;
    }
}
/** @returns 0..<max の int */
function randomInt(max) {
    return Math.floor(Math.random() * max);
}
function assignRolesFromList(players, max, roles, currently) {
    while (currently.assigned < max && players.length > 0 && roles.length > 0) {
        const roleIndex = randomInt(roles.length);
        const role = roles[roleIndex];
        roles.splice(roleIndex, 1);
        const playerIndex = randomInt(players.length);
        const player = players[playerIndex];
        players.splice(playerIndex, 1);
        player.role = role;
        currently.assigned++;
    }
}
function assignRoles(players, mixedAssignInfo, max, teamIsImpostor) {
    var currently = { assigned: 0 };
    const assignInfo = mixedAssignInfo.filter((mai) => isImpostorRole(mai.role) === teamIsImpostor);
    // 100% ロールを先に割り振る
    const alwaysRAIs = assignInfo.filter((ai) => ai.percent >= 100);
    const alwaysRoles = [];
    for (const arai of alwaysRAIs) {
        for (let c = 0; c < arai.count; c++) {
            alwaysRoles.push(arai.role);
        }
    }
    assignRolesFromList(players, max, alwaysRoles, currently);
    // 100% ではないロールを割り振る
    const mayRAIs = assignInfo.filter((ai) => ai.percent > 0 && ai.percent < 100);
    const mayRoles = [];
    for (const mrai of mayRAIs) {
        for (let c = 0; c < mrai.count; c++) {
            if (Math.floor(Math.random() * 101) < mrai.percent)
                mayRoles.push(mrai.role);
        }
    }
    assignRolesFromList(players, max, mayRoles, currently);
    // デフォルトロールを割り振る
    const defaultRoles = [];
    for (let i = 0; i < max; i++) {
        defaultRoles.push(teamIsImpostor ? ImpostorRole : CrewRole);
    }
    assignRolesFromList(players, max, defaultRoles, currently);
}
function run(playerCount, assignInfo, impostorCount) {
    const players = [];
    for (let i = 0; i < playerCount; i++) {
        players.push(new Player("プレーヤー" + (i + 1)));
    }
    const origPlayers = [...players];
    assignRoles(players, assignInfo, impostorCount, true);
    assignRoles(players, assignInfo, players.length, false);
    console.log(origPlayers);
    return origPlayers;
}
function App() {
    const [playerCount, setPlayerCount] = useState(10);
    const [impostorCount, setImpostorCount] = useState(3);
    const [result, setResult] = useState();
    const specialRoles = [];
    for (const specialRole of SpecialRoles) {
        const [percent, setPercent] = useState(50);
        const [count, setCount] = useState(1);
        specialRoles.push({
            role: specialRole,
            percent,
            setPercent,
            count,
            setCount
        });
    }
    return (React.createElement("main", null,
        React.createElement("h1", null, "Among Us \u5F79\u8077\u30AC\u30C1\u30E3\u30B7\u30DF\u30E5\u30EC\u30FC\u30BF"),
        React.createElement("p", null, "\u305F\u3076\u3093 v2021.11.9 \u306E\u30B2\u30FC\u30E0\u672C\u4F53\u3068\u540C\u3058\u51E6\u7406\u306B\u306A\u3063\u3066\u308B\u306F\u305A"),
        React.createElement("div", null,
            "\u30D7\u30EC\u30FC\u30E4\u30FC:",
            " ",
            React.createElement("input", { type: "number", value: playerCount, onChange: (e) => setPlayerCount(e.currentTarget.valueAsNumber) })),
        React.createElement("div", null,
            "\u30A4\u30F3\u30DD\u30B9\u30BF\u30FC:",
            React.createElement("input", { type: "number", value: impostorCount, onChange: (e) => setImpostorCount(e.currentTarget.valueAsNumber) })),
        React.createElement("p", null,
            "\u7279\u6B8A\u5F79\u8077 (",
            specialRoles.length,
            "):"),
        specialRoles.map((sr) => {
            return (React.createElement("div", { key: sr.role },
                sr.role,
                ":",
                " ",
                React.createElement("input", { type: "number", value: sr.percent, onChange: (e) => sr.setPercent(e.currentTarget.valueAsNumber) }),
                "%\u3067",
                React.createElement("input", { type: "number", value: sr.count, onChange: (e) => sr.setCount(e.currentTarget.valueAsNumber) })));
        }),
        React.createElement("button", { onClick: () => setResult(run(playerCount, specialRoles, impostorCount)) }, "\u62BD\u9078"),
        result != null && (React.createElement(React.Fragment, null,
            React.createElement("h2", null, "\u62BD\u9078\u7D50\u679C"),
            result.map((player, i) => {
                return (React.createElement("div", { key: i, style: {
                        color: isImpostorRole(player.role) ? "red" : undefined
                    } },
                    player.name,
                    ": ",
                    player.role));
            })))));
}
const rootElement = document.getElementById("root");
ReactDOM.render(React.createElement(App, null), rootElement);
