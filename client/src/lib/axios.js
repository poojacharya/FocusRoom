import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // needed once the Auth feature adds cookie-based refresh tokens
})
