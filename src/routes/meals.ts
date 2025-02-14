import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    const meals = await knex('meals').where({ user_id: user.id })

    return {
      meals
    }
  })

  app.get('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    const meal = await knex('meals').where({ id }).first()

    if (!meal) {
      return res.status(400).send({ message: 'Meal not found' })
    }

    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    if (meal.user_id !== user.id) {
      return res.status(400).send({ message: 'Meal not found' })
    }

    return {
      meal
    }
  })

  app.post('/', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
      datetime: z.string()
    })

    const { name, description, is_on_diet, datetime } = createMealBodySchema.parse(req.body)

    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_on_diet,
      datetime,
      user_id: user.id,
    })

    return res.status(201).send()
  })

  app.put('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const updateMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      is_on_diet: z.boolean(),
      datetime: z.string(),
    })

    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { name, description, is_on_diet, datetime } = updateMealBodySchema.parse(req.body)

    const { id } = updateMealParamsSchema.parse(req.params)

    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    const meal = await knex('meals').where({ id }).first()

    if (!meal || meal.user_id !== user.id) {
      return res.status(400).send({ message: 'Meal not found' })
    }

    await knex('meals').where({ id }).update({
      name,
      description,
      is_on_diet,
      datetime,
    })

    return res.send()
  })

  app.delete('/:id', {
    preHandler: [checkSessionIdExists],
  }, async (req, res) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(req.params)

    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    const meal = await knex('meals').where({ id }).first()

    if (!meal || meal.user_id !== user.id) {
      return res.status(400).send({ message: 'Meal not found' })
    }

    await knex('meals').where({ id }).delete()

    return res.status(204).send()
  })
}