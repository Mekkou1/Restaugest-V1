import api from './api'

export const usersAPI = {
  // Authentication
  login: credentials => {
    console.log('Envoi des credentials:', {
      pseudo: credentials.pseudo,
      mot_de_passe: credentials.mot_de_passe
    })
    return api.post('/auth/login', {


      pseudo: credentials.pseudo,
      mot_de_passe: credentials.mot_de_passe
    })
  },
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),



  // CRUD operations
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (userData) => api.post('/api/users', userData),
  update: (id, userData) => api.put(`/api/users/${id}`, userData),
  delete: (id) => api.delete(`/api/users/${id}`)
}

export default usersAPI
