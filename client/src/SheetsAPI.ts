import { URIs, callProtectedResources } from "./APIs";
import type { PanelRange } from '@panels'

export type NonPanelRange = "Announcements" | "Registrar List" | "Temporary Data"
export type Range = PanelRange | NonPanelRange

export type HeaderRows = Partial<Record<Range, string[]>>
export const headerRowMemo: HeaderRows = {}

export async function getRange(range: Range) {
  const rangeData = await callProtectedResources<string[][]>({
    method: "GET",
    url: `${URIs.sheets}/range/${range}`
  });
  if (!rangeData) {
    console.error("no range data returned from getRange")
    return [];
  }
  headerRowMemo[range] = rangeData.shift();
  return rangeData;
}

type ExpectedRangeReturn = {
  range: Range,
  values: string[][]
  majorDimension: "ROWS"
}

export async function getRanges(ranges: Range[] = [
  "Students",
  "Modules",
  "Graduates",
  "Completed Modules",
  "Grad Engagements",
  "Theses",
  "Announcements"
]): Promise<Record<string, string[][]>[]> {

  const rangeData = await callProtectedResources<ExpectedRangeReturn[], { ranges: Range[] }>({
    method: "POST",
    url: `${URIs.sheets}/ranges`,
    data: {
      ranges
    }
  });

  if (!rangeData) {
    return [];
  }

  return rangeData.map(({ values }, i) => {
    const range = ranges[i];
    headerRowMemo[range as Range] = values.shift();
    return {
      [range]: values
    }
  });
}

export async function clearByRow(range: Range, row: number) {
  await callProtectedResources({
    method: "DELETE",
    url: `${URIs.sheets}/range/${range}/${row}`
  })
}

export async function clearByRowData(range: Range, data: string[]) {
  await callProtectedResources({
    method: "DELETE",
    url: `${URIs.sheets}/range/${range}`,
    data
  })
}

export async function updateByRow(range: Range, row: number, data: string[][]) {
  await callProtectedResources({
    method: "PUT",
    url: `${URIs.sheets}/range/${range}/${row}`,
    data
  })
}

export async function postInRange(range: Range, data: string[][]) {
  const row = await callProtectedResources<number>({
    method: "POST",
    url: `${URIs.sheets}/range/${range}`,
    data
  })
  if (!row) {
    console.error("no row returned from postInRange")
    throw new Error("no row returned from postInRange")
  }
  return row;
}

export function getHeaderRowCache(range: Range) {
  if (!headerRowMemo[range]) {
    throw new Error("Header row cache miss for: " + range)
  }
  return headerRowMemo[range] || [];
}

export async function replaceRange(range: Range, data: string[][]) {
  await callProtectedResources({
    method: "PUT",
    url: `${URIs.sheets}/range/${range}`,
    data
  })
}

export type BatchUpdateData = {
  range: `${Range}!${string}${number}`;
  values: string[][]
}[];

export async function batchUpdate(data: BatchUpdateData) {
  await callProtectedResources({
    method: "PUT",
    url: `${URIs.sheets}/batch`,
    data
  })
}