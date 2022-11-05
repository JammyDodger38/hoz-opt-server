const express = require('express')
const router = express.Router()
const productRouter = require('./productRouter')
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
const subTypeRouter = require('./subTypeRouter')
const excelRouter = require('./excelRouter')
const basketRouter = require('./basketRouter')
const emailRouter = require('./emailRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/subType', subTypeRouter)
router.use('/product', productRouter)
router.use('/excel', excelRouter)
router.use('/basket', basketRouter)
router.use('/email', emailRouter)

module.exports = router