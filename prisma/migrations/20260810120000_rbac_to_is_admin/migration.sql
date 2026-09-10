-- Replace role-based admin (Role model + users.role_id) with a single
-- is_admin flag on users. Former super_admins are promoted to is_admin = true.

ALTER TABLE "users" ADD COLUMN "is_admin" BOOLEAN NOT NULL DEFAULT false;

UPDATE "users" SET "is_admin" = true
WHERE "role_id" = (SELECT "id" FROM "roles" WHERE "name" = 'super_admin');

ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

ALTER TABLE "users" DROP COLUMN "role_id";

DROP TABLE "roles";