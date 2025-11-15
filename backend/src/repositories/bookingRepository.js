//src/repositories/bookingRepository.js
import Reservation from "../models/modeleReservation.js";
import mongoose from "mongoose";

class BookingRepository {
  // Créer une réservation
  async createBooking(bookingData) {
    try {
      console.info("Données reçues :", bookingData);
      const reservation = new Reservation(bookingData);
      return await reservation.save();
    } catch (err) {
      throw new Error(`Erreur création réservation : ${err.message}`);
    }
  }

  // Trouver une réservation par son ID
  async findById(id) {
    try {
      return await Reservation.findById(id).populate("utilisateur evenement");
    } catch (err) {
      throw new Error(`Erreur recherche réservation par ID : ${err.message}`);
    }
  }

  // Trouver toutes les réservations (optionnel : filtrer)
  async findAll(filter = {}) {
    try {
      return await Reservation.find(filter).populate("utilisateur evenement");
    } catch (err) {
      throw new Error(`Erreur récupération des réservations : ${err.message}`);
    }
  }

  // Trouver les réservations d'un utilisateur
  async findByUser(userId) {
    try {
      return await Reservation.find({ utilisateur: userId })
        .populate("evenement")
        .populate("utilisateur", "nom email");
    } catch (err) {
      throw new Error(`Erreur réservations utilisateur : ${err.message}`);
    }
  }

  // Mettre à jour une réservation
  async updateBooking(id, updateData) {
    try {
      return await Reservation.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } catch (err) {
      throw new Error(`Erreur mise à jour réservation : ${err.message}`);
    }
  }

  // Supprimer une réservation
  async deleteBooking(id) {
    try {
      return await Reservation.findByIdAndDelete(id);
    } catch (err) {
      throw new Error(`Erreur suppression réservation : ${err.message}`);
    }
  }

  // Compter les réservations confirmées pour un événement
  async countReservationsByEvent(evenementId) {
    try {
      const bookings = await Reservation.aggregate([
        {
          $match: {
            evenement: new mongoose.Types.ObjectId(evenementId),
            statut: "confirme",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$nombrePlaces" },
          },
        },
      ]);
      return bookings[0]?.total || 0;
    } catch (err) {
      throw new Error(`Erreur comptage des réservations : ${err.message}`);
    }
  }

  // Vérifier si un utilisateur a déjà réservé pour un événement
  async findBookingByUserAndEvent(userId, eventId) {
    console.info(userId, eventId);

    try {
      return await Reservation.findOne({
        utilisateur: userId,
        evenement: eventId,
      });
    } catch (err) {
      throw new Error(
        `Erreur vérification de réservation existante : ${err.message}`
      );
    }
  }
  async findByEventId(eventId) {
    try {
      return await Reservation.find({ evenement: eventId });
    } catch (err) {
      throw new Error(
        `Erreur recherche réservations par événement : ${err.message}`
      );
    }
  }
}

export default BookingRepository;
