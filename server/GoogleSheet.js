import * as path from 'path';
import { google } from 'googleapis';

export default class GoogleSheet {
  spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';
  sheets;
  static instance;

  static async getInstance() {
    if (!GoogleSheet.instance) {
      GoogleSheet.instance = await new GoogleSheet().init();
    }

    return GoogleSheet.instance;
  }

  async init() {
    const config = {
      keyFilename: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    };

    const auth = await google.auth.getClient(config);
    this.sheets = google.sheets({ 
      version: 'v4', 
      auth 
    });

    return this;
  }

  async getStudents() {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Students',
    });

    return response.data.values;
  }

  async deleteStudent(row) {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${row}:Z${row}:clear`,
    });
  }
}