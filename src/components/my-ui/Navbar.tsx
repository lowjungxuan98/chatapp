'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AuthNavSection } from './AuthNavSection';
import { Badge } from '@/components/ui/badge';
import pkg from '../../../package.json';
import { Navbar01, NavLeading, NavTrailing } from '@/components/ui/shadcn-io/navbar-01';

export function Navbar() {
  return (
    <Navbar01>
      <NavLeading>
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
          <Image
            src="https://picsum.photos/32/32"
            alt={`${pkg.name} logo`}
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="font-bold">{pkg.name}</span>
          <Badge variant="secondary" className="hidden sm:inline-flex text-xs ml-2">
            v{pkg.version}
          </Badge>
        </Link>
      </NavLeading>

      {/* <NavMain>
        {session?.user && (
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/dashboard">Dashboard</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/help">Help</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </NavMain> */}

      <NavTrailing>
        <AuthNavSection />
      </NavTrailing>
    </Navbar01>
  );
}
