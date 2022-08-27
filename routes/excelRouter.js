const express = require('express')
const router = express.Router()
const excelController = require('../controllers/excelController')
const checkRole = require("../middleware/checkRoleMiddleware")

router.post('/', checkRole('ADMIN'), excelController.create)

module.exports = router