import axios from "axios";

export async function getStudents() {
  return (await axios.get("/api/students")).data;
}

export async function deleteStudent(row: number) {
  axios.delete(`/api/students/${row}`);
}

export async function addStudent(student: any) {
  axios.post("/api/students", student);
}

export async function updateStudent(student: any) {
  axios.put("/api/students", student);
}

export async function getModules(studentId: string) {
  return (await axios.get(`/api/modules/${studentId}`)).data;
}