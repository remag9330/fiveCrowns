async function main() {
    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) {
        throw new Error("Could not find 'main' element :(");
    }

    let state: GameState = {
        players: {},
    };

    const root = (ReactDOM as any).createRoot(main);
    while (true) {
        const event = await render(root, state);
        state = handleEvent(state, event);
    }
}

function render(root: any, state: GameState): Promise<GameEvent> {
    return new Promise(res => {
        const elem = <App state={state} onEvent={res} />
        root.render(elem);
    });
}

function App({ state, onEvent }: { state: GameState, onEvent: (e: GameEvent) => void }) {
    const players = Object.values(state.players);
    const gameStarted = players.some(p => Object.values(p.scores).length > 0);
    const anyPlayers = players.length > 0;

    const [name, setName] = React.useState("");
    const [dealerShift, setDealerShift] = React.useState(0);

    return <>
        {!gameStarted && <>
            <div className="addPlayer">
                <input type="text" placeholder="Player Name" value={name} onChange={e => setName(e.target.value)} />
                <button type="button" onClick={() => {
                    setName("");
                    onEvent(addPlayerEvent(name));
                }}>Add Player</button>
            </div>
            {anyPlayers && <div className="shiftDealer">
                <button type="button" onClick={() => setDealerShift(dealerShift + 1)}>⬅️</button>
                <span>Shift Dealer</span>
                <button type="button" onClick={() => setDealerShift(dealerShift - 1)}>➡️</button>
            </div>}
        </>}
        {anyPlayers && <Table state={state} dealerShift={dealerShift} onEvent={onEvent} />}
    </>
}

function Table({ state, dealerShift, onEvent }: { state: GameState, dealerShift: number, onEvent: (e: GameEvent) => void }) {
    const players = Object.values(state.players);
    const gameStarted = players.some((p) => Object.values(p.scores).length > 0);

    return <table className="scoreTable">
        <Header players={players} />
        <Body players={players} dealerShift={dealerShift} onEvent={onEvent} />
        <Footer players={players} />
    </table>;
}

function Header({players}: {players: Player[]}) {
    return <thead>
        <tr>
            <td />
            {players.map(p => <th key={p.name} scope="col">{p.name}</th>)}
        </tr>
    </thead>
}

function Body({ players, dealerShift, onEvent }: { players: Player[], dealerShift: number, onEvent: (e: GameEvent) => void }) {
    return <tbody>
        {ROUND_VALUES.map((round, i) => {
            const dealerIdx = (((dealerShift + i) % players.length) + players.length) % players.length
            const dealer = players[dealerIdx];

            return <tr key={round}>
                <th scope="row">{round}<sub>{dealer?.name[0] ?? ""}</sub></th>
                {...players.map(p => {
                    return <td>
                        <input
                            type="number"
                            value={p.scores[round] ?? ""}
                            onChange={e => {
                                const v = parseInt(e.target.value);
                                onEvent(setPlayerScoreEvent(p.name, round, isNaN(v) ? undefined : v));
                            }}
                        ></input>
                    </td>
                })}
            </tr>
        })}
    </tbody>
}

function Footer({ players }: { players: Player[] }) {
    return <tfoot>
        <tr>
            <th scope="row"></th>
            {...players.map(p => <td key={p.name}>{sum(p.scores)}</td>)}
        </tr>
    </tfoot>
}

function sum(nums: Record<string, number | undefined>): number {
    return Object.values(nums)
        .map((i) => i ?? 0)
        .reduce((prev, curr) => prev + curr, 0);
}

interface GameState {
    players: Record<string, Player>
}


interface Player {
    name: string,
    scores: {[K in RoundValue]?: number},
}

const ROUND_VALUES = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const
type RoundValue = typeof ROUND_VALUES[number];

type GameEvent = AddPlayerEvent | SetPlayerScoreEvent;

interface AddPlayerEvent {
    type: "addPlayer",
    name: string
}

function addPlayerEvent(name: string): AddPlayerEvent {
    return {
        type: "addPlayer",
        name,
    };
}

interface SetPlayerScoreEvent {
    type: "setPlayerScore",
    playerName: string, 
    round: string,
    value: number | undefined,
}

function setPlayerScoreEvent(playerName: string, round: string, value: number | undefined): SetPlayerScoreEvent {
    return {
        type: "setPlayerScore",
        playerName,
        round,
        value,
    };
}

function handleEvent(state: GameState, evt: GameEvent): GameState {
    if (evt.type === "addPlayer") {
        if (state.players[evt.name]) {
            alert("Name already taken");
            return state;
        }

        return {
            ...state,
            players: {
                ...state.players,
                [evt.name]: {
                    name: evt.name,
                    scores: {},
                },
            },
        };
    } else if (evt.type === "setPlayerScore") {
        return {
            ...state,
            players: {
                ...state.players,
                [evt.playerName]: {
                    ...state.players[evt.playerName],
                    scores: {
                        ...state.players[evt.playerName].scores,
                        [evt.round]: evt.value,
                    },
                },
            },
        };
    } else {
        const exhaustive: never = evt;
        throw new Error(`Unhandled event: ${JSON.stringify(evt)}`);
    }
}

window.addEventListener("load", main);
