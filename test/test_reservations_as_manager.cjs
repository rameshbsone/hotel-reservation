const expect = require('chai').expect;
let chai = require('chai');
let should = chai.should();
const axios = require('axios');

const { API_URL } = require('./test_utils.cjs');
const { response } = require('express');

var token = ""
var api_headers = {headers: {} }
var reservation_id = ""
var guest_id = ""

describe("Reservation endpoints with manager role...", function () {

    it("User Login", async () => {

        const response = await axios.post(API_URL + 'login', {email: "manager@gmail.com", password: "Manager@12"});
        token = response.data.token
        api_headers.headers = { Authorization: 'Bearer ' + token};
        expect(response.status).to.be.equal(200);
    });

    it("Create a reservation", async () => {

        const response = await axios.post(API_URL + 'reservation/new', {guest_name: "Test Guest", hotel_name: "Test hotel", status: "Active", arrival_date: "2022-10-07", departure_date:"2022-10-12", base_stay_amount: 1000.00, tax_amount: 100.00}, api_headers);
        reservation_id = response.data.data._id;
        guest_id = response.data.data.guest_member_id;
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('object')

    });

    it("Retrieve guest stay summary", async () => {

            const response = await axios.get(API_URL + 'guest/' + guest_id, api_headers);
            expect(response.status).to.be.equal(200);
            expect(response.data.data.guest_member_id).to.be.equal(guest_id);
            expect(response.data.data).to.be.an('object');
            

    });

    it("Retrieve past 30 days reservations", async () => {

        const response = await axios.get(API_URL + 'reservations/in/days/-30', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('object')

    });

    it("Retrieve next 30 days reservations", async () => {

        const response = await axios.get(API_URL + 'reservations/in/days/30', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('object')

    });

    it("Delete a reservation", async () => {

        const response = await axios.delete(API_URL + 'reservation/' + reservation_id, api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.message).to.be.equal("Reservation is deleted.")

    });

    it("User Logout", async () => {

        const response = await axios.get(API_URL + 'logout', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.message).to.be.equal("Logged out successfully.");
    });

});