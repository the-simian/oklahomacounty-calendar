const KEYFILE = '<yourpem.pem>';
const SERVICE_ACCT_ID = 'okccc-calendar-bot-app@okccc-bot.iam.gserviceaccount.com';

const CALENDAR_URL = 'https://calendar.google.com/calendar/embed?src=2ouibbdivhml32hhlpigr7b2r0%40group.calendar.google.com&ctz=America%2FChicago';
const CALENDAR_ID = {
  'primary': '2ouibbdivhml32hhlpigr7b2r0@group.calendar.google.com@gmail.com',
  'okccc': '2ouibbdivhml32hhlpigr7b2r0@group.calendar.google.com'
};
const TIMEZONE = 'UTC+05:00';

module.exports.calendarUrl = CALENDAR_URL;
module.exports.serviceAcctId = SERVICE_ACCT_ID;
module.exports.calendarId = CALENDAR_ID;
module.exports.keyFile = KEYFILE;           //or if using json keys - module.exports.key = key; 
module.exports.timezone = TIMEZONE;