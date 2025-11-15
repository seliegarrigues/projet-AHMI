import mongoose from "mongoose";
import dotenv from "dotenv";
import Evenement from "../models/modeleEvenement.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ahmi";

async function removeAdresseFromLieu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.info("✅ Connecté à MongoDB");

    // Filtrer les événements avec lieu.adresse
    const events = await Evenement.find({ "lieu.adresse": { $exists: true } });
    console.info(`🔍 Événements à nettoyer : ${events.length}`);

    const ids = events.map((e) => e._id);

    if (ids.length > 0) {
      const result = await Evenement.updateMany(
        { _id: { $in: ids } },
        { $unset: { "lieu.adresse": "" } }
      );

      console.info(
        `✅ Adresse supprimée pour ${result?.modifiedCount || 0} événement(s).`
      );
    } else {
      console.info("ℹ️ Aucun événement à mettre à jour.");
    }

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Erreur pendant la suppression :", err);
    process.exit(1);
  }
}

removeAdresseFromLieu();
