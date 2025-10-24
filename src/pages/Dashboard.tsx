import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import { Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      checkAdminStatus(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Failed to check admin status:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="i-approve" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              i-approve
            </h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage your approval workflows</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Button
            onClick={() => navigate("/invoices/new")}
            className="h-32 text-lg"
            size="lg"
          >
            Upload New Invoice
          </Button>
          <Button
            onClick={() => navigate("/invoices")}
            variant="secondary"
            className="h-32 text-lg"
            size="lg"
          >
            View All Invoices
          </Button>
          <Button
            onClick={() => navigate("/approvals")}
            variant="outline"
            className="h-32 text-lg"
            size="lg"
          >
            Pending Approvals
          </Button>
        </div>

        {isAdmin && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Admin Tools</h3>
            </div>
            <Button
              onClick={() => navigate("/users")}
              variant="outline"
              className="h-24 w-full text-lg"
              size="lg"
            >
              <Shield className="mr-2 h-5 w-5" />
              User Management
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
