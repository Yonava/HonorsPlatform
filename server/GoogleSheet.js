const { google } = require("googleapis")

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

  async init({ auth, spreadsheetId }) {
    try {
      this.sheets = google.sheets({
        version: 'v4',
        auth,
      });
      this.spreadsheetId = spreadsheetId;
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

  async getRanges(ranges) {
    const response = await this.sheets.spreadsheets.values.batchGet({
      spreadsheetId: this.spreadsheetId,
      ranges,
    });

    return response.data.valueRanges;
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