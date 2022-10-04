module.exports = (username,io,socket) => {
            socket.emit("linked", username);
            const room = `player-${username}`;
            io.in(room).allSockets().then(sockets => {
                sockets.forEach(sId => {
                    const s = io.sockets.sockets.get(sId);
                    s.emit("unlinked");
                    s.leave(room);
                })
            });
            socket.join(room);
    };