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
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${row}:Z${row}`,
    });
  }

  async addStudent(student) {
    let students = (await this.getStudents()).map(row => row.join(''));
    let insertRow = students.indexOf('');
    insertRow = insertRow === -1 ? students.length : insertRow + 1;
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${insertRow}:Z${insertRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [student]
      }
    });
  }

  async updateStudent(student) {
    const { misc, rowNum, ...rest } = student
    const studentData = [...Object.values(rest)]

    if (Object.values(misc).length > 0) {
      studentData.push(...(await this.getMiscCategories()).map(cat => misc[cat] ?? ''))
    }

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Students!A${rowNum}:Z${rowNum}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [studentData]
      }
    });
  }

  async getMiscCategories() {
    const { data } = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Students!G1:Z1',
    });

    return data.values[0];
  }

  async getModules(studentId) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Modules',
    });

    const modules = response.data.values
      .slice(1)
      .filter(row => row[0] === studentId);

    return modules.map(row => {
      return {
        studentId: row[0] ?? '',
        courseCode: row[1] ?? '',
        description: row[2] ?? '',
        term: row[3] ?? '',
      };
    });
  }
}