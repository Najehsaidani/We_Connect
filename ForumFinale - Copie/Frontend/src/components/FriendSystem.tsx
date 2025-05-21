
import React, { useState } from 'react';
import { Search, UserPlus, UserCheck, UserX, Users, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Sample friends data
const sampleFriends = [
  { id: 1, name: 'Marie Dupont', avatar: '/placeholder.svg', status: 'online', department: 'Informatique' },
  { id: 2, name: 'Thomas Martin', avatar: '/placeholder.svg', status: 'offline', department: 'Droit' },
  { id: 3, name: 'Léa Rousseau', avatar: '/placeholder.svg', status: 'online', department: 'Marketing' },
  { id: 4, name: 'Hugo Petit', avatar: '/placeholder.svg', status: 'offline', department: 'Sciences' },
  { id: 5, name: 'Emma Lefevre', avatar: '/placeholder.svg', status: 'online', department: 'Lettres' },
];

// Sample friend requests data
const sampleRequests = [
  { id: 6, name: 'Lucas Bernard', avatar: '/placeholder.svg', department: 'Économie' },
  { id: 7, name: 'Clara Dubois', avatar: '/placeholder.svg', department: 'Médecine' },
];

// Sample search results
const sampleSearchResults = [
  { id: 8, name: 'Antoine Girard', avatar: '/placeholder.svg', department: 'Arts' },
  { id: 9, name: 'Sophie Lambert', avatar: '/placeholder.svg', department: 'Psychologie' },
  { id: 10, name: 'Maxime Richard', avatar: '/placeholder.svg', department: 'Histoire' },
];

const FriendSystem = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(sampleFriends);
  const [friendRequests, setFriendRequests] = useState(sampleRequests);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === '') return;
    
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSearchResults(sampleSearchResults.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setIsSearching(false);
    }, 800);
  };

  const acceptFriendRequest = (id: number) => {
    const request = friendRequests.find(req => req.id === id);
    if (request) {
      setFriends([...friends, {...request, status: 'online'}]);
      setFriendRequests(friendRequests.filter(req => req.id !== id));
      toast({
        title: "Demande acceptée",
        description: `Vous êtes maintenant ami avec ${request.name}.`
      });
    }
  };

  const declineFriendRequest = (id: number) => {
    setFriendRequests(friendRequests.filter(req => req.id !== id));
    toast({
      title: "Demande refusée",
      description: "La demande d'ami a été refusée."
    });
  };

  const sendFriendRequest = (id: number, name: string) => {
    setSearchResults(searchResults.filter(user => user.id !== id));
    toast({
      title: "Demande envoyée",
      description: `Votre demande d'ami a été envoyée à ${name}.`
    });
  };

  const removeFriend = (id: number, name: string) => {
    setFriends(friends.filter(friend => friend.id !== id));
    toast({
      title: "Ami supprimé",
      description: `${name} a été retiré de vos amis.`
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Users className="h-5 w-5" />
          {friendRequests.length > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary"
            >
              {friendRequests.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="friends">
          <div className="border-b">
            <TabsList className="w-full">
              <TabsTrigger value="friends" className="flex-1">
                Amis ({friends.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex-1">
                Demandes {friendRequests.length > 0 && `(${friendRequests.length})`}
              </TabsTrigger>
              <TabsTrigger value="search" className="flex-1">
                Rechercher
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="friends" className="p-0">
            <ScrollArea className="h-[300px]">
              {friends.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span 
                            className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                              friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{friend.name}</p>
                          <p className="text-xs text-muted-foreground">{friend.department}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFriend(friend.id, friend.name)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-muted-foreground">Vous n'avez pas encore d'amis</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="requests" className="p-0">
            <ScrollArea className="h-[300px]">
              {friendRequests.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{request.name}</p>
                          <p className="text-xs text-muted-foreground">{request.department}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <UserCheck className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => declineFriendRequest(request.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <UserPlus className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-muted-foreground">Aucune demande en attente</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="search" className="p-0">
            <div className="p-3 border-b">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Rechercher des amis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="secondary" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <ScrollArea className="h-[250px]">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">Recherche en cours...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col divide-y">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-3 p-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.department}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => sendFriendRequest(user.id, user.name)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-muted-foreground">Aucun résultat trouvé</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Search className="h-10 w-10 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-muted-foreground">Recherchez des amis</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

export default FriendSystem;
