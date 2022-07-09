const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");
const fs = require("fs");
const { dailyData, playerData } = require("./lib/playerData");
const {
  teamDataCsv,
  getTopPlayerList,
  topMatchList,
} = require("./lib/teamData");

const oldPaths = ["teamData.csv", "teamPlayerData.csv", "teamMatch.csv"];

const teamDataCSV = createCsvWriter({
  path: "teamData.csv",
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

const teamPlayerDataCSV = createCsvWriter({
  path: "teamPlayerData.csv",
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

function getData() {
  oldPaths.forEach((e) => {
    try {
      fs.unlinkSync(e);
      //file removed
    } catch (err) {
      console.error("file not found !");
    }
  });
  teamDataCSV.writeRecords([]).then(() => {
    console.log("CSV file created");
  });
  teamPlayerDataCSV.writeRecords([]).then(() => {
    console.log("CSV file created");
  });
  csvTopMatch.writeRecords([]).then(() => {
    console.log("CSV file created");
  });
  teamDataCsv()
    .then(() => {
      getTopPlayerList().then(() => {
        topMatchList();
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

getData();
