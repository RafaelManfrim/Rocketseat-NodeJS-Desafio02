import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (req, res) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const sessionId = randomUUID()

    res.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    })

    const { name, email } = createUserBodySchema.parse(req.body)

    const userByEmail = await knex('users').where({ email }).first()

    if (userByEmail) {
      return res.status(400).send({ message: 'User already exists' })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return res.status(201).send()
  })

  app.get('/metrics', async (req, res) => {
    const sessionId = req.cookies.sessionId

    const user = await knex('users').where({ session_id: sessionId }).first()

    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    const meals = await knex('meals').where({ user_id: user.id })

    const totalMeals = meals.length
    const totalMealsOnDiet = meals.filter(meal => meal.is_on_diet).length
    const totalMealsOutDiet = meals.filter(meal => !meal.is_on_diet).length

    const { bestSequenceOnDiet } = meals.reduce(
      (acc, currentMeal) => {
        if (currentMeal.is_on_diet) {
          acc.currentSequence++
        } else {
          acc.currentSequence = 0
        }

        if (acc.currentSequence > acc.bestSequenceOnDiet) {
          acc.bestSequenceOnDiet++
        }

        return acc
      }, {
      bestSequenceOnDiet: 0,
      currentSequence: 0
    }
    )

    return {
      metrics: {
        totalMeals,
        totalMealsOnDiet,
        totalMealsOutDiet,
        bestSequenceOnDiet
      }
    }
  })
}
