'use client';

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center p-4">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu />
      </Button>
      <div className="flex w-full justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <UserAvatar />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => signOut()}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
