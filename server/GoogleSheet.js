const { google } = require("googleapis")
const { OAuth2 } = google.auth;
const { GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET } = process.env;
const { redirectUri } = require("./index.js");

const spreadsheetIds = {
  dev: '1Wh1rIfVQd8ekvrNloaU9vbxMkgdsDlAz2sqwH5YDLe0',
  production: '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y',
}

module.exports = class GoogleSheet {
  spreadsheetId;
  sheets;

  writable(range, data) {
    return {
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: data
      }
    }
  }

  constructor(accessToken) {
    const auth = new OAuth2(
      GOOGLE_OAUTH_CLIENT_ID,
      GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri
    );
    auth.setCredentials({
      access_token: accessToken
    });
    this.sheets = google.sheets({
      version: 'v4',
      auth,
    });
    this.spreadsheetId = spreadsheetIds[process.env.NODE_ENV ?? 'dev'];
  }

  // ping to check if access token is valid
  async getSheetPermissions() {

    const perms = {
      read: false,
      write: false,
    }

    // test write access
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: 'Students!Z50',
        valueInputOption: 'RAW',
        resource: {
          values: [['']]
        }
      });
      return {
        read: true,
        write: true,
      };
    } catch (err) {
      perms.write = false;
    }

    // test read access as fallback
    try {
      await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        ranges: [],
      });
      perms.read = true;
    } catch (err) {
      perms.read = false;
    }

    return perms;
  }

  async getRange(range) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return response.data.values;
  }

  async getRanges(ranges) {
    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      ranges,
    });

    return response.data.valueRanges;
  }

  async deleteByRow(range, row) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${range}!A${row}:Z${row}`,
    });
  }

  async deleteRowByRowData(range, data) {
    const rangeData = await this.getRange(range);
    const rowToDelete = rangeData.findIndex(row => row.join('') === data.join(''));
    if (rowToDelete === -1) {
      throw new Error('ROW_NOT_FOUND');
    }
    await this.deleteByRow(range, rowToDelete + 1);
  }

  async updateByRow(range, row, data) {
    await this.sheets.spreadsheets.values.update(
      this.writable(`${range}!A${row}:Z${row}`, data)
    );
  }

  async postInRange(range, data) {
    const rangeData = await this.getRange(range);

    if (data.length > 1) {
      await this.sheets.spreadsheets.values.update(
        this.writable(range, [
          ...rangeData,
          ...data,
        ])
      );
      return rangeData.length + 1;
    }

    let insertRow = rangeData.findIndex(row => row.join('') === '');
    insertRow = insertRow === -1 ? rangeData.length + 1 : insertRow + 1;
    await this.sheets.spreadsheets.values.update(
      this.writable(`${range}!A${insertRow}:Z${insertRow}`, data)
    );

    return insertRow;
  }

  async replaceRange(range, data) {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: {
        values: data
      }
    });
  }
}