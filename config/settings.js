const SERVICE_ACCT_ID =
  "okccc-calendar-bot-app@okccc-bot.iam.gserviceaccount.com";

const KEY = require("./google-api-key.json").private_key;

const CALENDAR_URL =
  "https://calendar.google.com/calendar/embed?src=2ouibbdivhml32hhlpigr7b2r0%40group.calendar.google.com&ctz=America%2FChicago";

const CALENDAR_ID = {
  primary: "oklahomacountycalendarbot@gmail.com",
};

const TIMEZONE = "UTC+05:00";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

module.exports.calendarUrl = CALENDAR_URL;
module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.calendarId = CALENDAR_ID;
module.exports.key = KEY;
module.exports.timezone = TIMEZONE;
module.exports.SCOPES = SCOPES;
