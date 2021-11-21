const { useState } = React

const CrewSpecialRoles = ["サイエンティスト", "エンジニア"] as const;
const ImpostorSpecialRoles = ["シェープシフター"] as const;
const CrewRole = "クルー" as const;
const ImpostorRole = "インポスター" as const;
const SpecialRoles = [...CrewSpecialRoles, ...ImpostorSpecialRoles] as const;
type Role =
    | typeof CrewSpecialRoles[number]
    | typeof ImpostorSpecialRoles[number]
    | typeof CrewRole
    | typeof ImpostorRole;
function isImpostorRole(role: Role): boolean {
    return ImpostorSpecialRoles.includes(role as any) || role === "インポスター";
}

interface RoleAssignInfo {
    role: Role;
    count: number;
    percent: number;
}

class Player {
    constructor(public name: string, public role?: Role) { }
}

/** @returns 0..<max の int */
function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

function assignRolesFromList(
    players: Player[],
    max: number,
    roles: Role[],
    currently: { assigned: number }
) {
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

function assignRoles(
    players: Player[],
    mixedAssignInfo: RoleAssignInfo[],
    max: number,
    teamIsImpostor: boolean
) {
    var currently = { assigned: 0 };
    const assignInfo = mixedAssignInfo.filter(
        (mai) => isImpostorRole(mai.role) === teamIsImpostor
    );
    // 100% ロールを先に割り振る
    const alwaysRAIs = assignInfo.filter((ai) => ai.percent >= 100);
    const alwaysRoles: Role[] = [];
    for (const arai of alwaysRAIs) {
        for (let c = 0; c < arai.count; c++) {
            alwaysRoles.push(arai.role);
        }
    }
    assignRolesFromList(players, max, alwaysRoles, currently);
    // 100% ではないロールを割り振る
    const mayRAIs = assignInfo.filter((ai) => ai.percent > 0 && ai.percent < 100);
    const mayRoles: Role[] = [];
    for (const mrai of mayRAIs) {
        for (let c = 0; c < mrai.count; c++) {
            if (Math.floor(Math.random() * 101) < mrai.percent)
                mayRoles.push(mrai.role);
        }
    }
    assignRolesFromList(players, max, mayRoles, currently);
    // デフォルトロールを割り振る
    const defaultRoles: Role[] = [];
    for (let i = 0; i < max; i++) {
        defaultRoles.push(teamIsImpostor ? ImpostorRole : CrewRole);
    }
    assignRolesFromList(players, max, defaultRoles, currently);
}

function run(
    playerCount: number,
    assignInfo: RoleAssignInfo[],
    impostorCount: number
) {
    const players: Player[] = [];
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
    const [result, setResult] = useState<Player[]>();
    const specialRoles: {
        role: Role;
        percent: number;
        setPercent: (f: number) => void;
        count: number;
        setCount: (f: number) => void;
    }[] = [];
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
    return (
        <main>
            <h1>Among Us 役職ガチャシミュレータ</h1>
            <p>たぶん v2021.11.9 のゲーム本体と同じ処理になってるはず</p>
            <div>
                プレーヤー:{" "}
                <input
                    type="number"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(e.currentTarget.valueAsNumber)}
                />
            </div>
            <div>
                インポスター:
                <input
                    type="number"
                    value={impostorCount}
                    onChange={(e) => setImpostorCount(e.currentTarget.valueAsNumber)}
                />
            </div>
            <p>特殊役職 ({specialRoles.length}):</p>
            {specialRoles.map((sr) => {
                return (
                    <div key={sr.role}>
                        {sr.role}:{" "}
                        <input
                            type="number"
                            value={sr.percent}
                            onChange={(e) => sr.setPercent(e.currentTarget.valueAsNumber)}
                        />
                        %で
                        <input
                            type="number"
                            value={sr.count}
                            onChange={(e) => sr.setCount(e.currentTarget.valueAsNumber)}
                        />
                    </div>
                );
            })}
            <button
                onClick={() => setResult(run(playerCount, specialRoles, impostorCount))}
            >
                抽選
            </button>
            {result != null && (
                <>
                    <h2>抽選結果</h2>
                    {result.map((player, i) => {
                        return (
                            <div
                                key={i}
                                style={{
                                    color: isImpostorRole(player.role!) ? "red" : undefined
                                }}
                            >
                                {player.name}: {player.role}
                            </div>
                        );
                    })}
                </>
            )}
        </main>
    );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
