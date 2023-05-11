const pool = require('../../config/pg-config');

const createConference = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_id,
    body.conference_name,
    body.conference_abbreviation,
    body.conference_logo
  ];

  return pool.query(
    `INSERT INTO conferences(
      id,
      sport_id,
      league_id,
      conference_name,
      conference_abbreviation,
      conference_logo
    ) VALUES (
      $1,$2, $3, $4, $5, $6
    ) RETURNING *`,
    values
  );
};

const getConferencesByLeagueId = async leagueId => {
  return pool.query(
    `SELECT 
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
      ON conferences.id = ratings.conference_id
    WHERE conferences.league_id = '${leagueId}' 
    GROUP BY conferences.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation
    ORDER BY conferences.conference_name ASC`
  );
};

const getUserFavoriteConferences = userId => {
  return pool.query(
    `SELECT DISTINCT ON(conferences.id) 
      conferences.*, 
      sports.sport_name,
      leagues.league_name, 
      leagues.league_abbreviation, 
      COUNT(DISTINCT ratings.id) AS rating_count,
      round(avg(ratings.overall_performance)::numeric, 2) as rating 
    FROM conferences
    INNER JOIN users_favorite_conferences 
      ON users_favorite_conferences.user_id = '${userId}'
    INNER JOIN sports
      ON conferences.sport_id = sports.id 
    INNER JOIN leagues
      ON conferences.league_id = leagues.id  
    LEFT OUTER JOIN ratings
      ON conferences.id = ratings.conference_id
    WHERE 
    conferences.id = users_favorite_conferences.conference_id 
    GROUP BY conferences.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation
    `
  );
};

const updateConference = async (id, body) => {
  const values = [];
  values.push(id);

  const queryKeys = [];
  Object.keys(body).forEach(key => {
    values.push(body[key]);
    if (key !== id) {
      queryKeys.push(key);
    }
  });

  let queryString = '';
  let count = 1;

  queryKeys.forEach((key, index) => {
    count += 1;
    queryString += `${key}=($${count})${queryKeys.length - 1 !== index ? ',' : ''}`;
  });

  return pool.query(`UPDATE conferences SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const getConferenceId = async (leagueId, sportId, name) => {
  return pool.query(
    `SELECT id FROM conferences WHERE league_id = ${leagueId} AND sport_id = ${sportId} AND conference_name = '${name}'`
  );
};

const getConferenceIdByEspnId = async (espnId, leagueId) => {
  return pool.query(
    `SELECT id FROM conferences WHERE espn_id = ${espnId} AND league_id = ${leagueId}`
  );
};

const deleteConference = async id => {
  return pool.query(`DELETE FROM conferences WHERE id IN ($1) RETURNING *`, [id]);
};

const upsertConference = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_id,
    body.conference_name,
    body.conference_abbreviation,
    body.conference_logo,
    body.espn_id
  ];

  let toUpdate = `sport_id,
    conference_abbreviation,
    espn_id
  ) = (
    $2, $5, $7`;

  if (body.conference_logo) {
    toUpdate = `sport_id,
    conference_abbreviation,
    conference_logo,
    espn_id
  ) = (
    $2, $5, $6, $7`;
  }

  return pool.query(
    `INSERT INTO conferences(
      id,
      sport_id,
      league_id,
      conference_name,
      conference_abbreviation,
      conference_logo,
      espn_id
    ) VALUES (
      $1,$2, $3, $4, $5, $6, $7
    ) ON CONFLICT ON CONSTRAINT unique_name_for_league DO UPDATE SET (
      ${toUpdate}
    ) RETURNING *`,
    values
  );
};

module.exports = {
  createConference,
  updateConference,
  getConferenceId,
  getConferenceIdByEspnId,
  deleteConference,
  upsertConference,
  getConferencesByLeagueId,
  getUserFavoriteConferences
};
