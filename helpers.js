const axios = require("axios");
const cheerio = require("cheerio");

const hours = (n) => n * 60 * 60 * 1000;

const titleCase = (str) => {
  str = str.toLowerCase().split(" ");
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(" ");
};

const clean = (str) => {
  let _str = str.replace(/ +(?= )/g, "").replace(/(\r\n|\n|\r)/gm, "");
  return _str.trim();
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

const THIS_MONTH = "This Month";
const LAST_MONTH = "Last Month";
const NEXT_MONTH = "Next Month";

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

let CAL_YEAR_NAME = "Setting-736-Calendar Year";
let CAL_YEAR_VALUE = "This Month";
let CAL_BODY_NAME = "Setting-736-Calendar Body";
let CAL_BODY_VALUE = "All";

async function fetchHTML(url, month) {
  console.log("fetching", url, month);
  let _month = month || CAL_YEAR_VALUE;
  try {
    const { data } = await axios.get(URL, {
      headers: {
        Cookie: `${CAL_YEAR_NAME}=${_month};`,
      },
    });
    //console.log("done fetch", data);
    return cheerio.load(data);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  LAST_MONTH,
  THIS_MONTH,
  NEXT_MONTH,
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
  clean,
};
