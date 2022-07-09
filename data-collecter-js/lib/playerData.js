const { fetchData } = require("../model/fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const { setTimeout } = require("timers/promises");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvWriter = createCsvWriter({
  append: true,
  path: "newOut.csv",
  header: [
    { id: "name", title: "name" },
    { id: "country", title: "country" },
    { id: "url", title: "url" },
    { id: "teams", title: "teams" },
    { id: "maps_played", title: "maps_played" },
    { id: "rounds_played", title: "rounds_played" },
    { id: "kd_difference", title: "kd_difference" },
    { id: "kd_ratio", title: "kd_ratio" },
    { id: "rating", title: "rating" },
    { id: "total_kills", title: "total_kills" },
    { id: "image_url", title: "image_url" },
  ],
});

const dailyData = async (count) => {
  const data = await fetchData(`https://www.hltv.org/results?offset=${count}`);
  let $ = cheerio.load(data);
  let dataArr = {
    date: "",
    links: [],
  };
  $(".results-sublist").each(function (i, elm) {
    let date = $(this).find(".standard-headline").text();
    dataArr.date = date;
    $(elm)
      .find(".result-con")
      .each((j, el) => {
        let url = $(el).first(":first").find("a").attr("href");
        dataArr.links.push(url);
        fs.appendFile(
          "empirestate.txt",
          `\nhttps://www.hltv.org${url}`,
          (err) => {
            if (err) throw err;
            console.log("Link Added !");
          }
        );
      });
    console.log(dataArr);
    dataArr.links = [];
  });
};

const newArr = new Array();
const playerData = async () => {
  const data = await fetchData(`https://www.hltv.org/stats/players`);
  let $ = cheerio.load(data);
  $(
    "html body.colsCustom1101 div.bgPadding div.widthControl div.colCon div.contentCol div.stats-section table.stats-table.player-ratings-table tbody tr"
  ).each(async function (i, elm) {
    if (i < 100) {
      const getCountry = cheerio.load(this);
      const countryList = [];
      getCountry("td.teamCol a img").each((i, el) => {
        // console.log($(el).attr("title"));
        countryList.push($(el).attr("title"));
      });
      // console.log(coun);
      const newurl =
        "https://www.hltv.org" + $(this).find("td.playerCol a").attr("href");
      const totalKill = await getTotalKills(newurl);
      const obj = {
        name: $(this).find("td > a").text(),
        country: $(this).find("td.playerCol img.flag").attr("alt"),
        url: newurl,
        teams: countryList,
        maps_played: $(this).find("td:nth-child(3)").text(),
        rounds_played: $(this).find("td.statsDetail.gtSmartphone-only").text(),
        kd_difference: $(this).find("td.kdDiffCol.won").text().replace("+", ""),
        kd_ratio: $(this).find("td:nth-child(6)").text().replace("+", ""),
        rating: $(this).find("td:nth-child(7)").text().replace("+", ""),
        total_kills: totalKill.kill,
        image_url: totalKill.img_url,
      };
      pushToArray(obj);

      let aaArr = [];
      aaArr.push(obj);
      // console.log(aaArr);
      csvWriter.writeRecords(aaArr).then(() => {
        aaArr = [];
        console.log("The CSV file was written successfully");
      });
    }
  });
  console.log(newArr);
};

function pushToArray(obj) {
  return newArr.push(obj);
}

async function getTotalKills(url) {
  const data = await fetchData(url);
  let $ = cheerio.load(data);
  const kill = $(
    "div.col:nth-child(1) > div:nth-child(1) > span:nth-child(2)"
  ).text();
  const img_url = $(
    "html body.colsCustom1101 div.bgPadding div.widthControl div.colCon div.contentCol div.stats-section.stats-player.stats-player-overview div.playerSummaryStatBox div.summaryBodyshotContainer img.summaryBodyshot"
  ).attr("src");

  return {
    kill: kill,
    img_url: img_url,
  };
}

module.exports = {
  playerData,
};
//
