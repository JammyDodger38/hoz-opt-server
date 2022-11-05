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

const createMessage = async (cart) => {
  let message = ""
  for (let item of cart) {
    if (item.email) {
      message += "Email покупателя: " + item.email + "<br>" + "<strong>Список товаров:</strong> <br>"
    } else {
      message += "Артикул - " + item.article + ",<br>" + "Наименование: " + item.name + ",<br>" + "Количество: " + item.count + ",<br>" + "Стоимость: " + item.cost + "<br><hr>"
    }
  }
  return String(message)
}

class EmailController {
  async send(req, res) {
      const cart = req.body

      await transporter.sendMail({
        from: '"ХозОптСклад" <blad20002000@mail.ru>',
        to: 'blad20002000@mail.ru, blad20002000@mail.ru',
        subject: 'Заказ клиента',
        html:
        await createMessage(cart)
      })
      
      return res.json("Сообщение отправлено!")
  }
}

module.exports = new EmailController()
