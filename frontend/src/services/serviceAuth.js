import api from '@/services/api'

// ➤ Inscription d’un utilisateur
export const inscrireUtilisateur = (data) => {
  return api.post('/auth/inscription', data)
}
export const inscription = (data) => api.post('/auth/inscription', data)

// ➤ Connexion

export const connexion = (data) => api.post('/auth/connexion', data)

// ➤ Déconnexion
export const deconnecterUtilisateur = () => api.post('/auth/deconnexion')

export const motDePasseOublie = (data) => api.post('/auth/mot-de-passe-oublie', data)

// ➤ Mot de passe oublié
export const demanderReinitialisationMotDePasse = (email) => {
  console.info('POST /auth/mot-de-passe-oublie payload =', { email })
  return api.post('/auth/mot-de-passe-oublie', { email })
}

// ➤ Réinitialisation du mot de passe
export const reinitialiserMotDePasse = async (token, motDePasse, confirmationMotDePasse) => {
  try {
    return await api.post('/auth/reinitialisation-mot-de-passe', {
      token,
      motDePasse,
      confirmationMotDePasse,
    })
  } catch (err) {
    const status = err?.response?.status
    if (status === 404 || status === 405) {
      return api.post(`/auth/reinitialiser/${token}`, { motDePasse, confirmationMotDePasse })
    }
    throw err
  }
}

// activation du compte
export async function activerCompte(code) {
  return api.get(`/auth/activation/${code}`) // api = instance Axios déjà configurée
}
// ➕ Renvoi e-mail d’activation
export const renvoyerActivation = (email) => api.post('/auth/activation/resend', { email })
