const pool = require('../../config/pg-config');

const upsertVenue = async body => {
  const values = [body.id, body.venue_name, body.venue_city, body.venue_state];

  if (body.venue_city === null || body.venue_state === null) {
    return pool.query(
      `INSERT INTO venue(
        id,
        venue_name
      ) VALUES (
        $1,$2
      ) ON CONFLICT (id) DO UPDATE SET (
        id,
        venue_name
      ) = (
        $1, $2
      ) RETURNING *`,
      values
    );
  }
  return pool.query(
    `INSERT INTO venue(
        id,
        venue_name,
        venue_city,
        venue_state
      ) VALUES (
        $1,$2, $3, $4
      ) ON CONFLICT (id) DO UPDATE SET (
        venue_name,
        venue_city,
        venue_state
      ) = (
        $2, $3, $4
      ) RETURNING *`,
    values
  );
};

const updateCoordinates = async body => {
  const values = [body.lat, body.lng, body.id];
  return pool.query(
    `UPDATE venue
    SET
      latitude = $1,
      longitude = $2
    WHERE id = $3
    RETURNING *`,
    values
  );
};

const getAllVenues = async () => {
  return pool.query(`SELECT * FROM venue`);
};

module.exports = {
  upsertVenue,
  updateCoordinates,
  getAllVenues
};
