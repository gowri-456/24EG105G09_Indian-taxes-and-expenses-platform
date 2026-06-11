import { useState, useEffect } from "react";
import { FiSearch, FiEdit2, FiTrash2, FiShield, FiUser, FiEye } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { apiClient } from "../services/apiClient";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("user");
  const [selectedUser, setSelectedUser] = useState(null);
  const [counts, setCounts] = useState({ total: 0, admins: 0, regular: 0 });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/users");
      setUsers(response.users || []);
      setCounts(response.counts || { total: 0, admins: 0, regular: 0 });
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId) => {
    try {
      const response = await apiClient.put(`/admin/users/${userId}/role`, {
        role: selectedRole,
      });

      setUsers(users.map((user) => (user.id === userId ? response.user : user)));
      toast.success("User role updated");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await apiClient.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const formatCurrencyShort = (value) => {
    const amount = Number(value) || 0;
    return `Rs ${(amount / 100000).toFixed(1)}L`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all users and their roles</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute inset-y-0 left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-600">Name</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-600">Email</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-600">Annual Salary</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-600">Role</th>
              <th className="text-left py-4 px-4 font-semibold text-gray-600">Joined</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-blue-600 text-sm" />
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">{user.email}</td>
                  <td className="py-4 px-4 text-gray-600">{formatCurrencyShort(user.salary)}</td>
                  <td className="py-4 px-4 text-center">
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2 justify-center">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleUpdateRole(user.id)}
                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "admin" && <FiShield className="text-sm" />}
                        {user.role === "admin" ? "Admin" : "User"}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-xs">{formatDate(user.joinedDate)}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        title="View user"
                      >
                        <FiEye className="text-base" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit role"
                      >
                        <FiEdit2 className="text-lg" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading users...</p>
          </div>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{counts.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Admin Users</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">{counts.admins}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-gray-600 text-sm font-medium">Regular Users</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{counts.regular}</p>
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <FiUser className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Role</span>
                <span className="font-semibold capitalize text-gray-900">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Annual Salary</span>
                <span className="font-semibold text-gray-900">{formatCurrencyShort(selectedUser.salary)}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Tax Regime</span>
                <span className="font-semibold capitalize text-gray-900">
                  {selectedUser.preferredRegime || "not-decided"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Financial Year</span>
                <span className="font-semibold text-gray-900">{selectedUser.financialYear || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedUser.joinedDate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
