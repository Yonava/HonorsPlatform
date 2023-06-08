const { google } = require("googleapis")

module.exports = class GoogleSheet {
  spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';
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

  async init(auth) {
    try {
      this.sheets = google.sheets({
        version: 'v4',
        auth,
      });
      return this;
    } catch (e) {
      throw e
    }
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
    await this.sheets.spreadsheets.values.update(
      this.writable(`${range}!A${row}:Z${row}`, data)
    );
  }

  async postInRange(range, data) {
    if (data.length > 1) {
      await this.sheets.spreadsheets.values.append(
        this.writable(range, data)
      )
      return;
    }
    const rangeData = await this.getRange(range);
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