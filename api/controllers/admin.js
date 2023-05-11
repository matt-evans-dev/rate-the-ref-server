const Joi = require('joi');
const axios = require('axios');
const uniqid = require('uniqid');
const sportModel = require('../models/sport');
const leagueModel = require('../models/league');
const teamModel = require('../models/team');
const scheduleModel = require('../models/schedule');
const conferenceModel = require('../models/conference');
const venueModel = require('../models/venue');
const refereeModel = require('../models/referee');
const refereeRoleModel = require('../models/refereeRole');
const mapsService = require('../services/maps');
const notificationService = require('../services/notifications');
const { ErrorHandler } = require('../helpers/error');

// SPORTS
const validateCreateSport = body => {
  const schema = {
    id: Joi.number().required(),
    sport_name: Joi.string()
      .required()
      .allow(''),
    sport_logo: Joi.string().required(),
    sport_espn_slug: Joi.string().required()
  };

  return Joi.validate(body, schema);
};

const validateUpdateSport = body => {
  const schema = {
    sport_name: Joi.string()
      .optional()
      .allow(''),
    sport_logo: Joi.string().optional(),
    sport_espn_slug: Joi.string().optional()
  };

  return Joi.validate(body, schema);
};

const createSport = async (req, res, next) => {
  try {
    const { err } = validateCreateSport(req.body);
    if (err) throw new ErrorHandler(400, err.details);
    const data = await sportModel.createSport(req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured creating sport.' });
  } catch (error) {
    return next(error);
  }
};

const updateSport = async (req, res, next) => {
  try {
    const { err } = validateUpdateSport(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const { id } = req.params;
    const data = await sportModel.updateSport(id, req.body);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured updating sport.');
  } catch (error) {
    return next(error);
  }
};

const deleteSport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await sportModel.deleteSport(id);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured deleting sport.');
  } catch (err) {
    return next(err);
  }
};

// LEAGUES
const validateCreateLeague = body => {
  const schema = {
    id: Joi.number().required(),
    sport_id: Joi.number().required(),
    league_name: Joi.string()
      .required()
      .allow(''),
    league_abbreviation: Joi.string().required(),
    league_logo: Joi.string().optional(),
    league_espn_slug: Joi.string().required()
  };

  return Joi.validate(body, schema);
};

const validateUpdateLeague = body => {
  const schema = {
    sport_id: Joi.number().optional(),
    league_name: Joi.string()
      .optional()
      .allow(''),
    league_abbreviation: Joi.string().optional(),
    league_logo: Joi.string().optional(),
    league_espn_slug: Joi.string().optional()
  };

  return Joi.validate(body, schema);
};

