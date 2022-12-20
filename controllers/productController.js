const uuid = require('uuid')
const path = require('path')
const {
    Product,
    ProductInfo,
    BasketProduct,
    Type,
    SubType
} = require('../models/models')
const ApiError = require('../error/ApiError')
const {
    unlink
} = require('fs').promises;
const { Op, where } = require('sequelize')

class ProductController {
    async create(req, res, next) {
        try {
            let {
                article,
                name,
                price,
                img,
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
                // const {
                //     img
                // } = req.files
                // let fileName = uuid.v4() + ".jpg"
                // img.mv(path.resolve(__dirname, '..', 'static', fileName))
                const product = await Product.create({
                    article,
                    name,
                    price,
                    img,
                    typeId,
                    subTypeId,
                    // img: fileName,
                    availability: true,
                    handleCreate: true,
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
        let offset
        if (limit != null) {
            page = page || 1
            limit = limit || 9
            offset = page * limit - limit
        }
        

        let products;

        if (filter !== "") {
            products = await Product.findAndCountAll({
                where: {
                    [Op.or]: [
                    {
                        name: {
                        [Op.iLike]: '%' + filter + '%'
                    }},
                    {
                        article: {
                            [Op.iLike]: '%' + filter + '%'
                        },
                    }
                ]
                },
                order: [
                    ['id', 'ASC']
                ],
                limit,
                offset
            })
        } else {
            if (!typeId && !subTypeId) {
                products = await Product.findAndCountAll({
                    order:[
                        ['id', 'ASC']
                    ],
                    limit,
                    offset
                })
            }
            if (typeId && !subTypeId) {
                products = await Product.findAndCountAll({
                    where: {
                        typeId,
                    },
                    order: [
                        ['id', 'ASC']
                    ],
                    limit,
                    offset
                })
            }
            if (!typeId && subTypeId) {
                products = await Product.findAndCountAll({
                    where: {
                        subTypeId,
                    },
                    order: [
                        ['id', 'ASC']
                    ],
                    limit,
                    offset
                })
            }
            if (typeId && subTypeId) {
                products = await Product.findAndCountAll({
                    where: {
                        typeId,
                        subTypeId,
                    },
                    order: [
                        ['id', 'ASC']
                    ],
                    limit,
                    offset
                })
            }
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
        const typeName = await Type.findOne({
            where: {
                id: product.typeId
            }
        })
        const subTypeName = await SubType.findOne({
            where: {
                id: product.subTypeId
            }
        })
        return res.json({product: product, type: typeName, subType: subTypeName})
    }

    async editOne(req, res) {
        let {
            article,
            name,
            price,
            img,
            info
        } = req.body

        const editProduct = await Product.update(
            {
                name: name,
                price: price,
                img: img,
            },
            {
                where: {
                    article: article
                }
            }
        )

        const product = await Product.findOne({
            where: {
                article: article
            }
        })

        ProductInfo.destroy({
            where: {
                productId: product.id
            }
        })
        
        if (info.length > 0) {
            info = JSON.parse(info)
            info.forEach(i =>
                ProductInfo.create({
                    title: i.title,
                    description: i.description,
                    productId: product.id
                })
            )
        }

        return res.json(editProduct)
    }

    async delete(req, res) {
        const {
            id
        } = req.params
        let productId = id
        // const productImg = await Product.findOne({
        //     where: {
        //         id
        //     },
        // }, )
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
        // let pathFile = path.resolve(__dirname, '..', 'static', productImg.img)
        // unlink(pathFile, (err) => {
        //     if (err) throw err;
        // })
        return res.json(product)
    }
}

module.exports = new ProductController()