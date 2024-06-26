/**
 * @module helpers/auth
 * @requires jwt
 * @requires googleapis
 * @requires constants
 * @description all functions related to the authentication process
*/

const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
const { redirectUri, AUTH_ERRORS, googleOAuthScope } = require('../constants');
const { OAuth2 } = google.auth;
const {
  GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET,
  JWT_SECRET
} = process.env;

/**
 * @typedef {Object} ClientToken
 * @description a token that is sent and stored on the client to authenticate access to protected resources
 * @property {string} googleOAuthAccessToken
 * @property {string} googleOAuthRefreshToken
*/

/**
 * @param {string} googleOAuthAccessToken
 * @param {string} googleOAuthRefreshToken
 * @description takes in a google oauth access token and refresh token and returns a client token
 * @returns {ClientToken} a client token
 */
function generateClientToken(googleOAuthAccessToken, googleOAuthRefreshToken) {
  // console.log('generating client token', googleOAuthAccessToken, googleOAuthRefreshToken)
  return jwt.sign({
    googleOAuthAccessToken,
    googleOAuthRefreshToken,
  }, JWT_SECRET, { expiresIn: '55m' });
}

/**
  * @param {string} googleOAuthRefreshToken
  * @description takes in a google oauth refresh token and returns a google oauth access token
  * @returns {Promise<string>} a promise that resolves with a google oauth access token
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
    const tokens  = await auth.refreshAccessToken();
    // console.log('new access token', tokens.credentials.access_token)
    return tokens.credentials.access_token;
  } catch (e) {
    throw AUTH_ERRORS.INVALID_GOOGLE_OAUTH_REFRESH_TOKEN;
  }
}

/**
 * @param {string} googleOAuthCode
 * @description takes in a google oauth code and returns a google oauth refresh token and access token
 * @returns {Promise<string>} a promise that resolves with a google oauth refresh token and access token
 * @throws {Error} if the google oauth code is invalid
*/
async function generateGoogleOAuthTokens(googleOAuthCode) {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await auth.getToken(googleOAuthCode);
    // console.log('generated tokens', tokens)
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    }
  } catch (e) {
    console.log('error', e)
    throw AUTH_ERRORS.INVALID_GOOGLE_OAUTH_CODE;
  }
}

/**
 * @param {string} clientToken
 * @description takes a client token that has been sent from the client and either returns:
 * 1. the same client token if it is valid and has not expired
 * 2. a new client token if the client token is valid but has expired
 * 3. throws an error if the client token is invalid
 * @returns {Promise<ClientToken>} a promise that resolves with a client token
*/
async function handleIncomingClientToken(clientToken) {
  try {

    // console.log('the client token is', clientToken)
    const payload = jwt.verify(clientToken, JWT_SECRET, {
      ignoreExpiration: true
    });
    // console.log('payload', payload)

    const isExpired = Date.now() >= payload.exp * 1000;
    // console.log('is expired', isExpired)
    if (!isExpired) return clientToken;

    const { googleOAuthRefreshToken: refreshToken } = payload;
    // console.log('refresh token', refreshToken)
    const accessToken = await generateGoogleOAuthAccessToken(refreshToken);
    // console.log('new access token', accessToken)
    return generateClientToken(accessToken, refreshToken);
  } catch (e) {
    throw new Error(AUTH_ERRORS.INVALID_CLIENT_TOKEN);
  }
}

/**
 * @param {string} clientToken
 * @description takes in a client token and returns a google oauth access token
 * @returns {Promise<string>} a promise that resolves with a google oauth access token
 * @throws {Error} if the client token is invalid or has expired
*/
async function getAccessTokenFromClientToken(clientToken) {
  try {
    const payload = jwt.verify(clientToken, JWT_SECRET);
    // console.log('total jwt payload', payload)
    return payload.googleOAuthAccessToken;
  } catch (e) {
    throw e;
  }
}

/**
 * @param {string} googleOAuthCode
 * @description takes in a google oauth code and returns a client token
 * @returns {Promise<ClientToken>} a promise that resolves with a client token
 * @throws {Error} if the google oauth code is invalid
*/
async function generateClientTokenWithOAuthCode(googleOAuthCode) {
  try {
    const { refreshToken, accessToken } = await generateGoogleOAuthTokens(googleOAuthCode);
    return generateClientToken(accessToken, refreshToken);
  } catch (e) {
    throw e;
  }
}

/**
 * @description generates a google oauth url for the client to visit
 * @returns {string} a google oauth url
 * @throws {Error} if the google oauth url fails to generate
*/
function generateGoogleOAuthURL() {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  try {
    return auth.generateAuthUrl({
      prompt: 'consent',
      access_type: 'offline',
      scope: googleOAuthScope,
    });
  } catch (e) {
    // console.log('error generating oauth url')
    throw AUTH_ERRORS.GOOGLE_OAUTH_URL_GENERATION_FAILED;
  }
}

/**
 * @param {Response} res
 * @description returns a function that will handle a client token that is invalid or has expired
 * @returns {Function} a function that will try to issue a new client token and send it to the client
 * @param {string} clientToken
 * @returns {Promise<void>}
*/
function clientTokenInvalidOrExpiredFallback(res) {
  return async (clientToken) => {
    try {
      const newClientToken = await handleIncomingClientToken(clientToken);
      // console.log('successfully issued new client token')
      res.status(401).json({
        error: AUTH_ERRORS.NEW_CLIENT_TOKEN_ISSUED,
        issuedClientToken: newClientToken
      })
    } catch {
      // console.log('failed to issue new client token')
      res.status(401).json({
        error: AUTH_ERRORS.INVALID_CLIENT_TOKEN
      });
    }
  }
}

/**
 * @description middleware fn that takes a request with a client token and adds an access token to the request object.
 * If the client token is invalid, it will terminate the request with
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {void}
 */
async function provideAccessToken(req, res, next) {
  const { authorization } = req.headers;
  const clientToken = authorization.split(' ')[1];

  // try to verify the client token and add the access token to the request object
  try {
    const payload = jwt.verify(clientToken, JWT_SECRET);
    req.accessToken = payload.googleOAuthAccessToken;
    // console.log('added access token to req')
  } catch {
    // console.log('failed to add access token to req, generating new token')
    await clientTokenInvalidOrExpiredFallback(res)(clientToken);
    return;
  }

  next();
}

module.exports = {
  generateClientToken,
  generateClientTokenWithOAuthCode,

  generateGoogleOAuthAccessToken,
  generateGoogleOAuthTokens,

  handleIncomingClientToken,
  generateGoogleOAuthURL,
  getAccessTokenFromClientToken,

  provideAccessToken
};