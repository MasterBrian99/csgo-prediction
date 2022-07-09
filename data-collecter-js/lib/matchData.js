const topMatchData = async () => {
  const data = await fetchData(`https://www.hltv.org/stats/players`);
  let $ = cheerio.load(data);
};

module.exports = {
  topMatchData,
};
