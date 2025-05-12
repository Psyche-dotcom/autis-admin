"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import HttpService from "@/service/httpService";
import { routes } from "@/service/api-routes";
import { Admin } from "@/interface";
import { mapApiToAdmin } from "@/lib/utils";

type AdminKey =
  | "email"
  | "firstName"
  | "lastName"
  | "country"
  | "age"
  | "gender"
  | "phoneNumber"
  | "password"
  | "userName";

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState<Record<AdminKey, string>>({
    email: "",
    firstName: "",
    lastName: "",
    country: "",
    age: "",
    gender: "",
    phoneNumber: "",
    password: "",
    userName: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateAdmin = async () => {
    const {
      email,
      firstName,
      lastName,
      country,
      age,
      gender,
      phoneNumber,
      password,
      userName,
    } = newAdmin;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !country ||
      !age ||
      !gender ||
      !phoneNumber ||
      !password ||
      !userName
    ) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      await HttpService.postData(
        {
          email,
          userName,
          firstName,
          lastName,
          country,
          age,
          gender,
          phoneNumber,
          password,
        },
        routes.Adminsignup()
      );

      setIsDialogOpen(false);
      setNewAdmin({
        email: "",
        firstName: "",
        lastName: "",
        country: "",
        age: "",
        gender: "",
        phoneNumber: "",
        password: "",
        userName: "",
      });
      fetchAdmins();

      toast({
        title: "Admin Created",
        description: "The new admin has been successfully created.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create admin. Please try again.",
      });
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await HttpService.getData(
        routes.retrieveAllAdmin(50, 1)
      );
      // @ts-expect-error: API response is loosely typed
      const converted = response?.user?.map(mapApiToAdmin) || [];
      setAdmins(converted);
    } catch {
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "Failed to retrieve admins.",
      });
    }
  };

  const handleDeleteAdmin = async (email: string) => {
    try {
      await HttpService.deleteData(routes.deleteAccount(email));
      fetchAdmins();
      toast({
        title: "Admin Deleted",
        description: "The admin has been removed successfully.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete admin.",
      });
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Fill out the form to create a new admin account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {[
                { label: "First Name", key: "firstName" },
                { label: "Last Name", key: "lastName" },
                { label: "Email", key: "email", type: "email" },
                { label: "Username", key: "userName" },
                { label: "Country", key: "country" },
                { label: "Age", key: "age", type: "number" },
                { label: "Gender", key: "gender" },
                { label: "Phone", key: "phoneNumber" },
                { label: "Password", key: "password", type: "password" },
              ].map(({ label, key, type = "text" }) => (
                <div key={key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={key} className="text-right">
                    {label}
                  </Label>
                  <Input
                    id={key}
                    type={type}
                    value={newAdmin[key as AdminKey]}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, [key]: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdmin}>Create Admin</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No admins found
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.role}</TableCell>
                    <TableCell>{admin.dateCreated}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this admin? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAdmin(admin.email)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
