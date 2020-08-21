const cheerio = require("cheerio");
const axios = require("axios");

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

const li = (item, prop) => item[prop] ? `<li>${prop.toLowerCase()}:${item[prop]}</li>` : '';

async function fetchHTML(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

async function scrape() {
  const $ = await fetchHTML(URL);

  const strategies = {
    text: (cell) => $(cell).text().trim(),
    link: (cell) => $(cell).html().trim(),
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
      description: `<span> Oklahoma County ${item[NAME]}</span><ul>${li(item,LOCATION)}${li(item,DETAILS)}${li(item,AGENDA)}${item,li(MINUTES)}${item,li(VIDEO)}</ul>`,
      location: `${item[LOCATION]} Oklahoma City, Oklahoma`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
  });

  console.log(calendarReadyItems);

  return calendarReadyItems;
}

scrape();
