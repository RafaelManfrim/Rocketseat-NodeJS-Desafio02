import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('is_on_diet').notNullable()
    table.datetime('datetime').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user_id').references('users.id').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}

