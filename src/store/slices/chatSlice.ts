import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  id: string;
  senderId: string;
  messageText: string;
  timestamp: number;
}

interface ChatRoom {
  chatRoomId: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  messages: Message[];
}

interface ChatState {
  chatRooms: ChatRoom[];
  activeChatRoom: string | null;
  isLoading: boolean;
  error: string | null;
  newMessagePopup: {
    show: boolean;
    message: string;
    senderName: string;
  };
}

const initialState: ChatState = {
  chatRooms: [],
  activeChatRoom: null,
  isLoading: false,
  error: null,
  newMessagePopup: {
    show: false,
    message: '',
    senderName: '',
  },
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setChatRooms: (state, action: PayloadAction<ChatRoom[]>) => {
      state.chatRooms = action.payload;
    },
    setActiveChatRoom: (state, action: PayloadAction<string | null>) => {
      state.activeChatRoom = action.payload;
    },
    addMessage: (state, action: PayloadAction<{ chatRoomId: string; message: Message }>) => {
      const { chatRoomId, message } = action.payload;
      const chatRoom = state.chatRooms.find(room => room.chatRoomId === chatRoomId);
      if (chatRoom) {
        chatRoom.messages.push(message);
        chatRoom.lastMessage = message.messageText;
        chatRoom.lastMessageTime = message.timestamp;

        // If this is not the active chat room and message is from other user, increment unread count
        if (state.activeChatRoom !== chatRoomId && message.senderId !== 'currentUser') {
          chatRoom.unreadCount += 1;
        }
      }
    },
    setMessages: (state, action: PayloadAction<{ chatRoomId: string; messages: Message[] }>) => {
      const { chatRoomId, messages } = action.payload;
      const chatRoom = state.chatRooms.find(room => room.chatRoomId === chatRoomId);
      if (chatRoom) {
        chatRoom.messages = messages;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const chatRoomId = action.payload;
      const chatRoom = state.chatRooms.find(room => room.chatRoomId === chatRoomId);
      if (chatRoom) {
        chatRoom.unreadCount = 0;
      }
    },
    updateUnreadCount: (state, action: PayloadAction<{ chatRoomId: string; count: number }>) => {
      const { chatRoomId, count } = action.payload;
      const chatRoom = state.chatRooms.find(room => room.chatRoomId === chatRoomId);
      if (chatRoom) {
        chatRoom.unreadCount = count;
      }
    },
    showNewMessagePopup: (state, action: PayloadAction<{ message: string; senderName: string }>) => {
      state.newMessagePopup = {
        show: true,
        message: action.payload.message,
        senderName: action.payload.senderName,
      };
    },
    hideNewMessagePopup: (state) => {
      state.newMessagePopup.show = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChatRooms,
  setActiveChatRoom,
  addMessage,
  setMessages,
  markAsRead,
  updateUnreadCount,
  showNewMessagePopup,
  hideNewMessagePopup,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;