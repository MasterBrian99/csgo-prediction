const { fetchData } = require("./model/fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");

const csvTopMatch = createCsvWriter({
  path: "teamTopMatchData.csv",
  append: true,
  header: [
    { id: "team", title: "team" },
    { id: "date", title: "date" },
    { id: "opponent", title: "opponent" },
    { id: "map", title: "map" },
    { id: "win_lose", title: "win_lose" },
    { id: "outcome", title: "outcome" },
    { id: "year", title: "year" },
  ],
});
const topMatch = async (url, team) => {
  console.log(url);
  const data = await fetchData(url);
  let $ = cheerio.load(data);
  $(
    "html body.colsCustom1101 div.bgPadding div.widthControl div.colCon div.contentCol div.stats-section.stats-team.stats-team-matches table.stats-table.no-sort tbody tr"
  ).each(function (i, ele) {
    let date = setCustomDate(
      $(this).find("td:nth-child(1) > a:nth-child(1)").text()
    );
    let opponent = $(this).find("td:nth-child(4) > a:nth-child(1)").text();
    let map = $(this).find("td:nth-child(5) > span:nth-child(1)").text();
    let win_lose = $(this)
      .find("td.gtSmartphone-only.text-center span.statsDetail")
      .text()
      .replace(/ /g, "");
    let outcome = $(this).find("td:nth-child(7)").text() == "W" ? "1" : "0";
    let year =
      "20" +
      $(this).find("td:nth-child(1) > a:nth-child(1)").text().split("/")[2];
    const obj = {
      team,
      date,
      opponent,
      map,
      win_lose,
      outcome,
      year,
    };
    let aaArr = [];
    aaArr.push(obj);
    console.log(obj);
    // console.log(aaArr);
    csvTopMatch.writeRecords(aaArr).then(() => {
      aaArr = [];
      console.log(`The CSV file was written successfully for ${obj.team}`);
    });
  });
};
const setCustomDate = (date) => {
  const dateArr = date.split("/");
  const customYear = "20" + dateArr[2];
  const newDate = customYear + "-" + dateArr[1] + "-" + dateArr[0];
  return newDate;
};

topMatch(
  "https://www.hltv.org/stats/teams/matches/6665/astralis",
  "Astralis"
).then(() => {
  console.log("asd");
});
