const sportModel = require('../models/sport');
const { ErrorHandler } = require('../helpers/error');

const getAllSports = async (req, res, next) => {
  try {
    const data = await sportModel.getAllSports();

    if (data.length > 0) {
      return res.send(data);
    }
    throw new ErrorHandler(500, 'Error getting sports.');
  } catch (error) {
    return next(error);
  }
};

const getAllSportsWithGames = async (req, res, next) => {
  try {
    const { date } = req.params;
    const data = await sportModel.getAllSportsWithGames(date);

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllSports,
  getAllSportsWithGames
};
