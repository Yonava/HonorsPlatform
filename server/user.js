const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
const { redirectUri } = require('./constants');

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