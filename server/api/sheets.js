const express = require('express');
const GoogleSheet = require('../GoogleSheet');
const { provideAccessToken } = require('../auth');

const router = express.Router();

router.use(provideAccessToken);

router.get("/range/:range", async (req, res) => {
  const { range } = req.params;
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    const data = await sheet.getRange(range);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.post("/ranges", async (req, res) => {
  const { ranges } = req.body;
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    const data = await sheet.getRanges(ranges);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.put("/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;
  const data = req.body;

  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.updateByRow(range, row, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.put("/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;

  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.replaceRange(range, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.delete("/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.deleteByRow(range, row);
    res.json({ success: true });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.delete("/range/:range", async (req, res) => {
  const { range } = req.params;
  const { accessToken } = req;

  const { body: data } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.deleteRowByRowData(range, data);
    res.json({ success: true });
  } catch (e) {
    if (e === 'ROW_NOT_FOUND') {
      res.status(401).json({ error: 'ROW_NOT_FOUND' });
    } else {
      res.status(401).json({ error: 'Forbidden' });
    }
  }
});

router.post("/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    const rowInsertedAt = await sheet.postInRange(range, data);
    res.json({
      row: rowInsertedAt,
      success: true
    });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.put("/batch", async (req, res) => {
  const data = req.body;
  const { accessToken } = req;

  try {
    const sheet = new GoogleSheet(accessToken);
    await sheet.batchUpdate(data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

module.exports = router;