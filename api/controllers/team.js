const teamModel = require('../models/team');
const { ErrorHandler } = require('../helpers/error');

const getAllTeams = async (req, res, next) => {
  try {
    const data = await teamModel.getAllTeams();

    if (data.length > 0) {
      return res.send(data);
    }
    throw new ErrorHandler(400, 'No teams found.');
  } catch (error) {
    return next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const data = await teamModel.getTeamById(teamId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'Could not find team');
  } catch (error) {
    return next(error);
  }
};

const getTeamsByEntityId = async (req, res, next) => {
  try {
    const pathType = req.path.split('/')[1];
    const entity = pathType.slice(0, pathType.length - 1);
    const idType = `teams.${entity}_id`;
    const { id } = req.params;

    const data = await teamModel.getTeamsByEntityId(idType, id);

    if (data.length > 0) {
      return res.send(data);
    }
    throw new ErrorHandler(400, `No teams found for this ${entity}`);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  getTeamsByEntityId
};
