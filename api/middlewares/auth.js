const firebase = require('../../config/firebase-config');
const { ErrorHandler } = require('../helpers/error');

const isAuthenticated = async (req, res, next) => {
  try {
    const user = await firebase.auth().verifyIdToken(req.headers.authorization);
    req.user = user;
    next();
  } catch (err) {
    next(new ErrorHandler(401, 'Not Authorized'));
  }
};

module.exports = {
  isAuthenticated
};
