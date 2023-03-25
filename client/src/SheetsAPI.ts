import axios from "axios";
import router from "./router";

function catchAction() {
  router.push("/auth");
}

export async function getEvery(range: string) {
  try {
    const data = (await axios.get(`/api/range/${range}`)).data;
    // remove header row
    data.shift();
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

export async function clearByRow(range: string, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`);
  } catch {
    catchAction();
  }
}

export async function updateByRow(range: string, row: number, data: any[][]) {
  try {
    await axios.put(`/api/range/${range}/${row}`, data);
  } catch {
    catchAction();
  }
}

export async function postInRange(range: string, data: any[][]) {
  try {
    await axios.post(`/api/range/${range}`, data);
  } catch {
    catchAction();
  }
}

export async function getHeaderRow(range: string) {
  try {
    const headerRow = (await axios.get(`/api/range/${range}!A1:Z1`)).data;
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

export async function getModules(studentId: string) {
  try {
    return (await axios.get(`/api/modules/${studentId}`)).data;
  } catch {
    catchAction();
  }
}

export async function deleteModule(studentId: string, courseCode: string) {
  try {
    await axios.delete(`/api/modules/${studentId}/${courseCode}`);
  } catch {
    catchAction();
  }
}

export async function addModule(module: any) {
  try {
    await axios.post("/api/modules", module);
  } catch {
    catchAction();
  }
}