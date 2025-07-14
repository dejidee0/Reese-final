import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/lib/stores/userStore";

export function useAuth() {
  const { user, setUser, setProfile, setTier, setPoints, setIsAdmin, logout } =
    useUserStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile) {
        setProfile(profile);
        console.log(profile);
        setTier(profile.tier || "guest");
        setPoints(profile.points || 0);
        setIsAdmin(profile.is_admin || false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const signInAndInsertProfile = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return {
            error: {
              message: "Please verify your email before signing in.",
              code: "email_not_confirmed",
            },
          };
        }

        return { error };
      }

      const userId = data.user.id;

      // ✅ Attempt to fetch profile
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle(); // 👈 safer than `.single()` for non-existence

      if (fetchError) {
        console.error("❌ Fetch profile error:", fetchError);
        return { error: fetchError };
      }

      // ✅ If profile doesn't exist, create one
      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email: data.user.email,
          first_name: "",
          last_name: "",
          tier: "guest",
          points: 0,
          is_admin: false,
        });

        if (insertError) {
          console.error("❌ Insert profile error:", insertError);
          return { error: insertError };
        }
      }

      return { data, error: null };
    } catch (err) {
      console.error("❌ Unexpected catch block error:", err);
      return {
        error: {
          message: "An unexpected error occurred. Please try again.",
        },
      };
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { data, error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      logout();
    }
    return { error };
  };

  return {
    user,
    signInAndInsertProfile,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };
}
