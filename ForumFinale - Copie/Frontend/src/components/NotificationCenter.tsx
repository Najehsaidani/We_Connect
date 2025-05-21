
import React, { useState } from 'react';
import { Bell, X, Settings, User, Image, MessageSquare } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    type: 'message',
    sender: 'Marie Dupont',
    avatar: '/placeholder.svg',
    content: 'vous a envoyé un message',
    time: 'Il y a 5 minutes',
    read: false
  },
  {
    id: 2,
    type: 'like',
    sender: 'Thomas Martin',
    avatar: '/placeholder.svg',
    content: 'a aimé votre publication',
    time: 'Il y a 30 minutes',
    read: false
  },
  {
    id: 3,
    type: 'comment',
    sender: 'Léa Rousseau',
    avatar: '/placeholder.svg',
    content: 'a commenté votre publication',
    time: 'Il y a 2 heures',
    read: true
  },
  {
    id: 4,
    type: 'friend',
    sender: 'Hugo Petit',
    avatar: '/placeholder.svg',
    content: 'a accepté votre demande d\'ami',
    time: 'Hier',
    read: true
  },
  {
    id: 5,
    type: 'event',
    sender: 'Club Tech',
    avatar: '/placeholder.svg',
    content: 'a un nouvel événement: "Workshop IA"',
    time: 'Il y a 2 jours',
    read: true
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'friend':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'photo':
        return <Image className="h-4 w-4 text-teal-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-medium">Notifications</h4>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-muted transition-colors",
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={notification.avatar} />
                    <AvatarFallback>
                      {notification.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <p className="text-sm">
                        <span className="font-medium">{notification.sender}</span>{' '}
                        {notification.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Bell className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
              <p className="text-muted-foreground">Aucune notification</p>
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={clearAllNotifications}
            >
              Effacer toutes les notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

import { Heart, Calendar } from 'lucide-react';

export default NotificationCenter;
