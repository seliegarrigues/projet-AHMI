// backend/src/validations/eventSchemas.js

import Joi from "joi";

export const eventSchema = Joi.object({
  titre: Joi.string().min(3).required().messages({
    "string.empty": "Le titre est requis",
    "string.min": "Le titre doit contenir au moins 3 caractères",
  }),

  description: Joi.string().max(500).allow("").messages({
    "string.max": "La description ne peut pas dépasser 500 caractères",
  }),

  dateDebut: Joi.date().required().messages({
    "date.base": "La date de début est invalide",
    "any.required": "La date de début est requise",
  }),

  dateFin: Joi.date().greater(Joi.ref("dateDebut")).required().messages({
    "date.base": "La date de fin est invalide",
    "date.greater": "La date de fin doit être postérieure à la date de début",
    "any.required": "La date de fin est requise",
  }),

  lieu: Joi.object({
    rue: Joi.string().min(3).required().messages({
      "string.base": "La rue doit être une chaîne de caractères",
      "string.empty": "La rue est obligatoire",
    }),
    codePostal: Joi.string()
      .pattern(/^\d{5}$/)
      .required()
      .messages({
        "string.pattern.base": "Le code postal doit comporter 5 chiffres",
        "any.required": "Le code postal est requis",
      }),
    commune: Joi.string().min(2).required().messages({
      "string.empty": "La commune est requise",
    }),
    coordonnees: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional(),
    }).optional(),
  }).required(),

  capaciteMax: Joi.number().integer().positive().optional().messages({
    "number.base": "La capacité doit être un nombre",
    "number.positive": "La capacité doit être supérieure à zéro",
  }),

  imageUrl: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "L'URL de l'image est invalide",
  }),

  lienSiteInternet: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Le lien du site doit être une URL valide",
  }),

  lienInstagram: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "Le lien Instagram doit être une URL valide",
  }),

  participationFinanciere: Joi.number()
    .min(0)
    .optional()
    .allow(null, "")
    .messages({
      "number.base": "Le prix doit être un nombre",
      "number.min": "Le prix ne peut pas être négatif",
    }),

  categories: Joi.array().items(Joi.string().length(24)).optional().messages({
    "string.length": "L'identifiant de catégorie est invalide",
  }),

  organisateur: Joi.object({
    nom: Joi.string().required(),
    email: Joi.string().email().required(),
  }).required(),
});

export const updateEventSchema = Joi.object({
  // les champs autorises pour la mise à jour :
  titre: Joi.string().min(3),
  description: Joi.string().max(500).allow(""),
  dateDebut: Joi.date().iso(),
  dateFin: Joi.date().iso(),
  lieu: Joi.object({
    rue: Joi.string().min(3),
    codePostal: Joi.string().pattern(/^\d{5}$/),
    commune: Joi.string().min(2),
    coordonnees: Joi.object({
      lat: Joi.number(),
      lng: Joi.number(),
    }).optional(), //
  }).optional(),

  capaciteMax: Joi.number().min(1).optional(),

  imageUrl: Joi.string().uri().allow(""),
  lienSiteInternet: Joi.string().uri().allow(""),
  lienInstagram: Joi.string().uri().allow(""),
  participationFinanciere: Joi.number().min(0).optional().messages({
    "number.base": "Le prix doit être un nombre",
    "number.min": "Le prix ne peut pas être négatif",
  }),

  categories: Joi.array().items(Joi.string().length(24)).optional(),
  organisateur: Joi.object({
    nom: Joi.string(),
    email: Joi.string().email(),
  }),
});
console.info("Schémas Joi chargés correctement");
