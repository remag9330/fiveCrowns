"use strict";
async function main() {
    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) {
        throw new Error("Could not find 'main' element :(");
    }
    let state = {
        players: {},
    };
    const root = ReactDOM.createRoot(main);
    while (true) {
        const event = await render(root, state);
        state = handleEvent(state, event);
    }
}
function render(root, state) {
    return new Promise(res => {
        const elem = React.createElement(App, { state: state, onEvent: res });
        root.render(elem);
    });
}
function App({ state, onEvent }) {
    const players = Object.values(state.players);
    const gameStarted = players.some(p => Object.values(p.scores).length > 0);
    const anyPlayers = players.length > 0;
    const [name, setName] = React.useState("");
    const [dealerShift, setDealerShift] = React.useState(0);
    return React.createElement(React.Fragment, null,
        !gameStarted && React.createElement(React.Fragment, null,
            React.createElement("div", { className: "addPlayer" },
                React.createElement("input", { type: "text", placeholder: "Player Name", value: name, onChange: e => setName(e.target.value) }),
                React.createElement("button", { type: "button", onClick: () => {
                        setName("");
                        onEvent(addPlayerEvent(name));
                    } }, "Add Player")),
            anyPlayers && React.createElement("div", { className: "shiftDealer" },
                React.createElement("button", { type: "button", onClick: () => setDealerShift(dealerShift + 1) }, "\u2B05\uFE0F"),
                React.createElement("span", null, "Shift Dealer"),
                React.createElement("button", { type: "button", onClick: () => setDealerShift(dealerShift - 1) }, "\u27A1\uFE0F"))),
        anyPlayers && React.createElement(Table, { state: state, dealerShift: dealerShift, onEvent: onEvent }));
}
function Table({ state, dealerShift, onEvent }) {
    const players = Object.values(state.players);
    const gameStarted = players.some((p) => Object.values(p.scores).length > 0);
    return React.createElement("table", { className: "scoreTable" },
        React.createElement(Header, { players: players }),
        React.createElement(Body, { players: players, dealerShift: dealerShift, onEvent: onEvent }),
        React.createElement(Footer, { players: players }));
}
function Header({ players }) {
    return React.createElement("thead", null,
        React.createElement("tr", null,
            React.createElement("td", null),
            players.map(p => React.createElement("th", { key: p.name, scope: "col" }, p.name))));
}
function Body({ players, dealerShift, onEvent }) {
    return React.createElement("tbody", null, ROUND_VALUES.map((round, i) => {
        var _a;
        const dealerIdx = (((dealerShift + i) % players.length) + players.length) % players.length;
        const dealer = players[dealerIdx];
        return React.createElement("tr", { key: round },
            React.createElement("th", { scope: "row" },
                round,
                React.createElement("sub", null, (_a = dealer === null || dealer === void 0 ? void 0 : dealer.name[0]) !== null && _a !== void 0 ? _a : "")),
            ...players.map(p => {
                var _a;
                return React.createElement("td", null,
                    React.createElement("input", { type: "number", value: (_a = p.scores[round]) !== null && _a !== void 0 ? _a : "", onChange: e => {
                            const v = parseInt(e.target.value);
                            onEvent(setPlayerScoreEvent(p.name, round, isNaN(v) ? undefined : v));
                        } }));
            }));
    }));
}
function Footer({ players }) {
    return React.createElement("tfoot", null,
        React.createElement("tr", null,
            React.createElement("th", { scope: "row" }),
            ...players.map(p => React.createElement("td", { key: p.name }, sum(p.scores)))));
}
function sum(nums) {
    return Object.values(nums)
        .map((i) => i !== null && i !== void 0 ? i : 0)
        .reduce((prev, curr) => prev + curr, 0);
}
const ROUND_VALUES = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
function addPlayerEvent(name) {
    return {
        type: "addPlayer",
        name,
    };
}
function setPlayerScoreEvent(playerName, round, value) {
    return {
        type: "setPlayerScore",
        playerName,
        round,
        value,
    };
}
function handleEvent(state, evt) {
    if (evt.type === "addPlayer") {
        if (state.players[evt.name]) {
            alert("Name already taken");
            return state;
        }
        return Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { [evt.name]: {
                    name: evt.name,
                    scores: {},
                } }) });
    }
    else if (evt.type === "setPlayerScore") {
        return Object.assign(Object.assign({}, state), { players: Object.assign(Object.assign({}, state.players), { [evt.playerName]: Object.assign(Object.assign({}, state.players[evt.playerName]), { scores: Object.assign(Object.assign({}, state.players[evt.playerName].scores), { [evt.round]: evt.value }) }) }) });
    }
    else {
        const exhaustive = evt;
        throw new Error(`Unhandled event: ${JSON.stringify(evt)}`);
    }
}
window.addEventListener("load", main);
