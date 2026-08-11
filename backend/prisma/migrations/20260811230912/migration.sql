/*
  Warnings:

  - A unique constraint covering the columns `[codigoMatricula]` on the table `students` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "students" ADD COLUMN     "apellidoMaterno" TEXT,
ADD COLUMN     "apellidoPaterno" TEXT,
ADD COLUMN     "cicloDuracion" TEXT,
ADD COLUMN     "cicloInicio" TEXT,
ADD COLUMN     "cicloTurno" TEXT,
ADD COLUMN     "codigoMatricula" TEXT,
ADD COLUMN     "colegioAnioEgreso" TEXT,
ADD COLUMN     "colegioDepartamento" TEXT,
ADD COLUMN     "colegioDistrito" TEXT,
ADD COLUMN     "colegioNombre" TEXT,
ADD COLUMN     "colegioProvincia" TEXT,
ADD COLUMN     "comoSeEntero" TEXT,
ADD COLUMN     "comoSeEnteroDetalle" TEXT,
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "direccion" TEXT,
ADD COLUMN     "distrito" TEXT,
ADD COLUMN     "escuelaProfesional" TEXT,
ADD COLUMN     "facultad" TEXT,
ADD COLUMN     "fechaNacimiento" TIMESTAMP(3),
ADD COLUMN     "lugarNacimiento" TEXT,
ADD COLUMN     "provincia" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "students_codigoMatricula_key" ON "students"("codigoMatricula");
