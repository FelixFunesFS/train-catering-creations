import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuoteNotifications } from "@/hooks/useQuoteNotifications";
import { useNavigate } from "react-router-dom";

export const NotificationBell = () => {
  const { unreadCount, markAsRead } = useQuoteNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    markAsRead();
    navigate('/admin');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={handleClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
