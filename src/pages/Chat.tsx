import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ArrowLeft, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import ChatComponent from "@/features/chat/ChatComponent";
import { getUserChats } from "@/services/chatService";

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!user?._id) return;

      try {
        console.log('Fetching chat rooms for user:', user._id);
        const chats = await getUserChats();
        console.log('Fetched chat rooms:', chats);
        setChatRooms(chats);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [user?._id]);

  const handleChatSelect = (chatRoom: any) => {
    setSelectedChat(chatRoom);
    setActiveChatRoom(chatRoom.chatRoomId);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
    setActiveChatRoom(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">جاري تحميل الدردشات...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-orange-500/5 dark:bg-black dark:from-black dark:via-gray-900/20 dark:to-gray-800/20 transition-colors duration-500">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4 hover-lift"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              الدردشات
            </h1>
            <p className="text-muted-foreground">
              تواصل مع الميكانيكيين والعملاء
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat List */}
            <div className={`lg:col-span-1 ${selectedChat ? 'hidden lg:block' : 'block'}`}>
              <Card className="p-6 animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300 h-[600px] flex flex-col">
                <h2 className="text-2xl font-bold mb-6 text-right flex items-center gap-3 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                  <MessageCircle className="h-6 w-6" />
                  المحادثات
                </h2>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {chatRooms.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد محادثات بعد</p>
                      <p className="text-sm mt-2">ابدأ محادثة من خلال حجز موعد أو النقر على زر الدردشة</p>
                      <div className="mt-4 space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => navigate('/mechanics')}
                        >
                          تصفح الميكانيكيين
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate('/book-appointment')}
                        >
                          حجز موعد
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatRooms.map((chatRoom) => (
                        <div
                          key={chatRoom.chatRoomId}
                          onClick={() => handleChatSelect(chatRoom)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover-lift ${selectedChat?.chatRoomId === chatRoom.chatRoomId
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 bg-card/50'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-primary/20">
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-right">
                              <h3 className="font-semibold text-sm">
                                {chatRoom.otherUser?.name || 'مستخدم غير معروف'}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate">
                                {chatRoom.lastMessage?.messageText || 'لا توجد رسائل'}
                              </p>
                            </div>
                            {chatRoom.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {chatRoom.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Chat Area */}
            <div className={`lg:col-span-2 ${selectedChat ? 'block' : 'hidden lg:block'}`}>
              {selectedChat ? (
                <div className="h-[600px]">
                  <div className="lg:hidden mb-4">
                    <Button variant="ghost" onClick={handleBackToList}>
                      <ArrowLeft className="h-4 w-4 ml-2" />
                      العودة للقائمة
                    </Button>
                  </div>
                  <ChatComponent
                    otherUserId={selectedChat.otherUser?._id}
                    otherUserName={selectedChat.otherUser?.name}
                    onClose={() => setSelectedChat(null)}
                  />
                </div>
              ) : (
                <Card className="h-[600px] flex flex-col items-center justify-center p-12 text-center animate-slide-up shadow-xl border-border/50 bg-card/90 dark:bg-gray-900/90 transition-colors duration-300">
                  <MessageCircle className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="text-2xl font-bold mb-4">اختر محادثة</h3>
                  <p className="text-muted-foreground">
                    اختر محادثة من القائمة لبدء المحادثة
                  </p>
                  {chatRooms.length === 0 && (
                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        للبدء في المحادثة، يمكنك:
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => navigate('/mechanics')}>
                          تصفح الميكانيكيين
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/book-appointment')}>
                          حجز موعد
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;