const { google } = require("googleapis");
let privatekey = require("./config/privatekey.json");

const CALENDAR_ID = "q6ilmj54h7f11k6fdq5sp962k8@group.calendar.google.com";

const SAMPLE_DATA = require("./sample-data");

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
let calendarInfo = {
  auth: jwtClient,
  calendarId: CALENDAR_ID,
  showDeleted: true,
};
calendar.events.list(calendarInfo, function (err, response) {
  if (err) {
    console.log("The API returned an error: " + err);
    return;
  }

  //   console.log(response.data.items);
  //   response.data.items.forEach(function (item) {
  //     calendar.events.delete({
  //       auth: jwtClient,
  //       calendarId: CALENDAR_ID,
  //       eventId: item.id,
  //     });
  //   });
});

// SAMPLE_DATA.forEach((sample_event) => {
//   console.log(sample_event);
// });

function scrapeToIinsert(scrapedEvent) {
  const {
    id,
    summary,
    description,
    location,
    startDateTime,
    endDateTime,
  } = scrapedEvent;
  return {
    id: id,
    summary: summary,
    sendNotifications: true,
    sendUpdates: "all",
    supportsAttachments: true,
    start: {
      dateTime: startDateTime,
      timezone: "America/Chicago",
    },
    end: {
      dateTime: endDateTime,
      timezone: "America/Chicago",
    },
    description: description,
    location: location,
  };
}

let testEvent = scrapeToIinsert(SAMPLE_DATA[1]);

console.log(testEvent);

calendar.events.update(
  {
    auth: jwtClient,
    eventId: testEvent.id,
    calendarId: CALENDAR_ID,
    resource: testEvent,
  },
  function (err, event) {
    if (err) {
      console.log("There was an error contacting the Calendar service: " + err);
      return;
    }
    console.log("Event created: %s", event.htmlLink);
  }
);

module.exports = {};
