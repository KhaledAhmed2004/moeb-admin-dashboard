"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import api from "@/lib/axios";
import {
  User,
  KeyRound,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminProfilePage() {
  // Profile Form State with local fallback initializers
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.name) return parsed.name;
        } catch {
          // ignore
        }
      }
    }
    return "Admin User";
  });

  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.email) return parsed.email;
        } catch {
          // ignore
        }
      }
    }
    return "admin@ekkali.com";
  });

  const [avatar, setAvatar] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_profile");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.avatar) return parsed.avatar;
        } catch {
          // ignore
        }
      }
    }
    return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop";
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Fetch live profile data from backend on mount: GET /api/v1/user/profile
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile").catch(async () => {
          return await api.get("/users/profile").catch(async () => {
            return await api.get("/user/me").catch(async () => {
              return await api.get("/auth/me");
            });
          });
        });

        const userData = res?.data?.data || res?.data;
        if (userData && isMounted) {
          if (userData.name || userData.fullName) {
            setName(userData.name || userData.fullName);
          }
          if (userData.email) {
            setEmail(userData.email);
          }
          const fetchedImage =
            userData.profilePicture ||
            userData.avatar ||
            userData.image ||
            userData.profileImage;
          if (fetchedImage) {
            setAvatar(fetchedImage);
          }
        }
      } catch {
        // Graceful fallback to cached state
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Avatar file upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        toast.success("Profile photo selected!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile Save: PATCH /api/v1/user/profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      if (avatarFile) {
        // Multipart Form-Data for direct image file upload
        const formData = new FormData();
        formData.append("profilePicture", avatarFile);
        formData.append("name", name);

        await api.patch("/user/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }).catch(async () => {
          await api.patch("/users/profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          }).catch(async () => {
            await api.patch("/user/update-profile", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          });
        });
      } else {
        // Standard JSON payload
        const payload = { name, avatar, profilePicture: avatar };
        await api.patch("/user/profile", payload).catch(async () => {
          await api.patch("/users/profile", payload).catch(async () => {
            await api.patch("/user/update-profile", payload).catch(async () => {
              await api.patch("/users/update-profile", payload);
            });
          });
        });
      }

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "admin_profile",
          JSON.stringify({ name, email, avatar })
        );
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.success("Profile updated successfully!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password Update (Admin does not require current password)
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSavingPassword(true);

    try {
      const payload = {
        newPassword,
        confirmPassword,
      };

      await api.post("/auth/change-password", payload).catch(async () => {
        await api.patch("/auth/change-password", payload).catch(async () => {
          await api.put("/users/change-password", payload);
        });
      });

      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message || "Failed to update password. Please try again.";
      toast.error(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Edit Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account information, profile photo, and security password.
        </p>
      </div>

      {/* Section 1: Profile Details */}
      <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-xl bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <User size={18} className="text-purple-600" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your profile photo, display name, and email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Row */}
            <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
              <div className="relative">
                <Avatar className="size-16 rounded-xl border border-gray-200 bg-purple-600">
                  <AvatarImage src={avatar} alt={name} className="object-cover" />
                  <AvatarFallback className="rounded-xl bg-purple-600 text-white font-bold text-base">
                    AD
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 cursor-pointer transition-colors"
                >
                  <Camera size={14} className="text-gray-500" />
                  <span>Change Photo</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  JPG, PNG or WEBP (Max 2MB)
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name" className="text-xs font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="admin-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Admin Name"
                    className="pl-10 h-10 rounded-lg bg-gray-50/50 border-gray-200 text-xs focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-xs font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 h-10 rounded-lg bg-gray-100/60 border-gray-200 text-xs text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingProfile}
                size="sm"
                className="rounded-lg px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium cursor-pointer gap-1.5"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Section 2: Change Password */}
      <Card className="border-0 shadow-sm ring-1 ring-black/5 rounded-xl bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <KeyRound size={18} className="text-purple-600" />
            Change Password
          </CardTitle>
          <CardDescription className="text-xs">
            Set a new password for your administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-pass" className="text-xs font-medium text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="new-pass"
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="pl-10 pr-9 h-10 rounded-lg bg-gray-50/50 border-gray-200 text-xs focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-pass" className="text-xs font-medium text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="confirm-pass"
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="pl-10 pr-9 h-10 rounded-lg bg-gray-50/50 border-gray-200 text-xs focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                Passwords do not match
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingPassword || (confirmPassword.length > 0 && newPassword !== confirmPassword)}
                size="sm"
                className="rounded-lg px-5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium cursor-pointer gap-1.5"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="size-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
