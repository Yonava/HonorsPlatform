import OpenSheet from "./OpenSheet.js";
import express from "express";
const router = express.Router();

const sheetInstance = async () => await OpenSheet.getInstance();

router.get("/", async (req, res) => {
  res.json({ message: "Welcome to the Open Access API" });
});

router.get("/points", async (req, res) => {
  try {
    const studentData = {
      'points': 3,
      'name': 0,
    };
    const students = (await (await sheetInstance()).getRange("Students"))
      .slice(1)
      .filter(student => student[0]);
    const points = students
      .map(student => {
        const studentObj = {};
        for (const key in studentData) {
          studentObj[key] = student[studentData[key]];
          if (key === 'points') {
            studentObj[key] = parseInt(studentObj[key]) || 0;
          }
        }
        return studentObj;
      });
    res.json(points);
  } catch {
    res.status(401).json({ error: "Forbidden" });
  }
});

export default router;