import axios from "axios";

const key = 'AIzaSyDjXnz5jBG7LoYlhWERA85b2ypKu1VPbws';
const spreadsheetId = '1bW-aQRn-GAbTsNkV2VB9xtBFT3n-LPrSJXua_NA2G6Y';

export async function getStudentData() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Students?key=${key}`;
  const response = await axios.get(url);
  console.log(response.data.values);
  return response.data.values;
}