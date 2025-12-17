import { db } from '../db';
import { api } from './api';

export const syncManager = {
  init: () => {
    window.addEventListener('online', syncManager.processQueue);
    if (navigator.onLine) syncManager.processQueue();
  },

  processQueue: async () => {
    console.log('[SyncManager] Processing offline queue...');
    const queue = await db.syncQueue.orderBy('timestamp').toArray();

    for (const item of queue) {
      try {
        if (item.action === 'create') {
           const res = await api.post(`/${item.table}`, item.payload);
           // Update local record with real Server ID
           if (res.data.id) {
               await db.table(item.table).update(item.itemId, { serverId: res.data.id, syncStatus: 'synced' });
           }
        } else if (item.action === 'update') {
           const localItem = await db.table(item.table).get(item.itemId);
           // If we don't have a serverId yet (e.g. created offline), we might need to look it up or wait.
           // Assuming sequential processing handles it if created in same queue.
           const targetId = localItem?.serverId || item.payload.id;
           if (targetId) {
               await api.put(`/${item.table}/${targetId}`, item.payload);
           }
        }

        await db.syncQueue.delete(item.id);
      } catch (err) {
        console.error(`[SyncManager] Sync failed for item ${item.id}`, err);
      }
    }
  },

  // Usage: await syncManager.save('projects', projectData);
  save: async (table, data) => {
      const id = await db.table(table).add({ ...data, syncStatus: 'created' });
      await db.syncQueue.add({ table, itemId: id, action: 'create', payload: data, timestamp: Date.now() });
      if (navigator.onLine) syncManager.processQueue();
      return id;
  },
  
  update: async (table, id, data) => {
      await db.table(table).update(id, { ...data, syncStatus: 'updated' });
      await db.syncQueue.add({ table, itemId: id, action: 'update', payload: data, timestamp: Date.now() });
      if (navigator.onLine) syncManager.processQueue();
  }
};
