import axios from "axios";

const key = 'AIzaSyDjXnz5jBG7LoYlhWERA85b2ypKu1VPbws';
const spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';

export async function getStudentData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Students?key=${key}`;
  const response = await axios.get(url);
  return response.data.values;
}

export async function deleteStudent(row: number) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Students!A${row}:Z${row}:clear?key=${key}`;
  const response = await axios.post(url);
  return response;
}