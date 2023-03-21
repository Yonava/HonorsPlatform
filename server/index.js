import express from "express";
import GoogleSheet from "./GoogleSheet.js";

const app = express();
app.use(express.json());
const sheetInstance = await GoogleSheet.getInstance();

app.get("/students", async (req, res) => {
  const students = await sheetInstance.getStudents();
  res.json(students);
});

app.delete("/students/:row", async (req, res) => {
  const { row } = req.params;
  await sheetInstance.deleteStudent(row);
  res.json({ success: true });
});

app.put("/students", async (req, res) => {
  const student = req.body;
  await sheetInstance.updateStudent(student);
  res.json({ success: true });
});

app.post("/students", async (req, res) => {
  const student = req.body;
  await sheetInstance.addStudent(student);
  res.json({ success: true });
});

app.get("/students/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const student = await sheetInstance.getStudent(studentId);
  if (!student) {
    res.status(404).json({ error: `Student with ID ${studentId} not found` });
    return;
  }
  res.json(student);
});

app.get("/modules/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const modules = await sheetInstance.getModules(studentId);
  res.json(modules);
});

app.post("/modules", async (req, res) => {
  const module = req.body;
  await sheetInstance.addModule(module);
  res.json({ success: true });
});

app.delete("/modules/:studentId/:courseCode", async (req, res) => {
  const { studentId, courseCode } = req.params;
  await sheetInstance.deleteModule(studentId, courseCode);
  res.json({ success: true });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 1010;

app.listen(port, () => {
  console.log("listening on port " + port);
});