import EventService from "../services/eventService.js";
import bookingRepository from "../repositories/bookingRepository.js";
import mongoose from "mongoose";
//import { updateEventSchema } from "../validations/eventSchemas.js";

class EventController {
  constructor() {
    this.eventService = EventService;
  }
  // Helper: détecte correctement un admin, qu’il soit dans `role` ou dans `roles[]`
  isAdminUser = (req) => {
    const r = req?.utilisateur?.role;
    const rs = req?.utilisateur?.roles;
    const hasRole = typeof r === "string" && r.toLowerCase() === "admin";
    const hasInArray =
      Array.isArray(rs) && rs.some((x) => String(x).toLowerCase() === "admin");
    return hasRole || hasInArray;
  };

  // Créer un événement (partner ou admin)
  createEvent = async (req, res) => {
    try {
      const event = await this.eventService.createEvent({
        ...req.body,
        statut: "en_attente", // Par défaut
        createur: req.utilisateur?.id,
        // Si connecté
      });
      res.status(201).json(event);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  // Récupérer tous les événements (validés ou tout selon les rôles)
  getAllEvents = async (req, res) => {
    try {
      console.info(" Requête reçue pour getAllEvents");
      console.info(
        " Utilisateur connecté (req.utilisateur) :",
        req.utilisateur
      );

      console.info("Utilisateur courant dans getAllEvents :", req.utilisateur);

      const filter = this.isAdminUser(req) ? {} : { statut: "approuve" };
      console.info(" Filtre utilisé pour getAllEvents :", filter);

      const events = await this.eventService.getAllEvents(filter);
      console.info(" Événements retournés :", events.length);
      res.status(200).json(events);
    } catch (err) {
      console.error(" Erreur dans getAllEvents :", err.message);
      res.status(500).json({ message: err.message });
    }
  };

  // Obtenir un événement par ID (détail public ou privé)
  getEventById = async (req, res) => {
    try {
      const event = await this.eventService.getEventById(req.params.id);
      if (!event)
        return res.status(404).json({ message: "Évènement introuvable" });
      const user = req.utilisateur; // undefined si pas d'auth
      const isAdmin = this.isAdminUser(req);
      const creatorId =
        event?.createur?._id?.toString?.() ?? event?.createur?.toString?.();
      const isCreator = user && creatorId === user.id;

      if (event.statut !== "approuve" && !isAdmin && !isCreator) {
        return res.status(403).json({
          message: "Cet évènement n’est pas accessible publiquement.",
        });
      }

      res.status(200).json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // Mettre à jour un événement (par créateur ou admin)
  updateEvent = async (req, res) => {
    try {
      console.info(" Requête reçue (updateEvent) :", req.body);

      // Seul l’auteur (createur) ou admin peut modifier
      const existing = await this.eventService.getEventById(req.params.id);

      if (!existing) {
        return res.status(404).json({ message: "Événement non trouvé." });
      }

      const creatorId =
        existing?.createur?._id?.toString?.() ??
        existing?.createur?.toString?.();
      const isAdmin = this.isAdminUser(req);
      if (creatorId !== req.utilisateur.id && !isAdmin) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const updatedEvent = await this.eventService.updateEvent(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Événement non trouvé." });
      }

      res.status(200).json(updatedEvent);
    } catch (err) {
      console.error(" Erreur updateEvent :", err);
      res.status(400).json({
        message: "Erreur lors de la mise à jour de l'événement",
        error: err.message,
      });
    }
  };

  // Supprimer un événement
  deleteEvent = async (req, res) => {
    try {
      await this.eventService.deleteEvent(req.params.id);
      res.status(200).json({ message: "Évènement supprimé avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // Filtrer les événements par statut (admin)
  getEventsByStatus = async (req, res) => {
    try {
      const { status } = req.params;
      const events = await this.eventService.getEventsByStatus(status);
      res.status(200).json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  updateStatut = async (req, res) => {
    try {
      const { statut } = req.body;
      const moderateurId =
        req.utilisateur?.id ||
        new mongoose.Types.ObjectId("000000000000000000000000");
      const event = await this.eventService.updateStatut(
        req.params.id,
        statut,
        moderateurId
      );
      res.status(200).json(event);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  getPlacesRestantes = async (req, res) => {
    try {
      // 1) Récupère l’évènement pour vérifier l’accès
      const event = await this.eventService.getEventById(req.params.id);
      if (!event)
        return res.status(404).json({ message: "Évènement introuvable" });
      const user = req.utilisateur; // peut être undefined si route publique
      const isAdmin = this.isAdminUser(req);
      const creatorId =
        event?.createur?._id?.toString?.() ?? event?.createur?.toString?.();
      const isCreator = user && creatorId === user.id;
      if (event.statut !== "approuve" && !isAdmin && !isCreator) {
        return res.status(403).json({
          message: "Cet évènement n’est pas accessible publiquement.",
        });
      }
      // 2) Calcule les places restantes
      const places = await this.eventService.getPlacesRestantes(req.params.id);
      res.status(200).json({ placesRestantes: places });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  getPlacesReservees = async (req, res) => {
    try {
      const total = await bookingRepository.countReservationsByEvent(
        req.params.id
      );
      res.json({ total });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
  // GET /api/events/mine?statut=all|valide|en_attente|rejete
  getMyEvents = async (req, res) => {
    try {
      if (!req.utilisateur?.id) {
        return res.status(401).json({ message: "Authentification requise" });
      }
      const raw = String(req.query?.statut || "all").toLowerCase();
      const map = {
        valide: "approuve",
        approuve: "approuve",
        en_attente: "en_attente",
        rejete: "rejete",
        rejeté: "rejete",
        all: "all",
      };
      const statut = map[raw];
      if (!statut) {
        return res
          .status(400)
          .json({ message: "statut invalide (all|valide|en_attente|rejete)" });
      }
      const events = await this.eventService.getMyEvents(
        req.utilisateur.id,
        statut
      );
      return res.status(200).json(events);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
}

export default new EventController();
