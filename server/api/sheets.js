/**
 * @module api/sheets
 * @requires express
 * @description exposes routes for interacting with Google Sheets API
 * @exports express.Router
*/

const express = require('express');
const { provideAccessToken } = require('../helpers/auth');
const {
  attachSheetInstance,
  attachExecuteGoogleSheetRequest
} = require('../helpers/sheets');

const router = express.Router();

router.use(provideAccessToken);
router.use(attachSheetInstance);
router.use(attachExecuteGoogleSheetRequest);

router.get("/range/:range", async (req) => {
  const { range } = req.params;
  req.execSheetRequest(async (sheet) => await sheet.getRange(range));
});

router.post("/ranges", async (req) => {
  const { ranges } = req.body;
  req.execSheetRequest(async (sheet) => await sheet.getRanges(ranges));
});

router.put("/range/:range/:row", async (req) => {
  const { range, row } = req.params;
  const data = req.body;
  req.execSheetRequest(async (sheet) => await sheet.updateByRow(range, row, data));
});

router.put("/range/:range", async (req) => {
  const { range } = req.params;
  const data = req.body;
  req.execSheetRequest(async (sheet) => await sheet.replaceRange(range, data));
});

router.delete("/range/:range/:row", async (req) => {
  const { range, row } = req.params;
  req.execSheetRequest(async (sheet) => await sheet.deleteByRow(range, row));
});

router.delete("/range/:range", async (req) => {
  const { range } = req.params;
  const data = req.body;
  req.execSheetRequest(async (sheet) => await sheet.deleteRowByRowData(range, data));
});

router.post("/range/:range", async (req) => {
  const { range } = req.params;
  const data = req.body;
  req.execSheetRequest(async (sheet) => await sheet.postInRange(range, data));
});

router.put("/batch", async (req) => {
  const data = req.body;
  req.execSheetRequest(async (sheet) => await sheet.batchUpdate(data));
});

module.exports = router;