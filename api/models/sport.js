const moment = require('moment');
const pool = require('../../config/pg-config');

// ADMIN ONLY ROUTES
const createSport = async body => {
  const values = [body.id, body.sport_name, body.sport_logo, body.sport_espn_slug];

  return pool.query(
    `INSERT INTO sports(
      id,
      sport_name,
      sport_logo,
      sport_espn_slug
    ) VALUES (
      $1,$2, $3, $4
    ) RETURNING *`,
    values
  );
};

const updateSport = async (id, body) => {
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

  return pool.query(`UPDATE sports SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const getSportIdBySlug = async slug => {
  return pool.query(`SELECT id FROM sports WHERE sport_espn_slug IN($1)`, [slug]);
};

const getAllSports = async () => {
  return pool.query(`SELECT * FROM sports`);
};

const getAllSportsWithGames = async date => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT DISTINCT
      sports.id,
      sports.sport_name,
      sports.sport_logo
    FROM sports
    INNER JOIN schedule
      ON schedule.sport_id = sports.id
    WHERE 
      schedule.start_time > '${userCurrentTimeStamp}' 
      AND schedule.start_time < '${endDay}' 
      `
  );
};

const deleteSport = async id => {
  return pool.query(`DELETE FROM sports WHERE id IN ($1) RETURNING *`, [id]);
};

module.exports = {
  createSport,
  updateSport,
  getSportIdBySlug,
  getAllSports,
  getAllSportsWithGames,
  deleteSport
};
