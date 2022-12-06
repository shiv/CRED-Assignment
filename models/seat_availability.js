"use strict";

const { Seat } = require("./seat");

class ClassSeatAvailablity {

    /**
    * @param {string} classType
    * @param {Seat[]} availableSeats
    * @param {Seat[]} bookedSeats
    */
    constructor(classType, availableSeats, bookedSeats) {
        this.classType = classType;
        this.availableSeats = availableSeats;
        this.bookedSeats = bookedSeats;
    }
}

module.exports.ClassSeatAvailablity = ClassSeatAvailablity;
