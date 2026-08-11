import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/students
export async function listStudents(req: Request, res: Response) {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(students);
}

// GET /api/students/:id
export async function getStudent(req: Request, res: Response) {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: { payments: true },
  });
  if (!student) return res.status(404).json({ error: "Alumno no encontrado" });
  res.json(student);
}

// POST /api/students
export async function createStudent(req: Request, res: Response) {
  const { dni, nombres, apellidos, email, telefono, sede, ciclo, monto } = req.body;

  if (!dni || !nombres || !apellidos || !email || !telefono || !sede || !ciclo || monto == null) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const student = await prisma.student.create({
      data: {
        dni, nombres, apellidos, email, telefono, sede, ciclo,
        monto: Number(monto),
        montoPagado: 0,
        estado: "pendiente",
        pagado: false,
      },
    });
    res.status(201).json(student);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con ese DNI" });
    }
    res.status(500).json({ error: "Error al crear alumno" });
  }
}

// PUT /api/students/:id
export async function updateStudent(req: Request, res: Response) {
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(student);
  } catch {
    res.status(404).json({ error: "Alumno no encontrado" });
  }
}

// DELETE /api/students/:id
export async function deleteStudent(req: Request, res: Response) {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Alumno no encontrado" });
  }
}
