'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HiRectangleStack, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

export function AuthNavSection() {
    const { data: session, status } = useSession();
    const router = useRouter();
    if (status === 'loading') {
        return <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />;
    }
    console.log(session?.user);

    if (session?.user) {
        const userName = session.user.name || session.user.email || "User";
        const userInitials = userName
            .split(' ')
            .map(name => name.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <Avatar className="w-8 h-8">
                            {session.user.image && <AvatarImage
                                src={session.user.image}
                                alt={userName}
                            />}
                            <AvatarFallback className="bg-gray-500 text-white text-xs">
                                {userInitials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                            {userName}
                        </span>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() => router.push('/dashboard')}
                    >
                        <HiRectangleStack />
                        Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center cursor-pointer"
                    >
                        <HiArrowRightOnRectangle />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <Link href="/login">
                <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
                <Button variant="default" size="sm">Sign Up</Button>
            </Link>
        </div>
    );
}
