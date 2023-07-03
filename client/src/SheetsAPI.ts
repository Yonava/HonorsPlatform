import axios from "axios";
import router from "./router";
import { useAuth } from "./store/useAuth";

export type Range = "Students" | "Modules" | "Graduates" | "Completed Modules" | "Announcements" | "Grad Engagements" | "Registrar List" | "Theses" | "Temporary Data";

// memoized to avoid API calls on every update
export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function catchAction() {
  router.push({
    name: "auth"
  })
}

function requestHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${useAuth().getToken()}`,
    }
  }
}

export async function getEvery(range: Range): Promise<string[][]> {
  try {
    const { data } = (await axios.get(`/api/range/${range}`, requestHeaders()));
    headerRowMemo[range] = data.shift();
    return data;
  } catch {
    await useAuth().authorize();
    return getEvery(range);
  }
}

export async function getFullSheetData(): Promise<{ [key in string]: string[][] }[]> {
  try {
    const ranges: Range[] = [
      "Students",
      "Modules",
      "Graduates",
      "Completed Modules",
      "Grad Engagements",
      "Theses",
      "Announcements"
    ]

    type ExpectedReturn = {
      range: Range,
      values: string[][]
      majorDimension: "ROWS"
    }

    const { data } = (await axios.post(`/api/ranges/`, { ranges }, requestHeaders())) as { data: ExpectedReturn[] };
    return data.map(({ values }, i) => {
      const range = ranges[i];
      headerRowMemo[range as Range] = values.shift();
      return {
        [range]: values
      }
    });
  } catch {
    await useAuth().authorize();
    return getFullSheetData();
  }
}

export async function clearByRow(range: Range, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`, requestHeaders());
  } catch {
    await useAuth().authorize();
    await clearByRow(range, row);
  }
}

export async function updateByRow(range: Range, row: number, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}/${row}`, data, requestHeaders());
  } catch {
    await useAuth().authorize();
    await updateByRow(range, row, data);
  }
}

export async function postInRange(range: Range, data: string[][]) {
  try {
    const { data: res } = await axios.post(`/api/range/${range}`, data, requestHeaders());
    return res.row;
  } catch {
    await useAuth().authorize();
    await postInRange(range, data);
  }
}

export async function getHeaderRow(range: Range): Promise<string[]> {
  try {
    const headerRow = (await axios.get(`/api/range/${range}!A1:Z1`, requestHeaders())).data;
    headerRowMemo[range] = headerRow[0];
    return headerRow[0];
  } catch {
    await useAuth().authorize();
    return getHeaderRow(range);
  }
}

export async function getHeaderRowCache(range: Range) {
  return headerRowMemo[range] ?? await getHeaderRow(range);
}

export async function getNonSensitiveData(endpointExtension: string) {
  try {
    return (await axios.get(`/api/open/${endpointExtension}`, requestHeaders())).data;
  } catch {
    catchAction();
    return [];
  }
}

export async function moveRowToRange(fromRange: Range, toRange: Range, row: number, data: string[][]) {
  try {
    await postInRange(toRange, data);
    await clearByRow(fromRange, row);
  } catch {
    await useAuth().authorize();
    await moveRowToRange(fromRange, toRange, row, data);
  }
}

export async function replaceRange(range: Range, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}`, data, requestHeaders());
  } catch {
    await useAuth().authorize();
    await replaceRange(range, data);
  }
}