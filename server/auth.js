const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { redirectUri, AUTH_ERRORS, googleOAuthScope } = require('./constants');
const { OAuth2 } = google.auth;
const {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  JWT_SECRET
} = process.env;

/**
 * @typedef {Object} ClientToken
 * @property {string} googleOAuthAccessToken
 * @property {string} googleOAuthRefreshToken
*/

/**
 * @param {string} googleOAuthAccessToken
 * @param {string} googleOAuthRefreshToken
 * @description takes in a google oauth access token and refresh token and returns a client token
 * @returns {ClientToken}
 */
function generateClientToken(googleOAuthAccessToken, googleOAuthRefreshToken) {
  return jwt.sign({
    googleOAuthAccessToken,
    googleOAuthRefreshToken,
  }, JWT_SECRET, { expiresIn: '45m' });
}

/**
  * @param {string} googleOAuthRefreshToken
  * @description takes in a google oauth refresh token and returns a google oauth access token
  * @returns {string} googleOAuthAccessToken
  * @throws {Error} if the google oauth refresh token is invalid
*/
async function generateGoogleOAuthAccessToken(googleOAuthRefreshToken) {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  try {
    auth.setCredentials({ refresh_token: googleOAuthRefreshToken });
    const { tokens } = await auth.refreshAccessToken();
    return tokens.access_token;
  } catch (e) {
    throw new Error(AUTH_ERRORS.INVALID_GOOGLE_OAUTH_REFRESH_TOKEN)
  }
}

/**
 * @param {string} googleOAuthCode
 * @description takes in a google oauth code and returns a google oauth refresh token
 * @returns {string}
 * @throws {Error} if the google oauth code is invalid
 */
async function generateGoogleOAuthRefreshToken(googleOAuthCode) {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await auth.getToken(googleOAuthCode);
    return tokens.refresh_token;
  } catch (e) {
    throw new Error(AUTH_ERRORS.INVALID_GOOGLE_OAUTH_CODE);
  }
}

/**
 * @param {string} clientToken
 * @description takes a client token that has been sent from the client and either returns:
 * 1. the same client token if it is valid and has not expired
 * 2. a new client token if the client token is valid but has expired
 * 3. throws an error if the client token is invalid
 * @returns {ClientToken}
*/
function handleIncomingClientToken(clientToken) {
  try {
    const payload = jwt.verify(clientToken, JWT_SECRET, {
      ignoreExpiration: true
    });

    const isExpired = Date.now() >= payload.exp * 1000;
    if (!isExpired) return clientToken;

    const accessToken = generateGoogleOAuthAccessToken(clientToken);
    const { googleOAuthRefreshToken: refreshToken } = payload;

    return generateClientToken(accessToken, refreshToken);
  } catch (e) {
    throw new Error(AUTH_ERRORS.INVALID_CLIENT_TOKEN);
  }
}

/**
 * @description generates a google oauth url for the client to visit
 * @returns {string} googleOAuthURL
*/
function generateGoogleOAuthURL() {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: googleOAuthScope,
  });
}

module.exports = {
  generateClientToken,
  generateGoogleOAuthAccessToken,
  generateGoogleOAuthRefreshToken,
  handleIncomingClientToken,
  generateGoogleOAuthURL
};