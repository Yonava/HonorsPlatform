import axios from "axios";

export async function getStudents() {
  return (await axios.get("/api/students")).data;
}

export async function deleteStudent(row: number) {
  await axios.delete(`/api/students/${row}`);
}

export async function addStudent(student: any) {
  await axios.post("/api/students", student);
}

export async function updateStudent(student: any) {
  await axios.put("/api/students", student);
}

export async function getModules(studentId: string) {
  return (await axios.get(`/api/modules/${studentId}`)).data;
}