const hours = (n) => n * 60 * 60 * 1000;

const titleCase = (str) => {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

const URL = `https://oklahomacounty.legistar.com/Calendar.aspx`;

const NAME = "Name";
const DATE = "Meeting Date";
const TIME = "Meeting Time";
const LOCATION = "Meeting Location";
const DETAILS = "Meeting Details";
const AGENDA = "Agenda";
const MINUTES = "Minutes";
const VIDEO = "Video";

const axios = require("axios");
const cheerio = require("cheerio");

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

async function fetchHTML(url) {
  console.log("fetching", url);
  try {
    const { data } = await axios.get(url);
    console.log("done fetch", data);
    return cheerio.load(data);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  URL,
  NAME,
  DATE,
  TIME,
  LOCATION,
  DETAILS,
  AGENDA,
  MINUTES,
  VIDEO,
  hours,
  titleCase,
  colDefinition,
  fetchHTML,
};
