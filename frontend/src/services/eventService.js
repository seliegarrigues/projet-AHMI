import api from './api'

export const getEventById = (id, config = {}) => api.get(`/events/${id}`, config)

export const getCategories = (config = {}) => api.get(`/categories`, config)

export const getAllEvents = (config = {}) => api.get('/events', config)

export const createEvent = (data, config = {}) => api.post(`/events`, data, config)

export const updateEvent = (id, data, config = {}) => api.put(`/events/${id}`, data, config)

export const getPlacesRestantes = (id, config = {}) =>
  api.get(`/events/${id}/places-restantes`, config)

export const getEventsByStatus = (statut, config = {}) =>
  api.get(`/events/statut/${statut}`, config)

export const updateEventStatus = (id, status, config = {}) =>
  api.patch(`/events/${id}/statut`, { statut: status }, config)

export const deleteEvent = (id, config = {}) => api.delete(`/events/${id}`, config)

export const getMyEvents = (statut = 'all', config = {}) =>
  api.get('/events/mine', { ...config, params: { statut } })
