const {
    BasketProduct,
    Product
} = require('../models/models')

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
            basketId,
            productId,
            count,
            cost
        } = req.body

        const addBasket = await BasketProduct.create({
            basketId,
            productId,
            count,
            cost
        })
        const basket = await BasketProduct.findAll({
            where: {
                basketId: basketId
            }
        },)

        const allBasketProduct = []
        const basketIdRow = []

        for (let value of basket) {
            const prod = await findProductBasket(value.productId)
            allBasketProduct.push(prod)
            basketIdRow.push({id: value.id, count: value.count, cost: value.cost})
        }

        return res.json([allBasketProduct, basketIdRow])
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

        const allBasketProduct = []
        const basketIdRow = []

        for (let value of basket) {
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
}

module.exports = new BasketController()