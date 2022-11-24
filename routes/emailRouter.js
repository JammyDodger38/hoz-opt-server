const express  = require('express')
const router = express.Router()
const nodemailer = require('../controllers/nodemailer')

router.post('/sendCart', nodemailer.sendCart)
router.post('/sendContacts', nodemailer.sendContacts)

module.exports = router