const createLeague = async (req, res, next) => {
  try {
    const { err } = validateCreateLeague(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const data = await leagueModel.createLeague(req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured creating league.' });
  } catch (error) {
    return next(error);
  }
};

const updateLeague = async (req, res, next) => {
  try {
    const { err } = validateUpdateLeague(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const { id } = req.params;
    const data = await leagueModel.updateLeague(id, req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured updating league.' });
  } catch (error) {
    return next(error);
  }
};

const deleteLeague = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await leagueModel.deleteLeague(id);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured deleting league.');
  } catch (err) {
    return next(err);
  }
};

// TEAMS
const validateCreateTeam = body => {
  const schema = {
    id: Joi.string().required(),
    espn_id: Joi.number().required(),
    sport_id: Joi.number().required(),
    league_id: Joi.number().required(),
    conference_id: Joi.string().required(),
    team_name: Joi.string()
      .required()
      .allow(''),
    team_display_name: Joi.string()
      .required()
      .allow(''),
    team_logo: Joi.string().required(),
    city: Joi.string()
      .required()
      .allow(''),
    state: Joi.string().required(),
    city_nickname: Joi.string()
      .optional()
      .allow(''),
    team_espn_slug: Joi.string().required()
  };

  return Joi.validate(body, schema);
};

const validateUpdateTeam = body => {
  const schema = {
    sport_id: Joi.number().optional(),
    league_id: Joi.number().optional(),
    conference_id: Joi.string().optional(),
    team_name: Joi.string()
      .optional()
      .allow(''),
    team_display_name: Joi.string()
      .optional()
      .allow(''),
    team_logo: Joi.string().optional(),
    city: Joi.string()
      .optional()
      .allow(''),
    state: Joi.string().optional(),
    city_nickname: Joi.string()
      .optional()
      .allow(''),
    team_espn_slug: Joi.string().optional()
  };

  return Joi.validate(body, schema);
};

const createTeam = async (req, res, next) => {
  try {
    const { err } = validateCreateTeam(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const data = await teamModel.createTeam(req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured creating team.' });
  } catch (error) {
    return next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const { err } = validateUpdateTeam(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const { id } = req.params;
    const data = await teamModel.updateTeam(id, req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured updating team.' });
  } catch (error) {
    return next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await teamModel.deleteTeam(id);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured deleting team.');
  } catch (err) {
    return next(err);
  }
};

// GAMES
const validateCreateGame = body => {
  const schema = {
    id: Joi.number().required(),
    sport_id: Joi.number().required(),
    league_id: Joi.number().required(),
    home_team_conference_id: Joi.string().required(),
    opponent_conference_id: Joi.string().required(),
    home_team_id: Joi.string().required(),
    opponent_id: Joi.string().required(),
    referees: Joi.object().required(),
    start_time: Joi.date().required()
  };

  return Joi.validate(body, schema);
};

const validateUpdateGame = body => {
  const schema = {
    sport_id: Joi.number().optional(),
    league_id: Joi.number().optional(),
    home_team_conference_id: Joi.string().optional(),
    opponent_conference_id: Joi.string().optional(),
    home_team_id: Joi.string().optional(),
    opponent_id: Joi.string().optional(),
    referees: Joi.object().optional(),
    start_time: Joi.date().optional()
  };

  return Joi.validate(body, schema);
};

const createGame = async (req, res, next) => {
  try {
    const { err } = validateCreateGame(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const data = await scheduleModel.createGame(req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    return res.status(400).send({ message: 'Error occured creating game.' });
  } catch (error) {
    return next(error);
  }
};

const updateGame = async (req, res, next) => {
  try {
    const { err } = validateUpdateGame(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const { id } = req.params;
    const data = await scheduleModel.updateGame(id, req.body);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured updating game.');
  } catch (error) {
    return next(error);
  }
};

const deleteGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await scheduleModel.deleteGame(id);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured deleting game.');
  } catch (err) {
    return next(err);
  }
};

const getAllGames = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await scheduleModel.getAllGames(id);
    if (data.length > 0) {
      return res.send(data);
    }
    throw new ErrorHandler(500, 'No games found.');
  } catch (err) {
    return next(err);
  }
};

// CONFERENCES
const validateCreateConference = body => {
  const schema = {
    id: Joi.string().required(),
    sport_id: Joi.number().required(),
    league_id: Joi.number().required(),
    conference_name: Joi.string().required(),
    conference_abbreviation: Joi.string().required(),
    conference_logo: Joi.string().required()
  };

  return Joi.validate(body, schema);
};

const validateUpdateConference = body => {
  const schema = {
    sport_id: Joi.number().optional(),
    league_id: Joi.number().optional(),
    conference_name: Joi.string().optional(),
    conference_abbreviation: Joi.string().optional(),
    conference_logo: Joi.string().optional()
  };

  return Joi.validate(body, schema);
};

const createConference = async (req, res, next) => {
  try {
    const { err } = validateCreateConference(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    req.body.id = uniqid();
    const data = await conferenceModel.createConference(req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }

    throw new ErrorHandler(500, 'Error creating conference.');
  } catch (error) {
    return next(error);
  }
};

const updateConference = async (req, res, next) => {
  try {
    const { err } = validateUpdateConference(req.body);
    if (err) throw new ErrorHandler(400, err.details);

    const { id } = req.params;
    const data = await conferenceModel.updateConference(id, req.body);

    if (data.length > 0) {
      return res.send(data[0]);
    }

    throw new ErrorHandler(500, 'Error updating conference.');
  } catch (error) {
    return next(error);
  }
};

const deleteConference = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await conferenceModel.deleteConference(id);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(500, 'Error occured deleting conference.');
  } catch (err) {
    return next(err);
  }
};

const getGamesPast24Hours = async () => {
  const data = await scheduleModel.getGamesPast24Hours();
  return data;
};

const fetchESPNGameSummary = async (sportSlug, leagueSlug, gameId) => {
  try {
    const data = await axios.get(
      `http://site.api.espn.com/apis/site/v2/sports/${sportSlug}/${leagueSlug}/summary?event=${gameId}`
    );
    return data.data;
  } catch (error) {
    // Summary is sometimes not found.
    return null;
  }
};

const updateRefsFromPastDay = async () => {
  const games = await getGamesPast24Hours();

  const updatedGames = games.map(async game => {
    const summary = await fetchESPNGameSummary(
      game.sport_espn_slug,
      game.league_espn_slug,
      game.id
    );
    // summary.seasonseries for tournament?
    if (!summary) {
      return null;
    }
    const { officials } = summary.gameInfo;

    if (!officials) {
      return null;
    }

    const promises = officials.map(async official => {
      const { displayName, position } = official;
      const refName = displayName.split(' ');

      try {
        const refereeBody = {
          id: uniqid(),
          last_name: refName.pop(),
          first_name: refName.join(' ')
        };

        const roleBody = {
          id: position.id,
          referee_role_name: position.name
        };

        const referee = await refereeModel.upsertReferee(refereeBody);
        const refereeRole = await refereeRoleModel.upsertRefereeRole(roleBody);

        const [ref] = referee;
        const [roleObj] = refereeRole;

        return {
          id: ref.id,
          firstName: ref.first_name,
          lastName: ref.last_name,
          roleId: roleObj.id
        };
      } catch (err) {
        console.log('Err', err);
        return err;
      }
    });
    const gameOfficials = await Promise.all(promises);
    const officialsKeys = gameOfficials.map(official => {
      console.log(official);
      const { id, roleId } = official;
      return { id, role_id: roleId };
    });

    return scheduleModel.updateGameReferees(game.id, officialsKeys);
  });
  const resolvedUpdatedGames = await Promise.all(updatedGames);
  console.log('Finished updating games with Refs');
  return resolvedUpdatedGames;
};

const updateRefs = async (req, res, next) => {
  try {
    const updatedGamesWithRefs = await updateRefsFromPastDay();
    return res.status(200).send(updatedGamesWithRefs);
  } catch (err) {
    return next(err);
  }
};

const getVenueCoordinates = async (req, res, next) => {
  try {
    const venues = await venueModel.getAllVenues();

    const promises = venues.map(async venue => {
      const venueCoords = await mapsService.geocode(`${venue.venue_city}, ${venue.venue_state}`);
      return venueModel.updateCoordinates({ ...venueCoords, id: venue.id });
    });

    const resolved = await Promise.all(promises);
    return res.status(200).send(resolved);
  } catch (err) {
    return next(err);
  }
};

const sendTestNotification = async (req, res, next) => {
  try {
    const { token } = req.body;
    const response = await notificationService.sendNotification(token);
    return res.status(200).send(response);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSport,
  updateSport,
  deleteSport,
  createLeague,
  updateLeague,
  deleteLeague,
  createTeam,
  updateTeam,
  deleteTeam,
  createGame,
  updateGame,
  deleteGame,
  getAllGames,
  createConference,
  updateConference,
  deleteConference,
  updateRefs,
  getVenueCoordinates,
  sendTestNotification,
  updateRefsFromPastDay
};
