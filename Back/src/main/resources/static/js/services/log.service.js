const LogService = {
  getAll: () => StorageService.get('activityLogs').sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  getRecent: (count = 5) => LogService.getAll().slice(0, count),
  getByModule: (module) => LogService.getAll().filter(l => l.module === module),
  add: (userId, userName, role, action, module) => {
    const logs = StorageService.get('activityLogs');
    const entry = { id: StorageService.generateId(), userId, userName, role, action, module, timestamp: new Date().toISOString() };
    logs.push(entry); StorageService.set('activityLogs', logs); return entry;
  }
};
