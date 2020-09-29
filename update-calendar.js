const SAMPLE_DATA = require("./sample-data");
const { format } = require("date-fns");

const {
  removeGcalEvent,
  updateGcalEvent,
  insertGcalEvent,
  getGcalEvents,
  scrapeToGcal,
} = require("./calendar-repo");

const { LAST_MONTH, THIS_MONTH, NEXT_MONTH } = require("./helpers");

const scrape = require("./scrape");

// let testEvent = scrapeToGcal(SAMPLE_DATA[0]);

// console.log(testEvent);

async function getOCCCEvents() {
  return new Promise(async (resolve, reject) => {
    let lastMonthPageScrape = await scrape(LAST_MONTH);
    let thisMonthPageScrape = await scrape(THIS_MONTH);
    let nextMonthPageScrape = await scrape(NEXT_MONTH);

    const pageScrapeData = [
      ...lastMonthPageScrape,
      ...thisMonthPageScrape,
      ...nextMonthPageScrape,
    ]
      .slice()
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));

    console.log(`Scraped ${pageScrapeData.length} items`);
    console.log(`\t${LAST_MONTH}, ${lastMonthPageScrape.length}`);
    console.log(`\t${THIS_MONTH}, ${thisMonthPageScrape.length}`);
    console.log(`\t${NEXT_MONTH}, ${nextMonthPageScrape.length}`);
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

function noChangeBetween(n, e) {
  return (
    n.summary == e.summary &&
    n.start.dateTime == e.start.dateTime &&
    n.end.dateTime == e.end.dateTime &&
    n.location == e.location &&
    n.description == e.description
  );
}

async function syncGcalToOCCC() {
  const occcEvents = await getOCCCEvents();
  const gCalEvents = await getGcalEvents();

  console.log(`Found ${gCalEvents.length} Gcal Existing items`);

  const gcalReadyCalendarEvents = occcEvents.map(scrapeToGcal);
  console.log(gcalReadyCalendarEvents.map((x) => x.id));
  const addedAndUpdated = await gcalReadyCalendarEvents.reduce(
    async (prevEvent, nextEvent, index) => {
      await prevEvent;
      let existingEvent = existingGcalEvent(nextEvent, gCalEvents);
      let percent = `${((index * 100) / gcalReadyCalendarEvents.length).toFixed(
        2
      )}%`;
      let operation;
      if (existingEvent) {
        if (nextEvent.summary !== existingEvent.summary) {
          nextEvent.description = updatedDescription(nextEvent, existingEvent);
        }
        operation = updateGcalEvent;
        console.log(
          index,
          percent,
          "UPDATE",
          `${format(new Date(nextEvent.start.dateTime), "MM-dd hh:mm,bb")}`,
          nextEvent.summary
        );
      } else {
        operation = insertGcalEvent;
        console.log(
          index,
          percent,
          "CREATE",
          `${format(new Date(nextEvent.start.dateTime), "MM-dd hh:mm,bb")}`,
          nextEvent.summary
        );
      }
      return operation(nextEvent);
    },
    Promise.resolve()
  );

  function shouldDeleteItem(gCalEvent) {
    let mathchingEvents = gcalReadyCalendarEvents.filter(
      (calReadEvent) => calReadEvent.id == gCalEvent.id
    );

    return mathchingEvents.length == 0;
  }

  const thingsToRemove = await gCalEvents.reduce(
    async (prevEvent, nextEvent, index) => {
      await prevEvent;

      let percent = `${((index * 100) / gCalEvents.length).toFixed(2)}%`;

      if (shouldDeleteItem(nextEvent)) {
        console.log(
          index,
          percent,
          "DELETING",
          `${format(new Date(nextEvent.start.dateTime), "MM-dd hh:mm,bb")}`,
          nextEvent.summary
        );
        return removeGcalEvent(nextEvent);
      } else {
        console.log(
          index,
          percent,
          "NOT DELETING",
          `${format(new Date(nextEvent.start.dateTime), "MM-dd hh:mm,bb")}`,
          nextEvent.summary
        );
        return Promise.resolve();
      }
    },
    Promise.resolve()
  );

  console.log("all done.");
}

syncGcalToOCCC();
