import { Router } from "express";
import {
  listStudents, getStudent, createStudent, updateStudent, deleteStudent,
} from "../controllers/students.controller";

export const studentsRouter = Router();

studentsRouter.get("/", listStudents);
studentsRouter.get("/:id", getStudent);
studentsRouter.post("/", createStudent);
studentsRouter.put("/:id", updateStudent);
studentsRouter.delete("/:id", deleteStudent);
