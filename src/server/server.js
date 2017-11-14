"use strict";

import express from "express";
import http from "http";
import socketIO from "socket.io";
import mongoose from "mongoose";
import compression from "compression";

import { sanitizeString } from "../shared/util";

import SnekCommand from "./models/SnekCommand";
import { setInterval } from "timers";

mongoose.Promise = require("bluebird");
let mongo_url = process.env.MONGO || "127.0.0.1";

mongoose
    .connect(`mongodb://${mongo_url}/twitchsnek`, { useMongoClient: true })
    .then(
        () => {
            let db = mongoose.connection;
            console.log("Connected to database");
        },
        err => {
            console.log("Could not connect to database");
        }
    );

let app = express();
let server = http.Server(app);
let io = new socketIO(server);
let port = process.env.PORT || 6969;

app.use(compression({}));
app.use(express["static"](__dirname + "/../client"));

io.on("connection", socket => {
    // Check whether user is in database, if not, create one.
    console.log(`User ${socket.id} connected`);

    socket.on("disconnect", () => {
        // Update database when left
        console.log(`User ${socket.id} disconnected.`);
    });

    socket.on("error", err => {
        console.log(`CLIENT ERROR: ${err}`);
    });

    socket.on("directionChart", () => {
        let initialData = {
            datasets: [
                {
                    values: [0, 0, 0, 0]
                }
            ]
        };
        SnekCommand.count({ direction: "left" }, (err, count) => {
            initialData.datasets[0].values[0] = count;
            SnekCommand.count({ direction: "right" }, (err, count) => {
                initialData.datasets[0].values[1] = count;
                SnekCommand.count({ direction: "up" }, (err, count) => {
                    initialData.datasets[0].values[2] = count;
                    SnekCommand.count({ direction: "down" }, (err, count) => {
                        initialData.datasets[0].values[3] = count;
                        SnekCommand.count(
                            { direction: "down" },
                            (err, count) => {
                                initialData.datasets[0].values[3] = count;
                                socket.emit("updateDirectionChart", {
                                    data: initialData,
                                    type: "initial"
                                });
                            }
                        );
                    });
                });
            });
        });
    });

    socket.on("tilesinfo", () => {
        let tileData = {
            totalCommands: 0,
            totalPlayers: 0,
            totalCommandsDay: 0,
            totalPlayersDay: 0
        };

        SnekCommand.distinct("username", (err, users) => {
            tileData.totalPlayers = users.length;
            SnekCommand.count({}, (err, c) => {
                tileData.totalCommands = c;
                socket.emit("updateTiles", { data: tileData });
            });
        });
    });

    setInterval(() => {
        let newData = {
            datasets: [
                {
                    values: [0, 0, 0, 0]
                }
            ]
        };
        SnekCommand.count({ direction: "left" }, (err, count) => {
            newData.datasets[0].values[0] = count;
            SnekCommand.count({ direction: "right" }, (err, count) => {
                newData.datasets[0].values[1] = count;
                SnekCommand.count({ direction: "up" }, (err, count) => {
                    newData.datasets[0].values[2] = count;
                    SnekCommand.count({ direction: "down" }, (err, count) => {
                        newData.datasets[0].values[3] = count;
                        SnekCommand.count(
                            { direction: "down" },
                            (err, count) => {
                                newData.datasets[0].values[3] = count;
                                socket.emit("updateDirectionChart", {
                                    data: newData,
                                    type: "refresh"
                                });
                            }
                        );
                    });
                });
            });
        });
    }, 30000);

    setInterval(() => {
        let tileData = {
            totalCommands: 0,
            totalPlayers: 0,
            totalCommandsDay: 0,
            totalPlayersDay: 0
        };

        SnekCommand.distinct("username", (err, users) => {
            tileData.totalPlayers = users.length;
            SnekCommand.count({}, (err, c) => {
                tileData.totalCommands = c;
                socket.emit("updateTiles", { data: tileData });
            });
        });
    }, 180000);

    socket.on("topFiveAlltimeChart", () => {
        getAllPlayersData();
    });

    setInterval(() => {
        getAllPlayersData();
    }, 30000);

    async function getAllPlayersData() {
        const playersData = [];
        const players = await SnekCommand.distinct("username", (err, users) => {
            return users;
        });

        await Promise.all(
            players.map(async user => {
                const amount = await SnekCommand.count(
                    { username: user },
                    (err, count) => {
                        return count;
                    }
                );

                const newUser = { user: user, amount: amount };
                playersData.push(newUser);
            })
        ).then(() => {
            let topFive = playersData
                .sort((a, b) => {
                    return b.amount - a.amount;
                })
                .map(x => {
                    return [x.user, x.amount];
                })
                .slice(0, 5);

            socket.emit("updateTopFiveChart", { data: topFive });
        });
    }
});

server.listen(port, () => {
    console.log(`Server started listening on *:${port}`);
});
