const express = require("express")
const GoogleSheet = require("./GoogleSheet.js");
const openAccessAPI = require("./openAccessAPI.js");
const { google } = require('googleapis');
const cors = require("cors");
const bodyParser = require("body-parser");

const { OAuth2 } = google.auth;

const clientId = '190006346508-fsioaathe0vo6ou4c46dssgq3vnr0kk9.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri =  process.env.NODE_ENV ? 'https://honors.herokuapp.com/auth' : 'http://localhost:5177/auth';
const scope = 'https://www.googleapis.com/auth/spreadsheets';

const app = express();
app.use(bodyParser.json());
app.use(cors());
let sheetInstance;

app.use("/api/open", openAccessAPI);

function getAuthUrl() {
  const auth = new OAuth2(clientId, clientSecret, redirectUri);
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    scope,
  });
  return url;
}

app.get('/api', (req, res) => {
  console.log('api endpoint hit')
  res.send('API is responding')
})

app.get('/api/auth/url', (req, res) => {
  res.json({ url: getAuthUrl() });
});

app.get('/api/auth/:oauthtoken', async (req, res) => {
  const { oauthtoken } = req.params;
  const auth = new OAuth2(clientId, clientSecret, redirectUri);
  try {
    sheetInstance = await GoogleSheet.getInstance(auth, oauthtoken);
  } catch (e) {
    res.json({ 
      error: 'Invalid token',
      url: getAuthUrl()
    });
    return;
  }
  res.json({ token_received: true });
})

app.get("/api/range/:range", async (req, res) => {
  try {
    const { range } = req.params;
    const data = await sheetInstance.getRange(range);
    // sheets API return undefined when sheet is empty
    if (!data) {
      console.log(`No data found in range ${range}`)
      res.json([[]]);
      return;
    }
    res.json(data.map(row => row.map(cell => cell.replace(/[Ss][Hh][Aa][Nn][Nn][Oo][Nn]/g, 'S******'))));
  } catch(e) {
    GoogleSheet.instance = null;
    console.log(e);
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range/:row", async (req, res) => {
  try {
    const { range, row } = req.params;
    const data = req.body;
    await sheetInstance.updateByRow(range, row, data);
    res.json({ success: true });
  } catch(e) {
    GoogleSheet.instance = null;
    console.log(e);
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/api/range/:range", async (req, res) => {
  try {
    const { range } = req.params;
    const data = req.body;
    await sheetInstance.replaceRange(range, data);
    res.json({ success: true });
  } catch(e) {
    console.log(e);
    GoogleSheet.instance = null;
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.delete("/api/range/:range/:row", async (req, res) => {
  try {
    const { range, row } = req.params;
    await sheetInstance.clearByRow(range, row);
    res.json({ success: true });
  } catch(e) {
    GoogleSheet.instance = null;
    console.log(e);
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/api/range/:range", async (req, res) => {
  try {
    const { range } = req.params;
    const data = req.body;
    await sheetInstance.postInRange(range, data);
    res.json({ success: true });
  } catch(e) {
    GoogleSheet.instance = null;
    console.log(e);
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