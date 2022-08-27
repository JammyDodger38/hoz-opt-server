const sequelize = require('../db')
const {
    DataTypes
} = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: "USER"
    },
})

const Basket = sequelize.define('basket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
})

const BasketProduct = sequelize.define('basket_product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
})

const Product = sequelize.define('product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    article: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    img: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

const Type = sequelize.define('type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
})

const SubType = sequelize.define('sub_type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false
    },
})

const ProductInfo = sequelize.define('product_info', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

User.hasOne(Basket)
Basket.belongsTo(User)

Basket.hasMany(BasketProduct, {
    onDelete: "cascade"
})
BasketProduct.belongsTo(Basket)

Type.hasMany(Product, {
    onDelete: "cascade"
})
Product.belongsTo(Type)

SubType.hasMany(Product, {
    onDelete: "cascade"
})
Product.belongsTo(SubType)

Product.hasMany(BasketProduct, {
    onDelete: "cascade"
})
BasketProduct.belongsTo(Product)

Product.hasMany(ProductInfo, {
    as: 'info',
    onDelete: "cascade"
})
ProductInfo.belongsTo(Product)

Type.hasMany(SubType, {
    onDelete: "cascade"
})
SubType.belongsTo(Type)

module.exports = {
    User,
    Basket,
    BasketProduct,
    Product,
    Type,
    SubType,
    ProductInfo,
}