import Dexie from 'dexie';

export const db = new Dexie('MasterDiaryDB');

db.version(1).stores({
  projects: '++id, serverId, name, status, syncStatus', // syncStatus: 'synced', 'created', 'updated', 'deleted'
  quotes: '++id, serverId, projectId, name, status, syncStatus',
  diaries: '++id, serverId, projectId, date, syncStatus',
  syncQueue: '++id, table, itemId, action, payload, timestamp' // Queue for offline actions
});

export const addToSyncQueue = async (table, itemId, action, payload) => {
  await db.syncQueue.add({
    table,
    itemId,
    action, // 'create', 'update', 'delete'
    payload,
    timestamp: Date.now()
  });
};
