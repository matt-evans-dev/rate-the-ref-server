const moment = require('moment');
const pool = require('../../config/pg-config');

const gameReturns = `
  COUNT(DISTINCT ratings.id) AS rating_count,
  round(avg(ratings.overall_performance)::numeric, 2) as rating, 
  schedule.id,
  sports.sport_name, 
  sports.id AS sport_id,
  leagues.league_name, 
  leagues.league_abbreviation,
  leagues.id AS league_id,
  conferences.conference_name AS home_team_conference_name, 
  opponent_conference.conference_name AS opponent_conference_name,
  (SELECT row_to_json(t) FROM teams as t WHERE t.id = schedule.home_team_id) AS home_team,
  (SELECT row_to_json(t) FROM teams as t WHERE t.id = schedule.opponent_id) AS opponent_team,
  (SELECT row_to_json(t) FROM venue as t WHERE t.id = teams.venue_id) AS venue,
  schedule.start_time, 
  schedule.home_team_score,
  schedule.opponent_team_score`;

const gameGroupBy = `schedule.id, 
  sports.sport_name, 
  sports.id,
  leagues.league_name, 
  leagues.league_abbreviation, 
  leagues.id,
  conferences.conference_name, 
  opponent_conference.conference_name, 
  teams.team_name,
  teams.venue_id,
  opponent_team.team_name, 
  schedule.start_time`;

const gameInnerJoins = `
  INNER JOIN sports
      ON sports.id = schedule.sport_id
    INNER JOIN leagues
      ON leagues.id = schedule.league_id
    LEFT OUTER JOIN conferences
      ON conferences.id = schedule.home_team_conference_id
    LEFT OUTER JOIN conferences opponent_conference
      ON opponent_conference.id = schedule.opponent_conference_id
    LEFT OUTER JOIN teams
      ON teams.id = schedule.home_team_id
    LEFT OUTER JOIN teams opponent_team
      ON opponent_team.id = schedule.opponent_id 
  `;

const getGameById = async id => {
  return pool.query(
    `SELECT ${gameReturns}
      FROM schedule 
      LEFT OUTER JOIN ratings
      ON schedule.id = ratings.schedule_id 
      ${gameInnerJoins} 
      WHERE schedule.id = '${id}' 
      GROUP BY (${gameGroupBy}) 
      `
  );
};

// Trending Games -> Inner Join / Upcoming Games -> Left Join - as upcoming games may not have ratings.

const getFavoriteGamesByUserId = async id => {
  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    INNER JOIN users_favorite_schedule
      ON schedule.id = users_favorite_schedule.schedule_id 
    LEFT OUTER JOIN ratings
      ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE users_favorite_schedule.user_id = '${id}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getUserFavoriteUpcomingGames = async (id, date) => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    INNER JOIN users_favorite_schedule
      ON schedule.id = users_favorite_schedule.schedule_id 
    LEFT OUTER JOIN ratings
      ON schedule.id = ratings.schedule_id
    ${gameInnerJoins}
    WHERE users_favorite_schedule.user_id = '${id}'
    AND schedule.start_time > '${userCurrentTimeStamp}' 
    GROUP BY (${gameGroupBy})
    ORDER BY schedule.start_time ASC NULLS LAST
    LIMIT 20`
  );
};

/**
 * Get total comments and ratings interactions by date provided
 * Sorted by most interactions DESC
 */

const getTrendingGameIdsSorted = date => {
  console.log('date', date);
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .subtract(1, 'day')
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  console.log('userCurrentTimeStamp', userCurrentTimeStamp.format());
  return pool.query(`
  SELECT 
    schedule_id, SUM(count) total_interactions 
      FROM (
        SELECT
          schedule_id,
          COUNT(DISTINCT comments.id) AS count
        FROM
          comments
        WHERE
          comments.created_at > '${userCurrentTimeStamp}'
          AND comments.created_at < '${endDay}'
        GROUP BY
          comments.schedule_id 
      UNION ALL
        SELECT
          schedule_id,
          COUNT(DISTINCT ratings.id) AS count
        FROM
          ratings
        WHERE
          ratings.timestamp > '${userCurrentTimeStamp}'
          AND ratings.timestamp < '${endDay}'
        GROUP BY
          ratings.schedule_id          
      ) as combined 
    GROUP BY schedule_id
    ORDER BY total_interactions DESC
`);
};

const getTrendingGames = async date => {
  const trendingGameIdsSorted = await getTrendingGameIdsSorted(date);

  const trendingGamesPromises = trendingGameIdsSorted.map(item =>
    getGameById(item.schedule_id).then(res => res[0])
  );
  const trendingGamesResolved = await Promise.all(trendingGamesPromises);
  return trendingGamesResolved.splice(0, 10);
};

const getTrendingGamesByLeagueId = async (leagueId, date) => {
  const trendingGameIdsSorted = await getTrendingGameIdsSorted(date);

  const trendingGamesPromises = trendingGameIdsSorted.map(item =>
    getGameById(item.schedule_id).then(res => res[0])
  );
  const trendingGamesResolved = await Promise.all(trendingGamesPromises);
  return trendingGamesResolved.filter(game => game.league_id.toString() === leagueId).splice(0, 10);
};

const getTrendingGamesBySportId = async (sportId, date) => {
  const trendingGameIdsSorted = await getTrendingGameIdsSorted(date);

  const trendingGamesPromises = trendingGameIdsSorted.map(item =>
    getGameById(item.schedule_id).then(res => res[0])
  );
  const trendingGamesResolved = await Promise.all(trendingGamesPromises);
  return trendingGamesResolved.filter(game => game.sport_id.toString() === sportId).splice(0, 10);
};

const getUpcomingGames = async date => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.start_time > '${userCurrentTimeStamp}'
    AND schedule.start_time < '${endDay}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getUpcomingGamesByLeagueId = async (id, date) => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.league_id = '${id}' 
    AND schedule.start_time > '${userCurrentTimeStamp}' 
    AND schedule.start_time < '${endDay}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getGamesByLeagueId = async id => {
  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule 
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.league_id = '${id}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST 
    `
  );
};

