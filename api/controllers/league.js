const leagueModel = require('../models/league');

const getAllLeagues = async (req, res, next) => {
  try {
    const data = await leagueModel.getAllLeagues();

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getAllLeaguesWithGames = async (req, res, next) => {
  try {
    const { date } = req.params;
    const data = await leagueModel.getAllLeaguesWithGames(date);

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getLeagueById = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const data = await leagueModel.getLeagueById(leagueId);

    return res.send(data[0]);
  } catch (error) {
    return next(error);
  }
};

const getLeaguesBySportId = async (req, res, next) => {
  try {
    const { sportId } = req.params;
    const data = await leagueModel.getLeaguesBySportId(sportId);

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllLeagues,
  getAllLeaguesWithGames,
  getLeagueById,
  getLeaguesBySportId
};
