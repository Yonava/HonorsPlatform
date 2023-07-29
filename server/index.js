const express = require("express")
const cors = require("cors");
const app = express();
const http = require('http')

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
exports.server = server;
require('./sockets')

const GoogleSheet = require("./GoogleSheet.js");
// const openAccessAPI = require("./openAccessAPI.js");
const { google } = require('googleapis');

require('dotenv').config();

const { OAuth2 } = google.auth;

const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;

const redirectUri = process.env.NODE_ENV ? 'https://www.snhuhonors.com/auth' : 'http://localhost:5177/auth';

const spreadsheetId = process.env.NODE_ENV ? '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y' : '1Wh1rIfVQd8ekvrNloaU9vbxMkgdsDlAz2sqwH5YDLe0';

const scope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets'
]

let sheetInstances = {};
let authInstances = {};

// app.use("/api/open", openAccessAPI);

function removeTokenFromCache(req) {
  if (!req.headers.authorization) {
    return;
  }
  const accessToken = req.headers.authorization.split(' ')[1];
  delete sheetInstances[accessToken];
}

async function validateToken(req) {
  const accessToken = req.headers.authorization.split(' ')[1];
  if (!accessToken) {
    throw new Error('No bearer token provided');
  }

  if (sheetInstances[accessToken]) {
    return accessToken;
  }

  try {
    await newSheetInstance(accessToken);
  } catch (e) {
    console.log(e)
  }

  return accessToken;
}

function getAuthUrl(closeTabAfterAuth) {
  const auth = new OAuth2(
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    redirectUri + (closeTabAfterAuth ? '-redirect' : '')
  );
  return auth.generateAuthUrl({
    access_type: 'offline',
    login_hint: 'select_account',
    scope,
  });
}

async function newSheetInstance(accessToken) {
  try {
    const auth = authInstances[accessToken];
    if (!authInstances) {
      throw new Error('No auth instance');
    }
    sheetInstances[accessToken] = await new GoogleSheet().init({
      auth,
      spreadsheetId,
    });
  } catch (e) {
    console.log(e)
    throw "Invalid Grant: New Sheet Instance";
  }
}

const getGoogleProfileData = async (accessToken) => {
  try {
    const auth = authInstances[accessToken];
    console.log(auth)
    if (!auth) {
      throw new Error('No auth instance');
    }
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
  try {
    const accessToken = await validateToken(req);
    const data = await getGoogleProfileData(accessToken);
    res.json(data);
  } catch (e) {
    console.log(e)
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.get('/api/auth/url', (req, res) => {
  const { closeTabAfterAuth = false } = req.query;
  res.json({ url: getAuthUrl(closeTabAfterAuth) });
});

app.get('/api/auth/:authCode', async (req, res) => {
  const { authCode } = req.params;
  const { isRedirectLink } = req.query;
  console.log('isRedirectLink', isRedirectLink)
  console.log('authCode', authCode)
  try {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri + (isRedirectLink ? '-redirect' : '')
    );
    const { tokens } = await auth.getToken(authCode);
    const { access_token: accessToken } = tokens;

    auth.setCredentials({ access_token: accessToken });
    authInstances[accessToken] = auth;

    console.log('1', authInstances)

    const profile = await getGoogleProfileData(accessToken);

    res.json({
      accessToken,
      profile
    });
  } catch (e) {
    // console.log(e)
    res.json({
      error: 'Invalid token',
      url: getAuthUrl(),
      verbose: e
    });
  }
})

app.get("/api/range/:range", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { range } = req.params;
    const data = await sheetInstances[accessToken].getRange(range);
    // google returns undefined when sheet is empty
    if (!data) {
      console.log(`No data found in range ${range}`)
      res.json([[]]);
      return;
    }
    res.json(data);
  } catch (e) {
    console.log('unauthorized request', e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/api/ranges", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { ranges } = req.body;
    const data = await sheetInstances[accessToken].getRanges(ranges);
    res.json(data);
  } catch (e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range/:row", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { range, row } = req.params;
    const data = req.body;
    await sheetInstances[accessToken].updateByRow(range, row, data);
    res.json({ success: true });
  } catch(e) {
    removeTokenFromCache(req)
    console.log(e);
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { range } = req.params;
    const data = req.body;
    await sheetInstances[accessToken].replaceRange(range, data);
    res.json({ success: true });
  } catch(e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.delete("/api/range/:range/:row", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { range, row } = req.params;
    await sheetInstances[accessToken].clearByRow(range, row);
    res.json({ success: true });
  } catch(e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/api/range/:range", async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const { range } = req.params;
    const data = req.body;
    const rowInsertedAt = await sheetInstances[accessToken].postInRange(range, data);
    res.json({
      row: rowInsertedAt
    });
  } catch(e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
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