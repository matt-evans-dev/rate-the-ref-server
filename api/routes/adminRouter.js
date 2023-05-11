const express = require('express');
const { handleError } = require('../helpers/error');
const { verifyAdmin } = require('../middlewares/adminAuth');

const router = express.Router();
router.use(express.json());

const commentsController = require('../controllers/comments');
const userController = require('../controllers/users');
const adminController = require('../controllers/admin');
const jobsController = require('../controllers/jobs');
const espnLeaguesController = require('../controllers/espn-leagues');
const espnConferencesController = require('../controllers/espn-conferences');
const espnTeamsController = require('../controllers/espn-teams');
const espnScheduleController = require('../controllers/espn-schedules');

// User
router.delete('/users/:userId', verifyAdmin, userController.deleteUser);

// Comments
router.delete('/comments/:commentId', verifyAdmin, commentsController.deleteComment);

// ADMIN API
router.get('/upsert-leagues', verifyAdmin, espnLeaguesController.upsertLeagues);
router.get('/upsert-conferences', verifyAdmin, espnConferencesController.upsertConferences);
router.get('/upsert-teams', verifyAdmin, espnTeamsController.upsertTeams);
router.get('/upsert-schedules', verifyAdmin, espnScheduleController.upsertSchedules);

// Admin
router.post('/sports', verifyAdmin, adminController.createSport);
router.put('/sports/:id', verifyAdmin, adminController.updateSport);
router.delete('/sports/:id', verifyAdmin, adminController.deleteSport);

router.post('/leagues', verifyAdmin, adminController.createLeague);
router.put('/leagues/:id', verifyAdmin, adminController.updateLeague);
router.delete('/leagues/:id', verifyAdmin, adminController.deleteLeague);

router.post('/teams', verifyAdmin, adminController.createTeam);
router.put('/teams/:id', verifyAdmin, adminController.updateTeam);
router.delete('/teams/:id', verifyAdmin, adminController.deleteTeam);

router.post('/games', verifyAdmin, adminController.createGame);
router.put('/games/:id', verifyAdmin, adminController.updateGame);
router.delete('/games/:id', verifyAdmin, adminController.deleteGame);
router.get('/games', verifyAdmin, adminController.getAllGames);

router.post('/conferences', verifyAdmin, adminController.createConference);
router.put('/conferences/:id', verifyAdmin, adminController.updateConference);
router.delete('/conferences/:id', verifyAdmin, adminController.deleteConference);

router.get('/update-refs', verifyAdmin, adminController.updateRefs);
router.get('/venue-coordinates', verifyAdmin, adminController.getVenueCoordinates);

// Jobs Scheduler
router.post('/startSchedulerJobs', verifyAdmin, jobsController.startScheduler);
router.post('/stopSchedulerJobs', verifyAdmin, jobsController.stopScheduler);
// Notifications Testing
router.post('/notifications', verifyAdmin, adminController.sendTestNotification);

// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
  handleError(err, res);
});

module.exports = router;
