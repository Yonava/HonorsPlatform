/**
 * @module helper/sheets
 * @requires GoogleSheet
 * @description This module exports all middleware functions for the sheets route
*/

const GoogleSheet = require('../GoogleSheet');

/**
 * @description Middleware to attach a GoogleSheet instance to the request object
 * @param {Object} req - Express request object with an accessToken property
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 * @returns {void}
 * @throws {Object} - responds with a 401 status code if GoogleSheet constructor throws
*/
async function attachSheetInstance(req, res, next) {
  const { accessToken } = req;
  try {
    req.sheet = new GoogleSheet(accessToken);
  } catch (e) {
    console.log('Sheet Instance Creation Failed');
    res.status(401).json({
      error: 'Sheet Instance Creation Failed',
      details: e,
    });
    return;
  }
  next();
}

/**
 * @description takes in a function to be executed with a GoogleSheet instance and executes it returning the data if successful or either parses the error and tries again with exponential backoff
 * @param {Function} fn - function to be executed with a GoogleSheet instance
 * @param {Object} req - Express request object with an accessToken property and a sheet property
 * @param {Object} res - Express response object
  * @returns {void}
 */
function executeGoogleSheetRequest(req, res) {
  const MAX_RETRIES = 3;
  const RETRY_INTERVAL = 2000;
  const identifier = `${req.method} ${req.originalUrl}`;

  const makeRequest = async (fn, retries = 0) => {
    try {
      console.log('Request to', identifier, 'pending')
      const data = await fn(req.sheet);
      console.log('Request to', identifier, 'successful');
      res.status(200).json(data);
    } catch (e) {

      console.log('Request to', identifier, 'failed');

      // Check if the error is a 401 or 403, if so, return the error
      if (e.code === 401 || e.code === 403) {
        console.log('Error:', e);
        res.status(401).json({
          error: 'Unauthorized',
          details: e,
        });
        return;
      }

      console.log('Error to', identifier, 'failed with error:', e, 'Retrying...');

      if (retries < MAX_RETRIES) {
        console.log('Retrying in', RETRY_INTERVAL, 'ms');
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
        return makeRequest(fn, retries + 1);
      }

      console.log('Request to', identifier, 'failed after', MAX_RETRIES, 'retries');

      res.status(500).json({
        error: 'Failed to execute request',
        details: e,
      });
    }
  }

  return makeRequest;
}

function attachExecuteGoogleSheetRequest(req, res, next) {
  req.execSheetRequest = executeGoogleSheetRequest(req, res);
  next();
}

module.exports = {
  attachSheetInstance,
  attachExecuteGoogleSheetRequest,
};