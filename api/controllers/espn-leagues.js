const axios = require('axios');
const leagueModel = require('../models/league');

const urls = [
  'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
  'http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams',
  'http://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams',
  'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  'http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams',
  'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
  'http://site.api.espn.com/apis/site/v2/sports/baseball/college-baseball/teams',
  'http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams',
  'http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams'
];

const upsertLeagues = async (req, res, next) => {
  try {
    const promises = urls.map(async url => {
      const data = await axios.get(url);
      const sportData = data.data.sports[0];
      const league = sportData.leagues[0];

      const body = {
        id: parseInt(league.id, 10),
        sport_id: parseInt(sportData.id, 10),
        league_name: league.name,
        league_abbreviation: league.abbreviation,
        league_espn_slug: league.slug
      };

      try {
        const upsertedLeague = await leagueModel.upsertLeague(body);

        return upsertedLeague;
      } catch (err) {
        return err.message;
      }
    });

    const leagues = await Promise.all(promises);

    return res.status(200).send(leagues);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  upsertLeagues
};
