const {
    BasketProduct,
    Product
} = require('../models/models')

class BasketController {
    async create(req, res) {
        const {
            basketId,
            productId
        } = req.query

        const addBasket = await BasketProduct.create({
            basketId,
            productId
        })
        const basket = await BasketProduct.findAll({
            where: {
                basketId: basketId
            }
        },)
        return basket
    }

    async getAll(req, res) {
        const {
            basketId
        } = req.query

        const basket = await BasketProduct.findAll({
            where: {
                basketId: basketId
            }
        },)
        return res.json(basket)
    }
}

module.exports = new BasketController()