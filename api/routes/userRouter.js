const express = require('express');
const { handleError } = require('../helpers/error');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();
router.use(express.json());

const commentsController = require('../controllers/comments');
const scheduleController = require('../controllers/schedule');
const leagueController = require('../controllers/league');
const conferenceController = require('../controllers/conference');
const teamController = require('../controllers/team');
const ratingController = require('../controllers/rating');
const userController = require('../controllers/users');
const sportController = require('../controllers/sport');
const searchController = require('../controllers/search');

/* GET home page */
router.get('/', (req, res) => {
  res.send('Welcome to Rate the Refs Server!');
});

// User
router.post('/users', isAuthenticated, userController.createUser);
router.get('/users', isAuthenticated, userController.getUserById); // include favorite as IDs
router.get('/users/additional', isAuthenticated, userController.getUserAdditional); // include favorites full data
router.put('/users', isAuthenticated, userController.updateUser);
router.get('/users/:username/check-unique', userController.usernameIsUnique);
router.post('/users/favorite-games', isAuthenticated, userController.favoriteGame);
router.delete('/users/unfavorite-game', isAuthenticated, userController.unfavoriteGame);
router.get('/users/favorite-teams', isAuthenticated, userController.getUserFavoriteTeams);
router.post('/users/favorite-team', isAuthenticated, userController.favoriteTeam);
router.delete('/users/unfavorite-team', isAuthenticated, userController.unfavoriteTeam);
router.post('/users/favorite-league', isAuthenticated, userController.favoriteLeague);
router.delete('/users/unfavorite-league', isAuthenticated, userController.unfavoriteLeague);
router.post('/users/favorite-conference', isAuthenticated, userController.favoriteConference);
router.delete('/users/unfavorite-conference', isAuthenticated, userController.unfavoriteConference);

// Sport
router.get('/sports', isAuthenticated, sportController.getAllSports);
router.get('/sports-with-games/:date', isAuthenticated, sportController.getAllSportsWithGames);

// Game
// Route with query params
router.get('/games', isAuthenticated, scheduleController.fetchGames);

router.get('/games/search', isAuthenticated, scheduleController.searchForGame);
router.get('/games/past-games', isAuthenticated, scheduleController.getPastGames);
router.get('/games/leagues/:leagueId', isAuthenticated, scheduleController.getGamesByLeagueId);
router.get('/games/locations/:date', isAuthenticated, scheduleController.getGamesByLocation);
router.get('/games/:gameId', isAuthenticated, scheduleController.getGameById);
router.get('/users/games', isAuthenticated, scheduleController.getFavoriteGamesByUserId);
router.get(
  '/users/game-interactions',
  isAuthenticated,
  scheduleController.getGamesWithUserInteraction
);

router.post('/games/trending', isAuthenticated, scheduleController.getTrendingGames);
router.post('/games/upcoming', isAuthenticated, scheduleController.getUpcomingGames);
router.post('/games/future-games', isAuthenticated, scheduleController.getFutureGames);
router.post(
  '/games/leagues/:leagueId/trending',
  isAuthenticated,
  scheduleController.getTrendingGamesByLeagueId
);
router.post(
  '/games/leagues/:leagueId/upcoming',
  isAuthenticated,
  scheduleController.getUpcomingGamesByLeagueId
);
router.post(
  '/games/sports/:sportId/trending',
  isAuthenticated,
  scheduleController.getTrendingGamesBySportId
);
router.post(
  '/games/sports/:sportId/upcoming',
  isAuthenticated,
  scheduleController.getUpcomingGamesBySportId
);
router.post(
  '/users/games/upcoming',
  isAuthenticated,
  scheduleController.getUserFavoriteUpcomingGames
);
router.post(
  '/users/favorite-teams/games',
  isAuthenticated,
  scheduleController.getGamesForUserFavoriteTeams
);

// Rating
router.post('/ratings', isAuthenticated, ratingController.createRating);
router.put('/ratings/:ratingId', isAuthenticated, ratingController.updateRatingById);
router.get('/ratings', isAuthenticated, ratingController.getAllRatings);
router.get('/games/:id/ratings', isAuthenticated, ratingController.getRatingsByEntityId);
router.get('/sports/:id/ratings', isAuthenticated, ratingController.getRatingsByEntityId);
router.get('/leagues/:id/ratings', isAuthenticated, ratingController.getRatingsByEntityId);
router.get('/conferences/:id/ratings', isAuthenticated, ratingController.getRatingsByEntityId);
router.get('/teams/:id/ratings', isAuthenticated, ratingController.getRatingsByTeamId);

// Search
router.get('/search', isAuthenticated, searchController.search);

// League
router.get('/leagues', isAuthenticated, leagueController.getAllLeagues);
router.get('/leagues-with-games/:date', isAuthenticated, leagueController.getAllLeaguesWithGames);
router.get('/leagues/:leagueId', isAuthenticated, leagueController.getLeagueById);
router.get('/sports/:sportId/leagues', isAuthenticated, leagueController.getLeaguesBySportId);

// Conference
router.get('/conferences', isAuthenticated, conferenceController.getConferencesByLeagueId);

// Teams
router.get('/teams', isAuthenticated, teamController.getAllTeams);
router.get('/teams/:teamId', isAuthenticated, teamController.getTeamById);
router.get('/sports/:id/teams', isAuthenticated, teamController.getTeamsByEntityId);
router.get('/leagues/:id/teams', isAuthenticated, teamController.getTeamsByEntityId);
router.get('/conferences/:id/teams', isAuthenticated, teamController.getTeamsByEntityId);

// Comment
router.get('/comments/:scheduleId', isAuthenticated, commentsController.getCommentsByGame);
router.post('/comments', isAuthenticated, commentsController.createComment);
router.post('/comments/:commentId/like', isAuthenticated, commentsController.likeComment);
router.post('/comments/:commentId/unlike', isAuthenticated, commentsController.unlikeComment);

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = router;
