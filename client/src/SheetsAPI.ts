import axios from "axios";
import router from "./router";

export enum Range {
  STUDENTS = "Students",
  MODULES = "Modules",
  GRADUATES = "Graduates",
  COMPLETED_MODULES = "Completed Modules",
  ANNOUNCEMENTS = "Announcements",
}

// memoized to avoid API calls on every update
export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function catchAction() {
  router.push("/auth");
}

export async function getEvery(range: Range) {
  try {
    const data = (await axios.get(`/api/range/${range}`)).data;
    // remove header row and store it in memo
    headerRowMemo[range] = data.shift();
    return data;
  } catch {
    router.push({
      name: "auth",
      query: {
        hold: "true",
      }
    })
  }
}

export async function clearByRow(range: Range, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`);
  } catch {
    catchAction();
  }
}

export async function updateByRow(range: Range, row: number, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}/${row}`, data);
  } catch {
    catchAction();
  }
}

export async function postInRange(range: Range, data: string[][]) {
  try {
    await axios.post(`/api/range/${range}`, data);
  } catch {
    catchAction();
  }
}

export async function getHeaderRow(range: Range) {
  try {
    const headerRow = (await axios.get(`/api/range/${range}!A1:Z1`)).data;
    headerRowMemo[range] = headerRow[0];
    return headerRow[0];
  } catch {
    router.push({
      name: "auth",
      query: {
        hold: "true",
      }
    })
  }
}

export async function getNonSensitiveData(endpointExtension: string) {
  try {
    return (await axios.get(`/api/open/${endpointExtension}`)).data;
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