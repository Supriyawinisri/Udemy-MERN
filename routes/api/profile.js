const express = require('express');
const profileRouter = express.Router();

profileRouter.get('/', (req, res) => { res.send(`Profile route`); })

module.exports = profileRouter;