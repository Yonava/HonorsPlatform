const express = require("express");
const GoogleSheet = require('../GoogleSheet');
const { getUserGoogleProfile } = require('../helpers/user');
const { provideAccessToken } = require('../helpers/auth');

const router = express.Router();

router.use(provideAccessToken);

const log = (route, error) => console.log(`Error in ${route}: ${error}`);

/**
 * @name GET/api/user
 * @description sends the client the user's google profile data
 * @returns {GoogleProfile} googleProfileData
*/
router.get('/', async (req, res) => {
  const { accessToken } = req;

  try {
    const data = await getUserGoogleProfile(accessToken);
    res.json(data);
  } catch (e) {
    log('/user', e);
    res.status(403).json({ error: 'Forbidden' });
  }
});

/**
 * @name GET/api/user/permissions
 * @description sends the client the user's google sheet permissions
 * @returns {Object} permissions
 * @returns {boolean} permissions.read
 * @returns {boolean} permissions.write
 * @throws {Error} if the google sheet permissions are invalid
*/
router.get('/permissions', async (req, res) => {
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    const { read, write } = await sheet.getSheetPermissions();
    res.json({ read, write });
  } catch (e) {
    log('/user/permissions', e);
    res.status(403).json({ error: 'Forbidden' });
  }
});

module.exports = router;