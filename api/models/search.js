const pool = require('../../config/pg-config');

const teamSelect = `
SELECT 
  teams.*,
  sports.sport_name,
  leagues.league_name,
  leagues.league_abbreviation,
  conferences.conference_name,
  COUNT(DISTINCT ratings.id) AS rating_count,
  round(avg(ratings.overall_performance)::numeric, 2) as rating 
FROM teams 
INNER JOIN sports
  ON teams.sport_id = sports.id
INNER JOIN leagues
  ON teams.league_id = leagues.id
LEFT OUTER JOIN conferences
  ON teams.conference_id = conferences.id
LEFT OUTER JOIN ratings
  ON teams.id = ratings.home_team_id 
  OR teams.id = ratings.opponent_id 
`;
const teamGroupBy = `
GROUP BY teams.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation, conferences.conference_name
`;

const leagueSelect = `
SELECT 
  leagues.*,
  sports.sport_name,
  COUNT(DISTINCT ratings.id) AS rating_count,
  round(avg(ratings.overall_performance)::numeric, 2) as rating 
FROM leagues 
INNER JOIN sports
  ON leagues.sport_id = sports.id
LEFT OUTER JOIN ratings
  ON leagues.id = ratings.league_id 
`;

const leagueGroupBy = `
GROUP BY leagues.id, sports.sport_name  
`;

const conferenceSelect = `
SELECT 
  conferences.*, 
  sports.sport_name,
  leagues.league_name, 
  leagues.league_abbreviation,
  COUNT(DISTINCT ratings.id) AS rating_count,
  round(avg(ratings.overall_performance)::numeric, 2) as rating 
FROM conferences 
INNER JOIN sports
  ON conferences.sport_id = sports.id 
INNER JOIN leagues
  ON conferences.league_id = leagues.id 
LEFT OUTER JOIN ratings
  ON conferences.id = ratings.conference_id`;

const conferenceGroupBy = `
  GROUP BY conferences.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation
`;

// where to_tsvector(foo::text) @@ to_tsquery('full-text-query');
// foo::text concatenates all columns of that table as a single large string, using the default text representation for non-text data.

const search = async query => {
  let searchString = '';
  const queryArray = query.split(' ');
  if (queryArray.length > 0) {
    // Creates a string that looks like -> string1, string2
    queryArray.forEach((word, index) => {
      searchString += `${word}${queryArray.length - 1 !== index ? ' & ' : ''}`;
    });
  }
  const leagueQuery = await pool.query(
    `
      (${leagueSelect} 
        WHERE 
        to_tsvector(leagues::text) @@ to_tsquery('${searchString}') 
        ${leagueGroupBy}
    )
      `
  );
  const teamQuery = await pool.query(
    `
        (
          ${teamSelect} 
          WHERE 
          to_tsvector(teams::text) @@ to_tsquery('${searchString}') 
          ${teamGroupBy}
      )
        `
  );
  const conferenceQuery = await pool.query(
    `
    (
        ${conferenceSelect}
        WHERE 
        to_tsvector(conferences::text) @@ to_tsquery('${searchString}') 
        ${conferenceGroupBy}
    )
    `
  );

  return {
    leagues: leagueQuery,
    teams: teamQuery,
    conferences: conferenceQuery
  };
};

module.exports = {
  search
};
