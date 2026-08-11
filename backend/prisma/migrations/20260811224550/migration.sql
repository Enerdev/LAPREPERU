/*
  Warnings:

  - You are about to drop the `_CursoToStudent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cursos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CursoToStudent" DROP CONSTRAINT "_CursoToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_CursoToStudent" DROP CONSTRAINT "_CursoToStudent_B_fkey";

-- DropTable
DROP TABLE "_CursoToStudent";

-- DropTable
DROP TABLE "cursos";
