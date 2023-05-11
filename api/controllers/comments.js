const Joi = require('joi');
const moment = require('moment');
const commentsModel = require('../models/comments');
const notificationService = require('../services/notifications');
const { ErrorHandler } = require('../helpers/error');

const validateCreateBody = body => {
  const schema = {
    schedule_id: Joi.string().required(),
    comment: Joi.string().allow(''),
    mentions: Joi.string()
      .optional()
      .allow(null),
    reply_to: Joi.string()
      .optional()
      .allow('', null),
    asset_type: Joi.string()
      .optional()
      .allow('', null),
    asset_url: Joi.string()
      .optional()
      .allow('', null)
  };

  return Joi.validate(body, schema);
};

const createComment = async (req, res, next) => {
  try {
    const { error } = validateCreateBody(req.body);
    if (error) throw new ErrorHandler(400, error.details);

    const { uid: user_id } = req.user;
    const { body } = req;

    const [data] = await commentsModel.createComment({ ...body, ...{ user_id } });
    if (data) {
      if (body.mentions) {
        notificationService.sendNotificationOnNewComment({
          ...body,
          ...{ user_id, commentId: data.id }
        });
      }
      return res.send(data);
    }
    throw new ErrorHandler(400, 'Error occurred creating comment.');
  } catch (err) {
    return next(err);
  }
};

const getCommentsByGame = async (req, res, next) => {
  try {
    const { scheduleId } = req.params;
    const data = await commentsModel.getCommentsByGameId(scheduleId);
    if (data.length > 0) {
      const allReplys = data.filter(comment => comment.reply_to !== null);
      const withoutReplies = data.filter(comment => comment.reply_to === null);
      const combined = withoutReplies.map(comment => {
        const commentReplies = allReplys.filter(reply => reply.reply_to === comment.id);
        // Sort by Oldest first - Newest Last
        const sortedCommentReplies = commentReplies.sort((a, b) =>
          moment(a.created_at).diff(moment(b.created_at))
        );
        return {
          ...comment,
          replies: sortedCommentReplies
        };
      });
      return res.send(combined);
    }
    return res.send([]);
  } catch (error) {
    return next(error);
  }
};

const likeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { uid: user_id } = req.user;

    const data = await commentsModel.likeComment(user_id, commentId);
    if (data.length > 0) {
      notificationService.sendNotificationOnNewLike(commentId, user_id);
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'Error liking comment.');
  } catch (error) {
    return next(error);
  }
};

const unlikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { uid: user_id } = req.user;
    const data = await commentsModel.unlikeComment(user_id, commentId);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'Error unliking comment.');
  } catch (error) {
    return next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const data = await commentsModel.deleteComment(commentId);
    if (data.length > 0) {
      return res.send(data[0]);
    }
    throw new ErrorHandler(400, 'Error deleting comment.');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByGame,
  likeComment,
  unlikeComment,
  deleteComment
};
