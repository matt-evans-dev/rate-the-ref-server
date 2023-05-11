const axios = require('axios');
const moment = require('moment');
const scheduleModel = require('../models/schedule');
const venueModel = require('../models/venue');
const teamModel = require('../models/team');
const { leagues } = require('../../utils/constants');

const getGamesPromises = games => {
  return games.map(async game => {
    const { competitors, venue } = game.competitions[0];
    if (!competitors) {
      return null;
    }
    if (competitors[0].team.name === 'TBD' || competitors[1].team.name === 'TBD') {
      return null;
    }

    const ids = game.uid.split('~');
    if (!ids) {
      return null;
    }
    const sport = ids.find(id => id[0] === 's');
    const league = ids.find(id => id[0] === 'l');
    const sportId = parseInt(sport.split(':')[1], 10);
    const leagueId = parseInt(league.split(':')[1], 10);

    const homeTeam = competitors.find(competitor => competitor.homeAway === 'home');
    // If venue, upsert venue and team location data
    if (venue) {
      await venueModel.upsertVenue({
        id: venue.id,
        venue_name: venue.fullName,
        venue_city: venue.address ? venue.address.city : '',
        venue_state: venue.address ? venue.address.state : ''
      });

      await teamModel.updateTeamVenueAndLocation(homeTeam.team.displayName, sportId, venue);
    }

    const opponentTeam = competitors.find(competitor => competitor.homeAway === 'away');
    const homeTeamData = await teamModel.getTeamByESPNIdAndLeagueId(leagueId, homeTeam.team.id);
    const opponentTeamData = await teamModel.getTeamByESPNIdAndLeagueId(
      leagueId,
      opponentTeam.team.id
    );

    // If Teams are not found - not added to schedule
    if (!homeTeamData || homeTeamData.length === 0) {
      return null;
    }

    if (!opponentTeamData || opponentTeamData.length === 0) {
      return null;
    }

    const body = {
      id: game.id,
      sport_id: sportId,
      league_id: leagueId,
      home_team_conference_id: homeTeamData[0].conference_id,
      opponent_conference_id: opponentTeamData[0].conference_id,
      home_team_id: homeTeamData[0].id,
      opponent_id: opponentTeamData[0].id,
      start_time: game.date,
      home_team_score: homeTeam.score,
      opponent_team_score: opponentTeam.score
    };

    const upsertedGame = await scheduleModel.upsertGame(body);
    return upsertedGame;
  });
};

/**
 * Using ESPNs scoreboard URL to get schedule by Date
 * @param {league id} league ESPN league name from URL
 */
const getGamesFromSchedule = async league => {
  const url = `https://secure.espn.com/core/${league}/scoreboard?xhr=1&render=true`;
  const data = await axios.get(url);

  const seasonStartDate = moment()
    .subtract(2, 'days')
    .format('YYYYMMDD');

  const seasonEndDate = moment(data.data.content.sbData.leagues[0].calendarEndDate).format(
    'YYYYMMDD'
  );

  let games = [];
  let counter = seasonStartDate;
  let daysBetweenGames = 0;

  while (!(counter > seasonEndDate)) {
    try {
      // Stop loop from continuing on if no games are scheduled within 2 weeks.
      // Season End Dates are sometimes months into the future
      if (daysBetweenGames === 14) {
        break;
      }
      console.log(`${league} - ${counter}`);
      // console.log(`daysBetweenGames - ${daysBetweenGames}`);
      const dayScheduleData = await axios.get(`${url}&date=${counter}`);
      const daySchedule = dayScheduleData.data.content.sbData.events;
      if (daySchedule && daySchedule.length > 0) {
        games = [...games, ...daySchedule];
        daysBetweenGames = 0;
      } else {
        daysBetweenGames += 1;
      }
      counter = moment(counter)
        .add(1, 'day')
        .format('YYYYMMDD');
    } catch (e) {
      counter = moment(counter)
        .add(1, 'day')
        .format('YYYYMMDD');
      daysBetweenGames += 1;
    }
  }

  return games;
};

/**
 * Using ESPNs scoreboard URL to get schedule by Week #
 * @param {league id} league ESPN league name from URL
 */
