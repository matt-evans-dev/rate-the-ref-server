const pool = require('../../config/pg-config');

const getAllTeams = async () => {
  return pool.query(
    `SELECT 
      teams.id,
      teams.espn_id,
      sports.sport_name,
      leagues.league_name,
      conferences.conference_name,
      teams.team_name,
      teams.team_logo,
      teams.city,
      teams.state
    FROM teams
    INNER JOIN sports
      ON teams.sport_id = sports.id
    INNER JOIN leagues
      ON teams.league_id = leagues.id
    INNER JOIN conferences
      ON teams.conference_id = conferences.id`
  );
};

const getTeamById = async id => {
  return pool.query(
    `SELECT 
      teams.id,
      teams.espn_id,
      sports.sport_name,
      leagues.league_name,
      conferences.conference_name,
      teams.team_name,
      teams.team_logo,
      teams.city,
      teams.state
    FROM teams
    INNER JOIN sports
      ON teams.sport_id = sports.id
    INNER JOIN leagues
      ON teams.league_id = leagues.id
    INNER JOIN conferences
      ON teams.conference_id = conferences.id
    WHERE teams.id = '${id}'`
  );
};

const getTeamByESPNData = async (leagueName, id) => {
  return pool.query(
    `SELECT 
      teams.id,
      teams.espn_id,
      teams.sport_id,
      teams.league_id,
      teams.conference_id,
      teams.team_name,
      teams.team_logo,
      teams.city,
      teams.state
    FROM teams
    INNER JOIN leagues
      ON teams.league_id = leagues.id
    WHERE teams.espn_id = ${id}
      AND leagues.league_name = '${leagueName}'`
  );
};

const getTeamByESPNIdAndLeagueId = async (leagueId, id) => {
  return pool.query(
    `SELECT 
      teams.id,
      teams.espn_id,
      teams.sport_id,
      teams.league_id,
      teams.conference_id,
      teams.team_name,
      teams.team_logo,
      teams.city,
      teams.state
    FROM teams
    INNER JOIN leagues
      ON teams.league_id = leagues.id
    WHERE teams.espn_id = ${id}
      AND leagues.id = ${leagueId}`
  );
};

const getTeamsByEntityId = async (idType, id) => {
  return pool.query(
    `SELECT 
      teams.id,
      teams.espn_id,
      sports.sport_name,
      leagues.league_name,
      leagues.league_abbreviation,
      teams.team_name,
      teams.team_logo,
      teams.city,
      teams.state,
      COUNT(DISTINCT ratings.id) AS rating_count,
      round(avg(ratings.overall_performance)::numeric, 2) as rating ,
      (SELECT conferences.conference_name FROM conferences WHERE teams.conference_id = conferences.id) as conference_name 
      FROM teams 
      INNER JOIN sports
        ON teams.sport_id = sports.id
      INNER JOIN leagues
        ON teams.league_id = leagues.id
      LEFT OUTER JOIN ratings
        ON teams.id = ratings.home_team_id 
        OR teams.id = ratings.opponent_id 
      WHERE ${idType} = '${id}' 
        AND 
        teams.team_logo IS NOT NULL 
      GROUP BY teams.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation 
      ORDER BY teams.team_name ASC`
  );
};
// ADMIN ONLY ROUTES

// NEED TO INCLUDE ESPN ID AND ID
const createTeam = async body => {
  const values = [
    body.id,
    body.sport_id,
    body.league_id,
    body.conference_id,
    body.team_name,
    body.team_display_name,
    body.team_logo,
    body.city,
    body.state,
    body.city_nickname,
    body.team_espn_slug
  ];

  return pool.query(
    `INSERT INTO teams(
      id, 
      sport_id, 
      league_id, 
      conference_id, 
      team_name,
      team_display_name,
      team_logo,
      city,
      state,
      city_nickname,
      team_espn_slug
    ) VALUES (
      $1,$2, $3, $4, $5, $6, $7, $8, $9, $10, $11
    ) RETURNING *`,
    values
  );
};

const updateTeam = async (id, body) => {
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

  return pool.query(`UPDATE teams SET ${queryString} WHERE id IN($1) RETURNING *`, values);
};

