const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const app = express();
const wakeUpDyno = require("./awaken-dyno.js");

port = process.env.PORT || 5335;

const DYNO_URL = `https://occc-calendar.herokuapp.com/`;
const URL = `https://oklahomacounty.legistar.com/Calendar.aspx`;

const NAME = "Name";
const DATE = "Meeting Date";
const TIME = "Meeting Time";
const LOCATION = "Meeting Location";
const DETAILS = "Meeting Details";
const AGENDA = "Agenda";
const MINUTES = "Minutes";
const VIDEO = "Video";

const colDefinition = [
  { name: NAME, type: "text" },
  { name: DATE, type: "text" },
  { name: "", type: "none" },
  { name: TIME, type: "text" },
  { name: LOCATION, type: "text" },
  { name: DETAILS, type: "link" },
  { name: AGENDA, type: "link" },
  { name: MINUTES, type: "link" },
  { name: VIDEO, type: "link" },
];

const hours = (n) => n * 60 * 60 * 1000;

const titleCase = (str) => {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

const li = (item, prop) => {
  let _li = "";
  if (item[prop]) {
    if (prop != LOCATION) {
      let val = item[prop].indexOf("href") > -1 ? item[prop] : "none";
      _li = `<li>${titleCase(prop)} : ${val}</li>`;
    } else {
      let val = item[prop];
      _li = `<li>${titleCase(prop)} : ${val}</li>`;
    }
  }
  return _li;
};

async function fetchHTML(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

async function scrape() {
  const $ = await fetchHTML(URL);

  const strategies = {
    text: (cell) => $(cell).text().trim(),
    link: (cell) => {
      $(cell)
        .find("a")
        .each(function (index, el) {
          let fileLocation = $(el).attr("href");
          if (fileLocation) {
            $(el)
              .attr(
                "href",
                `https://oklahomacounty.legistar.com/${fileLocation}`
              )
              .removeAttr("class")
              .removeAttr("id");
          } else {
            $(el).remove();
          }
        });

      $(cell)
        .find("img")
        .each(function (index, el) {
          let _src = $(el).attr("src");
          if (_src) {
            $(el)
              .attr("src", `https://oklahomacounty.legistar.com/${_src}`)
              .removeAttr("class")
              .removeAttr("id");
          } else {
            $(el).remove();
          }
        });

      return $(cell).html();
    },
    none: () => null,
  };

  const cellToData = (cell, cellIndex) =>
    strategies[colDefinition[cellIndex].type](cell);

  const tData = $(".rgMasterTable tr")
    .get()
    .map((row) => $(row).find("td").get().map(cellToData))
    .filter((x) => x.length);

  const items = tData.map((row) => {
    return row.reduce((acc, item, index) => {
      return { ...acc, ...{ [colDefinition[index].name]: item } };
    }, {});
  });

  const calendarReadyItems = items.map((item, index) => {
    let startDateTime = new Date(`${item[DATE]} ${item[TIME]} GMT-0500`);
    let endDateTime = new Date(startDateTime.getTime() + hours(2));
    return {
      summary: `${item[NAME]}`,
      description: `<span> Oklahoma County ${item[NAME]}</span><ul>${li(
        item,
        LOCATION
      )}${li(item, DETAILS)}${li(item, AGENDA)}${(item, li(MINUTES))}${
        (item, li(VIDEO))
      }</ul>`,
      location: `${item[LOCATION]} Oklahoma City, Oklahoma`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
  });

  return calendarReadyItems;
}

let scrapedData = [];

app.use("/", async (req, res, next) => {
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
  wakeUpDyno(DYNO_URL);
});
