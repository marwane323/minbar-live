"use client";

import { useApi, useMutation } from "@/lib/hooks";
import { User } from "@/lib/types";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";

export function UserTable() {
  const { data: users, isLoading, refetch } = useApi<User[]>("/api/admin/users");
  const { mutate } = useMutation();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await mutate(() => api.delete(`/api/admin/users/${id}`));
      refetch();
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-400 py-8">Loading users...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-zinc-800 hover:bg-transparent">
          <TableHead className="text-gray-400">Name</TableHead>
          <TableHead className="text-gray-400">Email</TableHead>
          <TableHead className="text-gray-400">Role</TableHead>
          <TableHead className="text-gray-400">Status</TableHead>
          <TableHead className="text-right text-gray-400">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id} className="border-zinc-800 hover:bg-[#1a1a1e]">
            <TableCell className="font-medium text-gray-200">{user.full_name}</TableCell>
            <TableCell className="text-gray-400">{user.email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="border-zinc-700 text-gray-300">
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              {user.is_active ? (
                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Inactive</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-zinc-800">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a1e] border-zinc-700 text-gray-200">
                  <DropdownMenuItem className="focus:bg-zinc-800 focus:text-white cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="focus:bg-red-500/10 focus:text-red-500 text-red-500 cursor-pointer"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {(!users || users.length === 0) && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
