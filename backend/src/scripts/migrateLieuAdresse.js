import mongoose from "mongoose";
import dotenv from "dotenv";
import EventModel from "../models/modeleEvenement.js";

dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ahmi";

async function migrateLieuAdresse() {
  try {
    await mongoose.connect(uri);
    console.info(" Connecté à MongoDB");

    const eventsToUpdate = await EventModel.find({
      "lieu.adresse": { $exists: true, $ne: null },
    });

    console.info(`🔍 Événements à migrer : ${eventsToUpdate.length}`);

    for (const event of eventsToUpdate) {
      const adresseStr = event.lieu?.adresse;

      if (typeof adresseStr !== "string") {
        console.warn(` Adresse non valide pour l'événement ${event._id}`);
        continue;
      }

      const [ruePart, reste] = adresseStr.split(",");
      if (!ruePart || !reste) {
        console.warn(
          `Adresse mal formée pour l'événement ${event._id} : "${adresseStr}"`
        );
        continue;
      }

      const rue = ruePart.trim();
      const resteParts = reste.trim().split(" ");
      const codePostal = resteParts[0];
      const commune = resteParts.slice(1).join(" ").trim();

      event.lieu = {
        rue,
        codePostal,
        commune,
      };

      await event.save();
      console.info(` Événement mis à jour : ${event._id}`);
      await EventModel.updateOne(
        { _id: event._id },
        { $unset: { "lieu.adresse": "" } }
      );
    }

    console.info(" Migration terminée !");
  } catch (err) {
    console.error(" Erreur pendant la migration :", err);
  } finally {
    await mongoose.disconnect();
  }
}

migrateLieuAdresse();
