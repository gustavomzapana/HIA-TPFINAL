const autenticacionCtrl = require('../controllers/autenticacion.controller');
const express = require("express");

const router = express.Router();

router.post('/login/google', autenticacionCtrl.loginWithGoogle);

module.exports = router;