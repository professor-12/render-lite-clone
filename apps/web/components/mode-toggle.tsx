 'use client';
 
 import * as React from 'react';
 import { useTheme } from 'next-themes';
 import { RiComputerLine, RiMoonLine, RiSunLine } from '@remixicon/react';
 
 import { Button } from '@/components/ui/button';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 
 export function ModeToggle() {
   const { setTheme } = useTheme();
 
   return (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="outline" size="icon" aria-label="Toggle theme">
           <RiSunLine className="size-4 dark:hidden" />
           <RiMoonLine className="hidden size-4 dark:block" />
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         <DropdownMenuItem onClick={() => setTheme('light')}>
           <RiSunLine className="mr-2 size-4" />
           Light
         </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme('dark')}>
           <RiMoonLine className="mr-2 size-4" />
           Dark
         </DropdownMenuItem>
         <DropdownMenuItem onClick={() => setTheme('system')}>
           <RiComputerLine className="mr-2 size-4" />
           System
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 }

