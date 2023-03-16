import axios from "axios";

export async function getStudents() {
  return (await axios.get("/api/students")).data;
}

export async function deleteStudent(row: number) {
  await axios.delete(`/api/students/${row}`);
}