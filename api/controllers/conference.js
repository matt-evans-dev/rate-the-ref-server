const conferenceModel = require('../models/conference');

const getConferencesByLeagueId = async (req, res, next) => {
  try {
    const { league } = req.query;
    const data = await conferenceModel.getConferencesByLeagueId(league);
    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getConferencesByLeagueId
};
