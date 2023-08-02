import axios from "axios";
import { useAuth } from "./store/useAuth";
import { local } from "./Locals";

export type Range = "Students" | "Modules" | "Graduates" | "Completed Modules" | "Announcements" | "Grad Engagements" | "Registrar List" | "Theses" | "Temporary Data";

export type HeaderRows = { [key in Range]?: string[] }
export const headerRowMemo: HeaderRows = {}

function requestHeaders() {

  const { googleProfile } = useAuth();

  const googleAccessToken = () => {
    const googleId = googleProfile?.id
    if (!googleId) {
      const { accessTokenPrefix } = local
      const tokenKey = Object.keys(localStorage).find(key => key.startsWith(accessTokenPrefix))
      if (!tokenKey) {
        return
      }
      return localStorage.getItem(tokenKey)
    }
    const tokenKey = local.googleOAuthAccessToken(googleId)
    return localStorage.getItem(tokenKey)
  }

  return {
    headers: {
      Authorization: `Bearer ${googleAccessToken()}`,
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

  // await new Promise(resolve => setTimeout(resolve, 1000));

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
    await useAuth().pendingAuthorization
    return await getRanges();
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

export async function postInRange(range: Range, data: string[][]): Promise<number> {
  try {
    const { data: res } = await axios.post(`/api/range/${range}`, data, requestHeaders());
    return res.row;
  } catch {
    await useAuth().authorize();
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
    await useAuth().authorize();
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