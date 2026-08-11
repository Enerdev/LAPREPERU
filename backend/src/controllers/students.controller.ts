import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";

// GET /api/students/export/pdf
// Exporta la lista de alumnos matriculados/inscritos a PDF.
// Filtros opcionales por query string: ?sede=Lima&ciclo=IV%20Ciclo&estado=activo
export async function exportStudentsPdf(req: Request, res: Response) {
  const { sede, ciclo, estado } = req.query as {
    sede?: string;
    ciclo?: string;
    estado?: string;
  };

  const students = await prisma.student.findMany({
    where: {
      ...(sede ? { sede } : {}),
      ...(ciclo ? { ciclo } : {}),
      ...(estado ? { estado: estado as any } : {}),
    },
    orderBy: { apellidos: "asc" },
  });

  const doc = new PDFDocument({ size: "A4", margin: 40, layout: "landscape" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="alumnos-matriculados-${new Date().toISOString().slice(0, 10)}.pdf"`
  );
  doc.pipe(res);

  // --- Encabezado ---
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("LA PRE PERÚ — Lista de Alumnos Matriculados", { align: "center" });
  doc
    .fontSize(9)
    .font("Helvetica")
    .fillColor("#555")
    .text(
      `Generado: ${new Date().toLocaleString("es-PE")}  |  Total: ${students.length} alumno(s)` +
        (sede ? `  |  Sede: ${sede}` : "") +
        (ciclo ? `  |  Ciclo: ${ciclo}` : "") +
        (estado ? `  |  Estado: ${estado}` : ""),
      { align: "center" }
    );
  doc.moveDown(1);
  doc.fillColor("#000");

  // --- Tabla ---
  const startX = 40;
  let y = doc.y + 10;
  const rowHeight = 22;
  const cols = [
    { label: "DNI", width: 65, key: "dni" },
    { label: "Nombres y Apellidos", width: 190, key: "nombre" },
    { label: "Sede", width: 130, key: "sede" },
    { label: "Ciclo", width: 90, key: "ciclo" },
    { label: "Estado", width: 70, key: "estado" },
    { label: "Monto", width: 60, key: "monto" },
    { label: "Pagado", width: 60, key: "montoPagado" },
    { label: "F. Matrícula", width: 90, key: "fecha" },
  ];

  function drawHeader() {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#fff");
    doc.rect(startX, y, cols.reduce((a, c) => a + c.width, 0), rowHeight).fill("#1f2937");
    let x = startX;
    for (const col of cols) {
      doc.fillColor("#fff").text(col.label, x + 4, y + 6, { width: col.width - 8 });
      x += col.width;
    }
    doc.fillColor("#000");
    y += rowHeight;
  }

  drawHeader();

  doc.font("Helvetica").fontSize(8.5);
  students.forEach((s, i) => {
    if (y + rowHeight > doc.page.height - 40) {
      doc.addPage({ size: "A4", margin: 40, layout: "landscape" });
      y = 40;
      drawHeader();
      doc.font("Helvetica").fontSize(8.5);
    }

    if (i % 2 === 0) {
      doc.rect(startX, y, cols.reduce((a, c) => a + c.width, 0), rowHeight).fill("#f3f4f6");
      doc.fillColor("#000");
    }

    const row = {
      dni: s.dni,
      nombre: `${s.apellidos}, ${s.nombres}`,
      sede: s.sede,
      ciclo: s.ciclo,
      estado: s.estado,
      monto: `S/ ${s.monto.toFixed(2)}`,
      montoPagado: `S/ ${s.montoPagado.toFixed(2)}`,
      fecha: s.fechaMatricula.toLocaleDateString("es-PE"),
    };

    let x = startX;
    for (const col of cols) {
      doc.text((row as any)[col.key] ?? "-", x + 4, y + 6, {
        width: col.width - 8,
        ellipsis: true,
      });
      x += col.width;
    }
    y += rowHeight;
  });

  doc.end();
}

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
  const {
    dni, nombres, apellidos, email, telefono, sede, ciclo, monto,
    codigoMatricula, apellidoPaterno, apellidoMaterno, fechaNacimiento, lugarNacimiento,
    escuelaProfesional, facultad, cicloInicio, cicloDuracion, cicloTurno,
    direccion, distrito, provincia, departamento,
    colegioNombre, colegioDistrito, colegioProvincia, colegioDepartamento, colegioAnioEgreso,
    comoSeEntero, comoSeEnteroDetalle,
  } = req.body;

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
        codigoMatricula: codigoMatricula || undefined,
        apellidoPaterno, apellidoMaterno,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        lugarNacimiento,
        escuelaProfesional, facultad,
        cicloInicio, cicloDuracion, cicloTurno,
        direccion, distrito, provincia, departamento,
        colegioNombre, colegioDistrito, colegioProvincia, colegioDepartamento, colegioAnioEgreso,
        comoSeEntero, comoSeEnteroDetalle,
      },
    });
    res.status(201).json(student);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Ya existe un alumno con ese DNI o código de matrícula" });
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
