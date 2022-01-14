export function logClients(clients) {
    console.log("Clients: {");
    Object.keys(clients).forEach((key) => console.log("    " + key));
    console.log("}");
}

export function logPlayers(players) {
    console.log("Players: {");
    Object.keys(players).forEach((key) =>
        console.log(`    ${key}: ${players[key]}`)
    );
    console.log("}");
}

export const p = (s) => JSON.parse(s);
export const s = (j) => JSON.stringify(j);
export const getId = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + "-" + s4();
};

export const getIdFromUsername = (players, username) => {
    for (const key in Object.keys(players)) {
        if (players[key] === username) {
            return key;
        }
    }
};

export function containsPlayer(players, username) {
    const keys = Object.keys(players);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (players[key] === username) {
            return true;
        }
    }
    return false;
}

export function objectForEach(object, callback) {
    let i = 0;
    Object.keys(object).forEach((key) => callback(key, object[key], i++));
}
