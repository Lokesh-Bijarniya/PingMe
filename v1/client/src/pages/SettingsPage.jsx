// SettingsPage.jsx
import React, { useState , useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Lock, Bell, Moon, Shield, HelpCircle, LogOut } from "lucide-react";
import {
  updateProfile,
  changePassword,
  deleteAccount,
} from "../redux/features/auth/authSlice";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  // Get authenticated user's data from Redux
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  // Initialize profile state with user data from Redux
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "https://via.placeholder.com/150", // Default placeholder if no avatar exists
  });


  // Sync profile state with Redux user state after update
  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "https://via.placeholder.com/150",
    });
  }, [user]); // Runs when `user` changes

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
  
      if (profile.avatar instanceof File) {
        formData.append("avatar", profile.avatar);
      }
  
      const response = await dispatch(updateProfile(formData));
  
      if (response) {
        toast.success("Profile updated successfully!"); // Success toast
        setProfile((prev) => ({
          ...prev,
          name: response.userData.name,
          email: response.userData.email,
          avatar: response.userData.avatar,
          avatarPreview: response.userData.avatar,
        }));
        setIsEditing(false);
      } else {
        throw new Error("No user data received");
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error(error.message || "Failed to update profile."); // Error toast
    }
  };
  
  const handleChangePassword = async () => {
    const oldPassword = prompt("Enter your old password:");
    const newPassword = prompt("Enter your new password:");
  
    if (oldPassword && newPassword) {
      try {
        const response = await dispatch(changePassword({ oldPassword, newPassword }));
        toast.success(response.message || "Password changed successfully!"); // Success toast
      } catch (error) {
        console.error("Failed to change password:", error);
        toast.error(error.message || "Failed to change password."); // Error toast
      }
    }
  };
  
  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await dispatch(deleteAccount());
        toast.success("Account deleted successfully!"); // Success toast
      } catch (error) {
        console.error("Failed to delete account:", error);
        toast.error(error.message || "Failed to delete account."); // Error toast
      }
    }
  };
  

  return (
    <div className="w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">Settings</h2>
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <User className="mr-2 text-blue-500" /> Profile
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={profile.avatarPreview || profile.avatar}
              alt="User Avatar"
              className="w-16 h-16 rounded-full border"
            />
            <div className="text-center sm:text-left">
              <h4 className="font-medium">{profile.name}</h4>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <button
              className="mt-4 sm:mt-0 px-4 py-2 bg-blue-500 text-white rounded-md w-full sm:w-auto"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </div>

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="mt-4 space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfile({ ...profile, avatar: file, avatarPreview: URL.createObjectURL(file) });
                  }
                }}
                className="w-full px-4 py-2 border rounded"
              />
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 bg-gray-300 text-black rounded-md"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings Section */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <Lock className="mr-2 text-red-500" /> Account Settings
          </h3>
          <div className="space-y-2">
            {/* Change Password Button */}
            <button
              className="w-full text-left px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handleChangePassword}
              disabled={loading}
            >
              Change Password
            </button>
            {/* Delete Account Button */}
            <button
              className="w-full text-left px-4 py-2 text-red-600 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <Bell className="mr-2 text-yellow-500" /> Notifications
          </h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between py-2">
              <span>Message Notifications</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
            <label className="flex items-center justify-between py-2">
              <span>Call Notifications</span>
              <input type="checkbox" className="w-5 h-5" defaultChecked />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <Moon className="mr-2 text-purple-500" /> Appearance
          </h3>
          <label className="flex items-center justify-between py-2">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              className="w-5 h-5"
              checked=""
            />
          </label>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <Shield className="mr-2 text-green-500" /> Security & Privacy
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Manage Blocked Users
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Enable Two-Factor Authentication (2FA)
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <h3 className="flex items-center text-lg font-medium mb-4">
            <HelpCircle className="mr-2 text-blue-500" /> Help & Support
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              Contact Support
            </button>
            <button className="w-full text-left px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              FAQs
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white p-5 shadow-md rounded-lg">
          <button
            className="w-full px-4 py-2 text-red-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center justify-center"
            onClick={() => {
              dispatch({ type: "auth/logout" }); // Dispatch logout action
              localStorage.removeItem("authToken");
              window.location.href = "/auth"; // Redirect to login page
            }}
          >
            <LogOut className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Display Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;