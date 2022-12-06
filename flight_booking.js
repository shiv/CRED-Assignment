"use strict";

const { response } = require("express");
const { FlightDetails } = require("./models/flight_details");
const { SearchResponse } = require("./models/search_response");
const { ClassSeatAvailablity } = require("./models/seat_availability");

var flightDetailsMap = {};

const areConstraintsValid = (flightId, seatAvailability) => {
    if (seatAvailability === null) return false;

    if (
        seatAvailability.classType === undefined ||
        seatAvailability.availableSeats === undefined ||
        seatAvailability.bookedSeats === undefined
    ) return false;
        
    if (!flightDetailsMap.hasOwnProperty(flightId)) return false;

    return true;
}

/**
 * Add flight detail
 * @param {FlightDetails} flightDetails
 * @return {boolean} true if add is successful else false
*/
var add = (flightDetails) => {

    if (
        flightDetails.id === undefined ||
        flightDetails.name === undefined ||
        flightDetails.airline === undefined ||
        flightDetails.source === undefined ||
        flightDetails.destination === undefined ||
        flightDetails.seatAvailabilities === undefined
    ) return false;

    if (flightDetailsMap.hasOwnProperty(flightDetails.id)) return false;

    flightDetailsMap[flightDetails.id] = flightDetails;

    return true;
}

/**
 * Add {ClassSeatAvailablity} to given fightId
 * @param {string} flightId
 * @param {ClassSeatAvailablity} seatAvailability
 * @return {boolean} true if add is successful else false
*/
var addSeatAvailability = (flightId, seatAvailability) => {

    if (!areConstraintsValid(flightId, seatAvailability)) return false;

    const flight = flightDetailsMap[flightId];
    const seatsAvailable = flight.seatAvailabilities;

    for (let i = 0; i < seatsAvailable.length; i++) {
        if (seatsAvailable[i].classType === seatAvailability.classType) return false;
    }
    
    flight.seatAvailabilities.push(seatAvailability);       
    return true;
}

/**
 * Update {ClassSeatAvailablity} to given fightId
 * @param {string} flightId
 * @param {ClassSeatAvailablity} seatAvailability
 * @return {boolean} true if update is successful else false
 */
var updateSeatAvailability = (flightId, seatAvailability) => {
    
    if (!areConstraintsValid(flightId, seatAvailability)) return false;
    
    const flight = flightDetailsMap[flightId];
    const seatsAvailable = flight.seatAvailabilities;
    
    let classTypeIndex = -1;
    for (let i = 0; i < seatsAvailable.length; i++) {
        if (seatsAvailable[i].classType === seatAvailability.classType) classTypeIndex = i;
    }
    if (classTypeIndex === -1) return false;

    flight.seatAvailabilities[classTypeIndex] = seatAvailability;

    return true;
}

/**
 * Remove {ClassSeatAvailablity} to given fightId
 * @param {string} flightId
 * @param {ClassSeatAvailablity} seatAvailability
 * @return {boolean} true if remove is successful else false
 */
var removeSeatAvailability = (flightId, seatAvailability) => {

    if (!areConstraintsValid(flightId, seatAvailability)) return false;
    
    const flight = flightDetailsMap[flightId];
    const seatsAvailable = flight.seatAvailabilities;
    
    let classTypeIndex = -1;
    for (let i = 0; i < seatsAvailable.length; i++) {
        if (seatsAvailable[i].classType === seatAvailability.classType) classTypeIndex = i;
    }
    if (classTypeIndex === -1) return false;
    
    flight.seatAvailabilities.splice(classTypeIndex, 1);
    return true;
}

/**
 * bookSeat does the booking of a seat for given class type and flight ID
 * @param {string} flightId
 * @param {string} classType
 * @return {boolean} true if booking is successful else false
*/
var bookSeat = (flightId, classType) => {

    if (!flightDetailsMap.hasOwnProperty(flightId)) return false;

    if (classType === null) return false;

    const flight = flightDetailsMap[flightId];
    const seatsAvailable = flight.seatAvailabilities;

    let classTypeIndex = -1;
    for (let i = 0; i < seatsAvailable.length; i++) {
        if (seatsAvailable[i].classType === classType) classTypeIndex = i;
    }    
    if (classTypeIndex === -1) return false;

    let filghtSeatClass = seatsAvailable[classTypeIndex];

    if (filghtSeatClass.availableSeats.length === 0) return false;

    let firstAvailableSeat = filghtSeatClass.availableSeats[0];

    filghtSeatClass.bookedSeats.push(firstAvailableSeat);

    filghtSeatClass.availableSeats.splice(0, 1);

    return true;
}

/**
 * Search function searches direct flight details from source to destination
 * @param {string} source
 * @param {string} destination
 * @return {SearchResponse} which matches the criteria
*/
var search = (source, destination) => {

    if (!source && !destination) return SearchResponse(0, []);
    
    let results = [];

    Object.keys(flightDetailsMap).forEach(function (flightId) {
        const flightDetail = flightDetailsMap[flightId];
        if (source && destination) {
            if (flightDetail.source === source && flightDetail.destination === destination) {
                results.push(flightDetail);
            }
        }
        else if (source) {
            if (flightDetail.source === source) {
                results.push(flightDetail);
            }
        }
        else if (destination) {
            if (flightDetail.destination === destination) {
                results.push(flightDetail);
            }
        }
    });

    return new SearchResponse(results.length, results);
}


module.exports = {
    add : add,
    addSeatAvailability : addSeatAvailability,
    updateSeatAvailability : updateSeatAvailability,
    removeSeatAvailability : removeSeatAvailability,
    bookSeat : bookSeat,
    search : search
};