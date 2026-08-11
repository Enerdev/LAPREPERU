import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";

const CORAL = "#e0574d";
const CORAL_LIGHT = "#fbe4e1";
const GRAY = "#555555";

function fmtDate(d: Date | null | undefined) {
  if (!d) return "";
  return d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function line(doc: PDFKit.PDFDocument, x1: number, y: number, x2: number) {
  doc.moveTo(x1, y).lineTo(x2, y).strokeColor("#000").lineWidth(0.7).stroke();
}

function labeledField(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  label: string,
  value: string
) {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(GRAY).text(label, x, y, { width: w });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#000")
    .text(value || "", x, y + 11, { width: w });
  line(doc, x, y + 24, x + w);
}

// GET /api/students/:id/ficha-matricula/pdf
export async function generateFichaMatriculaPdf(req: Request, res: Response) {
  const student = await prisma.student.findUnique({ where: { id: req.params.id } });
  if (!student) return res.status(404).json({ error: "Alumno no encontrado" });

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ficha-matricula-${student.dni}.pdf"`
  );
  doc.pipe(res);

  const pageW = doc.page.width;
  const marginX = 40;
  const contentW = pageW - marginX * 2;

  // ============ PÁGINA 1: FICHA DE MATRÍCULA ============

  // Encabezado
  doc
    .rect(0, 0, pageW, 90)
    .fill(CORAL_LIGHT);
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(CORAL)
    .text("ACADEMIA PREUNIVERSITARIA", marginX, 20, { align: "center", width: contentW });
  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(CORAL)
    .text("LAPRE PERÚ", marginX, 42, { align: "center", width: contentW });
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(GRAY)
    .text("INGENIERÍAS · BIOMÉDICAS · SOCIALES", marginX, 75, { align: "center", width: contentW });

  doc.moveDown(3);
  let y = 110;
  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .fillColor(CORAL)
    .text("FICHA DE MATRÍCULA", marginX, y, { align: "center", width: contentW });

  // Código de matrícula (5 casillas)
  y += 35;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#000").text("CÓDIGO", marginX, y);
  const codigo = (student.codigoMatricula || "").padEnd(5, " ").slice(0, 5);
  const boxSize = 26;
  let boxX = marginX;
  const codY = y + 14;
  for (let i = 0; i < 5; i++) {
    doc.rect(boxX, codY, boxSize, boxSize).strokeColor(CORAL).lineWidth(1).stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#000")
      .text(codigo[i]?.trim() || "", boxX, codY + 6, { width: boxSize, align: "center" });
    boxX += boxSize + 4;
  }

  // Datos personales
  y = codY + boxSize + 25;
  const colW = contentW / 2 - 10;
  labeledField(doc, marginX, y, contentW, "APELLIDO PATERNO", student.apellidoPaterno || "");
  y += 32;
  labeledField(doc, marginX, y, contentW, "APELLIDO MATERNO", student.apellidoMaterno || "");
  y += 32;
  labeledField(doc, marginX, y, contentW, "NOMBRES", student.nombres);
  y += 32;
  labeledField(doc, marginX, y, colW, "FECHA DE NACIMIENTO", fmtDate(student.fechaNacimiento));
  labeledField(doc, marginX + colW + 20, y, colW, "LUGAR DE NACIMIENTO", student.lugarNacimiento || "");
  y += 40;

  labeledField(
    doc,
    marginX,
    y,
    colW,
    "ESCUELA PROFESIONAL A LA QUE POSTULA",
    student.escuelaProfesional || ""
  );
  labeledField(doc, marginX + colW + 20, y, colW, "FACULTAD", student.facultad || "");
  y += 45;

  // Ciclo / Inicio / Duración / Turno
  doc.font("Helvetica-Bold").fontSize(9).fillColor(CORAL).text("CICLO / INICIO / DURACIÓN / TURNO", marginX, y);
  y += 14;
  const quadW = contentW / 4 - 8;
  const cicloVals = [student.ciclo, student.cicloInicio, student.cicloDuracion, student.cicloTurno];
  let qx = marginX;
  for (const val of cicloVals) {
    doc.rect(qx, y, quadW, 20).strokeColor("#999").lineWidth(0.7).stroke();
    doc.font("Helvetica").fontSize(9).fillColor("#000").text(val || "", qx + 4, y + 5, { width: quadW - 8 });
    qx += quadW + 10;
  }
  y += 35;

  // Domicilio / Secundaria (dos columnas)
  const boxTop = y;
  const boxH = 110;
  doc.rect(marginX, boxTop, colW, boxH).strokeColor(CORAL).lineWidth(1).stroke();
  doc.rect(marginX + colW + 20, boxTop, colW, boxH).strokeColor(CORAL).lineWidth(1).stroke();

  doc.font("Helvetica-Bold").fontSize(9).fillColor(CORAL).text("DOMICILIO", marginX + 8, boxTop + 6);
  doc.font("Helvetica-Bold").fontSize(9).fillColor(CORAL).text("EN QUÉ I.E. ESTUDIÓ LA SECUNDARIA", marginX + colW + 28, boxTop + 6, { width: colW - 16 });

  const domicilioRows: [string, string][] = [
    ["Dirección", student.direccion || ""],
    ["Distrito", student.distrito || ""],
    ["Provincia", student.provincia || ""],
    ["Departamento", student.departamento || ""],
    ["Teléfono", student.telefono || ""],
  ];
  let dy = boxTop + 24;
  for (const [label, val] of domicilioRows) {
    doc.font("Helvetica").fontSize(8).fillColor(GRAY).text(`${label}:`, marginX + 8, dy, { width: 75 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000").text(val, marginX + 85, dy, { width: colW - 95 });
    dy += 16;
  }

  const secRows: [string, string][] = [
    ["Nombre de la I.E.", student.colegioNombre || ""],
    ["Distrito", student.colegioDistrito || ""],
    ["Provincia", student.colegioProvincia || ""],
    ["Departamento", student.colegioDepartamento || ""],
    ["Año de Egreso", student.colegioAnioEgreso || ""],
  ];
  dy = boxTop + 24;
  const col2X = marginX + colW + 28;
  for (const [label, val] of secRows) {
    doc.font("Helvetica").fontSize(8).fillColor(GRAY).text(`${label}:`, col2X, dy, { width: 90 });
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#000").text(val, col2X + 95, dy, { width: colW - 105 });
    dy += 16;
  }

  y = boxTop + boxH + 20;

  // Declaración
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor("#000")
    .text(
      "Doy fe que los datos indicados en esta Ficha son reales, así mismo autorizo a la ACADEMIA PREUNIVERSITARIA LAPRE " +
        "PERÚ para que utilice los mismos incluida mi imagen para fines publicitarios en caso de haber logrado mi ingreso " +
        "a la universidad. Por lo tanto, en pleno uso de mis facultades físicas y mentales firmo al pie de la hoja.",
      marginX,
      y,
      { width: contentW, align: "justify" }
    );

  y += 60;
  doc.font("Helvetica").fontSize(9).text(`Puno, ${fmtDate(student.fechaMatricula) || "____/____/______"}`, marginX, y);

  // Firma y huella
  const sigY = y + 50;
  line(doc, marginX + 20, sigY, marginX + 220);
  doc.font("Helvetica").fontSize(8).text("Firma del Alumno", marginX + 20, sigY + 5, { width: 200, align: "center" });

  doc.rect(pageW - marginX - 110, sigY - 55, 110, 65).strokeColor("#000").lineWidth(0.7).stroke();
  doc.font("Helvetica").fontSize(8).text("Huella Digital", pageW - marginX - 110, sigY + 12, { width: 110, align: "center" });

  // ============ PÁGINA 2: CARTA DE COMPROMISO ============
  doc.addPage({ size: "A4", margin: 40 });

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(CORAL)
    .text("CARTA DE COMPROMISO", marginX, 40, { align: "center", width: contentW });

  const nombreCompleto = `${student.apellidoPaterno || ""} ${student.apellidoMaterno || ""} ${student.nombres}`.trim();
  const domicilioCompleto = [student.direccion, student.distrito, student.provincia, student.departamento]
    .filter(Boolean)
    .join(", ");

  let cy = 85;
  doc.font("Helvetica").fontSize(9.5).fillColor("#000");
  doc.text(
    `Yo ${nombreCompleto || "_________________________________"}, Alumno de la ACADEMIA PREUNIVERSITARIA LAPRE PERÚ, ` +
      `identificado con documento de identidad ${student.dni}, domiciliado en ${domicilioCompleto || "_______________________"}; ` +
      `siendo conocedor de la importancia del cumplimiento de cada una de las normas establecidas por la Academia ` +
      `Preuniversitaria LAPRE Perú me comprometo a cumplir estrictamente lo siguiente:`,
    marginX,
    cy,
    { width: contentW, align: "justify" }
  );

  cy = doc.y + 18;

  const clausulas: [string, string][] = [
    ["PRIMERO:", "Cumpliré cada uno de los puntos citados en el reglamento de la institución."],
    ["SEGUNDO:", "No faltaré a clases ni llegaré tarde por ningún motivo."],
    [
      "TERCERO:",
      "En caso de situaciones de fuerza mayor que conlleven a que llegue tarde o imposibiliten mi asistencia al dictado de clases y/o simulacros de examen, mi padre o apoderado deberá de justificar la falta cometida en el plazo de 24 horas posteriores.",
    ],
    [
      "CUARTO:",
      "De acuerdo al punto anterior, si acumulara 3 faltas o 5 tardanzas sin haber justificado las mismas y siendo conocedor que el desarrollo irregular de cada una de las materias perjudica enormemente mi preparación, aceptaré mi retiro definitivo de la institución sin derecho a reclamo alguno.",
    ],
    [
      "QUINTO:",
      "Asistiré todos los sábados a rendir cada uno de los simulacros de actividades, llegando con 30 minutos de anticipación, considerando además que la puerta del local se cerrará 10 minutos antes de dar inicio al simulacro (8:00 a.m.) permaneciendo durante 2 hrs. y media tiempo que dura el desarrollo del examen.",
    ],
    [
      "SEXTO:",
      "Los días lunes posteriores a cada simulacro asistiré a clases con 30 minutos de anticipación para identificar el grupo al que pertenezco según el puntaje alcanzado; de esta manera evitaré llegar tarde.",
    ],
    ["SÉPTIMO:", "Realizaré los pagos por concepto de Matrícula y Mensualidad en su debido momento, sin retraso alguno."],
    [
      "OCTAVO:",
      "En caso de no haber cumplido con el punto anterior, dejaré de asistir a la academia hasta haber regularizado el pago correspondiente en un plazo no mayor a 3 días, de lo contrario aceptaré ser retirado definitivamente de la institución.",
    ],
    [
      "NOVENO:",
      "En caso de no haber hecho entrega de los requisitos establecidos para realizar mi matrícula, no podré ingresar al local de clases.",
    ],
    [
      "DÉCIMO:",
      "Alcanzado mi objetivo el haber ingresado a la universidad, autorizo a la ACADEMIA PREUNIVERSITARIA LAPRE PERÚ hacer uso de mis datos personales y de mi imagen, para la realización de publicidad, así mismo me comprometo a asistir a las sesiones que se convoquen para la grabación de los spots publicitarios.",
    ],
  ];

  for (const [num, texto] of clausulas) {
    if (cy > doc.page.height - 100) {
      doc.addPage({ size: "A4", margin: 40 });
      cy = 40;
    }
    doc.font("Helvetica-Bold").fontSize(9).fillColor(CORAL).text(num, marginX, cy, { continued: true });
    doc.font("Helvetica").fillColor("#000").text("  " + texto, { width: contentW, align: "justify" });
    cy = doc.y + 8;
  }

  cy += 15;
  doc.font("Helvetica").fontSize(9).fillColor("#000").text(`Puno, ${fmtDate(student.fechaMatricula) || "____/____/______"}`, marginX, cy);

  const sig2Y = cy + 55;
  line(doc, marginX + 130, sig2Y, marginX + 330);
  doc.font("Helvetica").fontSize(8).text("Firma", marginX + 130, sig2Y + 5, { width: 200, align: "center" });
  doc.rect(pageW - marginX - 110, sig2Y - 40, 110, 60).strokeColor("#000").lineWidth(0.7).stroke();

  cy = sig2Y + 45;
  doc.font("Helvetica-Bold").fontSize(9).fillColor("#000").text("Ud. se enteró de la Academia por intermedio de:", marginX, cy);
  cy += 16;
  const opciones = [
    ["REDES SOCIALES", "redes"],
    ["RADIO", "radio"],
    ["T.V.", "tv"],
    ["Información de otra persona", "otro"],
  ];
  for (const [label, key] of opciones) {
    const checked = student.comoSeEntero === key;
    doc.rect(marginX, cy, 10, 10).strokeColor("#000").lineWidth(0.7).stroke();
    if (checked) {
      doc.font("Helvetica-Bold").fontSize(9).text("X", marginX + 1.5, cy - 1);
    }
    doc.font("Helvetica").fontSize(9).text(label, marginX + 16, cy - 1);
    if (checked && student.comoSeEnteroDetalle) {
      doc.font("Helvetica").fontSize(9).text(student.comoSeEnteroDetalle, marginX + 150, cy - 1);
    }
    cy += 18;
  }

  doc.end();
}
