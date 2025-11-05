export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/todos/',
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};