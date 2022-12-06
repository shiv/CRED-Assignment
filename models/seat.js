"use strict";

class Seat {

    /**
    * @param {string} id
    * @param {number} cost
    */
    constructor(id, cost) {
        this.id = id;
        this.cost = cost;
    }
}

module.exports.Seat = Seat;