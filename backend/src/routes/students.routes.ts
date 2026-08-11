import { Router } from "express";
import {
  listStudents, getStudent, createStudent, updateStudent, deleteStudent, exportStudentsPdf,
} from "../controllers/students.controller";
import { generateFichaMatriculaPdf } from "../controllers/ficha.controller";

export const studentsRouter = Router();

studentsRouter.get("/", listStudents);
// OJO: estas rutas van ANTES de "/:id", si no Express cree que "export" o el id son literales
studentsRouter.get("/export/pdf", exportStudentsPdf);
studentsRouter.get("/:id/ficha-matricula/pdf", generateFichaMatriculaPdf);
studentsRouter.get("/:id", getStudent);
studentsRouter.post("/", createStudent);
studentsRouter.put("/:id", updateStudent);
studentsRouter.delete("/:id", deleteStudent);
