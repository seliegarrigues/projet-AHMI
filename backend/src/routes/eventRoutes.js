import express from "express";
import eventController from "../controllers/eventController.js";
import middlewareAuth from "../middlewares/middlewareAuth.js";
import checkRole from "../middlewares/middlewareCheckRole.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { vBody, vParams } from "../middlewares/middlewareValidation.js";
import {
  eventSchema as createEventSchema,
  updateEventSchema,
} from "../validations/eventSchemas.js";
import Joi from "joi";

const router = express.Router();

const statusParamSchema = Joi.object({
  status: Joi.string().valid("en_attente", "approuve", "rejete").required(),
});

// Schéma pour changer le statut
const statusUpdateSchema = Joi.object({
  statut: Joi.string().valid("en_attente", "approuve", "rejete").required(),
});

// ROUTES SPÉCIFIQUES EN PREMIER
router.get(
  "/statut/:status",
  middlewareAuth,
  checkRole("admin"),
  vParams(statusParamSchema),
  eventController.getEventsByStatus
);

router.patch(
  "/:id/statut",
  // Ordre : auth → rôle admin → validateObjectId → valider(schema) → contrôleur
  middlewareAuth,
  checkRole("admin"),
  validateObjectId,
  vBody(statusUpdateSchema),
  eventController.updateStatut
);

router.get(
  "/:id/places-restantes",
  middlewareAuth,

  validateObjectId,
  eventController.getPlacesRestantes
);

// ROUTES GÉNÉRIQUES
router.get("/", eventController.getAllEvents);

router.get("/mine", middlewareAuth, (req, res) =>
  eventController.getMyEvents(req, res)
);
router.get(
  "/:id",
  middlewareAuth,
  validateObjectId,
  eventController.getEventById
);
// CRÉATION / MÀJ / SUPPRESSION
router.post(
  "/",
  middlewareAuth,
  checkRole("admin", "partenaire"),
  vBody(createEventSchema),
  eventController.createEvent
);

router.put(
  "/:id",
  // Ordre : auth → rôle (admin|partenaire) → validateObjectId → valider(schema) → contrôleur
  middlewareAuth,
  checkRole("admin", "partenaire"),
  validateObjectId,
  vBody(updateEventSchema),
  eventController.updateEvent
);

router.delete(
  "/:id",
  // Ordre : auth → rôle admin → validateObjectId → contrôleur
  middlewareAuth,
  checkRole("admin"),
  validateObjectId,
  eventController.deleteEvent
);

export default router;
