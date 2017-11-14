"use strict";

import express from "express";
import http from "http";
import socketIO from "socket.io";
import mongoose from "mongoose";
import compression from "compression";

import { sanitizeString } from "../shared/util";

import SnekCommand from "./models/SnekCommand";
import {
    getTopFiveAllTimePlayersData,
    getDirectionData
} from "./controllers/Charts";
import { getTileData } from "./controllers/Tiles";
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
let wsDirectionData = [];
let wsCommandsAllTimeData = [];

app.use(compression({}));
app.use(express["static"](__dirname + "/../client"));

io.on("connection", socket => {
    console.log(`User ${socket.id} connected`);

    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected.`);
    });

    socket.on("error", err => {
        console.error(`CLIENT ERROR: ${err}`);
    });

    socket.on("directionChart", () => {
        getDirectionData(cb => {
            socket.emit("updateDirectionChart", { data: cb });
        });
    });
    socket.on("topFiveAlltimeChart", () => {
        getTopFiveAllTimePlayersData(cb => {
            socket.emit("updateTopFiveChart", { data: cb });
        });
    });
    socket.on("tilesinfo", () => {
        getTileData(cb => {
            socket.emit("updateTiles", { data: cb });
        });
    });

    setInterval(() => {
        getDirectionData(cb => {
            socket.emit("updateDirectionChart", { data: cb });
        });
        getTopFiveAllTimePlayersData(cb => {
            socket.emit("updateTopFiveChart", { data: cb });
        });
        getTileData(cb => {
            socket.emit("updateTiles", { data: cb });
        });
        socket.emit("updateData", { message: "data updated" });
    }, 30000);

    setInterval(() => {}, 30000);
});

server.listen(port, () => {
    console.log(`Server started listening on *:${port}`);
});
