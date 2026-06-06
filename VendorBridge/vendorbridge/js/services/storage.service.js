const StorageService = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  getObject: (key) => JSON.parse(localStorage.getItem(key)) || null,
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  remove: (key) => localStorage.removeItem(key),
  generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2)
};
