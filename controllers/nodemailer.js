const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: 'blad20002000@mail.ru',
    pass: 'BXrvpSzuY5tcYpGgbZzZ',
  },
})

const createMessageCart = async (cart, numOrder) => {
  let message = ''
  let sum = 0
  let oneCost = 0
  message += 'Номер заказа:' + numOrder + '<br>'
  for (let item of cart) {
    if (item.email) {
      message += 'Email покупателя: ' + item.email + '<br>'
    } else if (item.contact) {
      message += 'Имя покупателя: ' + item.name + '<br>'
      message += 'Телефон покупателя: ' + item.contact + '<br>'
      message += 'Способ доставки: ' + item.delivery + '<br>'
      if (item.delivery === 'Доставка по Красноярску') {
        message += 'Адресс доставки: ' + item.adressDelivery + '<br>'
      }
      message += 'Способ оплаты: ' + item.pay + '<br>'
      if (item.comment !== '') {
        message += 'Комментарий: ' + item.comment + '<br>' + '<br><strong>Список товаров:</strong> <br>'
      } else {
        message += '<br><strong>Список товаров:</strong> <br>'
        message +=
          '<table style="width: 100%; border-collapse:collapse; border-spacing:0; height: auto; border: 1px solid #595959;"><thead><tr><td style="border: 1px solid #595959;min-height:35px;padding: 3px; height: 35px;"><strong>Артикул</strong></td><td style="border: 1px solid #595959;min-height:35px;padding: 3px;height: 35px;"><strong>Наименование</strong></td><td style="border: 1px solid #595959;min-height:35px;padding: 3px;height: 35px;"><strong>Кол-во</strong></td><td style="border: 1px solid #595959; min-height:35px;padding: 3px;height: 35px;"><strong>Цена</strong></td><td style="border: 1px solid #595959;min-height:35px;padding: 3px;height: 35px;"><strong>Стоимость</strong></td></tr><thead><tbody>'
      }
    } else {
      sum += item.cost
      oneCost = item.cost / item.count

      message += `<tr><td style="min-height:35px;padding: 3px; height: 35px; border: 1px solid #595959;">${item.article}</td><td style="min-height:35px;padding: 3px;height: 35px; border: 1px solid #595959;">${item.name}</td><td style="min-height:35px;padding: 3px;height: 35px; border: 1px solid #595959;">${item.count}</td><td style="min-height:35px;padding: 3px; height: 35px; border: 1px solid #595959;">${oneCost}</td><td style="min-height:35px;padding: 3px; height: 35px; border: 1px solid #595959;">${item.cost}</td></tr>`
    }
  }
  message += `<tr><td style="min-height:35px;padding: 3px; height: 35px; border: 1px solid #595959;" colspan="5"><strong>Общая сумма:</strong> ${sum}</td></tr>`
  message += '</tbody></table>'
  return String(message)
}

const createMessageContact = async contacts => {
  let message = ''
  message += 'Имя покупателя: ' + contacts.name + '<br>'
  message += 'Телефон покупателя: ' + contacts.phone + '<br>'
  message += 'Email покупателя: ' + contacts.email + '<br>'
  if (contacts.comment) {
    message += 'Комментарий покупателя: ' + contacts.comment + '<br>'
  }
  return String(message)
}

class EmailController {
  async sendCart(req, res) {
    const cart = req.body
    let numOrder = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000

    await transporter.sendMail({
      from: '"ХозОптСклад" <blad20002000@mail.ru>',
      to: 'hozoptsklad@mail.ru, hozoptsklad@mail.ru',
      subject: 'Заказ клиента',
      html: await createMessageCart(cart, numOrder),
    })

    await transporter.sendMail({
      from: '"ХозОптСклад" <blad20002000@mail.ru>',
      to: 'blad20002000@mail.ru, blad20002000@mail.ru',
      subject: 'Заказ клиента',
      html: await createMessageCart(cart, numOrder),
    })

    return res.json(numOrder)
  }

  async sendContacts(req, res) {
    const contacts = req.body

    await transporter.sendMail({
      from: '"ХозОптСклад" <blad20002000@mail.ru>',
      to: 'hozoptsklad@mail.ru, hozoptsklad@mail.ru',
      subject: 'Контакты клиента для обратной связи',
      html: await createMessageContact(contacts),
    })

    await transporter.sendMail({
      from: '"ХозОптСклад" <blad20002000@mail.ru>',
      to: 'blad20002000@mail.ru, blad20002000@mail.ru',
      subject: 'Контакты клиента для обратной связи',
      html: await createMessageContact(contacts),
    })

    return res.json('Сообщение отправлено!')
  }
}

module.exports = new EmailController()
