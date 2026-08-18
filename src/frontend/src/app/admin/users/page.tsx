"use client";

import { PageShell } from "@/components/layout/page-shell";
import { UserTable } from "@/components/admin/user-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminUsersPage() {
  return (
    <PageShell 
      title="User Management" 
      description="Manage imams, operators, and admin accounts for your mosque."
      actions={
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 text-black hover:bg-amber-400">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#121214] border-zinc-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new user account and assign them a role.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Imam Ahmed" className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="ahmed@mosque.com" className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select>
                  <SelectTrigger className="bg-[#09090b] border-zinc-800 focus:ring-amber-500">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-zinc-800 text-gray-100">
                    <SelectItem value="imam">Imam</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="bg-[#09090b] border-zinc-800 focus-visible:ring-amber-500" />
              </div>
              <Button type="button" className="w-full bg-amber-500 text-black hover:bg-amber-400">
                Create User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="bg-[#121214] border border-zinc-800 rounded-lg p-6">
        <UserTable />
      </div>
    </PageShell>
  );
}
