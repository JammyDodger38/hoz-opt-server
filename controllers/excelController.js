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
} = require('fs').promises;
const { Op } = require('sequelize')

const parse = async (fileName) => {
    let tempList = []

    let typeList = []
    let subTypeList = []
    let productList = []

    let tempType = ''
    let tempSubType = ''
    let color

    const xl = require('exceljs');
    const workbook = new xl.Workbook();
    await workbook.xlsx.readFile(fileName);
    const worksheet = workbook.getWorksheet(1);

    worksheet.eachRow({
        includeEmpty: false
    }, (row, rowNumber) => {
        
        //FF800000 красный
        //FF008000 зеленый
        color = row.getCell(3).font.color

        if (rowNumber > 15 && rowNumber < worksheet.rowCount - 14) {
            if (color === undefined) {
                tempList.push({
                    index: rowNumber,
                    body: row.values,
                    class: 'product'
                })
            } else if (color.argb === 'FF800000') {
                tempList.push({
                    index: rowNumber,
                    body: row.values,
                    class: 'type'
                })
            } else if (color.argb === 'FF008000') {
                tempList.push({
                    index: rowNumber,
                    body: row.values,
                    class: 'subType'
                })
            }
        }
    })

    tempList.forEach((value, id) => {
        if (value['class'] === "type") {

            typeList.push(tempList[id]['body'][3])
            tempType = tempList[id]['body'][3]

            tempSubType = '-'
            
        } else if (value['class'] === "subType") {
            tempSubType = tempList[id]['body'][3]
            subTypeList.push({
                nameType: tempType,
                nameSubType: tempList[id]['body'][3]
            })
        } else if (value['class'] === "product") {
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
            } else {
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

                let filterSubType = subTypeList.filter(item => item['nameType'] == tempType)

                if (filterSubType.length > 0) {
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
                                        },
                                        {
                                            handleCreate: false
                                        }
                                    ]
                                }
                            }
                        )

                        let objForCreate = []

                        let productForCreate = []
                        let productForUpdate = []

                        let allProductArticle = []
                        
                        filterProduct.forEach((productItem) => {
                            allProductArticle.push(String(productItem['article']))
                        })

                        const findCondidate = await Product.findAll({
                            where: {
                                article: {
                                    [Op.in]: allProductArticle
                                }
                            }
                        })

                        if (findCondidate) {
                            for (let product of filterProduct) {
                                if (findCondidate.some(item => item.article === String(product['article']))) {
                                    if (product['img'] == undefined) {
                                        product['img'] = {
                                            hyperlink: 'NONE'
                                        }
                                    }
                                    const fileName = product['img']['hyperlink']
    
                                    const changeAvail = await Product.update(
                                        {
                                            name: product.name,
                                            price: product.cost,
                                            img: fileName,
                                            availability: true,
                                        },
                                        {
                                            where: {
                                                article: product.article
                                            }
                                        }
                                    )
                                }
                            }
                            // findCondidate.forEach((productItem) => {
                            //     productForUpdate.push(productItem.id)
                            // })

                            // const changeAvail = await Product.update(
                            //     {
                            //         availability: true,
                            //     },
                            //     {
                            //         where: {
                            //             id: {
                            //                 [Op.in]: productForUpdate
                            //             }
                            //         }
                            //     }
                            // )

                            filterProduct.forEach((productItem) => {
                                if (!findCondidate.some(item => item.article === String(productItem['article']))) {
                                    objForCreate.push(productItem)
                                }
                            })

                        } else {
                            filterProduct.forEach((productItem) => {
                                objForCreate.push(productItem)
                            })
                        }

                        objForCreate.forEach((productItem) => {
                            if (productItem['img'] == undefined) {
                                productItem['img'] = {
                                    hyperlink: 'NONE'
                                }
                            }
                            const fileName = productItem['img']['hyperlink']
                            productForCreate.push({
                                article: productItem['article'],
                                name: productItem['name'],
                                price: productItem['cost'],
                                typeId: typeId, 
                                subTypeId: subTypeId,
                                img: fileName,
                                availability: true
                                }
                            )
                        })
                        
                        const createProd = await Product.bulkCreate(productForCreate)
                    }
                } else {
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
                                    }, 
                                    {
                                        handleCreate: false
                                    }
                                ]
                            }
                        }
                    )

                    let objForCreate = []

                    let productForCreate = []
                    let productForUpdate = []

                    let allProductArticle = []
                    
                    filterProduct.forEach((productItem) => {
                        allProductArticle.push(String(productItem['article']))
                    })

                    const findCondidate = await Product.findAll({
                        where: {
                            article: {
                                [Op.in]: allProductArticle
                            }
                        }
                    })

                    if (findCondidate) {
                        
                        for (let product of filterProduct) {
                            if (findCondidate.some(item => item.article === String(product['article']))) {
                                if (product['img'] == undefined) {
                                    product['img'] = {
                                        hyperlink: 'NONE'
                                    }
                                }
                                const fileName = product['img']['hyperlink']

                                const changeAvail = await Product.update(
                                    {
                                        name: product.name,
                                        price: product.cost,
                                        img: fileName,
                                        availability: true,
                                    },
                                    {
                                        where: {
                                            article: product.article
                                        }
                                    }
                                )
                            }
                        }

                        filterProduct.forEach((productItem) => {
                            if (!findCondidate.some(item => item.article === String(productItem['article']))) {
                                objForCreate.push(productItem)
                            }
                        })

                    } else {
                        filterProduct.forEach((productItem) => {
                            objForCreate.push(productItem)
                        })
                    }

                    objForCreate.forEach((productItem) => {
                        if (productItem['img'] == undefined) {
                            productItem['img'] = {
                                hyperlink: 'NONE'
                            }
                        }
                        const fileName = productItem['img']['hyperlink']
                        productForCreate.push({
                            article: productItem['article'],
                            name: productItem['name'],
                            price: productItem['cost'],
                            typeId: typeId, 
                            subTypeId: null,
                            img: fileName,
                            availability: true
                            }
                        )
                    })
                    
                    const createProd = await Product.bulkCreate(productForCreate)
                }


            }

            return res.json("tempArr")
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
    }
}

module.exports = new ExcelController()