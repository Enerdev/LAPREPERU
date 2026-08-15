import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.payment.deleteMany();
  await prisma.student.deleteMany();

  const s1 = await prisma.student.create({
    data: { dni: "74521896", nombres: "Ana María", apellidos: "Torres Quispe", email: "ana.torres@email.com", telefono: "987654321", sede: "Juliaca", ciclo: "IV Ciclo", estado: "activo", fechaMatricula: new Date("2026-03-10"), pagado: true, monto: 450, montoPagado: 450 },
  });
  const s2 = await prisma.student.create({
    data: { dni: "63218745", nombres: "Carlos Eduardo", apellidos: "Mamani Flores", email: "carlos.mamani@email.com", telefono: "976543210", sede: "Puno", ciclo: "II Ciclo", estado: "activo", fechaMatricula: new Date("2026-03-12"), pagado: false, monto: 380, montoPagado: 190 },
  });
  const s3 = await prisma.student.create({
    data: { dni: "89456123", nombres: "Lucía Fernanda", apellidos: "Vargas Castro", email: "lucia.vargas@email.com", telefono: "965432109", sede: "Juliaca", ciclo: "I Ciclo", estado: "pendiente", fechaMatricula: new Date("2026-03-15"), pagado: false, monto: 380, montoPagado: 0 },
  });
  const s4 = await prisma.student.create({
    data: { dni: "52174839", nombres: "Diego Alejandro", apellidos: "Huanca Puma", email: "diego.huanca@email.com", telefono: "954321098", sede: "Puno", ciclo: "III Ciclo", estado: "activo", fechaMatricula: new Date("2026-02-28"), pagado: true, monto: 420, montoPagado: 420 },
  });
  const s5 = await prisma.student.create({
    data: { dni: "71293846", nombres: "Valeria Sofía", apellidos: "Condori Ticona", email: "valeria.condori@email.com", telefono: "943210987", sede: "Juliaca", ciclo: "Intensivo", estado: "inactivo", fechaMatricula: new Date("2026-01-20"), pagado: true, monto: 550, montoPagado: 550 },
  });
  const s6 = await prisma.student.create({
    data: { dni: "68374920", nombres: "Martín José", apellidos: "Ramos Benites", email: "martin.ramos@email.com", telefono: "932109876", sede: "Puno", ciclo: "II Ciclo", estado: "activo", fechaMatricula: new Date("2026-03-18"), pagado: false, monto: 380, montoPagado: 100 },
  });

  await prisma.payment.createMany({
    data: [
      { studentId: s1.id, concepto: "Mensualidad Marzo 2026", monto: 450, fecha: new Date("2026-03-10"), estado: "pagado", sede: "Juliaca", metodoPago: "Transferencia" },
      { studentId: s2.id, concepto: "Mensualidad Marzo 2026 (50%)", monto: 190, fecha: new Date("2026-03-12"), estado: "pagado", sede: "Puno", metodoPago: "Efectivo" },
      { studentId: s3.id, concepto: "Mensualidad Marzo 2026", monto: 380, fecha: new Date("2026-03-15"), estado: "pendiente", sede: "Juliaca", metodoPago: "-" },
      { studentId: s4.id, concepto: "Mensualidad Febrero 2026", monto: 420, fecha: new Date("2026-02-28"), estado: "pagado", sede: "Puno", metodoPago: "Yape" },
      { studentId: s6.id, concepto: "Mensualidad Marzo 2026", monto: 380, fecha: new Date("2026-03-18"), estado: "vencido", sede: "Puno", metodoPago: "-" },
    ],
  });

  console.log("✅ Base de datos poblada con datos de ejemplo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
