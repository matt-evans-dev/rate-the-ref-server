const { setQueues } = require('bull-board');
const Queue = require('bull');
const Redis = require('ioredis');
const Schedules = require('./espn-schedules');
const Admin = require('./admin');
const { leagues } = require('../../utils/constants');

const { REDIS_URL } = process.env;
const client = new Redis(REDIS_URL);
const subscriber = new Redis(REDIS_URL);

const opts = {
  createClient: type => {
    switch (type) {
      case 'client':
        return client;
      case 'subscriber':
        return subscriber;
      default:
        return new Redis(REDIS_URL);
    }
  }
};

const scheduleQueue = new Queue('scheduleQueue', opts);
const refereeQueue = new Queue('refereeQueue', opts);

// setQueues([basketballQueue, baseballQueue, mlsQueue, nhlQueue, refereeQueue]);
setQueues([scheduleQueue, refereeQueue]);

const processJobs = () => {
  console.log('Running job processor');
  scheduleQueue.process(async (job, done) => {
    const { league } = job.data;
    console.log('Processing League', league);
    try {
      switch (league) {
        case leagues.nba:
          await Schedules.upsertBasketballSchedules();
          break;
        case leagues.mlb:
          await Schedules.upsertBaseballSchedules();
          break;
        case leagues.mls:
          await Schedules.upsertMLSSchedule();
          break;
        case leagues.nhl:
          await Schedules.upsertNHLSchedule();
          break;
        case leagues.nfl:
          await Schedules.upsertNFLSchedule();
          break;
        case leagues.collegeFootball:
          await Schedules.upsertCollegeFootball();
          break;
        default:
          break;
      }
      console.log('Done Processing League: ', league);
      job.progress(100);
      done(null);
    } catch (err) {
      job.progress(100);
      done(err);
    }
  });

  refereeQueue.process(async (job, done) => {
    const { type } = job.data;
    console.log('Processing RefereeQueue', type);
    try {
      await Admin.updateRefsFromPastDay();
      console.log('Done Processing RefereeQueue: ', type);
      job.progress(100);
      done(null);
    } catch (err) {
      job.progress(100);
      done(err);
    }
  });
};

// Controller to start jobs
const addJobsToQueue = async () => {
  await scheduleQueue.clean(1000);
  await refereeQueue.clean(1000);
  const addPromise = new Promise(resolve => {
    console.log('Adding jobs to queue');
    // Clean up any previous jobs

    refereeQueue.add({ type: 'all' }, { repeat: { cron: '0 6 * * *' } });
    scheduleQueue.add(
      { league: leagues.nba },
      {
        repeat: { cron: '15 5 * * *' }
      }
    );
    scheduleQueue.add(
      { league: leagues.mlb },
      {
        repeat: { cron: '25 5 * * *' }
      }
    );
    scheduleQueue.add(
      { league: leagues.mls },
      {
        repeat: { cron: '35 5 * * *' }
      }
    );
    scheduleQueue.add(
      { league: leagues.nhl },
      {
        repeat: { cron: '45 5 * * *' }
      }
    );
    scheduleQueue.add(
      { league: leagues.nfl },
      {
        repeat: { cron: '50 5 * * *' }
      }
    );
    scheduleQueue.add(
      { league: leagues.collegeFootball },
      {
        repeat: { cron: '55 5 * * *' }
      }
    );
    resolve();
  });
  await Promise.resolve(addPromise);
  processJobs();
};

const stopJobs = () => {
  scheduleQueue.close();
  refereeQueue.close();
};

const startScheduler = (req, res) => {
  console.log('Starting Jobs');
  addJobsToQueue();
  res.send('Jobs Started');
};

// Remove Jobs
const stopScheduler = (req, res) => {
  console.log('Stopping Jobs');
  // Logic to stop jobs
  stopJobs();
  res.send('Jobs Stopped');
};
module.exports = {
  startScheduler,
  stopScheduler,
  addJobsToQueue,
  processJobs,
  stopJobs
};
