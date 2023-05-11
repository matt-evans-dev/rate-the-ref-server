const uniqid = require('uniqid');
const pool = require('../../config/pg-config');

const createComment = async body => {
  const values = [
    uniqid(),
    body.schedule_id,
    body.user_id,
    body.comment,
    body.mentions,
    body.reply_to,
    body.asset_type,
    body.asset_url
  ];

  return pool.query(
    `INSERT INTO comments(
          id,
          schedule_id,
          user_id,
          comment,
          mentions,
          reply_to,
          asset_type,
          asset_url
        ) VALUES (
          $1,$2, $3, $4, $5, $6, $7, $8
        ) RETURNING *`,
    values
  );
};

const getCommentsByGameId = gameId => {
  return pool.query(`
    SELECT
    comments.id, comments.schedule_id, comments.comment,comments.asset_type,comments.asset_url, 
    users.id as user_id, users.display_name as user_display_name, users.profile_picture as user_profile_picture,
    comments.reply_to, comments.created_at, 
    (SELECT ratings.overall_performance FROM ratings  
        WHERE ratings.schedule_id = comments.schedule_id 
    AND ratings.user_id = comments.user_id LIMIT 1) AS user_rating,
    (SELECT users.display_name FROM users WHERE comments.mentions = users.id) as mentions,
    (SELECT array_agg(users_favorite_comments.user_id) FROM users_favorite_comments 
        WHERE comments.id = users_favorite_comments.comment_id) AS likes  
    FROM comments
    INNER JOIN users 
    ON users.id = comments.user_id 
    WHERE 
    comments.schedule_id = '${gameId}' 
    ORDER BY comments.created_at DESC
    `);
};

const likeComment = (userId, commentId) => {
  const values = [uniqid(), userId, commentId];
  return pool.query(
    `INSERT INTO users_favorite_comments(id, user_id, comment_id)
    VALUES ($1,$2, $3)
    RETURNING *`,
    values
  );
};

const unlikeComment = (userId, commentId) => {
  return pool.query(`
    DELETE FROM users_favorite_comments WHERE user_id = '${userId}' AND comment_id = '${commentId}' RETURNING *
    `);
};

const deleteComment = commentId => {
  return pool.query(`
    DELETE FROM comments WHERE id = '${commentId}' RETURNING *
    `);
};

const getCommentById = commentId => {
  return pool.query(`
  SELECT * FROM comments WHERE id = '${commentId}'`);
};

module.exports = {
  createComment,
  getCommentsByGameId,
  likeComment,
  unlikeComment,
  deleteComment,
  getCommentById
};
