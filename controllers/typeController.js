const {
    Type,
    Product
} = require('../models/models')
const ApiError = require('../error/ApiError')
const path = require('path')
const {
    unlink
} = require('fs')

class TypeController {
    async create(req, res, next) {
        const {
            name
        } = req.body
        const candidate = await Type.findOne({
            where: {
                name
            }
        })
        if (candidate) {
            return next(ApiError.badRequest('Такая категория уже существует!'))
        } else {
            const type = await Type.create({
                name
            })
            return res.json(type)
        }
    }

    async getAll(req, res) {
        const types = await Type.findAll()
        return res.json(types)
    }

    async delete(req, res) {
        const {
            id
        } = req.params
        let typeId = id
        const productImg = await Product.findAll({
            where: {
                typeId
            },
        }, )
        if (productImg.img) {
            let pathFile = path.resolve(__dirname, '..', 'static', productImg.img).toString()
            unlink(pathFile, (err) => {
                if (err) throw err;
            })
        }

        const type = await Type.destroy({
            where: {
                id
            },
        })
        return res.json(type)
    }
}

module.exports = new TypeController()