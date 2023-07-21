const express = require("express")
const GoogleSheet = require("./GoogleSheet.js");
// const openAccessAPI = require("./openAccessAPI.js");
const { google } = require('googleapis');
const cors = require("cors");

require('dotenv').config();

const { OAuth2 } = google.auth;

const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
const redirectUri =  process.env.NODE_ENV ? 'https://www.snhuhonors.com/auth' : 'http://localhost:5177/auth';
const spreadsheetId = process.env.NODE_ENV ? '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y' : '1Wh1rIfVQd8ekvrNloaU9vbxMkgdsDlAz2sqwH5YDLe0';

const scope = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/spreadsheets'
]

const app = express();
app.use(express.json());
app.use(cors());
let sheetInstances = {};

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

function getAuthUrl() {
  const auth = new OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirectUri);
  return auth.generateAuthUrl({
    access_type: 'offline',
    login_hint: 'select_account',
    scope,
  });
}

async function newSheetInstance(accessToken) {
  try {
    const auth = new OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirectUri);
    auth.setCredentials({ access_token: accessToken });
    sheetInstances[accessToken] = await new GoogleSheet().init({
      auth,
      spreadsheetId,
    });
  } catch (e) {
    console.log(e)
    throw "Invalid Grant: New Sheet Instance";
  }
}

// get user profile from google
app.get('/api/user', async (req, res) => {
  try {
    const accessToken = await validateToken(req);
    const auth = new OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirectUri);
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ auth, version: 'v2' });
    const { data } = await oauth2.userinfo.get();
    res.json(data);
  } catch (e) {
    console.log(e)
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.get('/api/auth/url', (req, res) => {
  res.json({ url: getAuthUrl() });
});

app.get('/api/auth/:authCode', async (req, res) => {
  const { authCode } = req.params;
  try {
    const auth = new OAuth2(GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, redirectUri);
    const { tokens } = await auth.getToken(authCode);
    res.json({ accessToken: tokens.access_token });
  } catch (e) {
    console.log(e)
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
    const expr = /s{1,2}h{1,2}a{1,2}n{1,2}n{1,2}o{1,2}n{1,2}/gi;
    res.json(data.map(row => row.map(cell => cell.replace(expr, () => {
      const findIndexUpper = cell.indexOf('Shannon');
      const uppercase = findIndexUpper > -1;
      const encode = `${uppercase ? "S" : "s" }hannon`.split('');
      if (Math.random() < 0.99) {
        return encode.join('');
      }
      const randomIndex = Math.floor(Math.random() * encode.length) + 1;
      if (randomIndex === encode.length || randomIndex === 1) {
        return encode.join('');
      }
      const temp = encode[randomIndex];
      encode[randomIndex] = encode[randomIndex - 1];
      encode[randomIndex - 1] = temp;
      return encode.join('');
    }))));
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

app.listen(port, () => {
  console.log("listening on port " + port);
});