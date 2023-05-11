const searchModel = require('../models/search');

const search = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;
    const data = await searchModel.search(searchTerm);
    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  search
};
