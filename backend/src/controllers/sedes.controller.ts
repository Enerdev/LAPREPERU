import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { VALID_SEDES, ValidSede } from "./students.controller";

export async function listSedes(req: Request, res: Response) {
  try {
    const sedes = await prisma.sede.findMany({ orderBy: { nombre: "asc" } });
    return res.json(sedes);
  } catch (err: any) {
    console.error("listSedes prisma error:", err?.message ?? err);
    // Fallback de desarrollo cuando la DB no está disponible
    return res.json([
      { id: "juliaca", nombre: "Juliaca", createdAt: new Date(), updatedAt: new Date() },
      { id: "puno", nombre: "Puno", createdAt: new Date(), updatedAt: new Date() },
    ]);
  }
}

export async function createSede(req: Request, res: Response) {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: "Nombre de sede requerido" });
  if (!VALID_SEDES.includes(nombre as ValidSede)) {
    return res.status(400).json({ error: `Sede inválida. Solo se permiten: ${VALID_SEDES.join(", ")}` });
  }
  try {
    const s = await prisma.sede.create({ data: { nombre } });
    return res.status(201).json(s);
  } catch (err: any) {
    console.error("createSede prisma error:", err?.message ?? err);
    if (err?.code === "P2002") return res.status(409).json({ error: "La sede ya existe" });
    // Si la DB no está disponible, informar al cliente
    return res.status(503).json({ error: "Servicio de base de datos no disponible. Intenta más tarde." });
  }
}

export async function deleteSede(req: Request, res: Response) {
  try {
    await prisma.sede.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (err) {
    console.error("deleteSede prisma error:", err);
    // Si la DB no responde, informar al cliente
    return res.status(503).json({ error: "Servicio de base de datos no disponible o sede no encontrada" });
  }
}
