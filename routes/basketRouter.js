const express  = require('express')
const router = express.Router()
const basketController = require('../controllers/basketController')

router.post('/', basketController.create)
router.get('/', basketController.getAll)
router.delete('/', basketController.deleteOne)
router.put('/', basketController.editCount)

module.exports = router