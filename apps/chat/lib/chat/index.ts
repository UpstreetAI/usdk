import { openDB } from 'idb';

export const createChatIdb = async (chat: any) => {
  // Open (or create) the database
  const db = await openDB('upstreet-chat', 1, {
    upgrade(db) {
      // Create an object store for chats if it doesn't exist
      if (!db.objectStoreNames.contains('chats')) {
        db.createObjectStore('chats', { keyPath: 'id' });
      }
    },
  });

  // Get the current datetime
  const now = Date.now();

  // Get the transaction and object store
  const tx = db.transaction('chats', 'readwrite');
  const store = tx.objectStore('chats');

  // Check if the chat already exists
  const existingChat = await store.get(chat.id);

  if (existingChat) {
    // If it exists, update the lastJoined field
    existingChat.lastJoined = now;
    await store.put(existingChat);
  } else {
    // If it doesn't exist, add a new chat with savedAt and lastJoined fields
    const newChat = { ...chat, savedAt: now, lastJoined: now };
    await store.add(newChat);
  }

  // Close the transaction
  await tx.done;
};

export const getChatsIdb = async () => {
  const db = await openDB('upstreet-chat', 1, {
    upgrade(db) {
      // Create an object store for chats if it doesn't exist
      if (!db.objectStoreNames.contains('chats')) {
        db.createObjectStore('chats', { keyPath: 'id' });
      }
    },
  });

  const tx = db.transaction('chats', 'readonly');
  const store = tx.objectStore('chats');
  const allChats = await store.getAll();
  await tx.done;
  return allChats;
};
