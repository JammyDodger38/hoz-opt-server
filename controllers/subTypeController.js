const {
    SubType
} = require('../models/models')
const ApiError = require('../error/ApiError')
const path = require('path')
const {
    unlink
} = require('fs')

class SubTypeController {
    async create(req, res, next) {
        const {
            name,
            typeId
        } = req.body
        const candidate = await SubType.findOne({
            where: {
                name
            }
        })
        if (candidate) {
            return next(ApiError.badRequest('Такая подкатегория уже существует!'))
        } else {
            const subType = await SubType.create({
                name,
                typeId
            })
            return res.json(subType)
        }
    }

    async getAll(req, res) {
        const subTypes = await SubType.findAll()
        return res.json(subTypes)
    }

    async delete(req, res) {
        const {
            id
        } = req.params
        let subTypeId = id
        const productImg = await Product.findOne({
            where: {
                subTypeId
            },
        }, )
        let pathFile = path.resolve(__dirname, '..', 'static', productImg.img)
        unlink(pathFile, (err) => {
            if (err) throw err;
        })
        const subType = await SubType.destroy({
            where: {
                id
            },
        })
        return res.json(subType)
    }
}

module.exports = new SubTypeController()