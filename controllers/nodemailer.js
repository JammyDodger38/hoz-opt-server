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

const createMessageCart = async (cart) => {
  let message = ""
  for (let item of cart) {
    if (item.email) {
      message += "Email покупателя: " + item.email + "<br>"
    } else if (item.contact) {
      message += "Телефон покупателя: " + item.contact + "<br>" + "<strong>Список товаров:</strong> <br>"
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

      await transporter.sendMail({
        from: '"ХозОптСклад" <blad20002000@mail.ru>',
        to: 'blad20002000@mail.ru, blad20002000@mail.ru',
        subject: 'Заказ клиента',
        html:
        await createMessageCart(cart)
      })
      
      return res.json("Сообщение отправлено!")
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