const getUpcomingGamesBySportId = async (id, date) => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.sport_id = '${id}' 
    AND schedule.start_time > '${userCurrentTimeStamp}' 
    AND schedule.start_time < '${endDay}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getPastGames = async () => {
  const now = moment.utc();

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.start_time < '${now}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getFutureGames = async date => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');
  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule 
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE schedule.start_time > '${userCurrentTimeStamp}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST`
  );
};

const getGamesForUserFavoriteTeams = async (id, date) => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    ${gameInnerJoins}
    LEFT OUTER JOIN users_favorite_schedule
      ON  users_favorite_schedule.schedule_id = schedule.id
    LEFT OUTER JOIN ratings
      ON  ratings.schedule_id = schedule.id
    LEFT OUTER JOIN users_favorite_teams
      ON  users_favorite_teams.team_id = schedule.home_team_id
    LEFT OUTER JOIN users_favorite_teams opponent_favorite
      ON  opponent_favorite.team_id = schedule.opponent_id
    WHERE (users_favorite_teams.user_id = '${id}'
    OR opponent_favorite.user_id = '${id}') 
    AND schedule.start_time > '${userCurrentTimeStamp}' 
    GROUP BY (${gameGroupBy}) 
    ORDER BY schedule.start_time ASC NULLS LAST 
    LIMIT 10`
  );
};

const getGamesWithUserInteraction = async id => {
  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule 
    LEFT OUTER JOIN ratings 
    ON schedule.id = ratings.schedule_id  
    LEFT OUTER JOIN users_favorite_schedule
    ON  schedule.id = users_favorite_schedule.schedule_id 
    LEFT OUTER JOIN comments 
    ON schedule.id = comments.schedule_id 
    ${gameInnerJoins} 
    WHERE ratings.user_id = '${id}'
    OR users_favorite_schedule.user_id = '${id}' 
    OR comments.user_id = '${id}' 
    GROUP BY (ratings.schedule_id, ${gameGroupBy})  
    ORDER BY schedule.start_time DESC NULLS LAST `
  );
};

const getGamesNearby = async date => {
  const userCurrentTimeStamp = moment(date, 'YYYY-MM-DD')
    .utc()
    .startOf('day');

  const endDay = moment(date, 'YYYY-MM-DD')
    .add(1, 'day')
    .utc()
    .endOf('day');

  return pool.query(
    `SELECT ${gameReturns}
      FROM schedule
      LEFT OUTER JOIN ratings
      ON schedule.id = ratings.schedule_id 
      ${gameInnerJoins}
      WHERE schedule.start_time > '${userCurrentTimeStamp}' 
      AND 
      schedule.start_time < '${endDay}' 
      GROUP BY (${gameGroupBy}) 
      ORDER BY schedule.start_time ASC NULLS LAST
      `
  );
};

