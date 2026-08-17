import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('pages')
    .addColumn('is_template', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .execute();

  // La liste des modeles est lue a chaque ouverture du selecteur, toujours
  // filtree sur un espace de travail : index partiel, les modeles restant
  // une fraction marginale des pages.
  await sql`
    CREATE INDEX pages_is_template_idx
    ON pages (workspace_id, space_id)
    WHERE is_template = true AND deleted_at IS NULL
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('pages_is_template_idx').ifExists().execute();
  await db.schema.alterTable('pages').dropColumn('is_template').execute();
}
