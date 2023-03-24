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
    catchAction();
  }
}

export async function clearByRow(range: string, row: number) {
  try {
    await axios.delete(`/api/range/${range}/${row}`);
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

export async function getStudent(studentId: number) {
  try {
    return (await axios.get(`/api/students/${studentId}`)).data;
  } catch {
    catchAction();
  }
}

export async function deleteStudent(row: number) {
  try {
    await axios.delete(`/api/students/${row}`);
  } catch {
    catchAction();
  }
}

export async function addStudent(student: any) {
  try {
    await axios.post("/api/students", student);
  } catch {
    catchAction();
  }
}

export async function updateStudent(student: any) {
  try {
    await axios.put("/api/students", student);
  } catch {
    catchAction();
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