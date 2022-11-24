const uuid = require('uuid')
const path = require('path')
const createError = require('http-errors')
const {
    Product,
    ProductInfo,
    Type,
    SubType
} = require('../models/models')
const ApiError = require('../error/ApiError')
const {
    unlink
} = require('fs/promises')
const { Op } = require('sequelize')

const parse = async (fileName) => {
    let someType = ['Пиротехника', 'Новогодние товары', 'Прочее', 'Стеллажи металлические']
    let tempList = []

    let typeList = []
    let subTypeList = []
    let productList = []

    let typeIdList = []
    let subTypeIdList = []
    let productIdList = []

    let tempType = ''
    let tempSubType = ''

    const xl = require('exceljs');
    const workbook = new xl.Workbook();
    await workbook.xlsx.readFile(fileName);
    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow({
        includeEmpty: false
    }, (row, rowNumber) => {

        if (rowNumber > 15 && rowNumber < worksheet.rowCount - 14) {
            tempList.push({
                index: rowNumber,
                body: row.values
            })
        }
    })

    tempList.forEach((value, id) => {
        if (value['body'].length == 4) {
            if (tempList[id + 1]['body'].length != 9) {
                typeList.push(tempList[id]['body'][3])

                tempType = tempList[id]['body'][3]
                tempSubType = tempList[id + 1]['body'][3]

                subTypeList.push({
                    nameType: tempType,
                    nameSubType: tempList[id + 1]['body'][3]
                })
            } else if (tempList[id + 1]['body'].length == 9 && tempList[id - 1]['body'].length == 9) {
                if (someType.indexOf(tempList[id]['body'][3]) != -1) {
                    typeList.push(tempList[id]['body'][3])
                    tempType = tempList[id]['body'][3]
                } else {
                    tempSubType = tempList[id]['body'][3]
                    subTypeList.push({
                        nameType: tempType,
                        nameSubType: tempList[id]['body'][3]
                    })
                }
            }

        } else if (value['body'].length == 9) {
            if (someType.indexOf(tempType) != -1) {
                tempSubType = '-'
            }
            if (tempList[id]['body'][4] === undefined) {
                tempList[id]['body'][4] = 0
            }
            productList.push({
                article: tempList[id]['body'][2],
                name: tempList[id]['body'][3],
                cost: tempList[id]['body'][4],
                img: tempList[id]['body'][6],
                type: tempType,
                subType: tempSubType,
            })
        }
    })

    return {
        typeList: typeList,
        subTypeList: subTypeList,
        productList: productList
    }
}

const addType = async (name) => {
    let type
    try {
        type = await Type.create({
            name
        })
    } catch (err) {}
    return type
}

const addSubType = async (name, typeId) => {
    let subType
    try {
        subType = await SubType.create({
            name,
            typeId
        })
    } catch (err) {}
    return subType
}

const addProduct = async (article, name, price, typeId, subTypeId, fileName, availability) => {
    let product
    if (subTypeId != '-') {
        product = await Product.create({
            article,
            name,
            price,
            typeId,
            subTypeId,
            img: fileName,
            availability
        })
        return product
    } else {
        subTypeId = null
        product = await Product.create({
            article,
            name,
            price,
            typeId,
            subTypeId,
            img: fileName,
            availability
        })
    }

    return product
}

class ExcelController {

    async create(req, res, next) {
        let pathFile

        try {
            const {
                excel
            } = req.files
            let fileName = uuid.v4() + ".xlsx"
            await excel.mv(path.resolve(__dirname, '..', 'static', 'tempExcel', fileName))

            let {
                typeList,
                subTypeList,
                productList
            } = await parse(path.resolve(__dirname, '..', 'static', 'tempExcel', fileName))

            if (typeList && subTypeList && productList) {
                pathFile = path.resolve(__dirname, '..', 'static', 'tempExcel', fileName)
                unlink(pathFile, (err) => {
                    if (err) throw err;
                })
            }

            let type
            let tempType = ''
            let tempSubType = ''
            let typeId
            let subTypeId
            let someType = ['Пиротехника', 'Новогодние товары', 'Прочее', 'Стеллажи металлические']


            for (let nameType of typeList) {
                let name = nameType

                const candidateType = await Type.findOne({
                    where: {
                        name
                    }
                })
                if (!candidateType) {
                    type = await addType(nameType)
                    tempType = nameType
                    typeId = type.id
                } else {
                    tempType = candidateType.name
                    typeId = candidateType.id
                }
                if (someType.indexOf(tempType) == -1) {
                    let filterSubType = subTypeList.filter(item => item['nameType'] == tempType)

                    for (let nameSubType of filterSubType) {

                        name = nameSubType['nameSubType']
                        const candidateSubType = await SubType.findOne({
                            where: {
                                name
                            }
                        })
                        let subType
                        if (!candidateSubType) {
                            subType = await addSubType(nameSubType['nameSubType'], typeId)
                            tempSubType = nameSubType['nameSubType']
                            subTypeId = subType.id
                        } else {
                            tempSubType = candidateSubType['name']
                            subTypeId = candidateSubType['id']
                        }

                        let filterProduct = productList.filter(item => item['type'] == tempType && item['subType'] == tempSubType)

                        const changeAvailability = await Product.update(
                            {
                                availability: false,
                            },
                            {
                                where: {
                                    [Op.and]: [
                                        {
                                            typeId: typeId
                                        },
                                        {
                                            subTypeId: subTypeId
                                        }
                                    ]
                                }
                            }
                        )

                        for (let productObj of filterProduct) {
                            name = productObj['name']
                            const candidateProduct = await Product.findOne({
                                where: {
                                    name
                                }
                            })
                            if (!candidateProduct) {
                                if (productObj['img'] == undefined) {
                                    productObj['img'] = {
                                        hyperlink: 'NONE'
                                    }
                                }
                                fileName = productObj['img']['hyperlink']

                                let product
                                product = await addProduct(productObj['article'], productObj['name'], productObj['cost'], typeId, subTypeId, fileName, true)

                            } else {
                                const changeAvailability = await Product.update(
                                    {
                                        availability: true,
                                    },
                                    {
                                        where: {
                                            [Op.and]: [
                                                {
                                                    article: productObj['article']
                                                },
                                                {
                                                    name: productObj['name']
                                                }
                                            ]
                                        }
                                    }
                                )
                            }
                        }
                    }
                } else if (someType.indexOf(tempType) != -1) {
                    let filterProduct = productList.filter(item => item['type'] == tempType && item['subType'] == '-')

                    const changeAvailability = await Product.update(
                        {
                            availability: false,
                        },
                        {
                            where: {
                                [Op.and]: [
                                    {
                                        typeId: typeId
                                    }
                                ]
                            }
                        }
                    )

                    for (let productObj of filterProduct) {
                        name = productObj['name']
                        const candidateProduct = await Product.findOne({
                            where: {
                                name
                            }
                        })
                        if (!candidateProduct) {
                            if (productObj['img'] == undefined) {
                                productObj['img'] = {
                                    hyperlink: 'NONE'
                                }
                            }
                            fileName = productObj['img']['hyperlink']

                            let product
                            product = await addProduct(productObj['article'], productObj['name'], productObj['cost'], typeId, productObj['subType'], fileName, true)
                        } else {
                            const changeAvailability = await Product.update(
                                {
                                    availability: true,
                                },
                                {
                                    where: {
                                        [Op.and]: [
                                            {
                                                article: productObj['article']
                                            },
                                            {
                                                name: productObj['name']
                                            }
                                        ]
                                    }
                                }
                            )
                        }
                    }
                }


            }

            return res.json("tempArr")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new ExcelController()