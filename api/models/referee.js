const pool = require('../../config/pg-config');

const upsertReferee = async body => {
  const values = [body.id, body.first_name, body.last_name];

  return pool.query(
    `INSERT INTO referees(
      id,
      first_name,
      last_name
    ) VALUES (
      $1, $2, $3
    ) ON CONFLICT ON CONSTRAINT uq_f_name_l_name DO UPDATE SET (
      first_name,
      last_name
    ) = (
      $2, $3
    ) RETURNING *`,
    values
  );
};

module.exports = {
  upsertReferee
};
