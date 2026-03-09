const onlineUsers = new Map<string, string>();

export const addOnlineUser = (userId: string, socketId: string) => {
  onlineUsers.set(userId, socketId);
};

export const removeOnlineUser = (userId: string) => {
  onlineUsers.delete(userId);
};

export const isUserOnline = (userId: string) => {
  return onlineUsers.has(userId);
};

export const getOnlineUsers = () => {
  return onlineUsers;
};