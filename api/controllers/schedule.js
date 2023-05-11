const moment = require('moment');
const geolib = require('geolib');
const scheduleModel = require('../models/schedule');
const { ErrorHandler } = require('../helpers/error');

const getFavoriteGamesByUserId = async (req, res, next) => {
  try {
    const { uid: userId } = req.user;
    const data = await scheduleModel.getFavoriteGamesByUserId(userId);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getUserFavoriteUpcomingGames = async (req, res, next) => {
  const { uid: userId } = req.user;
  const { date } = req.body;
  try {
    const data = await scheduleModel.getUserFavoriteUpcomingGames(userId, date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getTrendingGames = async (req, res, next) => {
  try {
    const { date } = req.body;
    const data = await scheduleModel.getTrendingGames(date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getTrendingGamesByLeagueId = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const { date } = req.body;
    const data = await scheduleModel.getTrendingGamesByLeagueId(leagueId, date);
    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getTrendingGamesBySportId = async (req, res, next) => {
  try {
    const { sportId } = req.params;
    const { date } = req.body;
    const data = await scheduleModel.getTrendingGamesBySportId(sportId, date);
    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getUpcomingGames = async (req, res, next) => {
  try {
    const { date } = req.body;
    const data = await scheduleModel.getUpcomingGames(date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getUpcomingGamesByLeagueId = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const { date } = req.body;
    const data = await scheduleModel.getUpcomingGamesByLeagueId(leagueId, date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getGamesByLeagueId = async (req, res, next) => {
  try {
    const { leagueId } = req.params;
    const data = await scheduleModel.getGamesByLeagueId(leagueId);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getUpcomingGamesBySportId = async (req, res, next) => {
  try {
    const { sportId } = req.params;
    const { date } = req.body;
    const data = await scheduleModel.getUpcomingGamesBySportId(sportId, date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getPastGames = async (req, res, next) => {
  try {
    const data = await scheduleModel.getPastGames();

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const getFutureGames = async (req, res, next) => {
  try {
    const { date } = req.body;
    const data = await scheduleModel.getFutureGames(date);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param {string} date YYYY-MM-DD
 * @param {string} league League ID or 'top' to fetch from all leagues
 * @param {boolean} upcoming Upcoming = true OR Trending
 * @param {{latitude: number, longitude: number}} coordinates lat,lng
 */
const fetchByLocation = async (date, league = 'top', upcoming, coordinates) => {
  let games = [];
  if (upcoming) {
    if (league && league !== 'top' && league !== 'all') {
      games = await scheduleModel.getUpcomingGamesByLeagueId(league, date);
    } else {
      games = await scheduleModel.getUpcomingGames(date);
    }
  }

  if (!upcoming) {
    if (league && league !== 'top' && league !== 'all') {
      games = await scheduleModel.getTrendingGamesByLeagueId(league, date);
    } else {
      games = await scheduleModel.getTrendingGames(date);
    }
  }

  const nearbyGames = games.reduce((result, game) => {
    if (game.venue && game.venue.latitude && game.venue.longitude) {
      const distanceInMeters = geolib.getDistance(coordinates, {
        latitude: game.venue.latitude,
        longitude: game.venue.longitude
      });
      const gameCopy = { ...game };
      gameCopy.distance = geolib.convertDistance(distanceInMeters, 'mi');
      // Only return games within a 100 mile radius.
      if (gameCopy.distance <= 100) {
        result.push(gameCopy);
      }
    }
    return result;
  }, []);

  const sortedGames = nearbyGames.sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));
  return sortedGames;
};

const fetchGames = async (req, res, next) => {
  try {
    const { sport, league, upcoming, trending, date, lat, lng } = req.query;
    let result = [];
    if (sport) {
      // Handle fetching by Sport
      if (upcoming) {
        // Handle upcoming by sport
      }
      if (trending) {
        // Handle trending by sport
      }
    }
    if (league) {
      // Handle fetching by league
      if (upcoming) {
        if (lat && lng) {
          // Fetch nearby & upcoming
          const coordinates = {
            latitude: lat,
            longitude: lng
          };
          const games = await fetchByLocation(date, league, true, coordinates);
          result = games;
        }
        // Handle upcoming by league
      }
      if (trending) {
        // Handle Trending by League
        if (lat && lng) {
          // Fetch nearby & upcoming
          const coordinates = {
            latitude: lat,
            longitude: lng
          };
          const games = await fetchByLocation(date, league, false, coordinates);
          result = games;
        }
      }
    }
    return res.status(200).send(result);
  } catch (error) {
    return next(error);
  }
};

const getGamesByLocation = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).send('Missing coordinates.');
    }
    const coordinates = {
      latitude: lat,
      longitude: lng
    };

    const upcomingGames = await scheduleModel.getGamesNearby(date);
    const nearbyGames = upcomingGames.reduce((result, game) => {
      if (game.venue && game.venue.latitude && game.venue.longitude) {
        const distanceInMeters = geolib.getDistance(coordinates, {
          latitude: game.venue.latitude,
          longitude: game.venue.longitude
        });
        const gameCopy = { ...game };
        gameCopy.distance = geolib.convertDistance(distanceInMeters, 'mi');
        // Only return games within a 100 mile radius.
        if (gameCopy.distance <= 100) {
          result.push(gameCopy);
        }
      }
      return result;
    }, []);

    const sortedGames = nearbyGames.sort((a, b) => moment(a.start_time).diff(moment(b.start_time)));
    return res.status(200).send(sortedGames);
  } catch (error) {
    return next(error);
  }
};

const getGameById = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const data = await scheduleModel.getGameById(gameId);

    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'Could not find game');
  } catch (error) {
    return next(error);
  }
};

const getGamesWithUserInteraction = async (req, res, next) => {
  try {
    const { uid: userId } = req.user;
    const data = await scheduleModel.getGamesWithUserInteraction(userId);

    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

const searchForGame = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;
    const data = await scheduleModel.searchForGame(searchTerm);
    return res.send(data);
  } catch (error) {
    return next(error);
  }
};

const getGamesForUserFavoriteTeams = async (req, res, next) => {
  try {
    const { uid: userId } = req.user;
    const { date } = req.body;
    const data = await scheduleModel.getGamesForUserFavoriteTeams(userId, date);
    return res.status(200).send(data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFavoriteGamesByUserId,
  getUserFavoriteUpcomingGames,
  getTrendingGames,
  getUpcomingGames,
  getTrendingGamesByLeagueId,
  getUpcomingGamesByLeagueId,
  getGamesByLeagueId,
  getTrendingGamesBySportId,
  getUpcomingGamesBySportId,
  getPastGames,
  getFutureGames,
  getGamesByLocation,
  getGameById,
  getGamesWithUserInteraction,
  searchForGame,
  getGamesForUserFavoriteTeams,
  fetchGames
};
