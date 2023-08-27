const express = require("express")
const cors = require("cors");
const app = express();
const http = require('http')
const { google } = require('googleapis');

require('dotenv').config();

const { OAuth2 } = google.auth;
const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;

const redirectUri = process.env.NODE_ENV ? 'https://www.snhuhonors.com/auth' : 'http://localhost:5177/auth';
module.exports.redirectUri = redirectUri;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
exports.server = server;
require('./sockets')

const GoogleSheet = require("./GoogleSheet.js");

const scope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets'
]

const errors = {
  NO_SHEET_ACCESS: 'NO_SHEET_ACCESS',
  INVALID_ACCESS_TOKEN: 'INVALID_ACCESS_TOKEN',
  INVALID_OAUTH_CODE: 'INVALID_OAUTH_CODE',
}

// app.use("/api/open", openAccessAPI);

function getAuthUrl() {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri
  );

  return auth.generateAuthUrl({
    access_type: 'offline',
    login_hint: 'select_account',
    scope,
  });
}

const getGoogleProfileData = async (accessToken) => {
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
    // console.log(e)
    throw "Invalid Grant: Google Profile Data";
  }
}

// get user profile from google
app.get('/api/user', async (req, res) => {
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting get user', accessToken)

  try {
    const data = await getGoogleProfileData(accessToken);
    res.json(data);
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
  }
});

// get user permissions for sheet
app.get('/api/user/permissions', async (req, res) => {
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting get user permissions', accessToken)

  try {
    const sheet = new GoogleSheet(accessToken);
    const { read, write } = await sheet.getSheetPermissions();
    res.json({ read, write });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.get('/api/auth/url', (req, res) => {
  res.json({ url: getAuthUrl() });
});

app.get('/api/auth/:authCode', async (req, res) => {
  console.log('hitting auth route')
  const { authCode } = req.params;
  try {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri
    );
    const { tokens } = await auth.getToken(authCode);
    const { access_token: accessToken } = tokens;
    const profile = await getGoogleProfileData(accessToken);

    console.assert(accessToken && profile, 'Auth entry point failed');

    if (!accessToken || !profile) {
      throw "Invalid: Improper Google Profile Data";
    }

    res.json({
      accessToken,
      profile,
    });
  } catch (e) {
    console.log(e)
    res.json({
      error: errors.INVALID_OAUTH_CODE
    });
  }
})

app.get("/api/range/:range", async (req, res) => {
  const { range } = req.params;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 1', accessToken)

  try {
    const sheet = new GoogleSheet(accessToken);
    const data = await sheet.getRange(range);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.post("/api/ranges", async (req, res) => {
  const { ranges } = req.body;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 2', accessToken)

  if (!accessToken) {
    console.log('no access token')
    res.status(401).json({ error: 'Forbidden' });
    return;
  }

  try {
    const sheet = new GoogleSheet(accessToken);
    const data = await sheet.getRanges(ranges);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.put("/api/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;
  const data = req.body;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 3', accessToken)

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.updateByRow(range, row, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.put("/api/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 4', accessToken)

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.replaceRange(range, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.delete("/api/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 5', accessToken)

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.deleteByRow(range, row);
    res.json({ success: true });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.delete("/api/range/:range", async (req, res) => {
  const { range } = req.params;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  console.log('hitting 5.5', accessToken)

  const { body: data } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.deleteRowByRowData(range, data);
    res.json({ success: true });
  } catch (e) {
    if (e === 'ROW_NOT_FOUND') {
      res.status(401).json({ error: 'ROW_NOT_FOUND' });
    } else {
      res.status(401).json({ error: 'Forbidden' });
    }
  }
});

app.post("/api/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  try {
    const sheet = new GoogleSheet(accessToken);
    const rowInsertedAt = await sheet.postInRange(range, data);
    res.json({
      row: rowInsertedAt,
      success: true
    });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

app.put("/api/batch", async (req, res) => {
  const data = req.body;
  const { authorization } = req.headers;
  const accessToken = authorization.split(' ')[1];

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.batchUpdate(data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 1010;

server.listen(port, () => {
  console.log("Rest endpoints listening on port " + port);
});