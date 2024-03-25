/**
 * Constants for the server
 * @module constants
 * @category Server
*/

const localUri = 'http://localhost:5177/auth';
const prodUri = 'https://www.snhuhonors.com/auth';
const redirectUri = process.env.NODE_ENV ? prodUri : localUri;

const AUTH_ERRORS = {
  INVALID_CLIENT_TOKEN: 'INVALID_CLIENT_TOKEN',
  INVALID_GOOGLE_OAUTH_CODE: 'INVALID_GOOGLE_OAUTH_CODE',
  INVALID_GOOGLE_OAUTH_REFRESH_TOKEN: 'INVALID_GOOGLE_OAUTH_REFRESH_TOKEN',
  INVALID_GOOGLE_OAUTH_ACCESS_TOKEN: 'INVALID_GOOGLE_OAUTH_ACCESS_TOKEN',
}

const googleOAuthScope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets'
]

module.exports = {
  AUTH_ERRORS,
  redirectUri,
  googleOAuthScope
}