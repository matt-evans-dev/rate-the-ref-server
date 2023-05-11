const pool = require('../../config/pg-config');

const upsertRefereeRole = async body => {
  const values = [body.id, body.referee_role_name];

  return pool.query(
    `INSERT INTO referee_roles(
      id,
      referee_role_name
    ) VALUES (
      $1, $2
    ) ON CONFLICT (id) DO UPDATE SET
      referee_role_name = $2
    RETURNING *`,
    values
  );
};

module.exports = {
  upsertRefereeRole
};
