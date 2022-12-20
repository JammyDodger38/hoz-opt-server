const nodemailer = require('nodemailer')

let transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: "blad20002000@mail.ru",
    pass: "BXrvpSzuY5tcYpGgbZzZ",
  },
})

const createMessageCart = async (cart, numOrder) => {
  let message = ""
  message += "Номер заказа:" + numOrder + "<br>"
  for (let item of cart) {
    if (item.email) {
      message += "Email покупателя: " + item.email + "<br>"
    } else if (item.contact) {
      message += "Имя покупателя: " + item.name + "<br>"
      message += "Телефон покупателя: " + item.contact + "<br>"
      message += "Способ доставки: " + item.delivery + "<br>"
      if (item.delivery === 'Доставка по Красноярску') {
        message += "Адресс доставки: " + item.adressDelivery + "<br>"
      }
      message += "Способ оплаты: " + item.pay + "<br>"
      if (item.comment !== '') {
        message += "Комментарий: " + item.comment + "<br>" + "<strong>Список товаров:</strong> <br>"
      } else {
        message += "<strong>Список товаров:</strong> <br>"
      }
    } else {
      message += "Артикул - " + item.article + ",<br>" + "Наименование: " + item.name + ",<br>" + "Количество: " + item.count + ",<br>" + "Стоимость: " + item.cost + "<br><hr>"
    }
  }
  return String(message)
}

const createMessageContact = async (contacts) => {
  let message = ""
  message += "Имя покупателя: " + contacts.name + "<br>"
  message += "Телефон покупателя: " + contacts.phone + "<br>"
  message += "Email покупателя: " + contacts.email + "<br>"
  if(contacts.comment) {
    message += "Комментарий покупателя: " + contacts.comment + "<br>"
  }
  return String(message)
}

class EmailController {
  async sendCart(req, res) {
      const cart = req.body
      let numOrder = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

      await transporter.sendMail({
        from: '"ХозОптСклад" <blad20002000@mail.ru>',
        to: 'blad20002000@mail.ru, blad20002000@mail.ru',
        subject: 'Заказ клиента',
        html:
        await createMessageCart(cart, numOrder)
      })
      
      return res.json(numOrder)
  }

  async sendContacts(req, res) {
      const contacts = req.body

      await transporter.sendMail({
        from: '"ХозОптСклад" <blad20002000@mail.ru>',
        to: 'blad20002000@mail.ru, blad20002000@mail.ru',
        subject: 'Контакты клиента для обратной связи',
        html:
        await createMessageContact(contacts)
      })
      
      return res.json("Сообщение отправлено!")
  }
}

module.exports = new EmailController()
