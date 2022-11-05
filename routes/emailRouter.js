const express  = require('express')
const router = express.Router()
const nodemailer = require('../controllers/nodemailer')

router.post('/', nodemailer.send)

module.exports = router