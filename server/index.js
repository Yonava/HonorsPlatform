const path = require('path');
const { google } = require('googleapis');
const spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';

async function createSheet() {
  // config for google api service account
  const config = {
    keyFilename: path.join(process.cwd(), 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  };

  const auth = await google.auth.getClient(config);

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

async function getSpreadsheetData(sheets) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Students',
  });

  console.log(response.data.values);
}

async function deleteStudent(sheets, row) {
  const response = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Students!A${row}:Z${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[
        '', '', ''
      ]]
    }
  });
  console.log(response.data);
}

createSheet().then((sheets) => {
  // getSpreadsheetData(sheets);
  deleteStudent(sheets, 4);
});
