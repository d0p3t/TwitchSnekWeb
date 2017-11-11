'use strict';

import io from 'socket.io-client';
import { sanitizeString } from '../../shared/util';

import Chart from "frappe-charts/dist/frappe-charts.min.esm"
import { setInterval, setTimeout } from 'timers';

class Client {
    constructor() {
        this.socket = io();

        this.setupSocket();

        this.setupTiles();

        // Charts
        this.setupDirectionChart();
        this.setupDateChart();
        this.setupAlltimeChart();
        this.setupTopMonthChart();
    }

    setupSocket() {
        this.socket.on('connect', () => {
            console.log('connected');
        });

        this.socket.on('connect_failed', () => {
            this.socket.close();
        });

        this.socket.on('disconnected', () => {
            this.socket.close();
        });

    }

    setupDirectionChart() {
        let directionData = {
            labels: ["left", "right", "up", "down"
            ],
            datasets: [
                {
                    color: "violet",
                    values: [0, 0, 0, 0]
                }
            ]
        }
        
        let directionChart = new Chart({
            parent: '#directionChart', // or a DOM element
            title: "Total times commands used",
            data: directionData,
            type: 'bar', // or 'line', 'scatter', 'pie', 'percentage'
            height: 250
        });


        setTimeout(() => {
            this.socket.emit('directionChart');
        }, 1750);

        this.socket.on('updateDirectionChart', (e) => {
            console.log(e.type);
            directionChart.update_values(e.data.datasets);
        });
    }

    setupDateChart() {
        let dateData = {
            labels: ["02/11/2017", "03/11/2017", "04/11/2017", 
                    "05/11/2017", "06/11/2017", "07/11/2017", "08/11/2017", 
                    "09/11/2017", "10/11/2017", "11/11/2017"
            ],
            datasets: [
                {
                    title: "Serpent.AI Snek",
                    color: "violet",
                    values: [45, 20, 60, 50, 100, 57, 41, 78, 91, 39]
                }
            ]
        }
        
        let dateChart = new Chart({
            parent: '#dateChart', // or a DOM element
            title: "Number of commands per day",
            data: dateData,
            type: 'line', // or 'line', 'scatter', 'pie', 'percentage'
            height: 200
        });
    }
    setupAlltimeChart() {
        let alltimeData = {
            labels: ["d0p3t", "Vilsol", "tree", "serpent_ai", "Barie2"
            ],
            datasets: [
                {
                    color: "violet",
                    values: [69, 51, 43, 41, 23]
                }
            ]
        }
        
        let dateChart = new Chart({
            parent: '#alltimeChart', // or a DOM element
            title: "Highest all-time command users",
            data: alltimeData,
            type: 'pie', // or 'line', 'scatter', 'pie', 'percentage'
        });
    }
    setupTopMonthChart() { 
        let topmonthData = {
            labels: ["d0p3t", "Vilsol", "tree", "serpent_ai", "Barie2"
            ],
            datasets: [
                {
                    color: "violet",
                    values: [69, 51, 43, 41, 23]
                }
            ]
        }
        
        let dateChart = new Chart({
            parent: '#topmonthChart', // or a DOM element
            title: "Top 5 of the month command users",
            data: topmonthData,
            type: 'pie', // or 'line', 'scatter', 'pie', 'percentage'
        });
    }

    setupTiles() {
        let totalCommands = document.getElementById("totalcommands");
        let totalPlayers = document.getElementById("totalplayers");
        let totalCommandsDay = document.getElementById("totalcommandsday");
        let totalPlayersDay = document.getElementById("totalplayersday");
        
        this.socket.on('updateTiles', (e) => {
            totalCommands.innerHTML = e.data.totalCommands;
            totalCommandsDay.innerHTML = e.data.totalCommandsDay;
            totalPlayers.innerHTML = e.data.totalPlayers;
            totalPlayersDay.innerHTML = e.data.totalPlayersDay;
        });

        this.socket.emit('tilesinfo');
    }
}


window.onload = () => {
    new Client();
}

document.addEventListener('DOMContentLoaded', function () {
    
      // Get all "navbar-burger" elements
      var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    
      // Check if there are any navbar burgers
      if ($navbarBurgers.length > 0) {
    
        // Add a click event on each of them
        $navbarBurgers.forEach(function ($el) {
          $el.addEventListener('click', function () {
    
            // Get the target from the "data-target" attribute
            var target = $el.dataset.target;
            var $target = document.getElementById(target);
    
            // Toggle the class on both the "navbar-burger" and the "navbar-menu"
            $el.classList.toggle('is-active');
            $target.classList.toggle('is-active');
    
          });
        });
      }
    
    });