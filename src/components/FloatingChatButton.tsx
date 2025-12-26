import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";

export const FloatingChatButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Hide for workshop and mechanic users
  if (user?.role === 'workshop' || user?.role === 'mechanic') {
    return null;
  }

  return (
    <Button
      onClick={() => navigate("/ai-diagnosis")}
      className="fixed bottom-8 left-8 w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 bg-primary hover:bg-primary-hover"
      size="icon"
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
};