const upsertTeam = async body => {
  const values = [
    body.id,
    body.espn_id,
    body.sport_id,
    body.league_id,
    body.conference_id,
    body.team_name,
    body.team_display_name,
    body.team_logo,
    body.city,
    body.state,
    body.city_nickname,
    body.team_espn_slug,
    body.color,
    body.alternate_color,
    body.venue_id
  ];

  let toUpdate = `sport_id,
    conference_id,
    team_name,
    team_display_name,
    team_logo,
    city_nickname,
    team_espn_slug,
    color,
    alternate_color
  ) = (
    $3, $5, $6, $7, $8, $11, $12, $13, $14`;

  if (!body.conference_id) {
    toUpdate = `sport_id,
    team_name,
    team_display_name,
    team_logo,
    city,
    state,
    city_nickname,
    team_espn_slug,
    color,
    alternate_color,
    venue_id
  ) = (
    $3, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15`;
  }

  if (body.venue_id) {
    toUpdate = `sport_id,
    conference_id,
    team_name,
    team_display_name,
    team_logo,
    city,
    state,
    city_nickname,
    team_espn_slug,
    color,
    alternate_color,
    venue_id
  ) = (
    $3, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15`;
  }

  return pool.query(
    `INSERT INTO teams(
      id,
      espn_id,
      sport_id,
      league_id,
      conference_id,
      team_name,
      team_display_name,
      team_logo,
      city,
      state,
      city_nickname,
      team_espn_slug,
      color,
      alternate_color,
      venue_id
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
    ) ON CONFLICT ON CONSTRAINT uq_espn_id_league DO UPDATE SET (
      ${toUpdate}
    ) RETURNING *`,
    values
  );
};

const updateTeamVenueAndLocation = async (displayName, sportId, venue) => {
  if (venue.address) {
    const values = [venue.id, venue.address.city, venue.address.state, displayName, sportId];

    return pool.query(
      `UPDATE teams
      SET venue_id = $1,
      city = $2,
      state=$3
      WHERE team_display_name IN ($4)
      AND sport_id IN ($5)
      RETURNING *`,
      values
    );
  }
  if (venue.venue_city || venue.venue_state) {
    const values = [venue.id, venue.venue_city, venue.venue_state, displayName, sportId];

    return pool.query(
      `UPDATE teams
      SET venue_id = $1,
      city = $2,
      state=$3
      WHERE team_display_name IN ($4)
      AND sport_id IN ($5)
      RETURNING *`,
      values
    );
  }
  const values = [venue.id, displayName, sportId];

  return pool.query(
    `UPDATE teams
        SET venue_id = $1
        WHERE team_display_name IN ($2)
        AND sport_id IN ($3)
        RETURNING *`,
    values
  );
};

const deleteTeam = async id => {
  return pool.query(`DELETE FROM teams WHERE id IN ($1) RETURNING *`, [id]);
};

const getUserFavoriteTeams = userId => {
  return pool.query(
    `
    SELECT DISTINCT ON(teams.id)
      teams.*,
      sports.sport_name,
      leagues.league_name,
      leagues.league_abbreviation,
      conferences.conference_name,
      COUNT(DISTINCT ratings.id) AS rating_count,
      round(avg(ratings.overall_performance)::numeric, 2) as rating 
    FROM teams
    INNER JOIN users_favorite_teams 
      ON users_favorite_teams.user_id = '${userId}' 
    INNER JOIN sports
      ON teams.sport_id = sports.id
    INNER JOIN leagues
      ON teams.league_id = leagues.id
    LEFT OUTER JOIN conferences
      ON teams.conference_id = conferences.id 
    LEFT OUTER JOIN ratings
      ON teams.id = ratings.home_team_id 
      OR teams.id = ratings.opponent_id 
    WHERE 
    teams.id = users_favorite_teams.team_id 
    GROUP BY teams.id, sports.sport_name, leagues.league_name, leagues.league_abbreviation, conferences.conference_name
    `
  );
};

module.exports = {
  getAllTeams,
  getTeamById,
  getTeamByESPNData,
  getTeamByESPNIdAndLeagueId,
  getTeamsByEntityId,
  createTeam,
  updateTeam,
  upsertTeam,
  getUserFavoriteTeams,
  updateTeamVenueAndLocation,
  deleteTeam
};
