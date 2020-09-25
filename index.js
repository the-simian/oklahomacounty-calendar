const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const app = express();
const wakeUpDyno = require("./awaken-dyno.js");

const scrape = require("./scrape");

port = process.env.PORT || 5335;

const DYNO_URL = `https://occc-calendar.herokuapp.com/`;

let cachedData = null;

app.use("/scrape", async (req, res, next) => {
  let data = null;
  try {
    data = await scrape();
  } catch (err) {
    res.send(err);
  }

  if (data) {
    res.send(data);
  }

  next();
});

app.listen(port, function () {
  console.log(`Running on ${port}`);
  //wakeUpDyno(DYNO_URL);
});
