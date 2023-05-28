import axios from "axios";
import router from "./router";

export enum Range {
  STUDENTS = "Students",
  MODULES = "Modules",
  GRADUATES = "Graduates",
  COMPLETED_MODULES = "Completed Modules",
  ANNOUNCEMENTS = "Announcements",
  GRAD_ENGAGEMENT = "Grad Engagement",
  REGISTRAR_LIST = "Registrar List",
  THESES = "Theses",
}

// response delay to allow for Google Sheets API to update
const responseDelay = 100;

// memoized to avoid API calls on every update
export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function catchAction() {
  router.push({
    name: "auth",
    query: {
      hold: "true",
    }
  })
}

function requestHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  }
}

export async function getEvery(range: Range, addResponseDelay = true): Promise<string[][]> {
  try {
    if (addResponseDelay) {
      await new Promise(resolve => setTimeout(resolve, responseDelay));
    }
    const { data } = (await axios.get(`/api/range/${range}`, requestHeaders()));
    headerRowMemo[range] = data.shift();
    return data;
  } catch {
    catchAction();
    throw new Error("Access denied");
  }
}

export async function clearByRow(range: Range, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`, requestHeaders());
  } catch {
    catchAction();
  }
}

export async function updateByRow(range: Range, row: number, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}/${row}`, data, requestHeaders());
  } catch {
    catchAction();
  }
}

export async function postInRange(range: Range, data: string[][]) {
  try {
    await axios.post(`/api/range/${range}`, data, requestHeaders());
  } catch {
    catchAction();
  }
}

export async function getHeaderRow(range: Range): Promise<string[]> {
  try {
    const headerRow = (await axios.get(`/api/range/${range}!A1:Z1`, requestHeaders())).data;
    headerRowMemo[range] = headerRow[0];
    return headerRow[0];
  } catch {
    catchAction();
    throw new Error("Access denied");
  }
}

export async function getHeaderRowCache(range: Range) {
  return headerRowMemo[range] ?? await getHeaderRow(range);
}

export async function getNonSensitiveData(endpointExtension: string) {
  try {
    return (await axios.get(`/api/open/${endpointExtension}`, requestHeaders())).data;
  } catch {
    throw new Error("Access denied");
  }
}

export async function moveRowToRange(fromRange: Range, toRange: Range, row: number, data: string[][]) {
  try {
    await postInRange(toRange, data);
    await clearByRow(fromRange, row);
  } catch {
    catchAction();
  }
}

export async function replaceRange(range: Range, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}`, data, requestHeaders());
  } catch {
    catchAction();
    throw new Error("Access denied");
  }
}