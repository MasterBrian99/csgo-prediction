const { dailyData, playerData } = require("./lib/playerData");
const { teamDataCsv, getTopPlayerList } = require("./lib/teamData");

// let count = 100;
// while (count < 10000) {
//   dailyData(count);
//   count = count + 100;
// }

function getData() {
  teamDataCsv();
}

getData();
