import { google } from 'googleapis';

export default class GoogleSheet {
  spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';
  sheets;
  static instance;

  static async getInstance(auth, authCode) {
    if (!GoogleSheet.instance) {
      try {
        GoogleSheet.instance = await new GoogleSheet().init(auth, authCode);
      } catch (e) {
        throw e
      }
    }

    return GoogleSheet.instance;
  }

  async init(auth, authCode) {
    try {
      const { tokens } = await auth.getToken(authCode);
      auth.setCredentials(tokens);
    } catch (e) {
      throw e
    }

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

  async clearByRow(range, row) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${row}:Z${row}`,
    });
  }

  async updateByRow(range, row, data) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${row}:Z${row}`,
      valueInputOption: 'RAW',
      resource: {
        values: data
      }
    });
  }

  async postInRange(range, data) {
    const rangeData = await this.getRange(range);
    let insertRow = rangeData.findIndex(row => row.join('') === '');
    insertRow = insertRow === -1 ? rangeData.length + 1 : insertRow + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${insertRow}:Z${insertRow}`,
      valueInputOption: 'RAW',
      resource: {
        values: data
      }
    });
  }
}