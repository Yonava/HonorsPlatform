import axios from "axios";
// import router from "./router";
import { useAuth } from "./store/useAuth";

export type Range = "Students" | "Modules" | "Graduates" | "Completed Modules" | "Announcements" | "Grad Engagements" | "Registrar List" | "Theses" | "Temporary Data";

export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function requestHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${useAuth().getToken()}`,
    }
  }
}

export async function getRange(range: Range): Promise<string[][]> {
  try {
    const { data } = (await axios.get(`/api/range/${range}`, requestHeaders()));
    headerRowMemo[range] = data.shift();
    return data;
  } catch {
    await useAuth().authorize();
    return getRange(range);
  }
}

export async function getRanges(ranges: Range[] = [
  "Students",
  "Modules",
  "Graduates",
  "Completed Modules",
  "Grad Engagements",
  "Theses",
  "Announcements"
]): Promise<{ [key in string]: string[][] }[]> {

  // will be replaced with a better solution
  await new Promise((resolve) => {
    let numberOfTries = 0;
    const getTokenInterval = setInterval(() => {
      if (useAuth().getToken()) {
        clearInterval(getTokenInterval);
        resolve('done');
      } else if (numberOfTries > 5) {
        clearInterval(getTokenInterval);
        resolve('done');
      }
      numberOfTries++;
    }, 100);
  })

  try {
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
    return getRanges();
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

export function getHeaderRowCache(range: Range) {
  if (!headerRowMemo[range]) {
    throw new Error("Header row cache miss for: " + range)
  }
  return headerRowMemo[range] || [];
}

export async function replaceRange(range: Range, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}`, data, requestHeaders());
  } catch {
    await useAuth().authorize();
    await replaceRange(range, data);
  }
}