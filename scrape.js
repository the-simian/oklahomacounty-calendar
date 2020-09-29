const { format } = require("date-fns");
const {
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
  clean,
  colDefinition,
  fetchHTML,
  THIS_MONTH,
} = require("./helpers");

const { encodeId } = require("./encode-id");

const li = (item, prop) => {
  let _li = "";
  if (item[prop]) {
    if (prop != LOCATION) {
      let val = item[prop].indexOf("href") > -1 ? item[prop] : "none";
      _li = `<li>${titleCase(prop)}:${val}</li>`;
    } else {
      let val = item[prop];
      _li = `<li>${titleCase(prop)}:${val}</li>`;
    }
  }
  return clean(_li);
};

async function scrape(month) {
  let _month = month || THIS_MONTH;
  return new Promise(async (resolve, reject) => {
    const $ = await fetchHTML(URL, _month);
    console.log("running scrape");

    const strategies = {
      text: (cell) => $(cell).text().trim(),
      link: (cell) => {
        $(cell)
          .find("a")
          .each(function (index, el) {
            let fileLocation = $(el).attr("href");
            if (fileLocation) {
              $(el)
                .attr(
                  "href",
                  `https://oklahomacounty.legistar.com/${fileLocation}`
                )
                .removeAttr("class")
                .removeAttr("id")
                .removeAttr("style");
            } else {
              $(el).remove();
            }
          });

        $(cell)
          .find("img")
          .each(function (index, el) {
            $(el).remove();
          });

        $(cell)
          .find("font")
          .each(function (index, el) {
            $(el).replaceWith($(el).html());
          });

        $(cell)
          .find("span")
          .each(function (index, el) {
            $(el).removeAttr("style");
          });

        return $(cell).html();
      },
      none: () => null,
    };

    const cellToData = (cell, cellIndex) =>
      strategies[colDefinition[cellIndex].type](cell);

    const tData = $(".rgMasterTable tr")
      .get()
      .map((row) => $(row).find("td").get().map(cellToData))
      .filter((x) => x.length);

    const items = tData.map((row) => {
      return row.reduce((acc, item, index) => {
        return { ...acc, ...{ [colDefinition[index].name]: item } };
      }, {});
    });

    const calendarReadyItems = items.map((item, index) => {
      //   console.log(index);
      //   console.log(item);
      let startDateTime = new Date(`${item[DATE]} ${item[TIME]} GMT-0500`);
      let endDateTime = new Date(startDateTime.getTime() + hours(1));
      const when = format(new Date(startDateTime), "yyyy.MMM.dd.hh.mm");
      //   console.log(startDateTime);
      //console.log(when, item[NAME]);
      const _id = encodeId(`${when}`).substr(0, 1024);
      return {
        id: _id,
        summary: `${item[NAME]}`,
        description: clean(`
      <span> Oklahoma County ${item[NAME]}</span>
      <ul>
        ${li(item, LOCATION)}
        ${li(item, DETAILS)}
        ${li(item, AGENDA)}
        ${li(item, MINUTES)}
        ${li(item, VIDEO)}
      </ul>
      `),
        location: clean(`${item[LOCATION]}`),
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        details: clean(`${item[DETAILS]}`),
        agenda: clean(`${item[AGENDA]}`),
        minutes: clean(`${item[MINUTES]}`),
        video: clean(`${item[VIDEO]}`),
      };
    });
    resolve(calendarReadyItems);
  });
}

module.exports = scrape;
