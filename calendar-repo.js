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
let calendarInfo = {
  auth: jwtClient,
  calendarId: CALENDAR_ID,
  showDeleted: true,
};

async function getGcalEvents() {
  return new Promise((resolve, reject) => {
    calendar.events.list(
      {
        showDeleted: true,
        ...calendarInfo,
      },
      function (err, response) {
        if (err) {
          console.log("The API returned an error: " + err);
          reject(err);
        }
        resolve(response.data.items);
      }
    );
  });
}

function scrapeToGcal(scrapedEvent) {
  const {
    id,
    summary,
    description,
    location,
    startDateTime,
    endDateTime,
  } = scrapedEvent;
  return {
    id: id.substr(0, 1024),
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

async function insertGcalEvent(calendarEvent) {
  return new Promise((resolve, reject) => {
    calendar.events.insert(
      {
        resource: calendarEvent,
        ...calendarInfo,
      },
      (err, event) => {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return reject(err);
        }
        return resolve(event);
      }
    );
  });
}

async function updateGcalEvent(calendarEvent) {
  return new Promise((resolve, reject) => {
    calendar.events.update(
      {
        eventId: calendarEvent.id,
        resource: calendarEvent,
        ...calendarInfo,
      },
      (err, event) => {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          return reject(err);
        }
        return resolve(event);
      }
    );
  });
}

module.exports = {
  updateGcalEvent,
  insertGcalEvent,
  getGcalEvents,
  scrapeToGcal,
};
