const moment = require('moment');
const pool = require('../../config/pg-config');

const ratingsReturn = `ratings.id, 
  ratings.schedule_id, 
  sports.sport_name, 
  leagues.league_name, 
  conferences.conference_name, 
  teams.team_name AS home_team_name, 
  opponent_team.team_name AS opponent_team_name, 
  ratings.user_id, 
  ratings.overall_performance, 
  ratings.question_1, 
  ratings.question_1_specification, 
  ratings.question_2,
  ratings.overall_comment,
  ratings.question_3,
  ratings.timestamp`;
const createRating = async (id, body) => {
  const timestamp = moment.utc();

  const values = [
    id,
    body.schedule_id,
    body.sport_id,
    body.league_id,
    body.conference_id,
    body.user_id,
    body.home_team_id,
    body.opponent_id,
    body.overall_performance,
    JSON.stringify(body.question_1),
    body.question_1_specification,
    JSON.stringify(body.question_2),
    body.overall_comment,
    body.question_3,
    timestamp
  ];

  return pool.query(
    `INSERT INTO ratings(
      id,
      schedule_id,
      sport_id,
      league_id,
      conference_id,
      user_id,
      home_team_id,
      opponent_id,
      overall_performance,
      question_1,
      question_1_specification,
      question_2,
      overall_comment,
      question_3,
      timestamp
    ) VALUES (
      $1,$2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    ) RETURNING *`,
    values
  );
};

const updateRatingById = async (id, body) => {
  const values = [];
  values.push(id);

  const queryKeys = [];
  Object.keys(body).forEach(key => {
    // Handle special case for question array data
    if (key === 'question_1' || key === 'question_2') {
      values.push(JSON.stringify(body[key]));
    } else {
      values.push(body[key]);
    }
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

  return pool.query(`UPDATE ratings SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const getAllRatings = async () => {
  return pool.query(
    `SELECT ${ratingsReturn}
    FROM ratings
    INNER JOIN sports
     ON sports.id = ratings.sport_id
    INNER JOIN leagues
      ON leagues.id = ratings.league_id
    INNER JOIN conferences
      ON conferences.id = ratings.conference_id
    LEFT OUTER JOIN teams
      ON teams.id = ratings.home_team_id
    LEFT OUTER JOIN teams opponent_team
      ON opponent_team.id = ratings.opponent_id
    `
  );
};

const getRatingsByEntityId = async (idType, id) => {
  return pool.query(
    `SELECT ${ratingsReturn}
    FROM ratings
    INNER JOIN sports
      ON sports.id = ratings.sport_id
    INNER JOIN leagues
      ON leagues.id = ratings.league_id
    INNER JOIN conferences
      ON conferences.id = ratings.conference_id
    LEFT OUTER JOIN teams
      ON teams.id = ratings.home_team_id
    LEFT OUTER JOIN teams opponent_team
      ON opponent_team.id = ratings.opponent_id
    WHERE ${idType} = '${id}'`
  );
};

const getRatingsByTeamId = async id => {
  return pool.query(
    `SELECT ${ratingsReturn}
    FROM ratings
    INNER JOIN sports
      ON sports.id = ratings.sport_id
    INNER JOIN leagues
      ON leagues.id = ratings.league_id
    INNER JOIN conferences
      ON conferences.id = ratings.conference_id
    LEFT OUTER JOIN teams
      ON teams.id = ratings.home_team_id
    LEFT OUTER JOIN teams opponent_team
      ON opponent_team.id = ratings.opponent_id
    WHERE ratings.home_team_id = '${id}'
    OR ratings.opponent_id = '${id}'`
  );
};

module.exports = {
  createRating,
  updateRatingById,
  getAllRatings,
  getRatingsByEntityId,
  getRatingsByTeamId
};
