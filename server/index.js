const path = require('path');
const { google } = require('googleapis');

async function getSpreadsheetData() {
  // config for google api service account
  const config = {
    keyFilename: path.join(process.cwd(), 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  };

  const auth = await google.auth.getClient(config);

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y',
    range: 'Students',
  });

  console.log(response.data.values);
}

getSpreadsheetData();