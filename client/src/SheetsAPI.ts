import axios from "axios";
import { useAuth } from "@store/useAuth";
import { local, localKeys } from "@locals";
import { panels, type PanelRange } from "@panels";

export type Range = PanelRange | "Announcements" | "Registrar List" | "Temporary Data";

export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function requestHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${local.get(localKeys.googleOAuthAccessToken)}`,
    } as const
  }
}

export type SheetsAPIRange<T extends string = Range> = {
  range: `${T}!${string}:${string}`,
  values: string[][]
  majorDimension: "ROWS"
}

import { requestWithRePrompt } from "@store/useRequestQueue";

export async function getRanges(ranges: Range[] = [
  "Students",
  "Modules",
  "Graduates",
  "Completed Modules",
  "Grad Engagements",
  "Theses",
  "Announcements"
]): Promise<{ [key in string]: string[][] }[]> {

  console.log('getting ranges')
  return requestWithRePrompt(async () => {
    const { data } = (await axios.post(`/api/ranges/`, { ranges }, requestHeaders())) as { data: SheetsAPIRange[] };
    return data.map(({ values }, i) => {
      const range = ranges[i];
      headerRowMemo[range as Range] = values.shift();
      return {
        [range]: values
      }
    });
  });
}

export async function getAllSheetItemRanges() {
  const ranges = Object.values(panels).map(p => p.sheetRange);
  const { data } = await axios.post(`/api/ranges/`, { ranges }, requestHeaders());
  return data as SheetsAPIRange<PanelRange>[];
}

export async function clearByRow(range: Range, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await clearByRow(range, row);
  }
}

export async function clearByRowData(range: Range, data: string[]) {
  try {
    await axios.delete(`/api/range/${range}`, { data, ...requestHeaders() });
  } catch (e: any) {
    if (e.response.status === 400) {
      await useAuth().authorizeBeforeContinuing();
      await clearByRowData(range, data);
    } else {
      throw e;
    }
  }
}

export async function updateByRow(range: Range, row: number, data: string[][]) {
  try {
    await axios.put(`/api/range/${range}/${row}`, data, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await updateByRow(range, row, data);
  }
}

export async function postInRange(range: Range, data: string[][]): Promise<number> {
  try {
    const { data: res } = await axios.post(`/api/range/${range}`, data, requestHeaders());
    return res.row;
  } catch {
    await useAuth().authorizeBeforeContinuing();
    return await postInRange(range, data);
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
    await useAuth().authorizeBeforeContinuing();
    await replaceRange(range, data);
  }
}

export async function getUserProfileData(): Promise<any> {
  try {
    const { data } = await axios.get("/api/user", requestHeaders());
    if (!data) {
      throw new Error("No user profile data received");
    }
    return data;
  } catch {
    throw new Error("Unable to get user profile data");
  }
}

export async function getUserSheetPermissions(): Promise<{ read: boolean, write: boolean }> {
  try {
    const { data } = await axios.get("/api/user/permissions", requestHeaders());
    if (!data) {
      throw new Error("No user permissions data received");
    }
    return data;
  } catch {
    throw new Error("Unable to get user permissions data");
  }
}

export type BatchUpdateData = {
  range: `${Range}!${string}${number}`;
  values: string[][]
}[];

export async function batchUpdate(data: BatchUpdateData) {
  try {
    await axios.put("/api/batch", data, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await batchUpdate(data);
  }
}