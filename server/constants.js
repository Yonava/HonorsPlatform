/**
 * Constants for the server
 * @module constants
 * @category Server
*/

const localUri = 'http://localhost:5177/auth';
const prodUri = 'https://www.snhuhonors.com/auth';

/**
 * @type {string}
 * @description the redirect URI for the google OAuth process as defined on the google cloud console
 */
const redirectUri = process.env.NODE_ENV ? prodUri : localUri;

/**
 * @type {Object}
 * @description enumerable error states encountered during the auth process
*/
const AUTH_ERRORS = {
  INVALID_CLIENT_TOKEN: 'INVALID_CLIENT_TOKEN',
  INVALID_GOOGLE_OAUTH_CODE: 'INVALID_GOOGLE_OAUTH_CODE',
  INVALID_GOOGLE_OAUTH_REFRESH_TOKEN: 'INVALID_GOOGLE_OAUTH_REFRESH_TOKEN',
  INVALID_GOOGLE_OAUTH_ACCESS_TOKEN: 'INVALID_GOOGLE_OAUTH_ACCESS_TOKEN',
}

/**
 * @type {string[]}
 * @description the google OAuth scopes required for the application
 */
const googleOAuthScope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets'
]

/**
 * @type {Object}
 * @description the spreadsheet IDs as defined by google sheets for which the GoogleSheet class interfaces
*/
const spreadsheetIds = {
  dev: '1Wh1rIfVQd8ekvrNloaU9vbxMkgdsDlAz2sqwH5YDLe0',
  production: '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y',
}

module.exports = {
  AUTH_ERRORS,
  redirectUri,
  googleOAuthScope,
  spreadsheetIds,
}