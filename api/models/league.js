const moment = require('moment');
const pool = require('../../config/pg-config');

const getAllLeagues = async () => {
  return pool.query(
    `SELECT 
      leagues.*,
      COUNT(DISTINCT ratings.id) AS rating_count,
      round(avg(ratings.overall_performance)::numeric, 2) as rating 
    FROM leagues
    INNER JOIN sports
      ON leagues.sport_id = sports.id 
    LEFT OUTER JOIN ratings
      ON leagues.id = ratings.league_id 
    GROUP BY leagues.id, sports.sport_name 
    ORDER BY leagues.league_abbreviation ASC`
  );
};

const getAllLeaguesWithGames = async date => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT DISTINCT
    leagues.id,
    sports.sport_name,
    leagues.league_name,
    leagues.league_abbreviation,
    leagues.league_logo,
    leagues.league_espn_slug
    FROM leagues
    INNER JOIN sports
      ON leagues.sport_id = sports.id
    INNER JOIN schedule
      ON schedule.league_id = leagues.id
    WHERE schedule.start_time > '${userCurrentTimeStamp}' 
      AND schedule.start_time < '${endDay}' 
      AND schedule.league_id = leagues.id`
  );
};

const getLeagueById = async id => {
  return pool.query(
    `SELECT 
      leagues.id,
      sports.sport_name,
      leagues.league_name,
      leagues.league_abbreviation,
      leagues.league_logo,
      leagues.league_espn_slug
    FROM leagues
    INNER JOIN sports
      ON leagues.sport_id = sports.id
    WHERE leagues.id = '${id}'`
  );
};

const getLeaguesBySportId = async id => {
  return pool.query(
    `SELECT 
      leagues.*,
      sports.sport_name,
      COUNT(DISTINCT ratings.id) AS rating_count,
      round(avg(ratings.overall_performance)::numeric, 2) as rating
    FROM leagues
    INNER JOIN sports
      ON leagues.sport_id = sports.id 
    LEFT OUTER JOIN ratings
      ON leagues.id = ratings.league_id 
    WHERE leagues.sport_id = '${id}' 
    GROUP BY leagues.id, sports.sport_name 
    ORDER BY leagues.league_name ASC`
  );
};

// ADMIN ONLY ROUTES
const createLeague = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_name,
    body.league_abbreviation,
    body.league_logo,
    body.league_espn_slug
  ];

  return pool.query(
    `INSERT INTO leagues(
      id,
      sport_id,
      league_name,
      league_abbreviation,
      league_logo,
      league_espn_slug
    ) VALUES (
      $1,$2, $3, $4, $5, $6
    ) RETURNING *`,
    values
  );
};

const updateLeague = async (id, body) => {
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

  return pool.query(`UPDATE leagues SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const upsertLeague = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_name,
    body.league_abbreviation,
    body.league_espn_slug
  ];

  return pool.query(
    `INSERT INTO leagues(
      id,
      sport_id,
      league_name,
      league_abbreviation,
      league_espn_slug
    ) VALUES (
      $1, $2, $3, $4, $5
    ) ON CONFLICT (id) DO UPDATE SET (
      sport_id,
      league_name,
      league_abbreviation,
      league_espn_slug
    ) = (
      $2, $3, $4, $5
    ) RETURNING *`,
    values
  );
};

const getLeagueIdBySlug = async slug => {
  return pool.query(`SELECT id FROM leagues WHERE league_espn_slug IN ($1)`, [slug]);
};

const getLeagueNameBySlug = async slug => {
  return pool.query(`SELECT league_name FROM leagues WHERE league_espn_slug IN ($1)`, [slug]);
};

const getSportByLeagueName = async name => {
  return pool.query(
    `
    SELECT sports.sport_name
    FROM leagues
    INNER JOIN sports
      ON leagues.sport_id = sports.id
    WHERE league_name IN ($1)`,
    [name]
  );
};

const deleteLeague = async id => {
  return pool.query(`DELETE FROM leagues WHERE id IN ($1) RETURNING *`, [id]);
};

const getUserFavoriteLeagues = userId => {
  return pool.query(
    `
    SELECT DISTINCT ON(leagues.id) leagues.*,
    sports.sport_name,
    COUNT(DISTINCT ratings.id) AS rating_count,
    round(avg(ratings.overall_performance)::numeric, 2) as rating 
    FROM leagues
    INNER JOIN users_favorite_leagues 
      ON users_favorite_leagues.user_id = '${userId}' 
    INNER JOIN sports
      ON leagues.sport_id = sports.id 
    LEFT OUTER JOIN ratings
      ON leagues.id = ratings.league_id 
    WHERE 
    leagues.id = users_favorite_leagues.league_id 
    GROUP BY leagues.id, sports.sport_name 
    `
  );
};

module.exports = {
  getAllLeagues,
  getAllLeaguesWithGames,
  getLeagueById,
  getLeaguesBySportId,
  createLeague,
  updateLeague,
  upsertLeague,
  getLeagueIdBySlug,
  getLeagueNameBySlug,
  deleteLeague,
  getSportByLeagueName,
  getUserFavoriteLeagues
};
