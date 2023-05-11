const axios = require('axios');
const uniqid = require('uniqid');
const conferenceModel = require('../models/conference');

const upsertCollegeBasketballAndCollegeFootball = async () => {
  const urls = [
    'https://secure.espn.com/core/mens-college-basketball/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full',
    'https://secure.espn.com/core/womens-college-basketball/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full',
    'https://secure.espn.com/core/college-football/schedule?xhr=1&render=true&device=desktop&country=us&lang=en&region=us&site=espn&edition-host=espn.com&site-type=full'
  ];

  const promises = urls.map(async url => {
    const data = await axios.get(url);
    const { conferences } = data.data.content.conferenceAPI;

    const confPromises = await conferences.map(async conference => {
      if (!conference.parentGroupId) {
        return null;
      }

      const ids = conference.uid.split('~');
      const sport = ids.find(id => id[0] === 's');
      const league = ids.find(id => id[0] === 'l');
      const sportId = parseInt(sport.split(':')[1], 10);
      const leagueId = parseInt(league.split(':')[1], 10);

      const body = {
        id: uniqid(),
        sport_id: sportId,
        league_id: leagueId,
        conference_name: conference.name,
        conference_abbreviation: conference.shortName,
        conference_logo: conference.logo,
        espn_id: parseInt(conference.groupId, 10)
      };

      try {
        const upsertedConference = await conferenceModel.upsertConference(body);
        return upsertedConference[0];
      } catch (err) {
        return err.message;
      }
    });

    return Promise.all(confPromises);
  });

  return Promise.all(promises);
};

// WILL NEED TO HAVE LOGOS MANUALLY UPDATED
const upsertNBANFLNHL = async () => {
  const urls = [
    'https://site.api.espn.com/apis/site/v2/sports/basketball/nba',
    'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
    'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl'
  ];

  const promises = urls.map(async url => {
    const data = await axios.get(`${url}/groups`);
    const { groups } = data.data;

    const groupPromises = groups.map(async group => {
      const confTeam = group.children[0].teams[0];
      const teamData = await axios.get(`${url}/teams/${confTeam.id}`);
      const { team } = teamData.data;

      const ids = team.uid.split('~');
      const sport = ids.find(id => id[0] === 's');
      const league = ids.find(id => id[0] === 'l');
      const sportId = parseInt(sport.split(':')[1], 10);
      const leagueId = parseInt(league.split(':')[1], 10);

      const body = {
        id: uniqid(),
        sport_id: sportId,
        league_id: leagueId,
        conference_name: group.name,
        conference_abbreviation: group.abbreviation,
        espn_id: parseInt(team.groups.parent.id, 10)
      };

      try {
        const conference = await conferenceModel.upsertConference(body);
        return conference[0];
      } catch (err) {
        return err.message;
      }
    });

    return Promise.all(groupPromises);
  });

  return Promise.all(promises);
};

const upsertConferences = async (req, res, next) => {
  try {
    const collegePromises = await upsertCollegeBasketballAndCollegeFootball();
    const NBANFLNHLPromises = await upsertNBANFLNHL();
    const conferences = await Promise.all([...collegePromises, ...NBANFLNHLPromises]);

    const response = conferences.flat().filter(conf => conf != null);
    return res.status(200).send(response);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertConferences
};
