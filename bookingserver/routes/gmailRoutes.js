const express = require('express');
const routeGmail = express.Router(); 

const { getVerificationCode } = require('../Controller/AuthencationController');


routeGmail.post('/send-verificationcode', getVerificationCode);

module.exports = routeGmail;