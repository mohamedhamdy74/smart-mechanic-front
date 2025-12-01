// New chat service using MongoDB backend
import { api } from '../lib/api';

// Create chat room ID from user IDs
export const createChatRoom = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// Send message
export const sendMessage = async (chatRoomId, receiverId, messageText) => {
  try {
    const response = await api.post('/messages', {
      chatRoomId,
      receiverId,
      messageText,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get messages for a chat room
export const getMessages = async (chatRoomId) => {
  try {
    const response = await api.get(`/messages/${chatRoomId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Get user chat rooms
export const getUserChats = async () => {
  try {
    const response = await api.get('/messages');
    return response.data.data;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (chatRoomId) => {
  try {
    const response = await api.patch(`/messages/${chatRoomId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/messages/unread/count');
    return response.data.data.unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};