import { Router } from "express";
import {
  listPayments, createPayment, updatePayment, deletePayment,
} from "../controllers/payments.controller";

export const paymentsRouter = Router();

paymentsRouter.get("/", listPayments);
paymentsRouter.post("/", createPayment);
paymentsRouter.put("/:id", updatePayment);
paymentsRouter.delete("/:id", deletePayment);
