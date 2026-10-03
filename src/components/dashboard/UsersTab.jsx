import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Chip,
  Tooltip,
  useDisclosure,
  Avatar
} from "@heroui/react";
import { fetchAllUsers, deleteUser, updateUser } from "../../controllers/adminController";
import UserModal from "./UserModal";
import toast from "react-hot-toast";
import { Search, Pencil, Trash2, Plus } from "lucide-react";

export default function UsersTab() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedUser(null);
    onOpen();
  };

  const handleRoleQuickChange = async (userId, newRole) => {
    try {
      await updateUser(userId, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      toast.error("Failed to update user role");
    }
  };

  const handleDelete = async (user) => {
    const id = user.$id || user.id;
    if (window.confirm(`Are you sure you want to remove user "${user.name || user.email}"?`)) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        loadUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" ||
        (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "danger";
      case "farmer":
        return "success";
      case "customer":
      default:
        return "primary";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Platform Users & Roles</h2>
          <p className="text-xs text-gray-500">View registered customers, assign breeder/farmer permissions, or manage admins.</p>
        </div>
        <Button className="bg-[#14532D] font-semibold text-yellow-300 hover:bg-[#166534]" startContent={<Plus size={16} aria-hidden="true" />} onPress={handleCreate}>
          Add New User
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="w-full sm:w-72">
          <Input
            size="sm"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            isClearable
            startContent={<Search size={16} className="text-gray-400" aria-hidden="true" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500">Role:</span>
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {["all", "customer", "farmer", "admin"].map((r) => (
              <Button
                key={r}
                size="sm"
                className={`bg-[#14532D] text-xs capitalize h-8 text-yellow-300 hover:bg-[#166534] ${roleFilter === r ? "font-bold ring-2 ring-yellow-300" : ""}`}
                onPress={() => setRoleFilter(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Table aria-label="Users management table" className="min-w-full">
        <TableHeader>
          <TableColumn>USER</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ROLE</TableColumn>
          <TableColumn>QUICK ROLE EDIT</TableColumn>
          <TableColumn>JOINED</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody isLoading={isLoading} emptyContent={"No users found matching your search."}>
          {filteredUsers.map((user) => {
            const id = user.$id || user.id || "user";
            const initial = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

            return (
              <TableRow key={id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={initial} size="sm" color="success" className="font-bold text-xs" />
                    <div>
                      <p className="font-semibold text-xs text-gray-900">{user.name || "FARMLIVE User"}</p>
                      <p className="text-[11px] text-gray-400 font-mono">ID: {id.slice(-6)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-700 font-mono">{user.email}</span>
                </TableCell>
                <TableCell>
                  <Chip size="sm" color={getRoleColor(user.role)} variant="flat" className="capitalize text-xs font-bold">
                    {user.role || "customer"}
                  </Chip>
                </TableCell>
                <TableCell>
                  <select
                    value={user.role || "customer"}
                    onChange={(e) => handleRoleQuickChange(id, e.target.value)}
                    className="text-xs font-semibold rounded-lg px-2 py-1 border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                  >
                    <option value="customer">Customer</option>
                    <option value="farmer">Farmer / Breeder</option>
                    <option value="admin">Administrator</option>
                  </select>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Active"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 items-center">
                    <Tooltip content="Edit User Profile">
                      <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(user)}>
                        <Pencil size={16} className="text-blue-600" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete User">
                      <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleDelete(user)}>
                        <Trash2 size={16} className="text-red-500" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Edit / Create User Modal */}
      <UserModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        user={selectedUser}
        onSuccess={loadUsers}
      />
    </div>
  );
}
