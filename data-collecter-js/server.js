const { dailyData } = require("./lib/dailyData");

let count = 100;
while (count < 10000) {
  dailyData(count);
  count = count + 100;
}
