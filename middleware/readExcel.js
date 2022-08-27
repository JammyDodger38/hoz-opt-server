const path = require('path')
const {
    Type,
    SubType,
    Product
} = require('../models/models')


async function parse() {
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
    await workbook.xlsx.readFile(path.resolve(__dirname, '..', 'static', 'tempExcel', 'pricelist.xlsx'));
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
            if (tempList[id]['body'][4] === undefined) {
                tempList[id]['body'][4] = 0
            }
            if (someType.indexOf(tempType) != -1) {
                tempSubType = '-'
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

    typeList.forEach((value, index) => {
        console.log(value);
    })
}

parse()