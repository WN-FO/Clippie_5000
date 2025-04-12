'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

export const UserAvatar = () => {
  const { user } = useAuth();

  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src={user?.user_metadata?.avatar_url} />
      <AvatarFallback>
        {user?.email?.charAt(0).toUpperCase() || 'U'}
      </AvatarFallback>
    </Avatar>
  );
};
