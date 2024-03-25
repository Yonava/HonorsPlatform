/**
 * @module server/authEndpoints
 * @category Server
 * @description hosts all the endpoints that facilitate authentication
*/

const express = require('express');
const {
  generateGoogleOAuthURL,
  generateClientTokenWithOAuthCode,
} = require('../auth');

const router = express.Router();

/**
 * @name GET/api/auth/url
 * @description sends the client a google oauth url
 * @returns {string} googleOAuthURL
*/
router.get('/url', (req, res) => {
  res.json({ url: generateGoogleOAuthURL() });
})

/**
 * @name GET/api/auth/token/:googleOAuthCode
 * @param {string} googleOAuthCode
 * @description takes a google oauth code and a client token
 * @returns {string} clientToken
 * @throws {Error} if the google oauth code is invalid
*/
router.get('/token/:googleOAuthCode', async (req, res) => {
  const { googleOAuthCode } = req.params;
  try {
    const clientToken = await generateClientTokenWithOAuthCode(googleOAuthCode);
    res.json({ token: clientToken });
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
})

module.exports = router;