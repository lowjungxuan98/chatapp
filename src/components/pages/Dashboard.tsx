'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Settings, Activity } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Messages',
      value: '1,234',
      description: '+20% from last month',
      icon: MessageSquare,
    },
    {
      title: 'Active Contacts',
      value: '45',
      description: '+5 new this week',
      icon: Users,
    },
    {
      title: 'Settings Updated',
      value: '3',
      description: 'Last updated today',
      icon: Settings,
    },
    {
      title: 'Activity Score',
      value: '89%',
      description: '+12% from last week',
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email}! Here&apos;s what&apos;s happening with your chat app.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Your latest conversations and messages.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Message from User {i}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Hey! How are you doing today?
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {i}h ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used features and shortcuts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">New Message</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <Users className="w-5 h-5" />
                <span className="text-sm font-medium">Add Contact</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <Settings className="w-5 h-5" />
                <span className="text-sm font-medium">Settings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}