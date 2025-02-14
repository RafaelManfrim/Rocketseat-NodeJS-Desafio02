// eslint-disable-next-line
import { Knex } from "knex";

declare module 'knex/types/tables' {
  export interface Users {
    id: string
    session_id: string
    name: string
    email: string
    timestamp: string
  }

  export interface Meals {
    id: string
    name: string
    description: string
    is_on_diet: boolean
    datetime: string
    created_at: string
    user_id: string
  }

  export interface Tables {
    users: Users
    meals: Meals
  }
}