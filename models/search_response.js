"use strict";

const { FlightDetails } = require("./flight_details");

class SearchResponse {

    /**
    * @param {number} totalCount
    * @param {FlightDetails[]} results
    */
    constructor(totalCount, results) {
        this.totalCount = totalCount;
        this.results = results;
    }
}

module.exports.SearchResponse = SearchResponse;