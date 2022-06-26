const axios = require("axios");
const fetchData = async (url) => {
  const result = await axios.get(url);
  return result.data;
};
exports.fetchData = fetchData;
