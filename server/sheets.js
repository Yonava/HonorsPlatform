/**
 * @module sheets
 * @requires GoogleSheet
 * @description This module exports all middleware functions for the sheets route
*/

const GoogleSheet = require('./GoogleSheet');

/**
 * @description Middleware to attach a GoogleSheet instance to the request object
 * @param {Object} req - Express request object with an accessToken property
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 * @throws {Object} - responds with a 401 status code if GoogleSheet constructor throws
*/
async function attachSheetInstanceToRequest(req, res, next) {
  const { accessToken } = req;
  try {
    req.sheet = new GoogleSheet(accessToken);
  } catch (e) {
    res.status(401).json({ error: 'Sheet Instance Creation Failed' });
    return;
  }
  next();
}

module.exports = {
  attachSheetInstanceToRequest,
};