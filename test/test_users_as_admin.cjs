const expect = require('chai').expect;
let chai = require('chai');
let should = chai.should();
const axios = require('axios');

const { API_URL } = require('./test_utils.cjs');
const { response } = require('express');

var token = ""
var api_headers = {headers: {} }
var user_email = "admin@gmail.com"
var new_user_id = ""

describe("User endpoints as admin role", function () {

    it("User Login", async () => {

        console.log('user email:' + user_email);
        const response = await axios.post(API_URL + 'login', {email: user_email, password: "Admin@12"});
        token = response.data.token
        api_headers.headers = { Authorization: 'Bearer ' + token};
        expect(response.status).to.be.equal(200);
    });

    it("Retrieve current user profile", async () => {

        const response = await axios.get(API_URL + 'me', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('object');
        expect(response.data.data.email).to.be.equal(user_email);
    });

    it("Update current user", async () => {

        const response = await axios.put(API_URL + 'me/update', {name:"admin1", email:user_email}, api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('object');
        expect(response.data.data.name).to.be.equal("admin1");

    });

    it("Create an user", async () => {

        var new_user_email = 'emp_' + Math.floor((Math.random() * 100000) + 1).toString() + '@gmail.com';
        const response = await axios.post(API_URL + 'register', {name: new_user_email, email: new_user_email, password: "Employee50@12", role: "employee" }, api_headers);
        new_user_id = response.data.user_id;
        expect(response.status).to.be.equal(200);
        expect(response.data.token).to.be.an('string');

    });

    it("Retrieve the list of all the users", async () => {

        const response = await axios.get(API_URL + 'users', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.data).to.be.an('array')

    });

    it("Delete an user", async () => {

        const response = await axios.delete(API_URL + 'user/' + new_user_id, api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.message).to.be.equal("User is deleted by Admin.")

    });

    it("User Logout", async () => {

        const response = await axios.get(API_URL + 'logout', api_headers);
        expect(response.status).to.be.equal(200);
        expect(response.data.message).to.be.equal("Logged out successfully.");
    });

});