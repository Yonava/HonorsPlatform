import axios from "axios";
import router from "./router";

function catchAction() {
  router.push("/auth");
}

export async function getStudents() {
  try {
    return (await axios.get("/api/students")).data;
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