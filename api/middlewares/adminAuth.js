const { ErrorHandler } = require('../helpers/error');

const verifyAdmin = async (req, res, next) => {
  if (req.headers.authorization !== process.env.ADMIN_TOKEN) {
    const error = new ErrorHandler(401, 'Not authorized');
    return next(error);
  }

  return next();
};

module.exports = {
  verifyAdmin
};
