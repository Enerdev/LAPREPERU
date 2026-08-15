import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { VALID_SEDES, ValidSede } from "./students.controller";

// GET /api/payments
export async function listPayments(req: Request, res: Response) {
  const payments = await prisma.payment.findMany({
    include: { student: true },
    orderBy: { fecha: "desc" },
  });
  res.json(payments);
}

// POST /api/payments
export async function createPayment(req: Request, res: Response) {
  const { studentId, concepto, monto, sede, metodoPago, estado } = req.body;

  if (!studentId || !concepto || monto == null || !sede) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  if (!VALID_SEDES.includes(sede as ValidSede)) {
    return res.status(400).json({ error: `Sede inválida. Solo se permiten: ${VALID_SEDES.join(", ")}` });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return res.status(404).json({ error: "Alumno no encontrado" });

  const payment = await prisma.payment.create({
    data: {
      studentId,
      concepto,
      monto: Number(monto),
      sede,
      metodoPago: metodoPago ?? "-",
      estado: estado ?? "pendiente",
    },
  });

  // Si el pago se registra como "pagado", actualizamos el monto pagado del alumno
  if (payment.estado === "pagado") {
    const nuevoMontoPagado = student.montoPagado + payment.monto;
    await prisma.student.update({
      where: { id: studentId },
      data: {
        montoPagado: nuevoMontoPagado,
        pagado: nuevoMontoPagado >= student.monto,
      },
    });
  }

  res.status(201).json(payment);
}

// PUT /api/payments/:id
export async function updatePayment(req: Request, res: Response) {
  if (req.body.sede && !VALID_SEDES.includes(req.body.sede)) {
    return res.status(400).json({ error: `Sede inválida. Solo se permiten: ${VALID_SEDES.join(", ")}` });
  }

  try {
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(payment);
  } catch {
    res.status(404).json({ error: "Pago no encontrado" });
  }
}

// DELETE /api/payments/:id
export async function deletePayment(req: Request, res: Response) {
  try {
    await prisma.payment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Pago no encontrado" });
  }
}
