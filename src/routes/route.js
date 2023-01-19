const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

//======================post API=====================

router.post("/url/shorten", urlController.urlShorten);

//======================get API====================

router.get("/:urlCode", urlController.getUrl);

router.all("/*", (req, res) => {
  res.status(400).send({ message: "invalid path" });
});

module.exports = router;
