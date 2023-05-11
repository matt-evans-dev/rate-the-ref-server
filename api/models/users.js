const moment = require('moment');
const pool = require('../../config/pg-config');

const createUser = async body => {
  const createdOn = moment();
  const modifiedOn = null;

  const values = [
    body.id,
    body.first_name,
    body.last_name,
    body.email,
    body.display_name,
    body.profile_picture,
    body.state,
    body.zip_code,
    createdOn,
    modifiedOn
  ];

  return pool.query(
    `INSERT INTO users(
      id,
      first_name,
      last_name,
      email,
      display_name,
      profile_picture,
      state,
      zip_code,
      created_on,
      modified_on
    ) VALUES (
      $1,$2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING *`,
    values
  );
};

const getUserById = async id => {
  return pool.query(
    `SELECT 
      users.id,
      users.first_name,
      users.last_name,
      users.email,
      users.display_name,
      users.profile_picture,
      users.state,
      users.zip_code,
      users.notification_token,
      users.created_on,
      users.modified_on,
      (SELECT array_agg(users_favorite_teams.team_id) FROM users_favorite_teams WHERE users.id = users_favorite_teams.user_id) AS users_favorite_teams, 
      (SELECT array_agg(users_favorite_leagues.league_id) FROM users_favorite_leagues WHERE users.id = users_favorite_leagues.user_id) AS users_favorite_leagues, 
      (SELECT array_agg(users_favorite_conferences.conference_id) FROM users_favorite_conferences WHERE users.id = users_favorite_conferences.user_id) AS users_favorite_conferences, 
      (SELECT array_agg(users_favorite_schedule.schedule_id) FROM users_favorite_schedule WHERE users.id = users_favorite_schedule.user_id) AS users_favorite_games,
      (SELECT array_to_json(array_agg(row_to_json(ratings))) FROM ratings WHERE users.id = ratings.user_id) AS users_ratings
    FROM users
    WHERE users.id = '${id}'
    `
  );
};

const updateUser = async (id, body) => {
  const modifiedOn = moment();
  const values = [];
  values.push(id);

  const queryKeys = [];
  Object.keys(body).forEach(key => {
    values.push(body[key]);
    if (key !== id) {
      queryKeys.push(key);
    }
  });

  queryKeys.push('modified_on');
  values.push(modifiedOn);

  let queryString = '';
  let count = 1;

  queryKeys.forEach((key, index) => {
    count += 1;
    queryString += `${key}=($${count})${queryKeys.length - 1 !== index ? ',' : ''}`;
  });

  return pool.query(`UPDATE users SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const deleteUser = async id => {
  return pool.query(`DELETE FROM users WHERE id IN ($1) RETURNING *`, [id]);
};

const usernameIsUnique = async username => {
  return pool.query(
    `SELECT display_name
    FROM users
    WHERE users.display_name = '${username}'`
  );
};

// BELOW NEED TESTING
const favoriteGame = async (id, userId, gameId) => {
  const values = [id, userId, gameId];

  return pool.query(
    `INSERT INTO users_favorite_schedule(id, user_id, schedule_id)
    VALUES ($1,$2, $3)
    RETURNING *`,
    values
  );
};

const unfavoriteGame = async (userId, gameId) => {
  return pool.query(
    `DELETE FROM users_favorite_schedule WHERE user_id = '${userId}' AND schedule_id = '${gameId}' RETURNING *`
  );
};

const favoriteTeam = async (id, userId, gameId) => {
  const values = [id, userId, gameId];

  return pool.query(
    `INSERT INTO users_favorite_teams(id, user_id, team_id)
    VALUES ($1,$2, $3)
    RETURNING *`,
    values
  );
};

const unfavoriteTeam = async (userId, teamId) => {
  return pool.query(
    `DELETE FROM users_favorite_teams WHERE user_id = '${userId}' AND team_id = '${teamId}' RETURNING *`
  );
};

const favoriteLeague = async (id, userId, leagueId) => {
  const values = [id, userId, leagueId];

  return pool.query(
    `INSERT INTO users_favorite_leagues(id, user_id, league_id)
    VALUES ($1,$2, $3)
    RETURNING *`,
    values
  );
};

const unfavoriteLeague = async (userId, leagueId) => {
  return pool.query(
    `DELETE FROM users_favorite_leagues WHERE user_id = '${userId}' AND league_id = '${leagueId}' RETURNING *`
  );
};

const favoriteConference = async (id, userId, conferenceId) => {
  const values = [id, userId, conferenceId];

  return pool.query(
    `INSERT INTO users_favorite_conferences(id, user_id, conference_id)
    VALUES ($1,$2, $3)
    RETURNING *`,
    values
  );
};

const unfavoriteConference = async (userId, conferenceId) => {
  return pool.query(
    `DELETE FROM users_favorite_conferences WHERE user_id = '${userId}' AND conference_id = '${conferenceId}' RETURNING *`
  );
};

module.exports = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  usernameIsUnique,
  favoriteGame,
  unfavoriteGame,
  favoriteTeam,
  unfavoriteTeam,
  favoriteLeague,
  unfavoriteLeague,
  favoriteConference,
  unfavoriteConference
};
