/* eslint-disable no-console */
const admin = require('../../config/firebase-config');
const usersModel = require('../models/users');
const commentsModel = require('../models/comments');

const sendNotificationOnNewComment = async body => {
  try {
    const [replyTo] = await usersModel.getUserById(body.mentions);
    // Check if user replying to has a notification token stored.
    if (replyTo.notification_token) {
      const [replyFrom] = await usersModel.getUserById(body.user_id);
      const message = {
        notification: {
          title: `${replyFrom.display_name} replied to your comment!`
        },
        data: {
          title: `${replyFrom.display_name} replied to your comment!`,
          replyFrom: replyFrom.display_name,
          replyFromProfilePicture: replyFrom.profile_picture || '',
          scheduleId: body.schedule_id,
          parentCommentId: body.reply_to,
          commentId: body.commentId
        },
        token: replyTo.notification_token
      };
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response, message);
    } else {
      console.log('No token for user: ', replyTo.id);
    }
  } catch (error) {
    console.log(error);
  }
};

const sendNotificationOnNewLike = async (commentId, userId) => {
  try {
    const [comment] = await commentsModel.getCommentById(commentId);
    const [replyTo] = await usersModel.getUserById(comment.user_id);
    // Check if user replying to has a notification token stored.
    if (replyTo.notification_token) {
      const [replyFrom] = await usersModel.getUserById(userId);
      const message = {
        notification: {
          title: `${replyFrom.display_name} liked your comment!`
        },
        data: {
          title: `${replyFrom.display_name} liked your comment!`,
          replyFrom: replyFrom.display_name,
          replyFromProfilePicture: replyFrom.profile_picture || '',
          scheduleId: comment.schedule_id,
          parentCommentId: commentId
        },
        token: replyTo.notification_token
      };
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response, message);
    } else {
      console.log('No token for user: ', replyTo.id);
    }
  } catch (error) {
    console.log(error);
  }
};

const sendNotification = async token => {
  const registrationToken = token;

  const message = {
    notification: {
      title: `TestUser replied to your comment!`
    },
    data: {
      replyFrom: 'TestUser',
      replyFromProfilePicture: '',
      scheduleId: ''
    },
    token: registrationToken
  };

  // Send a message to the device corresponding to the provided
  // registration token.
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.log('Error sending message:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendNotificationOnNewComment,
  sendNotificationOnNewLike
};
