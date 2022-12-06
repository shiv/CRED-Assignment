"use strict";

const { ClassSeatAvailablity } = require("./seat_availability");

class FlightDetails {

    /**
    * @param {string} id
    * @param {string} name
    * @param {string} airline
    * @param {string} source
    * @param {string} destination
    * @param {ClassSeatAvailablity[]} seatAvailabilities
    */
    constructor(id, name, airline, source, destination, seatAvailabilities) {
        this.id = id;
        this.name = name;
        this.airline = airline;
        this.source = source;
        this.destination = destination;
        this.seatAvailabilities = seatAvailabilities;
    }
}

module.exports.FlightDetails = FlightDetails;
