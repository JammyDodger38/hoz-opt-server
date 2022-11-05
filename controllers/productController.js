const uuid = require('uuid')
const path = require('path')
const {
    Product,
    ProductInfo,
    BasketProduct
} = require('../models/models')
const ApiError = require('../error/ApiError')
const {
    unlink
} = require('fs')
const { Op } = require('sequelize')

class ProductController {
    async create(req, res, next) {
        try {
            let {
                article,
                name,
                price,
                typeId,
                subTypeId,
                info
            } = req.body

            const candidate = await Product.findOne({
                where: {
                    article
                }
            })
            if (candidate) {
                return next(ApiError.badRequest('Товар с таким артикулом уже существует!'))
            } else {
                const {
                    img
                } = req.files
                let fileName = uuid.v4() + ".jpg"
                img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const product = await Product.create({
                    article,
                    name,
                    price,
                    typeId,
                    subTypeId,
                    img: fileName
                })

                if (info) {
                    info = JSON.parse(info)
                    info.forEach(i =>
                        ProductInfo.create({
                            title: i.title,
                            description: i.description,
                            productId: product.id
                        })
                    )
                }

                return res.json(product)
            }
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {
            typeId,
            subTypeId,
            limit,
            page,
            filter
        } = req.query
        page = page || 1
        limit = limit || 9
        let offset = page * limit - limit

        let products;
        if (!typeId && !subTypeId) {
            products = await Product.findAndCountAll({
                where: {
                    [Op.or]: [
                    {
                        name: {
                        [Op.substring]: filter
                    }},
                    {
                        article: {
                            [Op.substring]: filter
                        },
                    }
                ]
                },
                limit,
                offset
            })
        }
        if (typeId && !subTypeId) {
            products = await Product.findAndCountAll({
                where: {
                    typeId,
                    name: {
                        [Op.substring]: filter
                    }
                },
                limit,
                offset
            })
        }
        if (!typeId && subTypeId) {
            products = await Product.findAndCountAll({
                where: {
                    subTypeId,
                    name: {
                        [Op.substring]: filter
                    }
                },
                limit,
                offset
            })
        }
        if (typeId && subTypeId) {
            products = await Product.findAndCountAll({
                where: {
                    typeId,
                    subTypeId,
                    name: {
                        [Op.substring]: filter
                    }
                },
                limit,
                offset
            })
        }
        return res.json(products)
    }

    async getOne(req, res) {
        const {
            id
        } = req.params

        const product = await Product.findOne({
            where: {
                id
            },
            include: [{
                model: ProductInfo,
                as: 'info'
            }]
        }, )
        return res.json(product)
    }

    async delete(req, res) {
        const {
            id
        } = req.params
        let productId = id
        const productImg = await Product.findOne({
            where: {
                id
            },
        }, )
        const product = await Product.destroy({
            where: {
                id
            },
            include: [{
                model: ProductInfo,
                as: 'info'
            }]
        })
        const productInf = await ProductInfo.destroy({
            where: {
                productId
            },
        })
        let pathFile = path.resolve(__dirname, '..', 'static', productImg.img)
        unlink(pathFile, (err) => {
            if (err) throw err;
        })
        return res.json(product)
    }
}

module.exports = new ProductController()