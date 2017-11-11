'use strict';

import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
import mongoose from 'mongoose';
import compression from 'compression';

import { sanitizeString } from '../shared/util';

import SnekCommand from './models/SnekCommand';

mongoose.Promise = require('bluebird');
let mongo_url = process.env.MONGO || '127.0.0.1';

mongoose.connect(`mongodb://${mongo_url}/twitchsnek`, { useMongoClient: true }).then(
    () => { let db = mongoose.connection; console.log('Connected to database'); },
    err => { console.log('Could not connect to database') }
  );

let app = express();
let server = http.Server(app);
let io = new socketIO(server);
let port = process.env.PORT || 6969;

let forceSsl = require('express-force-ssl');

app.use(forceSsl);
app.use(compression({}));
app.use(express['static'](__dirname + '/../client'));

io.on('connection', (socket) => {

    console.log(`client connected with id ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`client disconnected with id ${socket.id}`);
    });

    socket.on('error', (err) => {
        console.log(`ERROR: ${err}`);
    });

    socket.on('directionChart', () => {
        let initialData = {
            datasets: [
                {
                    values: [0, 0, 0, 0]
                }
            ]
        }
        SnekCommand.count({ direction: 'left' }, (err, count) => {
            initialData.datasets[0].values[0] = count;
            SnekCommand.count({ direction: 'right' }, (err, count) => {
                initialData.datasets[0].values[1] = count;
                SnekCommand.count({ direction: 'up' }, (err, count) => {
                    initialData.datasets[0].values[2] = count;
                    SnekCommand.count({ direction: 'down' }, (err, count) => {
                        initialData.datasets[0].values[3] = count;
                        SnekCommand.count({ direction: 'down' }, (err, count) => {
                            initialData.datasets[0].values[3] = count;
                            socket.emit('updateDirectionChart', { data: initialData, type: 'initial' });
                        });
                    });

                });
            });
        });
    });

    socket.on('tilesinfo', () => {
        let tileData = {
            totalCommands: 0,
            totalPlayers: 0,
            totalCommandsDay: 0,
            totalPlayersDay: 0
        }

        SnekCommand.distinct('username', (err, users) => {
            tileData.totalPlayers = users.length;
            SnekCommand.count({}, (err, c) => {
                tileData.totalCommands = c;
                socket.emit('updateTiles', { data: tileData });
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
        }
        SnekCommand.count({ direction: 'left' }, (err, count) => {
            newData.datasets[0].values[0] = count;
            SnekCommand.count({ direction: 'right' }, (err, count) => {
                newData.datasets[0].values[1] = count;
                SnekCommand.count({ direction: 'up' }, (err, count) => {
                    newData.datasets[0].values[2] = count;
                    SnekCommand.count({ direction: 'down' }, (err, count) => {
                        newData.datasets[0].values[3] = count;
                        SnekCommand.count({ direction: 'down' }, (err, count) => {
                            newData.datasets[0].values[3] = count;
                            socket.emit('updateDirectionChart', { data: newData, type: 'refresh' });
                        });
                    });

                });
            });
        });
    }, 30000);
});

server.listen(port, () => {
    console.log(`Server started listening on *:${port}`);
});