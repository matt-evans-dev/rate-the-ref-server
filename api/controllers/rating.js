const Joi = require('joi');
const uniqid = require('uniqid');
const ratingModel = require('../models/rating');
const { ErrorHandler } = require('../helpers/error');

const validateCreateBody = body => {
  const schema = {
    schedule_id: Joi.string().required(),
    sport_id: Joi.number().required(),
    league_id: Joi.number().required(),
    conference_id: Joi.string().optional(),
    home_team_id: Joi.string().required(),
    opponent_id: Joi.string().required(),
    overall_performance: Joi.number().required(),
    question_1: Joi.array()
      .optional()
      .allow(null),
    question_1_specification: Joi.string()
      .optional()
      .allow('', null),
    question_2: Joi.array()
      .optional()
      .allow(null),
    overall_comment: Joi.string()
      .optional()
      .allow('', null),
    question_3: Joi.string().optional()
  };

  return Joi.validate(body, schema);
};

const validateUpdateBody = body => {
  const schema = {
    schedule_id: Joi.string().optional(),
    sport_id: Joi.number().optional(),
    league_id: Joi.number().optional(),
    conference_id: Joi.string()
      .optional()
      .allow(null),
    home_team_id: Joi.string().optional(),
    opponent_id: Joi.string().optional(),
    overall_performance: Joi.number().optional(),
    question_1: Joi.array()
      .optional()
      .allow(null),
    question_1_specification: Joi.string()
      .optional()
      .allow('', null),
    question_2: Joi.array()
      .optional()
      .allow(null),
    overall_comment: Joi.string()
      .optional()
      .allow('', null),
    question_3: Joi.string()
      .optional()
      .allow(null)
  };

  return Joi.validate(body, schema);
};

const createRating = async (req, res, next) => {
  try {
    const { error } = validateCreateBody(req.body);
    if (error) throw new ErrorHandler(400, error.details);

    const ratingId = uniqid();
    const { body } = req;
    const { uid: user_id } = req.user;

    const data = await ratingModel.createRating(ratingId, { ...body, ...{ user_id } });
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred creating rating.');
  } catch (err) {
    return next(err);
  }
};

const updateRatingById = async (req, res, next) => {
  try {
    const { error } = validateUpdateBody(req.body);
    if (error) throw new ErrorHandler(400, error.details);

    const { ratingId } = req.params;
    const { body } = req;

    const data = await ratingModel.updateRatingById(ratingId, body);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred updating rating.');
  } catch (err) {
    return next(err);
  }
};

const getAllRatings = async (req, res, next) => {
  try {
    const data = await ratingModel.getAllRatings();

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getRatingsByEntityId = async (req, res, next) => {
  try {
    const pathType = req.path.split('/')[1];
    let entity = pathType.slice(0, pathType.length - 1);

    // remove after updating game to schedule
    if (entity === 'game') {
      entity = 'schedule';
    }

    const idType = `ratings.${entity}_id`;
    const { id } = req.params;
    const data = await ratingModel.getRatingsByEntityId(idType, id);

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getRatingsByTeamId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await ratingModel.getRatingsByTeamId(id);

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRating,
  updateRatingById,
  getAllRatings,
  getRatingsByEntityId,
  getRatingsByTeamId
};
