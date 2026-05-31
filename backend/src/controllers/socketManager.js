import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED")

        socket.on("check-room", (path, callback) => {
            const exists = connections[path] !== undefined && connections[path].length > 0;
            callback({ exists });
        });

        socket.on("join-call", (path, username) => {
            if (connections[path] === undefined) connections[path] = [];
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            socket.data.username = username?.trim() || `User-${socket.id.slice(0, 4)}`;
            socket.data.room = path;

            // ── Build a full { socketId: username } map for every participant ──
            const usernameMap = {};
            connections[path].forEach(id => {
                const s = io.sockets.sockets.get(id);

                usernameMap[id] =
                    s?.data?.username || `User-${id.slice(0, 4)}`;
            });

            // Tell everyone this user joined — include the full username map
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path], usernameMap);
            }

            // ── Path 2: individual user-name events (belt-and-suspenders) ──

            // Send new user's name TO all existing participants
            connections[path].forEach(elem => {
                if (elem !== socket.id) {
                    const name =
                        socket.data.username ||
                        `User-${socket.id.slice(0, 4)}`;

                    io.to(elem).emit("user-name", socket.id, name);
                }
            });

            // Send each existing participant's name BACK TO the new user
            connections[path].forEach(elem => {
                if (elem !== socket.id) {
                    const existingSocket = io.sockets.sockets.get(elem);

                    const name =
                        existingSocket?.data?.username ||
                        `User-${elem.slice(0, 4)}`;   // ✅ fallback ALWAYS

                    io.to(socket.id).emit("user-name", elem, name);
                }
            });

            // Replay chat history to newcomer
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message",
                        messages[path][a]['data'],
                        messages[path][a]['sender'],
                        messages[path][a]['socket-id-sender']);
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) return [roomKey, true];
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) messages[matchingRoom] = [];
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id });
                console.log("message", matchingRoom, ":", sender, data);
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id);
                })
            }
        })

        // End call — redirect everyone in the room to home
        socket.on("end-call", () => {
            const room = socket.data.room;
            if (room && connections[room]) {
                connections[room].forEach(elem => {
                    io.to(elem).emit("call-ended");
                });
            }
        });

        socket.on("disconnect", () => {
            var key;
            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k;
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }
                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);
                        if (connections[key].length === 0) delete connections[key];
                    }
                }
            }
        })
    })

    return io;
}

export const getConnections = () => connections;