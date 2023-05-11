/* eslint-disable global-require */
const admin = require('firebase-admin');

const serviceAccount = require(`../firebase-admin-config.json`);

serviceAccount.private_key_id = process.env.FIREBASE_PRIVATE_KEY_ID;
serviceAccount.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
serviceAccount.client_id = process.env.FIREBASE_CLIENT_ID;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rate-the-ref.firebaseio.com'
});

module.exports = admin;
