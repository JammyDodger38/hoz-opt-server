const express = require('express')
const router = express.Router()
const productRouter = require('./productRouter')
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
const subTypeRouter = require('./subTypeRouter')
const excelRouter = require('./excelRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/subType', subTypeRouter)
router.use('/product', productRouter)
router.use('/excel', excelRouter)

module.exports = router