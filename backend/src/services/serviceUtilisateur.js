import UtilisateurRepository from "../repositories/repositoryUtilisateur.js";
import dotenv from "dotenv";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
//import cookieParser from "cookie-parser";

import { schemaInscription } from "../validations/schemasUtilisateur.js";
// Charger les variables d'environnement
dotenv.config();

class ServiceUtilisateur {
  constructor() {
    this.utilisateurRepository = new UtilisateurRepository();
  }
  //authentification (inscription et connexion:)
  // s inscrire:
  // methode pour creer une chaine de caractere aleatoire:
  async inscrireUtilisateur(utilisateurData) {
    const { error } = schemaInscription.validate(utilisateurData);
    if (error) throw new Error(error.details[0].message);
    try {
      const utilisateurExiste =
        await this.utilisateurRepository.trouverParEmail(utilisateurData.email);

      if (utilisateurExiste)
        throw new Error(
          ` erreur : cet utilisateur existe déjà dans la base de donnée`
        );

      //etape1:hachage de mot de passe:
      utilisateurData.motDePasse = await argon2.hash(
        utilisateurData.motDePasse
      );

      const dataSaine = { ...utilisateurData };
      delete dataSaine.role;
      dataSaine.role = "user";
      const created = await this.utilisateurRepository.createUtilisateur(
        dataSaine
      );
      const safe = created?.toObject ? created.toObject() : { ...created };
      delete safe.motDePasse;
      delete safe.activationCode;
      return safe;
    } catch (err) {
      throw new Error(
        `Erreur lors de l'inscription de l'utilisateur : ${err.message}`
      );
    }
  }
  // se connecter
  async connecterUtilisateur(email, motDePasse) {
    try {
      const utilisateur = await this.utilisateurRepository.trouverParEmail(
        email,
        true
      );
      if (!utilisateur) throw new Error("Utilisateur non trouvé");

      const motDePasseValide = await argon2.verify(
        utilisateur.motDePasse,
        motDePasse
      );
      if (!motDePasseValide) throw new Error("Mot de passe incorrect");

      if (utilisateur && motDePasseValide && !utilisateur.isActif)
        throw new Error("veuillez verifier votre boite email");
      // Générer un token JWT
      // const token = jwt.sign(payload, 'votre_clé_secrète', { expiresIn: '1h' });
      const token = jwt.sign({ id: utilisateur._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      });
      /* console.info("Token généré :", token); */
      const utilisateurSafe = utilisateur?.toObject
        ? utilisateur.toObject()
        : { ...utilisateur };
      delete utilisateurSafe.motDePasse;
      delete utilisateurSafe.activationCode;

      return { utilisateur: utilisateurSafe, token };
    } catch (err) {
      throw new Error(
        `Erreur lors de la connexion de l'utilisateur : ${err.message}`
      );
    }
  }
  //---------------------------fin athentification----------------------------------------------------------------------------------------------------------------
  // Méthode pour récupérer un utilisateur par son email
  async getUtilisateurByEmail(email) {
    const utilisateur = await this.utilisateurRepository.trouverParEmail(email);
    if (!utilisateur) throw new Error("Utilisateur non trouvé");
    return utilisateur;
  }

  // Récupérer un utilisateur par son Id
  async getUtilisateurById(id) {
    try {
      return await this.utilisateurRepository.findById(id);
    } catch (err) {
      throw new Error(
        `Erreur lors de la récupération de l'utilisateur : ${err.message}`
      );
    }
  }
  // mise jour
  async updateUtilisateur(id, updateData) {
    try {
      return await this.utilisateurRepository.updateU(id, updateData);
    } catch (err) {
      throw new Error(
        `Erreur lors de la mise à jour de l'utilisateur : ${err.message}`
      );
    }
  }
  //supression:
  async deleteUtilisateur(id) {
    try {
      // Empêcher la suppression du dernier admin
      const user = await this.utilisateurRepository.findById(id);
      if (!user) throw new Error("Utilisateur non trouvé");
      if (user.role === "admin") {
        const nbAdmins = await this.utilisateurRepository.countAdmins();
        if (nbAdmins <= 1) {
          throw new Error(
            "Action refusée : vous ne pouvez pas supprimer le dernier administrateur"
          );
        }
      }
      return await this.utilisateurRepository.deleteU(id);
    } catch (err) {
      throw new Error(
        `Erreur lors de la suppression de l'utilisateur : ${err.message}`
      );
    }
  }
  /**
   * Changer le rôle d'un utilisateur (réservé admin).
   * - Valide la cible ∈ { user, partenaire, admin }
   * - Empêche de retirer le dernier admin
   * - Si promotion vers "partenaire", upsert la fiche Partenaire
   */
  async changerRoleUtilisateur(utilisateurId, roleCible) {
    const ROLES_VALIDES = new Set(["user", "partenaire", "admin"]);
    if (!ROLES_VALIDES.has(roleCible)) {
      throw new Error(
        "Rôle cible invalide. Attendus : user | partenaire | admin"
      );
    }

    const utilisateur = await this.utilisateurRepository.findById(
      utilisateurId
    );
    if (!utilisateur) {
      throw new Error("Utilisateur non trouvé");
    }

    // Garde-fou : empêcher de retirer le dernier admin
    if (utilisateur.role === "admin" && roleCible !== "admin") {
      const nbAdmins = await this.utilisateurRepository.countAdmins();
      if (nbAdmins <= 1) {
        throw new Error(
          "Action refusée : vous ne pouvez pas retirer le dernier administrateur"
        );
      }
    }

    // Appliquer le changement de rôle
    const maj = await this.utilisateurRepository.updateRole(
      utilisateurId,
      roleCible
    );

    // Effet de bord : créer la fiche Partenaire si promotion
    if (roleCible === "partenaire") {
      const Partenaire = (await import("../models/modelePartenaire.js"))
        .default;
      await Partenaire.updateOne(
        { utilisateur: maj._id },
        { $setOnInsert: { utilisateur: maj._id } },
        { upsert: true }
      );
    }

    return maj;
  }
}

export default new ServiceUtilisateur();
