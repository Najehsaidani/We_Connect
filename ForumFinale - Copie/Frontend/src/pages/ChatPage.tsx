
import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Search, Smile, Image, Paperclip, MoreHorizontal, Users, UserPlus, UserX, Trash, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatUser } from '@/types';

// Sample chat data
const initialUsers: ChatUser[] = [
  {
    id: 1,
    name: 'Marie Dupont',
    avatar: '/placeholder.svg',
    status: 'online',
    lastMessage: 'Salut, tu as eu les notes du dernier TP ?',
    timestamp: 'il y a 5 min',
    unread: 2
  },
  {
    id: 2,
    name: 'Thomas Martin',
    avatar: '/placeholder.svg',
    status: 'online',
    lastMessage: 'Super, merci pour l\'info !',
    timestamp: 'il y a 30 min',
    unread: 0
  },
  {
    id: 3,
    name: 'Léa Rousseau',
    avatar: '/placeholder.svg',
    status: 'offline',
    lastMessage: 'Je t\'envoie ça ce soir.',
    timestamp: 'hier',
    unread: 0
  },
  {
    id: 4,
    name: 'Club de Débat',
    avatar: '/placeholder.svg',
    status: 'group',
    lastMessage: 'Hugo: On se retrouve à 18h pour préparer le débat',
    timestamp: 'il y a 2h',
    unread: 5,
    members: 12
  },
  {
    id: 5,
    name: 'Groupe de projet Marketing',
    avatar: '/placeholder.svg',
    status: 'group',
    lastMessage: 'Emma: J\'ai terminé la partie analyse des résultats',
    timestamp: 'il y a 3h',
    unread: 0,
    members: 5
  }
];

// Sample messages for a specific chat
const initialMessages = [
  {
    id: 1,
    senderId: 2,
    content: 'Salut ! Comment vas-tu ?',
    timestamp: '14:22'
  },
  {
    id: 2,
    senderId: 1,
    content: 'Hey ! Ça va bien merci, et toi ?',
    timestamp: '14:23'
  },
  {
    id: 3,
    senderId: 2,
    content: 'Très bien ! Tu as commencé à travailler sur le projet de groupe ?',
    timestamp: '14:25'
  },
  {
    id: 4,
    senderId: 1,
    content: 'Oui, j\'ai déjà fait la première partie. Il faut qu\'on se réunisse pour discuter des prochaines étapes.',
    timestamp: '14:28'
  },
  {
    id: 5,
    senderId: 2,
    content: 'Parfait ! Tu serais dispo demain après les cours ? Vers 16h ?',
    timestamp: '14:30'
  },
  {
    id: 6,
    senderId: 1,
    content: 'Ça me va ! On peut se retrouver à la bibliothèque.',
    timestamp: '14:32'
  },
  {
    id: 7,
    senderId: 2,
    content: 'Super, à demain alors !',
    timestamp: '14:33'
  }
];

// Sample users for creating new conversations
const allUsers = [
  {
    id: 6,
    name: 'Julie Moreau',
    avatar: '/placeholder.svg',
    department: 'Informatique',
    status: 'online'
  },
  {
    id: 7,
    name: 'Lucas Bernard',
    avatar: '/placeholder.svg',
    department: 'Économie',
    status: 'offline'
  },
  {
    id: 8,
    name: 'Emilie Petit',
    avatar: '/placeholder.svg',
    department: 'Droit',
    status: 'online'
  },
  {
    id: 9,
    name: 'Antoine Girard',
    avatar: '/placeholder.svg',
    department: 'Médecine',
    status: 'offline'
  }
];

