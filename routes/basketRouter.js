const express  = require('express')
const router = express.Router()
const basketController = require('../controllers/basketController')

router.post('/', basketController.create)
router.get('/', basketController.getAll)
router.delete('/delOne', basketController.deleteOne)
router.delete('/delAll', basketController.deleteAll)
router.put('/', basketController.editCount)

module.exports = router