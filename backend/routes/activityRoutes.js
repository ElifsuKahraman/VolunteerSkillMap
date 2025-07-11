const express = require("express");
const router = express.Router();
const Activity = require("../models/Activity");


router.post("/", async (req, res) => {
  try {
    const { description } = req.body;
    const activity = new Activity({ description });
    await activity.save();
    res.status(201).json({ message: "Faaliyet kaydedildi", activity });
  } catch (error) {
    res.status(500).json({ message: "Hata oluştu", error });
  }
});

module.exports = router;
