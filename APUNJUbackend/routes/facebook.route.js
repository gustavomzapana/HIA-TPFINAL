const express = require('express');
const router = express.Router();
const facebookCtrl = require('../controllers/facebook.controller');

router.get('/sync', facebookCtrl.syncFacebookPosts);

module.exports = router;
