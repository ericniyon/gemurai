/*
  Warnings:

  - You are about to drop the column `permissions` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "permissions",
DROP COLUMN "role";
