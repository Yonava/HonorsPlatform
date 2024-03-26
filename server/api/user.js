const express = require("express");
const GoogleSheet = require('../GoogleSheet');
const { getGoogleProfileData } = require('../user');
const { provideAccessToken } = require('../auth');

const router = express.Router();

router.use(provideAccessToken);

// get user profile from google
router.get('/', async (req, res) => {
  const { accessToken } = req;

  try {
    const data = await getGoogleProfileData(accessToken);
    res.json(data);
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
  }
});

// get user permissions for sheet
router.get('/permissions', async (req, res) => {
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    const { read, write } = await sheet.getSheetPermissions();
    res.json({ read, write });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
  }
});

module.exports = router;