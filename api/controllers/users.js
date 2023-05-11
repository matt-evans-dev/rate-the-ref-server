const Joi = require('joi');
const uniqid = require('uniqid');
const userModel = require('../models/users');
const teamModel = require('../models/team');
const leagueModel = require('../models/league');
const conferenceModel = require('../models/conference');
const { ErrorHandler } = require('../helpers/error');

const validateCreateBody = body => {
  const schema = {
    first_name: Joi.string()
      .optional()
      .allow(''),
    last_name: Joi.string()
      .optional()
      .allow(''),
    email: Joi.string().required(),
    display_name: Joi.string()
      .required()
      .allow(''),
    profile_picture: Joi.string()
      .optional()
      .allow('', null),
    state: Joi.string()
      .optional()
      .allow(null),
    zip_code: Joi.string()
      .optional()
      .allow(null)
  };

  return Joi.validate(body, schema);
};

const validateUpdateBody = body => {
  const schema = {
    first_name: Joi.string()
      .optional()
      .allow(''),
    last_name: Joi.string()
      .optional()
      .allow(''),
    email: Joi.string()
      .optional()
      .allow(''),
    display_name: Joi.string()
      .optional()
      .allow(''),
    profile_picture: Joi.string()
      .optional()
      .allow('', null),
    state: Joi.string()
      .optional()
      .allow(''),
    zip_code: Joi.string()
      .optional()
      .allow(''),
    notification_token: Joi.string()
      .optional()
      .allow('', null)
  };

  return Joi.validate(body, schema);
};

const createUser = async (req, res, next) => {
  try {
    const { error } = validateCreateBody(req.body);
    if (error) throw new ErrorHandler(400, error.details);

    const { uid: user_id } = req.user;
    const data = await userModel.createUser({ ...req.body, ...{ id: user_id } });
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred creating user.');
  } catch (err) {
    return next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const data = await userModel.getUserById(user_id);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'User not found');
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error } = validateUpdateBody(req.body);
    if (error) throw new ErrorHandler(400, error.details);

    const { uid: user_id } = req.user;
    const data = await userModel.updateUser(user_id, req.body);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred updating user.');
  } catch (err) {
    return next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await userModel.deleteUser(userId);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred deleting user.');
  } catch (err) {
    return next(err);
  }
};

const usernameIsUnique = async (req, res, next) => {
  try {
    const { username } = req.params;
    const data = await userModel.usernameIsUnique(username);

    if (data.length > 0) {
      return res.status(200).send({ isUnique: false });
    }
    return res.status(200).send({ isUnique: true });
  } catch (err) {
    return next(err);
  }
};

const favoriteGame = async (req, res, next) => {
  try {
    const id = uniqid();
    const { uid: user_id } = req.user;
    const { gameId } = req.body;

    const data = await userModel.favoriteGame(id, user_id, gameId);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred favoriting game.');
  } catch (err) {
    return next(err);
  }
};

const unfavoriteGame = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const { gameId } = req.body;

    const data = await userModel.unfavoriteGame(user_id, gameId);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred unfavoriting game.');
  } catch (err) {
    return next(err);
  }
};

const favoriteTeam = async (req, res, next) => {
  try {
    const id = uniqid();
    const { uid: user_id } = req.user;
    const { teamId } = req.body;

    const data = await userModel.favoriteTeam(id, user_id, teamId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred favoriting team.');
  } catch (err) {
    return next(err);
  }
};

const unfavoriteTeam = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const { teamId } = req.body;

    const data = await userModel.unfavoriteTeam(user_id, teamId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred unfavoriting team.');
  } catch (err) {
    return next(err);
  }
};

const favoriteLeague = async (req, res, next) => {
  try {
    const id = uniqid();
    const { uid: user_id } = req.user;
    const { leagueId } = req.body;

    const data = await userModel.favoriteLeague(id, user_id, leagueId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred favoriting league.');
  } catch (err) {
    return next(err);
  }
};

const unfavoriteLeague = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const { leagueId } = req.body;

    const data = await userModel.unfavoriteLeague(user_id, leagueId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred unfavoriting league.');
  } catch (err) {
    return next(err);
  }
};

const favoriteConference = async (req, res, next) => {
  try {
    const id = uniqid();
    const { uid: user_id } = req.user;
    const { conferenceId } = req.body;

    const data = await userModel.favoriteConference(id, user_id, conferenceId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred favoriting conference.');
  } catch (err) {
    return next(err);
  }
};

const unfavoriteConference = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const { conferenceId } = req.body;

    const data = await userModel.unfavoriteConference(user_id, conferenceId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occurred unfavoriting conference.');
  } catch (err) {
    return next(err);
  }
};

const getUserFavoriteTeams = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;

    const data = await teamModel.getUserFavoriteTeams(user_id);
    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getUserAdditional = async (req, res, next) => {
  try {
    const { uid: user_id } = req.user;
    const favoriteTeams = await teamModel.getUserFavoriteTeams(user_id);
    const favoriteLeagues = await leagueModel.getUserFavoriteLeagues(user_id);
    const favoriteConferences = await conferenceModel.getUserFavoriteConferences(user_id);

    const data = {
      favoriteTeams,
      favoriteLeagues,
      favoriteConferences
    };

    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  usernameIsUnique,
  favoriteGame,
  unfavoriteGame,
  favoriteTeam,
  unfavoriteTeam,
  favoriteLeague,
  unfavoriteLeague,
  favoriteConference,
  unfavoriteConference,
  getUserFavoriteTeams,
  getUserAdditional
};
