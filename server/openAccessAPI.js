import OpenSheet from "./OpenSheet.js";
import express from "express";
const router = express.Router();

const sheetInstance = async () => await OpenSheet.getInstance();

router.get("/", async (req, res) => {
  res.json({ message: "Welcome to the Open Access API" });
});

router.get("/points", async (req, res) => {
  try {
    const students = await (await sheetInstance()).getRange("Students");
    const pointsIndex = 3;
    const points = students.map(student => student[pointsIndex]);
    res.json(points);
  } catch {
    res.status(401).json({ error: "Forbidden" });
  }
});

export default router;