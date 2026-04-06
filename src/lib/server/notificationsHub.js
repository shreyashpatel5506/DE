const listenersByUser = new Map();

function ensureUserSet(userId) {
  if (!listenersByUser.has(userId)) {
    listenersByUser.set(userId, new Set());
  }
  return listenersByUser.get(userId);
}

export function subscribeUser(userId, send) {
  const bucket = ensureUserSet(userId);
  bucket.add(send);

  return () => {
    const current = listenersByUser.get(userId);
    if (!current) return;
    current.delete(send);
    if (current.size === 0) {
      listenersByUser.delete(userId);
    }
  };
}

export function notifyUser(userId, payload) {
  if (!userId) return;
  const bucket = listenersByUser.get(String(userId));
  if (!bucket || bucket.size === 0) return;

  for (const send of bucket) {
    try {
      send(payload);
    } catch {
      // ignore listener failures; cleanup happens on disconnect
    }
  }
}
