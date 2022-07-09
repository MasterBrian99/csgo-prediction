const { fetchData } = require("../model/fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");

const csvWriter = createCsvWriter({
  path: "teamData.csv",
  append: true,
  header: [
    { id: "team_name", title: "team_name" },
    { id: "country", title: "country" },
    { id: "maps_played", title: "maps_played" },
    { id: "kd_difference", title: "kd_difference" },
    { id: "kd_ratio", title: "kd_ratio" },
    { id: "rating", title: "rating" },
    { id: "url", title: "url" },
  ],
});

const csvPlayerWriter = createCsvWriter({
  path: "playerData.csv",
  append: true,
  header: [
    { id: "name", title: "name" },
    { id: "team", title: "team" },
    { id: "maps_played", title: "maps_played" },
    { id: "rounds_played", title: "rounds_played" },
    { id: "kd_difference", title: "kd_difference" },
    { id: "kd_ratio", title: "kd_ratio" },
    { id: "rating", title: "rating" },
  ],
});

const teamDataCsv = async () => {
  const data = await fetchData(`https://www.hltv.org/stats/teams`);
  let $ = cheerio.load(data);
  $("table.stats-table.player-ratings-table tbody tr").each(function (i, _) {
    let team_name = $(this).find("td > a").text();
    let country = $(this).find("td > img").attr("alt");
    let maps_played = $(this).find("td:nth-child(2)").text();
    let kd_difference = $(this)
      .find("td.kdDiffCol.won")
      .text()
      .replace("+", "");
    let kd_ratio = $(this).find("td:nth-child(4)").text();
    let rating = $(this).find("td:nth-child(5)").text();
    let url =
      "https://www.hltv.org" +
      $(this).find("td.teamCol-teams-overview a").attr("href");
    const obj = {
      team_name,
      country,
      maps_played,
      kd_difference,
      kd_ratio,
      rating,
      url,
    };
    console.log(obj);
    let aaArr = [];
    aaArr.push(obj);
    console.log(aaArr);
    if (obj.team_name !== "TYLOO") {
      csvWriter.writeRecords(aaArr).then(() => {
        aaArr = [];
        console.log("The CSV file was written successfully");
        let $ = cheerio.load(data);
      });
    }
  });
};

const getTopPlayerList = async () => {
  const data = await fetchData(`https://www.hltv.org/stats/players`);
  let $ = cheerio.load(data);
  let topTeamList = [];
  let count = 0;
  fs.createReadStream("teamData.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (count <= 10) {
        topTeamList.push(row.team_name);
      }
      count++;
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
      $(
        "html body.colsCustom1101 div.bgPadding div.widthControl div.colCon div.contentCol div.stats-section table.stats-table.player-ratings-table tbody tr"
      ).each(async function (i, elm) {
        const getTeams = cheerio.load(this);
        const teamList = [];
        getTeams("td.teamCol a img").each((i, el) => {
          // console.log($(el).attr("title"));
          teamList.push($(el).attr("title"));
          if (topTeamList.includes($(el).attr("title"))) {
            const obj = {
              name: $(this).find("td > a").text(),
              team: $(el).attr("title"),
              maps_played: $(this).find("td:nth-child(3)").text(),
              rounds_played: $(this)
                .find("td.statsDetail.gtSmartphone-only")
                .text(),
              kd_difference: $(this)
                .find("td.kdDiffCol.won")
                .text()
                .replace("+", ""),
              kd_ratio: $(this).find("td:nth-child(6)").text().replace("+", ""),
              rating: $(this).find("td:nth-child(7)").text().replace("+", ""),
            };
            console.log(obj);
            let aaArr = [];
            aaArr.push(obj);
            // console.log(aaArr);
            csvPlayerWriter.writeRecords(aaArr).then(() => {
              aaArr = [];
              console.log("The CSV file was written successfully");
            });
          }
        });
      });
    });
};

module.exports = {
  teamDataCsv,
  getTopPlayerList,
};
