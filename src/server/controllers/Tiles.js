import moment from "moment";

import SnekCommand from "../models/SnekCommand";

export function getTileData(cb) {
    let tileData = {
        totalCommands: 0,
        totalPlayers: 0,
        totalCommandsDay: 0,
        totalPlayersDay: 0
    };

    let yesterday = moment().subtract(1, "days");
    let today = moment();

    SnekCommand.count(
        { performed_at: { $gte: yesterday, $lt: today } },
        (err, count) => {
            tileData.totalCommandsDay = count;
            SnekCommand.find({
                performed_at: { $gte: yesterday, $lt: today }
            }).distinct("username", (err, users) => {
                tileData.totalPlayersDay = users.length;
                SnekCommand.distinct("username", (err, users) => {
                    tileData.totalPlayers = users.length;
                    SnekCommand.count({}, (err, c) => {
                        tileData.totalCommands = c;
                        cb(tileData);
                    });
                });
            });
        }
    );
}