// Add in search on referees using json obj
// where to_tsvector(foo::text) @@ to_tsquery('full-text-query');
// foo::text concatenates all columns of that table as a single large string, using the default text representation for non-text data.
const searchForGame = async query => {
  let searchString = '';
  const queryArray = query.split(' ');
  if (queryArray.length > 0) {
    // Creates a string that looks like -> string1, string2
    queryArray.forEach((word, index) => {
      searchString += `${word}${queryArray.length - 1 !== index ? ' & ' : ''}`;
    });
  }

  const fourWeeksAhead = moment()
    .add(4, 'weeks')
    .utc()
    .endOf('day');

  const fourWeeksAgo = moment()
    .subtract(4, 'weeks')
    .utc()
    .startOf('day');

  return pool.query(
    `SELECT ${gameReturns}
    FROM schedule
    LEFT OUTER JOIN ratings
    ON schedule.id = ratings.schedule_id 
    ${gameInnerJoins}
    WHERE 
      (to_tsvector(sports::text) @@ to_tsquery('${searchString}') OR 
      to_tsvector(leagues::text) @@ to_tsquery('${searchString}') OR 
      to_tsvector(conferences::text) @@ to_tsquery('${searchString}') OR  
      to_tsvector(opponent_conference::text) @@ to_tsquery('${searchString}') OR 
      to_tsvector(teams::text) @@ to_tsquery('${searchString}') OR 
      to_tsvector(opponent_team::text) @@ to_tsquery('${searchString}')) AND
      schedule.start_time > '${fourWeeksAgo}' AND 
      schedule.start_time < '${fourWeeksAhead}'
      GROUP BY (${gameGroupBy})
      ORDER BY schedule.start_time`
  );
};

// ADMIN ONLY ROUTES
const createGame = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_id,
    body.home_team_conference_id,
    body.opponent_conference_id,
    body.home_team_id,
    body.opponent_id,
    body.referees,
    body.start_time
  ];

  return pool.query(
    `INSERT INTO schedule(
      id, 
      sport_id, 
      league_id,
      home_team_conference_id,
      opponent_conference_id,
      home_team_id,
      opponent_id,
      referees,
      start_time
    ) VALUES (
      $1,$2, $3, $4, $5, $6, $7, $8, $9
    ) RETURNING *`,
    values
  );
};

const updateGame = async (id, body) => {
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

  return pool.query(`UPDATE schedule SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const deleteGame = async id => {
  return pool.query(`DELETE FROM schedule WHERE id IN ($1) RETURNING *`, [id]);
};

const getAllGames = async () => {
  return pool.query(`SELECT * FROM schedule`);
};

const upsertGame = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_id,
    body.home_team_conference_id,
    body.opponent_conference_id,
    body.home_team_id,
    body.opponent_id,
    body.referees,
    body.start_time,
    body.home_team_score,
    body.opponent_team_score
  ];

  return pool.query(
    `INSERT INTO schedule(
      id,
      sport_id,
      league_id,
      home_team_conference_id,
      opponent_conference_id,
      home_team_id,
      opponent_id,
      referees,
      start_time, 
      home_team_score,
      opponent_team_score 
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    ) ON CONFLICT (id) DO UPDATE SET (
      home_team_conference_id,
      opponent_conference_id,
      home_team_id,
      opponent_id,
      referees,
      start_time,
      home_team_score,
      opponent_team_score 
    ) = (
      $4, $5, $6, $7, $8, $9, $10, $11
    ) RETURNING *`,
    values
  );
};

const getGamesPast24Hours = async () => {
  const now = moment.utc();
  const past24Hours = moment.utc().subtract(24, 'hours');

  return pool.query(
    `SELECT 
    sports.sport_espn_slug,
    leagues.league_espn_slug,
    schedule.id,
    schedule.start_time
    FROM schedule
    ${gameInnerJoins}
    WHERE schedule.start_time > '${past24Hours}'
    AND schedule.start_time < '${now}'`
  );
};

const updateGameReferees = async (scheduleId, officials) => {
  return pool.query(
    `UPDATE schedule
    SET referees = '${JSON.stringify(officials)}'
    WHERE id IN ('${scheduleId}')
    RETURNING *`
  );
};

module.exports = {
  getFavoriteGamesByUserId,
  getUserFavoriteUpcomingGames,
  getTrendingGames,
  getUpcomingGames,
  getTrendingGamesByLeagueId,
  getUpcomingGamesByLeagueId,
  getGamesByLeagueId,
  getTrendingGamesBySportId,
  getUpcomingGamesBySportId,
  getPastGames,
  getFutureGames,
  getGamesWithUserInteraction,
  getGameById,
  searchForGame,
  createGame,
  updateGame,
  deleteGame,
  getAllGames,
  upsertGame,
  getGamesPast24Hours,
  updateGameReferees,
  getGamesForUserFavoriteTeams,
  getGamesNearby
};
