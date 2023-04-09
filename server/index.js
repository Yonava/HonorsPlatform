const express = require("express")
const GoogleSheet = require("./GoogleSheet.js");
const openAccessAPI = require("./openAccessAPI.js");
const { google } = require('googleapis');
const cors = require("cors");

const { OAuth2 } = google.auth;

const clientId = '190006346508-fsioaathe0vo6ou4c46dssgq3vnr0kk9.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri =  process.env.NODE_ENV ? 'https://honors.herokuapp.com/auth' : 'http://localhost:5177/auth';
const scope = 'https://www.googleapis.com/auth/spreadsheets';

const app = express();
app.use(express.json());
app.use(cors());
let sheetInstances = {};

app.use("/api/open", openAccessAPI);

function removeTokenFromCache(req) {
  if (!req.headers.authorization) return;
  const refreshToken = req.headers.authorization.split(' ')[1];
  delete sheetInstances[refreshToken];
}

async function validateToken(req) {
  const refreshToken = req.headers.authorization.split(' ')[1];
  if (!refreshToken) {
    throw new Error('No bearer token provided');
  }
  
  if (sheetInstances[refreshToken]) return refreshToken;

  try {
    await createNewSheetInstanceRefresh(refreshToken);
  } catch (e) {
    console.log(e)
  }

  return refreshToken;
}

function getAuthUrl() {
  const auth = new OAuth2(clientId, clientSecret, redirectUri);
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    scope,
  });
  return url;
}

async function createNewSheetInstanceRefresh(refreshToken) {
  try {
    const auth = new OAuth2(clientId, clientSecret, redirectUri);
    auth.setCredentials({ refresh_token: refreshToken });
    sheetInstances[refreshToken] = await new GoogleSheet().init(auth);
  } catch (e) {
    console.log(e)
    throw "Invalid Grant: Create New Sheet Instance Refresh";
  }
}

app.get('/api', (req, res) => {
  console.log('api endpoint hit')
  res.send('API online')
})

app.get('/api/auth/url', (req, res) => {
  res.json({ url: getAuthUrl() });
});

app.get('/api/auth/:authCode', async (req, res) => {
  const { authCode } = req.params;
  console.log('auth code: ', authCode)
  try {
    const auth = new OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await auth.getToken(authCode);
    console.log('refresh token: ', tokens.refresh_token);
    console.log('token: ', tokens);
    res.json({ refreshToken: tokens.refresh_token });
  } catch (e) {
    res.json({ 
      error: 'Invalid token',
      url: getAuthUrl()
    });
  }
})

app.get("/api/range/:range", async (req, res) => {
  try {
    const refreshToken = await validateToken(req);
    const { range } = req.params;
    const data = await sheetInstances[refreshToken].getRange(range);
    // sheets API return undefined when sheet is empty
    if (!data) {
      console.log(`No data found in range ${range}`)
      res.json([[]]);
      return;
    }
    res.json(data.map(row => row.map(cell => cell.replace(/[Ss][Hh][Aa][Nn][Nn][Oo][Nn]/g, 'S******'))));
  } catch (e) {
    console.log('unauthorized request', e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range/:row", async (req, res) => {
  try {
    const oauthtoken = await validateToken(req);
    const { range, row } = req.params;
    const data = req.body;
    await sheetInstances[oauthtoken].updateByRow(range, row, data);
    res.json({ success: true });
  } catch(e) {
    removeTokenFromCache(req)
    console.log(e);
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range", async (req, res) => {
  try {
    const oauthtoken = await validateToken(req);
    const { range } = req.params;
    const data = req.body;
    await sheetInstances[oauthtoken].updateRange(range, data);
    res.json({ success: true });
  } catch(e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.delete("/api/range/:range/:row", async (req, res) => {
  try {
    await validateToken(req);
    const { range, row } = req.params;
    await sheetInstances[oauthtoken].deleteByRow(range, row);
    res.json({ success: true });
  } catch(e) {
    console.log(e);
    removeTokenFromCache(req)
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/api/range/:range", async (req, res) => {
  try {
    await validateToken(req);
    const { range } = req.params;
    const data = req.body;
    await sheetInstances[oauthtoken].appendRange(range, data);
    res.json({ success: true });
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