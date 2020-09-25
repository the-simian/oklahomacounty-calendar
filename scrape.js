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
  colDefinition,
} = require("./helpers");

const li = (item, prop) => {
  let _li = "";
  if (item[prop]) {
    if (prop != LOCATION) {
      let val = item[prop].indexOf("href") > -1 ? item[prop] : "none";
      _li = `<li>${titleCase(prop)} : ${val}</li>`;
    } else {
      let val = item[prop];
      _li = `<li>${titleCase(prop)} : ${val}</li>`;
    }
  }
  return _li;
};

async function fetchHTML(url) {
  const { data } = await axios.get(url);
  return cheerio.load(data);
}

async function scrape() {
  const $ = await fetchHTML(URL);

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
              .removeAttr("id");
          } else {
            $(el).remove();
          }
        });

      $(cell)
        .find("img")
        .each(function (index, el) {
          let _src = $(el).attr("src");
          if (_src) {
            $(el)
              .attr("src", `https://oklahomacounty.legistar.com/${_src}`)
              .removeAttr("class")
              .removeAttr("id");
          } else {
            $(el).remove();
          }
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
    let startDateTime = new Date(`${item[DATE]} ${item[TIME]} GMT-0500`);
    let endDateTime = new Date(startDateTime.getTime() + hours(1));
    return {
      summary: `${item[NAME]}`,
      description: `<span> Oklahoma County ${item[NAME]}</span><ul>${li(
        item,
        LOCATION
      )}${li(item, DETAILS)}${li(item, AGENDA)}${(item, li(MINUTES))}${
        (item, li(VIDEO))
      }</ul>`,
      location: `${item[LOCATION]} Oklahoma City, Oklahoma`,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
    };
  });

  return calendarReadyItems;
}

module.exports = scrape;
