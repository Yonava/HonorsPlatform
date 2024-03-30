import axios from "axios";
import { useAuth } from "@store/useAuth";
import { URIs, requestHeaders } from "./APIs";
import type { PanelRange } from '@panels'

export type NonPanelRanges = "Announcements" | "Registrar List" | "Temporary Data"
export type Range = PanelRange | NonPanelRanges

export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

export async function getRange(range: Range): Promise<string[][]> {
  try {
    const { data } = (await axios.get(`${URIs.sheets}/range/${range}`, requestHeaders()));
    headerRowMemo[range] = data.shift();
    return data;
  } catch {
    await useAuth().authorizeBeforeContinuing();
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

  try {
    type ExpectedReturn = {
      range: Range,
      values: string[][]
      majorDimension: "ROWS"
    }

    const { data } = (await axios.post(`${URIs.sheets}/ranges`, { ranges }, requestHeaders())) as { data: ExpectedReturn[] };
    return data.map(({ values }, i) => {
      const range = ranges[i];
      headerRowMemo[range as Range] = values.shift();
      return {
        [range]: values
      }
    });
  } catch {
    await useAuth().authorizeBeforeContinuing();
    return await getRanges();
  }
}

export async function clearByRow(range: Range, row: number) {
  try {
    await axios.delete(`${URIs.sheets}/range/${range}/${row}`, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await clearByRow(range, row);
  }
}

export async function clearByRowData(range: Range, data: string[]) {
  try {
    await axios.delete(`${URIs.sheets}/range/${range}`, { data, ...requestHeaders() });
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
    await axios.put(`${URIs.sheets}/range/${range}/${row}`, data, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await updateByRow(range, row, data);
  }
}

export async function postInRange(range: Range, data: string[][]): Promise<number> {
  try {
    const { data: res } = await axios.post(`${URIs.sheets}/range/${range}`, data, requestHeaders());
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
    await axios.put(`${URIs.sheets}/range/${range}`, data, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await replaceRange(range, data);
  }
}

export type BatchUpdateData = {
  range: `${Range}!${string}${number}`;
  values: string[][]
}[];

export async function batchUpdate(data: BatchUpdateData) {
  try {
    await axios.put(`${URIs.sheets}/batch`, data, requestHeaders());
  } catch {
    await useAuth().authorizeBeforeContinuing();
    await batchUpdate(data);
  }
}