const express = require("express");
const app = express();
const wakeUpDyno = require("./awaken-dyno.js");
const syncGcalToOCCC = require("./update-calendar");
const scrape = require("./scrape");
var bodyParser = require("body-parser");
port = process.env.PORT || 5335;

const DYNO_URL = `https://occc-calendar.herokuapp.com/`;
const PASSPHRASE = "Laputan Machines";
let WATERCSS = `https://cdn.jsdelivr.net/gh/kognise/water.css/dist/dark.min.css`;

let head = `
      <head>
          <link rel="stylesheet" href="${WATERCSS}">
          <style>
            html,body { padding: 0; overflow: hidden; }
            html,body,iframe { 
                width: 100%;
            }
            input,form { min-width: 95%; }
            form { padding: 5% }
            iframe { min-height: 80vh; }
            .if-loader {
                margin: 0;
                padding: 0;
                background:url(https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif) center center no-repeat;
            }
          </style>
        </head>
`;

function makeTable(data) {
  return `<table>
    <tr>
      <th>#</th>
      <th>%</th>
      <th>OP</th>
      <th>Time</th>
      <th>Event</th>
    </tr>
    ${data
      .map((r) => `<tr>${r.map((d) => `<td>${d}</td>`).join("")}</tr>`)
      .join("")}
    </table>`;
}

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/___force-update", async (req, res, next) => {
  var reportTable = await syncGcalToOCCC();
  let lastUpdate = {
    reportTable,
    when: new Date(),
  };
  res.send(
    `<html>${head}<body>${makeTable(lastUpdate.reportTable)}</body></html>`
  );
});

app.use("/___checkpass", async (req, res, next) => {
  let { passphrase } = req.body;
  if (passphrase == PASSPHRASE) {
    res.send(
      `<html>
        ${head}
        <body>
        <div class="if-loader">
          <iframe src="/___force-update"></iframe>
        </div>
       </body>
    </html>`
    );
  } else {
    res.send(
      `<html>
        ${head}
        <body>
            <h3>Nope. Update will not be performed.</h3>
        </body>
      </html>`
    );
  }
});

app.use("/___testuser", async (req, res, next) => {
  const body = `
    <form action="/___checkpass/" method="post">
        <label for="secret">Say the Command:</label>
        <br />
        <input id="secret" type="text" name="passphrase">
        <br />
        <input type="submit" value="Begin Force Update">
    </form>
  `;
  res.send(`<html>${head}<body>${body}</body></html>`);
});

app.use("/__update", async (req, res, next) => {
  let body = `
    <body>
        <h1>Force Update:</h1>
        <h4>This takes a long while. Use the passphrase to start.</h4>
        <iframe src="/___testuser"></iframe>
    </body>
`;

  return res.send(`
    <html>
        ${head}
        ${body}
    </html>
  `);
});

app.use("/", async (req, res, next) => {
  return res.send(`
        <html>
          <iframe
            src="https://calendar.google.com/calendar/embed?src=1vdop21cdv5vqiuld1ckf1849o%40group.calendar.google.com&ctz=America%2FChicago"
            style="border: 0"
            width="800"
            height="600"
            frameborder="0"
            scrolling="no"
          ></iframe>
        </html>
    `);
});

app.listen(port, function () {
  console.log(`Running on ${port}`);
  //wakeUpDyno(DYNO_URL);
});
