import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const AccountSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { setUser } = useAuth(); // Ambil setUser dari context

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.put(
        "http://localhost:5000/users/me",
        {
          username,
          email,
          password,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Update success:", response.data);

      if (response.data.user) {
        setUser(response.data.user);
      }

      toast.success("Profile updated!");
      onClose();
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Tombol close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold mb-4">Account Settings</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter new username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter new email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettingsModal;