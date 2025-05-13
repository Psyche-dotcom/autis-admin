import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Database, Inbox, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your admin dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active administrators
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/admins">Manage Admins</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Symbol Library
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across 3 categories
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/symbols">Manage Symbols</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Enquiries
            </CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              1 high priority
            </p>
            <Button variant="link" className="px-0 mt-2" asChild>
              <Link href="/dashboard/enquiry">View Enquiries</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions in the last 24h
            </p>
            <Button variant="link" className="px-0 mt-2" disabled>
              View Activity Log
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/symbols?tab=generator">
                <Database className="h-6 w-6 mb-2" />
                Generate New Symbol
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/admins">
                <Users className="h-6 w-6 mb-2" />
                Invite Admin
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              asChild
            >
              <Link href="/dashboard/enquiry">
                <Inbox className="h-6 w-6 mb-2" />
                Check Enquiries
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="font-medium">Unable to download symbols</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>John Smith</span>
                  <span>New</span>
                </div>
              </div>
              <div className="border-b pb-2">
                <p className="font-medium">Custom symbol request</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Sarah Johnson</span>
                  <span>In Progress</span>
                </div>
              </div>
              <div>
                <p className="font-medium">Billing issue with purchase</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Michael Chen</span>
                  <span>Resolved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
