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
  path: "teamPlayerData.csv",
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

const csvTopMatch = createCsvWriter({
  path: "teamTopMatchData.csv",
  append: true,
  header: [
    { id: "team", title: "team" },
    { id: "date", title: "date" },
    { id: "opponent", title: "opponent" },
    { id: "map", title: "map" },
    { id: "w/l", title: "w/l" },
    { id: "outcome", title: "outcome" },
    { id: "year", title: "year" },
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
    let url = generateUrl(
      $(this).find("td.teamCol-teams-overview a").attr("href")
    );
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
        console.log(
          `The CSV file was written successfully for ${obj.team_name}`
        );
        let $ = cheerio.load(data);
      });
    }
  });
};

function generateUrl(url) {
  const page_url = "https://www.hltv.org/stats";
  const temp_arr = url.split("teams");
  /* console.log(temp_arr) */
  const new_url = page_url + "/teams/matches" + temp_arr[1];
  return new_url;
}
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
              console.log(
                `The CSV file was written successfully for ${obj.team}`
              );
            });
          }
        });
      });
    });
};

const topMatchList = async () => {
  let count = 0;
  let topTeamList = [];
  fs.createReadStream("teamData.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (count <= 4) {
        topTeamList.push(row.url);
        // console.log(row.url);
        // console.log(row.team_name);
        topMatch(row.url, row.team_name);
      }
      count++;
    })
    .on("end", () => {
      console.log("asd");
    });
};

const topMatch = async (url, team) => {
  if (url == undefined) {
    return;
  }
  console.log(url);
  const data = await fetchData(url);
  let $ = cheerio.load(data);
  $(
    "html body.colsCustom1101 div.bgPadding div.widthControl div.colCon div.contentCol div.stats-section.stats-team.stats-team-matches table.stats-table.no-sort tbody tr"
  ).each(function (i, ele) {
    let date = $(this).find("td:nth-child(1) > a:nth-child(1)").text();
    let opponent = $(this).find("td:nth-child(4) > a:nth-child(1)").text();
    let map = $(this).find("td:nth-child(5) > span:nth-child(1)").text();
    let win_lose = $(this)
      .find("td:nth-child(6) > span:nth-child(1)")
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
    // console.log(aaArr);
    csvTopMatch.writeRecords(aaArr).then(() => {
      aaArr = [];
      console.log(`The CSV file was written successfully for ${obj.team}`);
    });
  });
};

module.exports = {
  teamDataCsv,
  getTopPlayerList,
  topMatchList,
};
