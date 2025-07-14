"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Link from "next/link";

export function AdminLoginInfo() {
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const [copied, setCopied] = useState({});

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, tier, points, created_at")
        .eq("is_admin", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      toast.error("Error loading admin users");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = async (text, type, userId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [`${userId}-${type}`]: true }));
      toast.success(`${type} copied to clipboard`);
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [`${userId}-${type}`]: false }));
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const defaultCredentials = [
    {
      id: "default-1",
      email: "ifemicheal2@gmail.com",
      password: "admin123",
      first_name: "Admin",
      last_name: "User",
      tier: "vip",
      points: 10000,
      isDefault: true,
    },
  ];

  const allAdminCredentials =
    adminUsers.length > 0 ? adminUsers : defaultCredentials;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Admin Login Details
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Here are the admin credentials for accessing the ReeseBlank admin
            dashboard. Keep these credentials secure and change the default
            password after first login.
          </p>
        </motion.div>

        <div className="grid gap-6 mb-8">
          {allAdminCredentials.map((admin, index) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-600" />
                      <span>
                        {admin.first_name} {admin.last_name}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-orange-500">
                        <Shield className="w-3 h-3 mr-1" />
                        ADMIN
                      </Badge>
                      <Badge variant="secondary">
                        {admin.tier?.toUpperCase() || "VIP"}
                      </Badge>
                      {admin.isDefault && (
                        <Badge variant="outline">DEFAULT</Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Email */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(admin.email, "Email", admin.id)
                      }
                    >
                      <span>
                        {copied[`${admin.id}-Email`] ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-sm text-gray-600 font-mono">
                          {showPasswords[admin.id]
                            ? admin.password || "admin123"
                            : "••••••••"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePasswordVisibility(admin.id)}
                      >
                        <span>
                          {showPasswords[admin.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            admin.password || "admin123",
                            "Password",
                            admin.id
                          )
                        }
                      >
                        <span>
                          {copied[`${admin.id}-Password`] ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {admin.points?.toLocaleString() || "10,000"}
                      </p>
                      <p className="text-sm text-gray-600">Points</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">
                        {admin.tier?.toUpperCase() || "VIP"}
                      </p>
                      <p className="text-sm text-gray-600">Tier</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <Link href="/login" className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-orange-500">
                        Login as Admin
                      </Button>
                    </Link>
                    <Link href="/admin" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Setup Instructions */}
        <Card className="bg-gradient-to-r from-purple-50 to-orange-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Login with Admin Credentials</p>
                <p className="text-sm text-gray-600">
                  Use the email and password above to login at /login
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Access Admin Dashboard</p>
                <p className="text-sm text-gray-600">
                  Navigate to /admin to manage products, orders, and battles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Change Default Password</p>
                <p className="text-sm text-gray-600">
                  For security, change the default password after first login
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex gap-4 justify-center">
            <Link href="/admin-setup">
              <Button variant="outline">Create New Admin</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
