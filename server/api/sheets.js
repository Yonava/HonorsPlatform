const express = require('express');
const GoogleSheet = require('../GoogleSheet');
const { provideAccessToken } = require('../auth');

const router = express.Router();

router.use(provideAccessToken);

// insert the sheet instance into the request object
router.use((req, res, next) => {
  const { accessToken } = req;
  try {
    req.sheet = new GoogleSheet(accessToken);
  } catch (e) {
    res.status(401).json({ error: 'Sheet Instance Creation Failed' });
    return;
  }
  next();
});

router.get("/range/:range", async (req, res) => {
  const { range } = req.params;

  try {
    const data = await req.sheet.getRange(range);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.post("/ranges", async (req, res) => {
  const { ranges } = req.body;

  try {
    const data = await req.sheet.getRanges(ranges);
    res.json(data);
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.put("/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;
  const data = req.body;

  try {
    await req.sheet.updateByRow(range, row, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.put("/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;

  try {
    await req.sheet.replaceRange(range, data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.delete("/range/:range/:row", async (req, res) => {
  const { range, row } = req.params;

  try {
    await req.sheet.deleteByRow(range, row);
    res.json({ success: true });
  } catch (e) {
    console.log(e)
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

router.delete("/range/:range", async (req, res) => {
  const { range } = req.params;
  const data = req.body;

  try {
    await req.sheet.deleteRowByRowData(range, data);
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

  try {
    const rowInsertedAt = await req.sheet.postInRange(range, data);
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

  try {
    await req.sheet.batchUpdate(data);
    res.json({ success: true });
  } catch (e) {
    res.status(401).json({ error: 'Forbidden' });
    return;
  }
});

module.exports = router;