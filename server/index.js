import express from "express";
import GoogleSheet from "./GoogleSheet.js";
import { google } from 'googleapis';

const { OAuth2 } = google.auth;

const clientId = '190006346508-fsioaathe0vo6ou4c46dssgq3vnr0kk9.apps.googleusercontent.com';
const clientSecret = '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';
const redirectUri = 'http://localhost:5177/auth';
const scope = 'https://www.googleapis.com/auth/spreadsheets';

const app = express();
app.use(express.json());
let sheetInstance;

app.get('/auth/:oauthtoken', async (req, res) => {
  const { oauthtoken } = req.params;
  const auth = new OAuth2(clientId, clientSecret, redirectUri);
  try {
    sheetInstance = await GoogleSheet.getInstance(auth, oauthtoken);
  } catch (e) {
    const url = auth.generateAuthUrl({
      access_type: 'offline',
      scope,
    });
    res.json({ 
      error: 'Invalid token',
      url
    });
    return;
  }
  res.json({ token_received: true });
})

app.get("/students", async (req, res) => {
  try {
    const students = await sheetInstance.getStudents();
    res.json(students);
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.delete("/students/:row", async (req, res) => {
  try {
    const { row } = req.params;
    await sheetInstance.deleteStudent(row);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.put("/students", async (req, res) => {
  try {
    const student = req.body;
    await sheetInstance.updateStudent(student);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/students", async (req, res) => {
  const student = req.body;
  await sheetInstance.addStudent(student);
  res.json({ success: true });
});

app.get("/students/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await sheetInstance.getStudent(studentId);
    if (!student) {
      res.status(404).json({ error: `Student with ID ${studentId} not found` });
      return;
    }
    res.json(student);
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.get("/modules/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const modules = await sheetInstance.getModules(studentId);
    res.json(modules);
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.post("/modules", async (req, res) => {
  try {
    const module = req.body;
    await sheetInstance.addModule(module);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

app.delete("/modules/:studentId/:courseCode", async (req, res) => {
  try {
    const { studentId, courseCode } = req.params;
    await sheetInstance.deleteModule(studentId, courseCode);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: 'Forbidden' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/public/'));
  app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.html'));
}

const port = process.env.PORT || 1010;

app.listen(port, () => {
  console.log("listening on port " + port);
});