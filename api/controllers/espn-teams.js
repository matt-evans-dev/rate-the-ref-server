const axios = require('axios');
const uniqid = require('uniqid');
const teamModel = require('../models/team');
const conferenceModel = require('../models/conference');

const upsertNBANFLNHLCollegeFootballAndCollegeBasketball = async () => {
  const urls = [
    'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
    'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
    'http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams',
    'http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams',
    // 'http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams',
    // 'http://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams'
  ];

  const promises = urls.map(async (url) => {
    const data = await axios.get(url);
    const { teams } = data.data.sports[0].leagues[0];

    const teamPromises = teams.map(async (teamObj) => {
      const { team } = teamObj;
      const teamData = await axios.get(`${url}/${team.id}`);
      const fullTeamData = teamData.data.team;
      const ids = fullTeamData.uid.split('~');
      const sport = ids.find((id) => id[0] === 's');
      const league = ids.find((id) => id[0] === 'l');
      const sportId = parseInt(sport.split(':')[1], 10);
      const leagueId = parseInt(league.split(':')[1], 10);

      const confEspnId = url.includes('college')
        ? fullTeamData.groups.id
        : fullTeamData.groups.parent.id;
      let confId = await conferenceModel.getConferenceIdByEspnId(
        parseInt(confEspnId, 10),
        leagueId
      );

      // Usually for college teams the right id is above, but sometimes it switches and we need to query with the parent id
      if (!confId[0]) {
        confId = await conferenceModel.getConferenceIdByEspnId(
          parseInt(fullTeamData.groups.parent.id, 10),
          leagueId
        );
      }

      let teamName = fullTeamData.name;
      if (url.includes('college')) {
        if (fullTeamData.nickname) {
          teamName = fullTeamData.nickname;
        } else if (fullTeamData.location) {
          teamName = fullTeamData.location;
        } else if (fullTeamData.abbreviation) {
          teamName = fullTeamData.abbreviation;
        } else {
          teamName = fullTeamData.name;
        }
      }

      const logo = fullTeamData.logos ? fullTeamData.logos[0].href : null;

      // If team does not have a logo, we are not adding it to the DB. App requires logo to show
      if (!logo) {
        return null;
      }

      const body = {
        id: uniqid(),
        espn_id: parseInt(fullTeamData.id, 10),
        sport_id: sportId,
        league_id: leagueId,
        conference_id: confId[0].id,
        team_name: teamName,
        team_display_name: fullTeamData.displayName,
        team_logo: logo,
        city_nickname: fullTeamData.abbreviation,
        team_espn_slug: fullTeamData.slug,
        color: fullTeamData.color,
        alternate_color: fullTeamData.alternateColor,
      };

      try {
        const upsertedTeam = await teamModel.upsertTeam(body);
        return upsertedTeam[0];
      } catch (err) {
        return err.message;
      }
    });

    return Promise.all(teamPromises);
  });

  return Promise.all(promises);
};

// Will need to maintain conference data manually
const upsertMLBMLSAndCollegeBaseball = async () => {
  const urls = [
    'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
    // 'http://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams',
    'http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams',
  ];

  const promises = urls.map(async (url) => {
    const data = await axios.get(url);
    const { teams } = data.data.sports[0].leagues[0];

    const teamPromises = teams.map(async (teamObj) => {
      const { team } = teamObj;
      const teamData = await axios.get(`${url}/${team.id}`);
      const fullTeamData = teamData.data.team;

      const ids = fullTeamData.uid.split('~');
      const sport = ids.find((id) => id[0] === 's');
      const league = ids.find((id) => id[0] === 'l');
      const sportId = parseInt(sport.split(':')[1], 10);
      let leagueId;

      if (league) {
        leagueId = parseInt(league.split(':')[1], 10);
      }

      // Hardcode for MLS league ID
      if (!league && sportId === 600) {
        leagueId = 770;
      }

      let teamName = fullTeamData.name;
      if (url.includes('college')) {
        if (fullTeamData.nickname) {
          teamName = fullTeamData.nickname;
        } else if (fullTeamData.location) {
          teamName = fullTeamData.location;
        } else if (fullTeamData.abbreviation) {
          teamName = fullTeamData.abbreviation;
        } else {
          teamName = fullTeamData.name;
        }
      }

      const logo = fullTeamData.logos ? fullTeamData.logos[0].href : null;

      // If team has no logo - do not add to DB
      if (!logo) {
        return null;
      }

      const body = {
        id: uniqid(),
        espn_id: parseInt(fullTeamData.id, 10),
        sport_id: sportId,
        league_id: leagueId,
        team_name: teamName,
        team_display_name: fullTeamData.displayName,
        team_logo: logo,
        city_nickname: fullTeamData.abbreviation,
        team_espn_slug: fullTeamData.slug,
        color: fullTeamData.color,
        alternate_color: fullTeamData.alternateColor,
      };

      try {
        const upsertedTeam = await teamModel.upsertTeam(body);
        return upsertedTeam[0];
      } catch (err) {
        return err.message;
      }
    });

    return Promise.all(teamPromises);
  });

  return Promise.all(promises);
};

const upsertTeams = async (req, res, next) => {
  try {
    const promisesWithConfs = await upsertNBANFLNHLCollegeFootballAndCollegeBasketball();
    const promisesNoConfs = await upsertMLBMLSAndCollegeBaseball();
    const teams = await Promise.all([...promisesWithConfs, ...promisesNoConfs]);

    const response = teams.flat().filter((team) => team != null);
    return res.status(200).send(response);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertTeams,
};
