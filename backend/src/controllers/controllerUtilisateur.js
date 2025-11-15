import utilisateurService from "../services/serviceUtilisateur.js";

import { sendConfirmationEmail } from "../config/nodemailerConfig.js";
import Role from "../models/modeleRole.js";
import Utilisateur from "../models/modeleUtilisateur.js";

class ControleurUtilisateur {
  constructor() {
    this.utilisateurService = utilisateurService;
  }
  //comment s'inscrire:
  async inscrire(req, res) {
    /*  console.info(req.body.nom);
    if (!req.body.nom || !req.body.email || !req.body.motDePasse) {
      res.status(400).json(`erreur ,l'un des champ est vide`);
    } else { */

    try {
      // methode pour creer une chaine de caractere aleatoire:
      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let activationCode = "";

      for (let i = 0; i < 25; i++) {
        activationCode +=
          characters[Math.floor(Math.random() * characters.length)];
      }

      console.info(activationCode);

      const dataUtilisateur = {
        nom: req.body.nom,
        email: req.body.email,
        motDePasse: req.body.motDePasse,
        activationCode: activationCode,
      };
      const utilisateur = await this.utilisateurService.inscrireUtilisateur(
        dataUtilisateur
      );
      // --- mail d’activation ---------------------------------
      const activationUrl = `${process.env.FRONTEND_URL}/activation/${activationCode}`;
      const subject = "Bienvenue chez AHMI – activez votre compte";

      const html = `
  <h1>Bienvenue, ${dataUtilisateur.nom} 👋</h1>   <p>Merci de votre inscription ! Cliquez sur le lien suivant pour
  activer votre compte :</p>
   <p><a href="${activationUrl}">${activationUrl}</a></p>
  <p>Ce lien est valable 24 h.</p>`;

      await sendConfirmationEmail(dataUtilisateur.email, subject, html);

      res.status(201).json(utilisateur);
      console.info("l utilisateur est cree");
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
  //comment se connecter:
  async connecter(req, res) {
    // verifier si l'utilisateur existe dans le body
    if (!req.body.email || !req.body.motDePasse) {
      res.status(400).json(`erreur ,l'un des champ est vide`);
    } else {
      try {
        const { email, motDePasse } = req.body;
        const { utilisateur, token } =
          await this.utilisateurService.connecterUtilisateur(
            /* req.body.email,
          req.body.motDePasse */
            email,
            motDePasse
          );

        // Envoyer le token dans un cookie:("tokenA" cest le nom de cookie)
        res.cookie("tokenA", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          expires: new Date(Date.now() + 36000 * 1000),
        });
        res.status(200).json(utilisateur);
      } catch (err) {
        res.status(401).json({ message: err.message });
      }
    }
  }
  // Récupérer l'utilisateur connecté

  obtenirProfil = async (req, res) => {
    try {
      const utilisateur = await this.utilisateurService.getUtilisateurById(
        req.utilisateur.id
      );
      if (utilisateur?.motDePasse) delete utilisateur.motDePasse;
      res.status(200).json(utilisateur);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  };

  mettreAJourProfil = async (req, res) => {
    console.info("Reçu PUT /profil");
    ["role", "roles", "isActif", "activationCode"].forEach(
      (k) => delete req.body[k]
    );
    if (Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Aucune donnée à mettre à jour." });
    }

    try {
      const utilisateur = await this.utilisateurService.updateUtilisateur(
        req.utilisateur.id,
        req.body
      );
      if (utilisateur?.motDePasse) delete utilisateur.motDePasse;
      console.info("Données reçues :", req.body);
      res.status(200).json(utilisateur);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

  supprimerUtilisateur = async (req, res) => {
    try {
      await this.utilisateurService.deleteUtilisateur(req.params.id);
      res.status(200).json({ message: "utilisateur supprimée avec succès" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  assignerRole = async (req, res) => {
    try {
      const utilisateur = await Utilisateur.findById(req.params.id);
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const role = await Role.findOne({ nom: req.body.nom });
      if (!role) {
        return res.status(404).json({ message: "Rôle non trouvé" });
      }

      const dejaAssigne = utilisateur.roles.includes(role._id);
      if (!dejaAssigne) {
        utilisateur.roles.push(role._id);
        await utilisateur.save();
      }

      res
        .status(200)
        .json({ message: "Rôle assigné avec succès", utilisateur });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Erreur assignation rôle : " + err.message });
    }
  };
  /**
+   * PATCH /api/utilisateurs/:id/role
+   * Body: { role: "user" | "partenaire" | "admin" }
+   * Autorisation: admin (middleware)
+   */
  changerRole = async (req, res) => {
    try {
      const { role } = req.body || {};
      if (!role) {
        return res
          .status(400)
          .json({ message: "Champ 'role' requis (user|partenaire|admin)" });
      }
      const maj = await this.utilisateurService.changerRoleUtilisateur(
        req.params.id,
        role
      );
      return res
        .status(200)
        .json({ message: "Rôle mis à jour avec succès", utilisateur: maj });
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}

export default new ControleurUtilisateur();
