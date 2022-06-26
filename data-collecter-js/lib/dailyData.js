const { fetchData } = require("../model/fetch");
const cheerio = require("cheerio");
const fs = require("fs");

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

exports.dailyData = dailyData;
