import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { MessageCircle, Send, X, Wrench, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createChatRoom } from '../../services/chatService';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/SimpleAuthContext';
import { toast } from 'sonner';

interface Message {
  _id: string;
  senderId: string | any;
  receiverId: string;
  messageText: string;
  createdAt: string;
  isRead: boolean;
  senderId_info?: {
    name: string;
    email: string;
    role: string;
  };
}

interface ChatComponentProps {
  otherUserId: string;
  otherUserName: string;
  onClose?: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  otherUserId,
  otherUserName,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?._id || '';
  const currentUserName = user?.name || '';
  const chatRoomId = createChatRoom(currentUserId, otherUserId);

  useEffect(() => {
    loadMessages();
  }, [chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/messages/${chatRoomId}`);
      setMessages((response as any).data.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('فشل في تحميل الرسائل');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !currentUserId) return;

    setIsSending(true);
    try {
      const response = await api.post('/messages', {
        chatRoomId,
        receiverId: otherUserId,
        messageText: messageText.trim(),
      });

      if ((response as any).data.success) {
        const newMessage: Message = {
          _id: (response as any).data.data._id,
          senderId: currentUserId,
          receiverId: otherUserId,
          messageText: messageText.trim(),
          createdAt: (response as any).data.data.createdAt,
          isRead: false,
        };

        setMessages(prev => [...prev, newMessage]);
        setMessageText('');

        try {
          await api.patch(`/messages/${chatRoomId}/read`);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full h-full flex flex-col bg-gradient-to-br from-gray-50 to-orange-50 shadow-xl border-2 border-orange-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b-2 border-orange-200 bg-gradient-to-r from-orange-500 to-orange-600 text-white flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          <Wrench className="w-5 h-5" />
          Chat with {otherUserName}
        </CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-orange-700">
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
        <ScrollArea className="flex-1 p-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="ml-2 text-gray-600">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: Message) => {
                const messageSenderId = typeof message.senderId === 'string'
                  ? message.senderId
                  : (message.senderId as any)?._id || message.senderId;
                const isCurrentUser = messageSenderId === currentUserId;

                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={isCurrentUser ? 'bg-orange-500' : 'bg-blue-500'}>
                          {isCurrentUser
                            ? currentUserName.charAt(0)
                            : (message.senderId_info?.name.charAt(0) || otherUserName.charAt(0))
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className={`rounded-lg px-3 py-2 ${isCurrentUser
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                        }`}>
                        <p className="text-sm">{message.messageText}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t-2 border-orange-200 bg-gradient-to-r from-orange-50 to-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="اكتب رسالتك هنا..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatComponent;