const mongoose = require("mongoose");
const dotenv = require("dotenv");
const argon2 = require("argon2");
const _path = require("path");

// Charger manuellement le modèle User avec require
const User = require("../models/user.model.js").default;

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.info(" Connecté à MongoDB");

    const hashedPassword = await argon2.hash("Test1234!");

    const user = new User({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      password: hashedPassword,
      telephone: "0601020304",
      adresse: {
        rue: "1 rue de Paris",
        codePostal: "75000",
        ville: "Paris",
      },
      consentementCGU: true,
      notifications: {
        newsletter: true,
        rappelEvenement: true,
      },
    });

    await user.save();
    console.info(" Utilisateur de test créé avec succès");
  } catch (error) {
    console.error(" Erreur :", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

run();
