/**
 * @module server/authEndpoints
 * @category Server
 * @description hosts all the endpoints that facilitate authentication
*/

const express = require('express');
const auth = require('./auth');

const router = express.Router();

module.exports = router;