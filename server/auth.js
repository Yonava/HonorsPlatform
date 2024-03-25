const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
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

// creates a jwt with google oauth credentials. Only feed this function
// access tokens that have just been generated from google oauth
function generateClientToken(googleOAuthAccessToken, googleOAuthRefreshToken) {
  return jwt.sign({
    googleOAuthAccessToken,
    googleOAuthRefreshToken,
  }, JWT_SECRET, { expiresIn: '45m' });
}

/**
  * @param {string} clientToken
  * @returns {ClientToken}
*/
async function generateGoogleOAuthAccessToken(clientToken) {
  const { googleOAuthRefreshToken } = jwt.verify(clientToken, JWT_SECRET, {
    ignoreExpiration: true
  });

  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  auth.setCredentials({ refresh_token: googleOAuthRefreshToken });

  const { tokens } = await auth.refreshAccessToken();
  return tokens.access_token;
}

async function generateGoogleOAuthRefreshToken(googleOAuthCode) {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  const { tokens } = await auth.getToken(googleOAuthCode);
  return tokens.refresh_token;
}