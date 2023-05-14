const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Basket } = require('../models/models')

const generateJwt = (id, email, name, face, inn, opt, role) => {
  return jwt.sign(
    {
      id,
      email,
      name,
      face,
      inn,
      opt,
      role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: '24h',
    }
  )
}

class UserController {
  async registration(req, res, next) {
    const { email, password, role, name, face, inn } = req.body
    if (!email || !password) {
      return next(ApiError.badRequest('Неккоректный email или password'))
    }
    const candidate = await User.findOne({
      where: {
        email,
      },
    })
    if (candidate) {
      return next(ApiError.badRequest('Пользователь с таким email уже существует'))
    }
    const hashPassword = await bcrypt.hash(password, 5)

    let user
    if (email === 'blad20002000@mail.ru') {
      user = await User.create({
        email,
        role: 'CREATOR',
        password: hashPassword,
        name,
        face,
        inn,
        opt: 5,
      })
    } else {
      user = await User.create({
        email,
        role,
        password: hashPassword,
        name,
        face,
        inn,
        opt: 0,
      })
    }

    const basket = await Basket.create({
      userId: user.id,
    })
    const token = generateJwt(user.id, user.email, user.name, user.face, user.inn, user.opt, user.role)
    return res.json({
      token,
    })
  }

  async login(req, res, next) {
    const { email, password } = req.body
    const user = await User.findOne({
      where: {
        email,
      },
    })
    if (!user) {
      return next(ApiError.internal('Пользователь не найден. Зарегистрируйтесь.'))
    }
    let comparePassword = bcrypt.compareSync(password, user.password)
    if (!comparePassword) {
      return next(ApiError.internal('Указан неверный пароль'))
    }
    const token = generateJwt(user.id, user.email, user.name, user.face, user.inn, user.opt, user.role)
    return res.json({
      token,
    })
  }

  async check(req, res, next) {
    const newUser = await User.findOne({
      where: {
        id: req.user.id,
      },
    })
    const token = generateJwt(
      req.user.id,
      req.user.email,
      req.user.name,
      req.user.face,
      req.user.inn,
      newUser.opt,
      newUser.role
    )
    return res.json({
      token,
    })
  }

  async getAll(req, res, next) {
    const users = await User.findAndCountAll({
      order: [['id', 'ASC']],
    })
    return res.json(users)
  }

  async editRole(req, res, next) {
    const { id, role } = req.body
    const user = await User.update(
      {
        role: role,
      },
      {
        where: {
          id: id,
        },
      }
    )
    const users = await User.findAndCountAll()
    return res.json(users)
  }

  async editOpt(req, res, next) {
    const { id, opt } = req.body
    const user = await User.update(
      {
        opt: opt,
      },
      {
        where: {
          id: id,
        },
      }
    )
    const users = await User.findAndCountAll()
    return res.json(users)
  }
}

module.exports = new UserController()
