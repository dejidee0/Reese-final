"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, CheckCircle, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminStatus, setAdminStatus] = useState(null);
  const { user, isAdmin, setIsAdmin, setTier, setPoints } = useUserStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      checkAdminStatus();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated]);

  const checkAdminStatus = async () => {
    try {
      setChecking(true);
      const { data, error } = await supabase.rpc("check_user_admin_status");

      if (error) throw error;

      setAdminStatus(data);

      if (data.is_admin) {
        setIsAdmin(true);
        setTier(data.tier);
        setPoints(data.points);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error checking admin status");
    } finally {
      setChecking(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc("promote_user_to_admin");

      if (error) throw error;

      if (data.success) {
        toast.success("Successfully promoted to admin!");
        setIsAdmin(true);
        setTier("vip");
        setPoints(10000);

        // Refresh admin status
        await checkAdminStatus();

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to promote to admin");
      }
    } catch (error) {
      console.error("Error promoting to admin:", error);
      toast.error("Error promoting to admin");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <CardTitle>Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Please login to access admin setup
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/login")} className="flex-1">
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/register")}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Admin Setup</h1>
            <p className="text-gray-600">
              Set up your admin account to manage the ReeseBlanks platform
            </p>
          </div>

          {/* Current Status */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Email:</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Status:</span>
                  <div className="flex items-center gap-2">
                    {adminStatus?.is_admin ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <Badge className="bg-green-500">Admin</Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <Badge variant="secondary">Regular User</Badge>
                      </>
                    )}
                  </div>
                </div>
                {adminStatus && (
                  <>
                    <div className="flex items-center justify-between">
                      <span>Tier:</span>
                      <Badge className="bg-purple-500">
                        {adminStatus.tier?.toUpperCase() || "GUEST"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Points:</span>
                      <span className="font-semibold">
                        {adminStatus.points?.toLocaleString() || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Admin Actions */}
          {adminStatus?.is_admin ? (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  Admin Access Granted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-700 mb-4">
                  You have admin access to the ReeseBlanks platform!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push("/admin")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Go to Admin Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Promote to Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Click the button below to promote your account to admin
                    status. This will give you access to:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Product management</li>
                    <li>Order management</li>
                    <li>Drop creation and management</li>
                    <li>Lookbook management</li>
                    <li>User management</li>
                  </ul>
                  <Button
                    onClick={promoteToAdmin}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-orange-500"
                  >
                    <span>{loading ? "Promoting..." : "Promote to Admin"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-700">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  <strong>Step 1:</strong> Make sure you're logged in with the
                  account you want to make admin
                </p>
                <p>
                  <strong>Step 2:</strong> Click "Promote to Admin" to grant
                  admin privileges
                </p>
                <p>
                  <strong>Step 3:</strong> Access the admin dashboard to manage
                  your platform
                </p>
                <p className="mt-4 text-blue-600">
                  <strong>Note:</strong> This is a one-time setup. Once you're
                  an admin, you can manage other users through the admin
                  dashboard.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
