import React, { useState, useEffect } from 'react';
import { UserActivity } from '@/services/userActivityService';
import { userActivityService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ThumbsUp, MessageSquare, Send, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserActivityFeedProps {
  userId: number;
}

const UserActivityFeed: React.FC<UserActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const data = await userActivityService.getUserActivities(userId);
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les activités',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivities();
    }
  }, [userId, toast]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'POST':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'POST_LIKE':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'COMMENT_LIKE':
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <Send className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: UserActivity) => {
    switch (activity.activityType) {
      case 'POST':
        return 'a publié un post';
      case 'POST_LIKE':
        return 'a aimé un post';
      case 'COMMENT':
        return 'a commenté un post';
      case 'COMMENT_LIKE':
        return 'a aimé un commentaire';
      default:
        return 'a fait une action';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr,
      });
    } catch (error) {
      return 'date inconnue';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune activité à afficher
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => (
          <Card key={activity.id} className="animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {getActivityText(activity)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </span>
                  </div>
                  {activity.targetTitle && (
                    <div className="mt-2 text-sm bg-muted p-2 rounded-md">
                      {activity.targetTitle}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default UserActivityFeed;