const ChatPage = () => {
  const [users, setUsers] = useState<ChatUser[]>(initialUsers);
  const [messages, setMessages] = useState(initialMessages);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [newConversationSearch, setNewConversationSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users for new conversation
  const filteredNewUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(newConversationSearch.toLowerCase()) ||
    user.department.toLowerCase().includes(newConversationSearch.toLowerCase())
  );

  // Scroll to bottom of messages when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Select user chat
  const handleSelectUser = (userId: number) => {
    setSelectedUser(userId);
    
    // Mark messages as read
    setUsers(users.map(user => 
      user.id === userId ? { ...user, unread: 0 } : user
    ));
  };

  // Send a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedUser) return;

    const newMessage = {
      id: messages.length + 1,
      senderId: 1, // Current user ID
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessageText('');

    // Update last message in the user list
    setUsers(users.map(user => 
      user.id === selectedUser 
        ? { 
            ...user, 
            lastMessage: messageText, 
            timestamp: 'à l\'instant' 
          } 
        : user
    ));

    // Simulate receiving a response after a delay
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const responseMessage = {
          id: messages.length + 2,
          senderId: selectedUser,
          content: "D'accord, merci pour l'information !",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, responseMessage]);
        
        // Update last message in the user list
        setUsers(users.map(user => 
          user.id === selectedUser 
            ? { 
                ...user, 
                lastMessage: "D'accord, merci pour l'information !", 
                timestamp: 'à l\'instant' 
              } 
            : user
        ));
      }, 2000 + Math.random() * 3000);
    }
  };

  // Start a new conversation
  const handleStartNewConversation = (newUserId: number) => {
    const newUser = allUsers.find(user => user.id === newUserId);
    
    if (!newUser) return;
    
    // Check if conversation already exists
    const existingConversation = users.find(user => user.id === newUserId);
    
    if (existingConversation) {
      setSelectedUser(newUserId);
    } else {
      const newChatUser = {
        id: newUser.id,
        name: newUser.name,
        avatar: newUser.avatar,
        status: newUser.status as 'online' | 'offline',
        lastMessage: 'Commencez une nouvelle conversation...',
        timestamp: 'à l\'instant',
        unread: 0
      };
      
      setUsers([newChatUser, ...users]);
      setSelectedUser(newUserId);
      setMessages([]);
    }
    
    setIsNewChatOpen(false);
    
    toast({
      title: "Nouvelle conversation",
      description: `Conversation démarrée avec ${newUser.name}`,
    });
  };

  // Block a user
  const handleBlockUser = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isBlocked: true } 
        : user
    ));
    
    toast({
      title: "Utilisateur bloqué",
      description: `L'utilisateur a été bloqué avec succès.`,
      variant: "destructive"
    });
  };
  
  // Unblock a user
  const handleUnblockUser = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isBlocked: false } 
        : user
    ));
    
    toast({
      title: "Utilisateur débloqué",
      description: `L'utilisateur a été débloqué avec succès.`,
    });
  };

  // Delete a conversation
  const handleDeleteConversation = (userId: number) => {
    setUsers(users.filter(user => user.id !== userId));
    
    if (selectedUser === userId) {
      setSelectedUser(null);
    }
    
    toast({
      title: "Conversation supprimée",
      description: "La conversation a été supprimée avec succès.",
      variant: "destructive"
    });
  };

  // Current selected user details
  const currentChat = users.find(user => user.id === selectedUser);

  return (
    <div className="page-container">
      {/* Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden h-[calc(85vh-2rem)]">
        <div className="flex h-full">
          {/* Users List */}
          <div className="w-full md:w-1/3 lg:w-1/4 border-r border-border flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-9 pr-4 py-2 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Users */}
            <div className="flex-grow overflow-y-auto">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className={`flex p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedUser === user.id ? 'bg-muted' : ''
                    } ${user.isBlocked ? 'opacity-60' : ''}`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                      {user.status === 'group' && (
                        <span className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                          <Users size={12} className="text-white" />
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-grow min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-sm truncate">{user.name}</h3>
                        <span className="text-xs text-muted-foreground">{user.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.isBlocked ? 'Utilisateur bloqué' : user.lastMessage}
                      </p>
                      {user.status === 'group' && (
                        <div className="flex items-center mt-1">
                          <Users size={12} className="text-muted-foreground mr-1" />
                          <span className="text-xs text-muted-foreground">{user.members} membres</span>
                        </div>
                      )}
                      {user.isBlocked && (
                        <Badge variant="outline" className="mt-1 text-xs">Bloqué</Badge>
                      )}
                    </div>
                    {user.unread > 0 && (
                      <div className="ml-2 self-center">
                        <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {user.unread}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Aucune conversation trouvée
                </div>
              )}
            </div>
            
            {/* New Chat Button */}
            <div className="p-3 border-t border-border">
              <Button className="w-full" onClick={() => setIsNewChatOpen(true)}>
                <Plus size={16} className="mr-2" /> Nouvelle conversation
              </Button>
            </div>
          </div>

          {/* Chat Area */}
          {selectedUser ? (
            <div className="hidden md:flex flex-col flex-grow">
              {/* Chat Header */}
              <div className="p-3 border-b border-border flex justify-between items-center">
                <div 
                  className="flex items-center cursor-pointer" 
                  onClick={() => setIsUserProfileOpen(true)}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentChat?.avatar} 
                      alt={currentChat?.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{currentChat?.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {currentChat?.status === 'online' ? 'En ligne' : currentChat?.status === 'group' ? `${currentChat.members} membres` : 'Hors ligne'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsUserProfileOpen(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir le profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {currentChat?.isBlocked ? (
                      <DropdownMenuItem onClick={() => handleUnblockUser(currentChat.id)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Débloquer
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleBlockUser(currentChat?.id || 0)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Bloquer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDeleteConversation(currentChat?.id || 0)}
                      className="text-red-600"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Supprimer la conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Messages */}
              <div className="flex-grow p-4 overflow-y-auto bg-muted/30">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center mb-6">
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-3 py-1">
                      Aujourd'hui
                    </span>
                  </div>
                  
                  {currentChat?.isBlocked ? (
                    <div className="text-center py-8">
                      <UserX size={48} className="mx-auto text-red-500 mb-3" />
                      <h3 className="text-xl font-medium mb-2">Utilisateur bloqué</h3>
                      <p className="text-muted-foreground mb-4">
                        Vous avez bloqué cet utilisateur et ne pouvez plus échanger de messages.
                      </p>
                      <Button variant="outline" onClick={() => handleUnblockUser(currentChat.id)}>
                        Débloquer l'utilisateur
                      </Button>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex mb-4 animate-fade-in ${
                          message.senderId === 1 ? 'justify-end' : 'justify-start'
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {message.senderId !== 1 && (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 mr-2 flex items-center justify-center overflow-hidden">
                            <img 
                              src={currentChat?.avatar} 
                              alt={currentChat?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="max-w-[70%]">
                          <div
                            className={`rounded-2xl px-4 py-2 inline-block ${
                              message.senderId === 1
                                ? 'bg-primary text-white'
                                : 'bg-white border border-border'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 px-2">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Démarrez la conversation en envoyant un message</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              {/* Message Input */}
              {!currentChat?.isBlocked && (
                <div className="p-3 border-t border-border">
                  <div className="flex items-end space-x-2">
                    <div className="flex-grow">
                      <Textarea
                        placeholder="Écrivez un message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="min-h-[50px] max-h-[120px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Smile size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Paperclip size={20} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <Image size={20} />
                      </Button>
                      <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex flex-col flex-grow items-center justify-center bg-muted/30 p-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Vos conversations</h2>
                <p className="text-muted-foreground mb-4">
                  Sélectionnez une conversation ou créez-en une nouvelle pour commencer à discuter.
                </p>
                <Button onClick={() => setIsNewChatOpen(true)}>
                  <Plus size={16} className="mr-2" /> Nouvelle conversation
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Message View */}
          <div className="md:hidden flex flex-col flex-grow items-center justify-center p-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chat</h2>
              <p className="text-muted-foreground mb-4">
                La vue complète du chat est disponible sur les appareils de plus grande taille.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
            <DialogDescription>
              Cherchez et sélectionnez un utilisateur pour démarrer une nouvelle conversation.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10 pr-4 py-2"
                  value={newConversationSearch}
                  onChange={(e) => setNewConversationSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {filteredNewUsers.length > 0 ? (
                filteredNewUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleStartNewConversation(user.id)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {user.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {user.department}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewChatOpen(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil de l'utilisateur</DialogTitle>
          </DialogHeader>
          
          {currentChat && (
            <div className="py-4">
              <div className="mb-6">
                <div className="relative w-full h-32 bg-muted rounded-lg mb-16">
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-24 h-24">
                    <div className="w-full h-full rounded-full bg-primary/20 border-4 border-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={currentChat.avatar} 
                        alt={currentChat.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold">{currentChat.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {currentChat.status === 'online' ? 'En ligne' : 
                    currentChat.status === 'group' ? `Groupe • ${currentChat.members} membres` : 
                    'Hors ligne'}
                  </p>
                </div>
                
                {currentChat.status !== 'group' && (
                  <div className="flex justify-center space-x-4 mb-4">
                    <Button variant="outline" onClick={() => setIsUserProfileOpen(false)}>
                      Envoyer un message
                    </Button>
                    <Button 
                      variant={currentChat.isBlocked ? "default" : "outline"}
                      onClick={() => {
                        currentChat.isBlocked ? 
                          handleUnblockUser(currentChat.id) : 
                          handleBlockUser(currentChat.id);
                        setIsUserProfileOpen(false);
                      }}
                    >
                      {currentChat.isBlocked ? (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Débloquer
                        </>
                      ) : (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Bloquer
                        </>
                      )}
                    </Button>
                  </div>
                )}
                
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-2">À propos</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentChat.status === 'group' 
                      ? "Groupe de discussion pour les membres partageant des intérêts communs."
                      : "Étudiant en informatique passionné de nouvelles technologies et de design d'interfaces."}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserProfileOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Import missing MessageSquare icon
import { MessageSquare } from 'lucide-react';

export default ChatPage;
