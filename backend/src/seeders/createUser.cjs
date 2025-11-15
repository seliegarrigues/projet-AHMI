// backend/src/seeders/createUser.cjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import argon2 from "argon2";
import db from "../config/db.js";
import Utilisateur from "../models/modeleUtilisateur.js";

dotenv.config();

await db();

async function createUser(nom, email, motDePasse, role) {
  try {
    const hash = await argon2.hash(motDePasse);

    const existing = await Utilisateur.findOne({ email });
    if (existing) {
      console.info(`ℹ️ Utilisateur déjà existant : ${email}`);
      return;
    }

    const utilisateur = new Utilisateur({
      nom,
      email,
      motDePasse: hash,
      role,
      consentementCGU: true,
    });

    await utilisateur.save();
    console.info(`Utilisateur ${role} créé et activé : ${email}`);
  } catch (e) {
    console.error(` Erreur lors de la création de ${email} :`, e.message);
  }
}

// Création des utilisateurs de test
await createUser("Admin Test", "admin@test.com", "motdepasse123", "admin");
await createUser(
  "Partenaire Test",
  "partenaire@test.com",
  "motdepasse123",
  "partenaire"
);

await mongoose.disconnect();
process.exit();
