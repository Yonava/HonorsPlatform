/**
 * @module user
 * @description all functions related to the retrieval of data bound to user identity
 * @requires googleapis
 * @requires constants
*/

const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
const { redirectUri } = require('../constants');

/**
  * @typedef {Object} GoogleProfile
  * @description a user's google profile data
  * @property {string} id
  * @property {string} name
  * @property {string} given_name
  * @property {string} family_name
  * @property {string} picture
  * @property {string} locale
*/

/**
 * @param {string} accessToken
 * @description takes in an access token and returns the user's google profile data
 * @returns {Promise<GoogleProfile>} a promise that resolves with the user's google profile data
 * @throws {Error} if the access token is invalid
*/
async function getGoogleProfileData(accessToken) {
  try {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri
    );
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    return data;
  } catch (e) {
    console.log(e)
    throw e;
  }
}

module.exports = {
  getGoogleProfileData
}