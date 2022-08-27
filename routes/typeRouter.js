const express  = require('express')
const router = express.Router()
const typeController = require('../controllers/typeController')
const checkRole = require("../middleware/checkRoleMiddleware")

router.post('/', checkRole('ADMIN'), typeController.create)
router.get('/', typeController.getAll)
router.delete('/:id', typeController.delete)

module.exports = router