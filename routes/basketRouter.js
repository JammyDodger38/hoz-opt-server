const express  = require('express')
const router = express.Router()
const basketController = require('../controllers/basketController')

router.post('/', basketController.create)
router.get('/', basketController.getAll)

module.exports = router