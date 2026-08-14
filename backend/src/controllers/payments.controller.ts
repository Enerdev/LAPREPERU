import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

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
  try {
    // Obtener pago anterior
    const existing = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Pago no encontrado" });

    // Actualizar el pago
    const updated = await prisma.payment.update({ where: { id: req.params.id }, data: req.body });

    // Si cambió el estado o el monto, ajustar el montoPagado del estudiante
    try {
      const student = await prisma.student.findUnique({ where: { id: updated.studentId } });
      if (student) {
        let montoPagado = student.montoPagado;
        // Si antes estaba pagado, restamos su monto
        if (existing.estado === "pagado") montoPagado -= existing.monto;
        // Si ahora está pagado, sumamos su nuevo monto
        if (updated.estado === "pagado") montoPagado += updated.monto;
        await prisma.student.update({ where: { id: student.id }, data: { montoPagado, pagado: montoPagado >= student.monto } });
      }
    } catch (e) {
      console.warn("updatePayment: could not adjust student totals", e);
    }

    res.json(updated);
  } catch (err: any) {
    console.error("updatePayment error:", err?.message ?? err);
    res.status(500).json({ error: "Error al actualizar pago" });
  }
}

// DELETE /api/payments/:id
export async function deletePayment(req: Request, res: Response) {
  try {
    const existing = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Pago no encontrado" });

    // Si el pago estaba marcado como pagado, restar del montoPagado del estudiante
    try {
      if (existing.estado === "pagado") {
        const student = await prisma.student.findUnique({ where: { id: existing.studentId } });
        if (student) {
          const nuevo = student.montoPagado - existing.monto;
          await prisma.student.update({ where: { id: student.id }, data: { montoPagado: nuevo, pagado: nuevo >= student.monto } });
        }
      }
    } catch (e) {
      console.warn("deletePayment: could not adjust student totals", e);
    }

    await prisma.payment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    console.error("deletePayment error:", err?.message ?? err);
    res.status(500).json({ error: "Error al eliminar pago" });
  }
}
