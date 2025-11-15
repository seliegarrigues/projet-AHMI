// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  inscription,
  connexion as connexionAPI,
  deconnecterUtilisateur,
  demanderReinitialisationMotDePasse,
  reinitialiserMotDePasse,
} from '@/services/serviceAuth'
import { useUtilisateurStore } from '@/stores/utilisateur'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const jeton = ref(null)
  const utilisateur = ref(null)
  const chargement = ref(false)
  const erreur = ref(null)
  const erreurChamp = ref(null)

  /* ───────── Connexion ───────── */
  const connexion = async (identifiants) => {
    chargement.value = true
    erreur.value = null
    erreurChamp.value = null

    try {
      const reponse = await connexionAPI(identifiants)

      // Token JWT en JSON
      jeton.value = reponse.data.token
      api.defaults.headers.common.Authorization = `Bearer ${jeton.value}`

      // Utilisateur connecté
      utilisateur.value = reponse.data.utilisateur

      // On met aussi à jour le store utilisateur global
      const utilisateurStore = useUtilisateurStore()
      utilisateurStore.setUtilisateur(utilisateur.value)

      // Persistance du token (pour rechargement)
      localStorage.setItem('auth_user', JSON.stringify(utilisateur.value))
      localStorage.setItem('auth_token', jeton.value)
      localStorage.setItem('token', jeton.value)

      return true // succès
    } catch (err) {
      const champ = err.response?.data?.champ || null
      erreurChamp.value = champ
      erreur.value = err.response?.data?.message || 'Erreur de connexion'
      return false //  échec
    } finally {
      chargement.value = false
    }
  }

  /* ───────── Inscription ───────── */
  const inscrire = async (donnees) => {
    chargement.value = true
    erreur.value = null
    try {
      await inscription(donnees)
    } catch (err) {
      if (err.response?.data?.champ === 'email') {
        erreurChamp.value = 'email'
      } else {
        erreurChamp.value = null
      }

      erreur.value = err.response?.data?.message || 'Erreur inscription'
    } finally {
      chargement.value = false
    }
  }

  /* ───────── Déconnexion ───────── */
  const deconnexion = async () => {
    await deconnecterUtilisateur() // invalide aussi le cookie côté back

    jeton.value = null
    utilisateur.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('auth_token') //
    localStorage.removeItem('auth_user')

    const utilisateurStore = useUtilisateurStore()
    utilisateurStore.setUtilisateur(null)

    delete api.defaults.headers.common.Authorization
  }

  /* ───────── Mot de passe oublié / reset ───────── */
  const motDePasseOublie = async (email) => await demanderReinitialisationMotDePasse(email)

  const reinitialiser = async (tokenReset, nouveauMotDePasse) =>
    await reinitialiserMotDePasse(tokenReset, nouveauMotDePasse)

  /* ───────── Simulation (dev) ─────────
  const simulerConnexion = (role = 'admin') => {
    utilisateur.value = {
      id: '64cd1f4c3b278baf7f0a6c93',
      nom: 'Admin Démo',
      email: 'admin@demo.fr',
      role,
    }
    const fakeToken = 'FAUX_TOKEN_TEST_DEV'
    jeton.value = fakeToken
    localStorage.setItem('token', fakeToken)

    const utilisateurStore = useUtilisateurStore()
    utilisateurStore.setUtilisateur(utilisateur.value)
  }

  // Auto‑login si token stocké (simulation uniquement)
  if (!utilisateur.value && localStorage.getItem('token')) {
    simulerConnexion('admin')
  } */

  // Au rechargement, si un token existe on le remonte (l’API refusera s’il est expiré)
  if (localStorage.getItem('token')) {
    const t = localStorage.getItem('token')
    jeton.value = t
    api.defaults.headers.common.Authorization = `Bearer ${t}`
  }
  return {
    jeton,
    utilisateur,
    chargement,
    erreur,
    erreurChamp,
    inscrire,
    connexion,
    deconnexion,
    motDePasseOublie,
    reinitialiser,
    //simulerConnexion,
  }
})
