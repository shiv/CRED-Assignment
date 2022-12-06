var chai = require('chai');
var chaiHttp = require('chai-http');
const decache = require('decache');
var should = chai.should();
var expect = chai.expect;
var uuid = require('uuid').v4;
chai.use(chaiHttp);

const Constants = require("../constants");
const { FlightDetails } = require("../models/flight_details");
const { SearchResponse } = require("../models/search_response");
const { Seat } = require("../models/seat");
const { ClassSeatAvailablity } = require("../models/seat_availability");

var flightService = require("../flight_booking");

describe('Flight booking tests', function() {

    beforeEach(function() {
        decache("../flight_booking");
        flightService = require("../flight_booking");
    });
	
    it('Add flight successfully', (done) => {
        expect(flightService.add(getMockFlight())).to.be.equal(true);
        done();
	});

    it('Duplicate and empty flight should not be added', (done) => {
        expect(flightService.add(new FlightDetails()), "Empty flight object should not be added").to.be.equal(false);
        
        var flight = getMockFlight();
        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.add(flight), "Duplicate flight should not be added").to.be.equal(false);
        done();
	});

    it('Add availability successfully', (done) => {
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.ECONOMY, [new Seat("2", 2000.0)], [new Seat("3", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability2)).to.be.equal(true);
        done();
	});

    it('Add availability to non existing flight and class', (done) => {
        expect(flightService.addSeatAvailability("random_id", null)).to.be.equal(false);
        expect(flightService.addSeatAvailability("random_id", new ClassSeatAvailablity())).to.be.equal(false);

        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("5", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("2", 2000.0)], [new Seat("6", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability2), "ClassSeatAvailablity exists for the same class type").to.be.equal(false);
        
        done();
	});

    it('Update non existing availability', (done) => {
        expect(flightService.updateSeatAvailability("random_id", null)).to.be.equal(false);
        expect(flightService.updateSeatAvailability("random_id", new ClassSeatAvailablity())).to.be.equal(false);

        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("2", 2000.0)], [new Seat("3", 2000.0)]);
        var seatAvailability3 = new ClassSeatAvailablity(Constants.ClassType.ECONOMY, [new Seat("3", 2000.0)], [new Seat("4", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.updateSeatAvailability(flight.id, seatAvailability3), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        var searchResponse = flightService.search(flight.source, flight.destination);
        var flightSeatAvailability = searchResponse.results[0].seatAvailabilities;
        expect(flightSeatAvailability).deep.to.equal([seatAvailability1]);

        expect(flightService.updateSeatAvailability(flight.id, seatAvailability2)).to.be.equal(true);
        searchResponse = flightService.search(flight.source, flight.destination);
        flightSeatAvailability = searchResponse.results[0].seatAvailabilities;
        expect(flightSeatAvailability).deep.to.equal([seatAvailability2]);

        expect(flightService.updateSeatAvailability(flight.id, seatAvailability3), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        done();
	});

    it('Update availability succesfully', (done) => {
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("3", 2000.0)], [new Seat("4", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.updateSeatAvailability(flight.id, seatAvailability1), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.updateSeatAvailability(flight.id, seatAvailability2)).to.be.equal(true);

        var searchResponse = flightService.search(flight.source, flight.destination);
        var flightSeatAvailability = searchResponse.results[0].seatAvailabilities;
        expect(flightSeatAvailability).deep.to.equal([seatAvailability2]);
        done();
	});

    it('Remove non existing availability', (done) => {
        expect(flightService.removeSeatAvailability("random_id", null)).to.be.equal(false);
        expect(flightService.removeSeatAvailability("random_id", new ClassSeatAvailablity())).to.be.equal(false);

        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.ECONOMY, [new Seat("2", 2000.0)], [new Seat("3", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability2), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability1), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability2), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        done();
	});

    it('Remove availability successfully', (done) => {
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("1", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability1), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.removeSeatAvailability(flight.id, seatAvailability1), "ClassSeatAvailablity does not exists for the same class type").to.be.equal(false);
        done();
	});

    it('Booking non existent seat', (done) => {
        expect(flightService.bookSeat("random_id", null)).to.be.equal(false);
        expect(flightService.bookSeat("random_id", Constants.ClassType.BUSINESS)).to.be.equal(false);
        expect(flightService.bookSeat("random_id", Constants.ClassType.ECONOMY)).to.be.equal(false);
        
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.bookSeat(flight.id, Constants.ClassType.ECONOMY)).to.be.equal(false);
        done();
	});

    it('Booking unavailable seat class', (done) => {
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [], [new Seat("2", 2000.0)]);
        var seatAvailability2 = new ClassSeatAvailablity(Constants.ClassType.ECONOMY, [new Seat("11", 2000.0)], [new Seat("12", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability2)).to.be.equal(true);
        expect(flightService.bookSeat(flight.id, Constants.ClassType.BUSINESS)).to.be.equal(false);
        done();
	});

    it('Successfully book a seat', (done) => {
        var flight = getMockFlight();
        var seatAvailability1 = new ClassSeatAvailablity(Constants.ClassType.BUSINESS, [new Seat("1", 2000.0)], [new Seat("2", 2000.0)]);

        expect(flightService.add(flight)).to.be.equal(true);
        expect(flightService.addSeatAvailability(flight.id, seatAvailability1)).to.be.equal(true);
        expect(flightService.bookSeat(flight.id, Constants.ClassType.BUSINESS)).to.be.equal(true);
        expect(flightService.bookSeat(flight.id, Constants.ClassType.BUSINESS), "No seats available to be booked").to.be.equal(false);
        done();
	});

    it('Search non existing flights', (done) => {
        var searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.DELHI);
        // console.log("tests");
        // console.log(searchResponse);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);
        done();
	});

    it('Search with only source available', (done) => {
        var flight = getMockFlight();
        flight.source = Constants.Location.AHMEDABAD;
        flight.destination = Constants.Location.DELHI;
        expect(flightService.add(flight)).to.be.equal(true);

        var searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.BANGALORE);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);
        done();
	});

    it('Search with only destination available', (done) => {
        var flight = getMockFlight();
        flight.source = Constants.Location.AHMEDABAD;
        flight.destination = Constants.Location.DELHI;
        expect(flightService.add(flight)).to.be.equal(true);

        var searchResponse = flightService.search(Constants.Location.BANGALORE, Constants.Location.DELHI);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);
        done();
	});

    it('Search with return of available flight', (done) => {
        var flight = getMockFlight();
        flight.source = Constants.Location.AHMEDABAD;
        flight.destination = Constants.Location.DELHI;
        expect(flightService.add(flight)).to.be.equal(true);

        var searchResponse = flightService.search(Constants.Location.DELHI, Constants.Location.AHMEDABAD);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);
        done();
	});

    it('Successful search', (done) => {
        var searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.DELHI);
        expect(searchResponse.totalCount).to.be.equal(0);
        expect(searchResponse.results).deep.to.equal([]);

        var flight1 = getMockFlight();
        flight1.source = Constants.Location.AHMEDABAD;
        flight1.destination = Constants.Location.BANGALORE;
        expect(flightService.add(flight1)).to.be.equal(true);

        searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.BANGALORE);
        expect(searchResponse.totalCount).to.be.equal(1);
        checkIfContainAllElements(searchResponse.results, [flight1]);

        var flight2 = getMockFlight();
        flight2.source = Constants.Location.AHMEDABAD;
        flight2.destination = Constants.Location.BANGALORE;
        expect(flightService.add(flight2)).to.be.equal(true);

        searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.BANGALORE);
        expect(searchResponse.totalCount).to.be.equal(2);
        checkIfContainAllElements(searchResponse.results, [flight1, flight2]);

        var flight3 = getMockFlight();
        flight3.source = Constants.Location.AHMEDABAD;
        flight3.destination = Constants.Location.JAIPUR;
        expect(flightService.add(flight3)).to.be.equal(true);

        searchResponse = flightService.search(Constants.Location.AHMEDABAD, Constants.Location.BANGALORE);
        expect(searchResponse.totalCount).to.be.equal(2);
        checkIfContainAllElements(searchResponse.results, [flight1, flight2]);

        done();
	});

});

var checkIfContainAllElements = (array1, array2) => {
    array1.forEach(x => expect(array2).contain(x));
}

var getMockFlight = () => {
    return new FlightDetails(uuid(), uuid(), Constants.Airline.AIRINDIA, Constants.Location.AHMEDABAD, Constants.Location.JAIPUR, []);
}

