const { google } = require('googleapis');
const path = require('path');

module.exports = class OpenSheet {
  spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';
  sheets;
  static instance;

  static async getInstance() {
    if (!OpenSheet.instance) {
      try {
        OpenSheet.instance = await new OpenSheet().init();
      } catch (e) {
        throw e
      }
    }

    return OpenSheet.instance;
  }

  async init() {
    const config = {
      keyFilename: path.join(process.cwd(), './credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    };

    const auth = await google.auth.getClient(config);
    this.sheets = google.sheets({ 
      version: 'v4', 
      auth 
    });

    return this;
  }

  async getRange(range) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return response.data.values;
  }
}