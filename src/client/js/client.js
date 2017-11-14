"use strict";

import io from "socket.io-client";
import moment from "moment";
import { sanitizeString } from "../../shared/util";

import Chart from "frappe-charts/dist/frappe-charts.min.esm";
import { setTimeout } from "timers";

class Client {
    constructor() {
        this.socket = io();

        this.setupSocket();

        this.setupTiles();

        // Charts
        this.setupDirectionChart();
        this.setupLastWeekChart();
        this.setupAlltimeChart();
        this.setupTopMonthChart();
    }

    setupSocket() {
        this.socket.on("connect", () => {
            console.log("connected");
        });

        this.socket.on("connect_failed", () => {
            this.socket.close();
        });

        this.socket.on("disconnected", () => {
            this.socket.close();
        });

        this.socket.on("updateData", e => {
            console.log(e.message);
        });
    }

    setupDirectionChart() {
        let directionData = {
            labels: ["down", "left", "right", "up"],
            datasets: [
                {
                    color: "violet",
                    values: [0, 0, 0, 0]
                }
            ]
        };

        let directionChart = new Chart({
            parent: "#directionChart", // or a DOM element
            title: "Total times commands used",
            data: directionData,
            type: "bar", // or 'line', 'scatter', 'pie', 'percentage'
            height: 300
        });

        setTimeout(() => {
            this.socket.emit("directionChart");
        }, 500);

        this.socket.on("updateDirectionChart", e => {
            directionChart.update_values([
                {
                    values: [
                        e.data[0][1],
                        e.data[1][1],
                        e.data[2][1],
                        e.data[3][1]
                    ]
                }
            ]);
        });
    }

    setupLastWeekChart() {
        setTimeout(() => {
            this.socket.emit("lastWeekChart");
        }, 1500);
        let dateData = {
            labels: [
                moment().subtract(6, "days").format("DD MMM"),
                moment().subtract(5, "days").format("DD MMM"),
                moment().subtract(4, "days").format("DD MMM"),
                moment().subtract(3, "days").format("DD MMM"),
                moment().subtract(2, "days").format("DD MMM"),
                moment().subtract(1, "days").format("DD MMM"),
                moment().format("DD MMM")
            ],
            datasets: [
                {
                    title: "Serpent.AI Snek",
                    color: "purple",
                    values: [0, 0, 0, 0, 0, 0, 0]
                }
            ]
        };

        let dateChart = new Chart({
            parent: "#dateChart", // or a DOM element
            title: "Number of commands in the past week",
            data: dateData,
            type: "line", // or 'line', 'scatter', 'pie', 'percentage'
            height: 300
        });

        this.socket.on("updateLastWeekChart", e => {
            dateChart.update_values(
                [
                    {
                        values: [
                            e.data[0][1],
                            e.data[1][1],
                            e.data[2][1],
                            e.data[3][1],
                            e.data[4][1],
                            e.data[5][1],
                            e.data[6][1]
                        ]
                    }
                ],
                [
                    e.data[0][0],
                    e.data[1][0],
                    e.data[2][0],
                    e.data[3][0],
                    e.data[4][0],
                    e.data[5][0],
                    e.data[6][0]
                ]
            );
        });
    }
    setupAlltimeChart() {
        this.socket.emit("topFiveAlltimeChart");
        let alltimeData = {
            labels: ["user", "user", "user", "user", "user", "Others"],
            datasets: [
                {
                    values: [1, 1, 1, 1, 1, 1]
                }
            ]
        };
        let alltimeChart = new Chart({
            parent: "#alltimeChart", // or a DOM element
            title: "Top 5 all-time command users",
            data: alltimeData,
            type: "pie" // or 'line', 'scatter', 'pie', 'percentage'
        });
        this.socket.on("updateTopFiveChart", e => {
            let alltimeChart = new Chart({
                parent: "#alltimeChart", // or a DOM element
                title: "Top 5 all-time command users",
                data: {
                    labels: [
                        e.data[0][0],
                        e.data[1][0],
                        e.data[2][0],
                        e.data[3][0],
                        e.data[4][0],
                        e.data[5][0]
                    ],
                    datasets: [
                        {
                            values: [
                                e.data[0][1],
                                e.data[1][1],
                                e.data[2][1],
                                e.data[3][1],
                                e.data[4][1],
                                e.data[5][1]
                            ]
                        }
                    ]
                },
                type: "pie" // or 'line', 'scatter', 'pie', 'percentage'
            });
        });
    }
    setupTopMonthChart() {
        this.socket.emit("topFiveMonthChart");
        let topmonthData = {
            labels: ["user", "user", "user", "user", "user", "Others"],
            datasets: [
                {
                    color: "violet",
                    values: [1,1,1,1,1,1]
                }
            ]
        };

        let topMonthChart = new Chart({
            parent: "#topmonthChart", // or a DOM element
            title: "Top 5 of the month command users",
            data: topmonthData,
            type: "pie" // or 'line', 'scatter', 'pie', 'percentage'
        });
        this.socket.on("updateTopFiveMonthChart", e => {
            let topMonthChart = new Chart({
                parent: "#topmonthChart",
                title: "Top 5 of the month command users",
                data: {
                    labels: [
                        e.data[0][0],
                        e.data[1][0],
                        e.data[2][0],
                        e.data[3][0],
                        e.data[4][0],
                        e.data[5][0]
                    ],
                    datasets: [
                        {
                            values: [
                                e.data[0][1],
                                e.data[1][1],
                                e.data[2][1],
                                e.data[3][1],
                                e.data[4][1],
                                e.data[5][1]
                            ]
                        }
                    ]
                },
                type: "pie"
            }) ;
        });
    }

    setupTiles() {
        let totalCommands = document.getElementById("totalcommands");
        let totalPlayers = document.getElementById("totalplayers");
        let totalCommandsDay = document.getElementById("totalcommandsday");
        let totalPlayersDay = document.getElementById("totalplayersday");

        this.socket.on("updateTiles", e => {
            totalCommands.innerHTML = e.data.totalCommands;
            totalCommandsDay.innerHTML = e.data.totalCommandsDay;
            totalPlayers.innerHTML = e.data.totalPlayers;
            totalPlayersDay.innerHTML = e.data.totalPlayersDay;
        });

        this.socket.emit("tilesinfo");
    }
}

window.onload = () => {
    new Client();
};

document.addEventListener("DOMContentLoaded", function() {
    // Get all "navbar-burger" elements
    var $navbarBurgers = Array.prototype.slice.call(
        document.querySelectorAll(".navbar-burger"),
        0
    );

    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
        // Add a click event on each of them
        $navbarBurgers.forEach(function($el) {
            $el.addEventListener("click", function() {
                // Get the target from the "data-target" attribute
                var target = $el.dataset.target;
                var $target = document.getElementById(target);

                // Toggle the class on both the "navbar-burger" and the "navbar-menu"
                $el.classList.toggle("is-active");
                $target.classList.toggle("is-active");
            });
        });
    }
});
