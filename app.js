import { logClients, logPlayers, p, s, getId, getIdFromUsername, containsPlayer, objectForEach } from "./utils.js";

/*const server = new WebSocketServer({
	port: 8080,
});*/
const clients = {};
const players = {};
const rooms = {};
let currentRoom = null;

export default (server) => {
	server.on("connection", (ws) => {
		ws.id = getId();
		clients[ws.id] = ws;

		console.log("Socket connected!");
		logClients(clients);

		ws.on("message", (d) => onMessage(d, ws));
		ws.on("close", () => onClose(ws));
	});
};

function onClose(ws) {
	//try {
	console.log("Socket disconnected!");
	deleteRoom(ws.room, ws.id);
	delete clients[ws.id];
	delete players[ws.id];
	//delete rooms[ws.room];
	logClients(clients);
	//} catch (e) {}
}

function deleteRoom(roomId, id) {
	const room = rooms[roomId];
	if (!room) return;
	room.forEach((socketId) => {
		const ws = clients[socketId];
		ws?.send(s({ action: "close" }));
		ws?.close();
	});
}

/**
 * @param {WebSocket} ws
 */
function onMessage(data, ws) {
	const msg = p(data.toString());
	switch (msg.action) {
		case "setPlayer": {
			setPlayer(msg, ws);
			break;
		}
		case "autoJoin": {
			if (currentRoom) {
				const id = getId();
				rooms[id] = [currentRoom, ws.id];
				currentRoom = null;
				startRoom(id);
			} else {
				currentRoom = ws.id;
			}
			break;
		}
		case "updateBar": {
			updateBar(msg, ws);
			break;
		}
		case "bounce": {
			bounce(msg, ws);
			break;
		}
		case "lose": {
			lose(msg, ws);
			break;
		}
	}
}

function setPlayer(data, ws) {
	if (containsPlayer(players, data.data)) {
		ws.send(s({ action: "setPlayer", result: false }));
	} else {
		players[ws.id] = data.data;
		ws.send(s({ action: "setPlayer", result: true }));

		console.log("Player connected!");
		logPlayers(players);
	}
}

const games = {};

function startRoom(roomId) {
	console.log(rooms);
	const room = rooms[roomId];
	const sockets = room.map((x) => clients[x]);
	let vel = 1;
	sockets.forEach((x) => {
		x.room = roomId;
		x.send(s({ action: "roomJoined", data: { vel: { x: vel } } }));
		vel -= 1;
	});
	console.log(
		"players",
		room.map((x) => players[x])
	);
	games[roomId] = {
		ball: { x: 0.5, y: 0.5, vel: { x: 1, y: 0 } },
		players: {},
	};
	games[roomId].players[room[0]] = { ws: sockets[0], pos: 0.5, score: 0 };
	games[roomId].players[room[1]] = { ws: sockets[1], pos: 0.5, score: 0 };
}

function updateBar(data, ws) {
	const game = games[ws.room];
	const player = game.players[ws.id];
	player.pos = data;
	objectForEach(game.players, (_, x) => {
		if (x.ws.id === ws.id) return;
		x.ws.send(s({ action: "updateBar", data: data }));
	});
}

function bounce({ data }, ws) {
	const game = games[ws.room];
	const newData = {
		pos: { x: data.dest.x, y: data.pos.y },
		dest: { x: data.pos.x, y: data.dest.y },
	};
	objectForEach(game.players, (_, x) => {
		if (x.ws.id === ws.id) return;
		x.ws.send(s({ action: "bounce", data: newData }));
	});
}

function lose(_, ws) {
	const game = games[ws.room];
	objectForEach(game.players, (_, x) => {
		if (x.ws.id === ws.id) {
			x.ws.send(
				s({
					action: "bounce",
					data: {
						pos: { x: 1, y: 0.5 },
						dest: { x: 0, y: 0.5 },
						lost: true,
					},
				})
			);
		} else {
			x.ws.send(
				s({
					action: "bounce",
					data: {
						pos: { x: 0, y: 0.5 },
						dest: { x: 1, y: 0.5 },
						lost: false,
					},
				})
			);
		}
	});
}
