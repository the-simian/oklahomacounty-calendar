const { hours, titleCase } = require('./helpers')

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

