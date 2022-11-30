const {
    BasketProduct,
    Product,
    Basket
} = require('../models/models')
const { Op } = require('sequelize')

const findProductBasket = async (productId) => {
    const any = await Product.findOne({
        where: {
            id: productId
        }
    })
    return any
}

class BasketController {
    async create(req, res) {
        const {
            userId,
            productId,
            count = 1,
            cost
        } = req.body

        const basket = await Basket.findOne({
            where: {
                userId
            }
        })

        const goodsCheck = await BasketProduct.findOne({
            where: {
                [Op.and]: [
                    {
                        basketId: basket.id
                    },
                    {
                        productId
                    }
                ]
            }
        })

        if (!goodsCheck) {
            const addBasket = await BasketProduct.create({
                basketId: basket.id,
                productId,
                count,
                cost
            })
        } else {
            const changeQuantity = await BasketProduct.update(
                {
                    count: (+goodsCheck.count + +count),
                    cost: Number(+cost + +goodsCheck.cost).toFixed(2)
                },
                {
                    where: {
                        [Op.and]: [
                            {
                                basketId: basket.id
                            },
                            {
                                productId
                            }
                        ]
                    }
                }
            )
        }

        
        const cart = await BasketProduct.findAll({
            where: {
                basketId: basket.id
            }
        },)

        const allBasketProduct = []
        const basketIdRow = []

        for (let value of cart) {
            const prod = await findProductBasket(value.productId)
            allBasketProduct.push(prod)
            basketIdRow.push({id: value.id, count: value.count, cost: value.cost})
        }

        return res.json([allBasketProduct, basketIdRow])
    }

    async getAll(req, res) {
        const {
            userId
        } = req.query

        const basket = await Basket.findOne({
            where: {
                userId
            }
        })

        const cart = await BasketProduct.findAll({
            where: {
                basketId: basket.id
            }
        },)

        const allBasketProduct = []
        const basketIdRow = []

        for (let value of cart) {
            const prod = await findProductBasket(value.productId)
            allBasketProduct.push(prod)
            basketIdRow.push({id: value.id, count: value.count, cost: value.cost})
        }

        return res.json([allBasketProduct, basketIdRow])
    }

    async deleteOne(req, res) {
        const {
            id
        } = req.query

        const deleteProd = await BasketProduct.destroy({
            where: {
                id
            }
        })

        return res.json(deleteProd)
    }

    async deleteAll(req, res) {
        const {
            userId
        } = req.query

        const basket = await Basket.findOne({
            where: {
                userId
            }
        })

        const deleteProd = await BasketProduct.destroy({
            where: {
                basketId: basket.id
            }
        })

        return res.json([], [])
    }

    async editCount(req, res) {
        const {
            userId,
            productId,
            count = 1,
        } = req.body

        const basket = await Basket.findOne({
            where: {
                userId
            }
        })

        const goodsCheck = await BasketProduct.findOne({
            where: {
                [Op.and]: [
                    {
                        basketId: basket.id
                    },
                    {
                        productId
                    }
                ]
            }
        })

        if (!goodsCheck) {
            
        } else {
            const changeQuantity = await BasketProduct.update(
                {
                    count: count,
                    cost: Number(goodsCheck.cost / goodsCheck.count * +count).toFixed(2)
                },
                {
                    where: {
                        [Op.and]: [
                            {
                                basketId: basket.id
                            },
                            {
                                productId
                            }
                        ]
                    }
                }
            )
        }

        
        const cart = await BasketProduct.findAll({
            where: {
                basketId: basket.id
            },
            order: [
                ['id', 'ASC']
            ],
        },)

        const allBasketProduct = []
        const basketIdRow = []

        for (let value of cart) {
            const prod = await findProductBasket(value.productId)
            allBasketProduct.push(prod)
            basketIdRow.push({id: value.id, count: value.count, cost: value.cost})
        }

        return res.json([allBasketProduct, basketIdRow])
    }
}

module.exports = new BasketController()