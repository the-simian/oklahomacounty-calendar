const { google } = require("googleapis");
let privatekey = require("./config/privatekey.json");

const CALENDAR_ID = "1vdop21cdv5vqiuld1ckf1849o@group.calendar.google.com";

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
};

async function getGcalEvents() {
  return new Promise((resolve, reject) => {
    calendar.events.list(
      {
        showDeleted: false,
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
    details,
    agenda,
    minutes,
    video,
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

const OPS_THROTTLE = 500;

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
          setTimeout(function () {
            return resolve(err);
          }, OPS_THROTTLE);
        }
        setTimeout(function () {
          return resolve(event);
        }, OPS_THROTTLE);
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
          setTimeout(function () {
            return resolve(err);
          }, OPS_THROTTLE);
        }
        setTimeout(function () {
          return resolve(event);
        }, OPS_THROTTLE);
      }
    );
  });
}

async function removeGcalEvent(calendarEvent) {
  return new Promise((resolve, reject) => {
    calendar.events.delete(
      {
        eventId: calendarEvent.id,
        sendNotifications: false,
        sendUpdates: "none",
        ...calendarInfo,
      },
      (err, event) => {
        if (err) {
          console.log(
            "There was an error contacting the Calendar service: " + err
          );
          setTimeout(function () {
            return resolve(err);
          }, OPS_THROTTLE);
        }
        setTimeout(function () {
          return resolve(event);
        }, OPS_THROTTLE);
      }
    );
  });
}

module.exports = {
  updateGcalEvent,
  insertGcalEvent,
  getGcalEvents,
  scrapeToGcal,
  removeGcalEvent,
};
