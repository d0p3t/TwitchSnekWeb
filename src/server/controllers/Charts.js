import SnekCommand from "../models/SnekCommand";
import moment from "moment";

const Promise = require("bluebird");

export async function getTopFiveAllTimePlayersData(cb) {
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
        let totalCount =
            topFive[0][1] +
            topFive[1][1] +
            topFive[2][1] +
            topFive[3][1] +
            topFive[4][1];
        SnekCommand.count({}, (err, c) => {
            topFive.push(["Others", c - totalCount]);
            cb(topFive);
        });
    });
}

export async function getTopFiveMonthPlayersData(cb) {
    const playersData = [];
    const today = moment();
    const players = await SnekCommand.find({ performed_at: {$gte: today.clone().subtract(1, "months"), $lt: today }}).distinct("username", (err, users) => {
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
        let totalCount =
            topFive[0][1] +
            topFive[1][1] +
            topFive[2][1] +
            topFive[3][1] +
            topFive[4][1];
        SnekCommand.count({}, (err, c) => {
            topFive.push(["Others", c - totalCount]);
            cb(topFive);
        });
    });
}

export async function getDirectionData(cb) {
    const directionData = [];
    const directions = ["left", "right", "up", "down"];

    await Promise.all(
        directions.map(async direction => {
            const amount = await SnekCommand.count(
                { direction: direction },
                (err, count) => {
                    return count;
                }
            );
            directionData.push({ label: direction, value: amount });
        })
    ).then(() => {
        let finalDirectionData = directionData
            .sort((a, b) => {
                if (a.label < b.label) return -1;
                if (a.label > b.label) return 1;
                return 0;
            })
            .map(x => {
                return [x.label, x.value];
            });
        cb(finalDirectionData);
    });
}

export async function getLastSevenDaysData(cb) {
    const tenDaysData = [];

    const days = [
        moment(),
        moment().subtract(1, "days"),
        moment().subtract(2, "days"),
        moment().subtract(3, "days"),
        moment().subtract(4, "days"),
        moment().subtract(5, "days"),
        moment().subtract(6, "days")
    ];

    await Promise.all(
        days.map(async day => {
            const yesterday = day.clone().subtract(1, "days");
            const amount = await SnekCommand.count(
                { performed_at: { $gte: yesterday, $lt: day } },
                (err, count) => {
                    return count;
                }
            );
            tenDaysData.push({ date: day.format("DD MMM"), value: amount });
        })
    ).then(() => {
        let finalTenDaysData = tenDaysData.sort((a,b) => {
            if(a.date < b.date) return -1;
            if(a.date > b.date) return 1;
            return 0;
        }).map(x => {
            return [x.date, x.value ];
        });
        cb(finalTenDaysData);
    });
}
