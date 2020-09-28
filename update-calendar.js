const SAMPLE_DATA = require("./sample-data");
const { format } = require("date-fns");

const {
  updateGcalEvent,
  insertGcalEvent,
  getGcalEvents,
  scrapeToGcal,
} = require("./calendar-repo");

const scrape = require("./scrape");

// let testEvent = scrapeToGcal(SAMPLE_DATA[0]);

// console.log(testEvent);

async function getOCCCEvents() {
  return new Promise(async (resolve, reject) => {
    let pageScrapeData = await scrape();
    console.log(pageScrapeData.map((x) => `${x.summary}`));
    resolve(pageScrapeData);
  });
}

function existingGcalEvent(gCalReadyEvent, gCalEvents) {
  let thisEvent = gCalEvents.filter((e) => e.id === gCalReadyEvent.id);
  return thisEvent.length ? thisEvent[0] : null;
}

function updatedDescription(nextEvent, existingEvent) {
  let _des = existingEvent.description;
  let changehistory = existingEvent.description.substr(
    _des.indexOf("📌"),
    _des.length + 1
  );
  let _date = format(new Date(), "MM-dd-yyyy hh:mm,bbbb");
  let nextHistory = `${existingEvent.summary} on ${_date}`;
  return `${nextEvent.description}\nChanged from:\n📌${nextHistory}\n${changehistory}`;
}

async function syncGcalToOCCC() {
  const occcEvents = await getOCCCEvents();
  const gCalEvents = await getGcalEvents();

  const gcalReadyCalendarEvents = occcEvents.map(scrapeToGcal);
  gcalReadyCalendarEvents.reduce(async (prevEvent, nextEvent, index) => {
    await prevEvent;
    let existingEvent = existingGcalEvent(nextEvent, gCalEvents);
    let operation;
    if (existingEvent) {
      operation = updateGcalEvent;

      if (nextEvent.summary !== existingEvent.summary) {
        nextEvent.description = updatedDescription(nextEvent, existingEvent);
      }
    } else {
      operation = insertGcalEvent;
    }
    // console.log(
    //   `${((index * 100) / gcalReadyCalendarEvents.length).toFixed(2)}%`
    // );
    return operation(nextEvent);
  }, Promise.resolve());
}

syncGcalToOCCC();
