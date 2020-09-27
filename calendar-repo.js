const { google } = require("googleapis");
let privatekey = require("./config/privatekey.json");

const CALENDAR_ID = "q6ilmj54h7f11k6fdq5sp962k8@group.calendar.google.com";

let jwtClient = new google.auth.JWT(
  privatekey.client_email,
  null,
  privatekey.private_key,
  ["https://www.googleapis.com/auth/calendar"]
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log(tokens);
    console.log("Successfully connected!");
  }
});

//Google Calendar API
let calendar = google.calendar("v3");
calendar.events.list(
  {
    auth: jwtClient,
    calendarId: CALENDAR_ID,
  },
  function (err, response) {
    if (err) {
      console.log("The API returned an error: " + err);
      return;
    }

    console.log(response.data.items);
  }
);

module.exports = {};