const getGamesFromScheduleByWeek = async league => {
  const url = `https://secure.espn.com/core/${league}/scoreboard?xhr=1&render=true`;

  let games = [];
  let week = 1;
  let weeksBetweenGames = 0;

  // Stop loop from continuing on if no games are scheduled within 2 weeks.
  // Season End Dates are sometimes months into the future
  while (weeksBetweenGames < 2) {
    try {
      console.log(`${league} - ${week}`);
      // console.log(`daysBetweenGames - ${daysBetweenGames}`);
      const dayScheduleData = await axios.get(`${url}&week=${week}`);
      const daySchedule = dayScheduleData.data.content.sbData.events;
      if (daySchedule && daySchedule.length > 0) {
        games = [...games, ...daySchedule];
        weeksBetweenGames = 0;
      } else {
        weeksBetweenGames += 1;
      }
      week += 1;
    } catch (e) {
      week += 1;
      weeksBetweenGames += 1;
    }
  }

  return games;
};

const upsertSchedule = async league => {
  console.log('Upserting Schedule for ', league);

  const games =
    league === leagues.nfl || league === leagues.collegeFootball
      ? await getGamesFromScheduleByWeek(league)
      : await getGamesFromSchedule(league);
  const gamePromises = getGamesPromises(games);
  return Promise.all(gamePromises);
};

/**
 * Start Dates are set 2 days before today - if need thole schedule,
 * Adjust to get from calendar start date from ESPN response, as in previous commits
 *
 */

const upsertBasketballSchedules = async () => {
  return upsertSchedule(leagues.nba);
};

const upsertBaseballSchedules = async () => {
  return upsertSchedule(leagues.mlb);
};

const upsertMLSSchedule = async () => {
  return upsertSchedule(leagues.mls);
};

const upsertNFLSchedule = async () => {
  return upsertSchedule(leagues.nfl);
};

const upsertCollegeFootball = async () => {
  return upsertSchedule(leagues.collegeFootball);
};

/**
 * using schedule URL as scoreboard URL is not returning anything for NHL
 */
const upsertNHLSchedule = async () => {
  console.log('Upserting Schedule for ', 'NHL');
  const url = 'https://secure.espn.com/core/nhl/schedule?xhr=1&render=true';
  const data = await axios.get(url);
  const dates = Object.values(data.data.content.schedule)[0].calendar;

  const seasonStartDate = moment()
    .subtract(2, 'days')
    .format('YYYYMMDD');
  const seasonEndDate = moment(dates[dates.length - 1]).format('YYYYMMDD');
  let games = [];
  let counter = seasonStartDate;

  while (!(counter > seasonEndDate)) {
    try {
      const dayScheduleData = await axios.get(`${url}&date=${counter}`);
      const daySchedule = dayScheduleData.data.content.schedule[`${counter}`];

      if (daySchedule.games) {
        games = [...games, ...daySchedule.games];
      }
      counter = moment(counter)
        .add(1, 'day')
        .format('YYYYMMDD');
    } catch (e) {
      counter = moment(counter)
        .add(1, 'day')
        .format('YYYYMMDD');
    }
  }

  const gamePromises = getGamesPromises(games);

  return Promise.all(gamePromises);
};

const upsertSchedules = async (req, res, next) => {
  try {
    const basketballPromises = await upsertBasketballSchedules();
    const baseballPromises = await upsertBaseballSchedules();
    const nhlPromises = await upsertNHLSchedule();
    const mlsPromises = await upsertMLSSchedule();
    const nflPromises = await upsertNFLSchedule();
    const collegeFootballPromises = await upsertCollegeFootball();

    const schedules = await Promise.all([
      ...basketballPromises,
      ...baseballPromises,
      ...nhlPromises,
      ...mlsPromises,
      ...nflPromises,
      ...collegeFootballPromises
    ]);

    const response = schedules.flat().filter(schedule => schedule != null);
    return res.status(200).send(response);
  } catch (error) {
    return next(error);
  }
};

// URLS for nba and college basketball
// const scoreboardUrls = [
//   'https://secure.espn.com/core/nba/scoreboard?xhr=1&render=true',
//   'https://secure.espn.com/core/mens-college-basketball/scoreboard?xhr=1&render=true',
//   'https://secure.espn.com/core/womens-college-basketball/scoreboard?xhr=1&render=true'
// ];

// const scheduleUrls = [
//   'https://secure.espn.com/core/nba/schedule?xhr=1&render=true',
//   'https://secure.espn.com/core/mens-college-basketball/schedule?xhr=1&render=true',
//   'https://secure.espn.com/core/womens-college-basketball/schedule?xhr=1&render=true'
// ];

module.exports = {
  upsertSchedules,
  upsertBasketballSchedules,
  upsertBaseballSchedules,
  upsertMLSSchedule,
  upsertNHLSchedule,
  upsertNFLSchedule,
  upsertCollegeFootball
};
