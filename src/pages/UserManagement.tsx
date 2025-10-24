import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
}

interface UserWithRoles extends Profile {
  roles: string[];
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await checkAdminStatus(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setIsAdmin(true);
        loadUsers();
      } else {
        toast.error("Access denied. Admin privileges required.");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Failed to verify permissions");
      navigate("/dashboard");
    }
  };

  const loadUsers = async () => {
    try {
      const [profilesResult, rolesResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*")
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (rolesResult.error) throw rolesResult.error;

      const profiles = profilesResult.data || [];
      const roles = rolesResult.data || [];

      const usersWithRoles: UserWithRoles[] = profiles.map(profile => ({
        ...profile,
        roles: roles
          .filter(r => r.user_id === profile.id)
          .map(r => r.role)
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (userId: string, role: string) => {
    try {
      const validRoles = ["user", "owner", "finance", "admin"];
      if (!validRoles.includes(role)) {
        toast.error("Invalid role");
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ 
          user_id: userId, 
          role: role as "user" | "owner" | "finance" | "admin"
        });

      if (error) {
        if (error.code === "23505") {
          toast.error("User already has this role");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`Role '${role}' added successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add role");
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (role === "user") {
      toast.error("Cannot remove the 'user' role");
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as "user" | "owner" | "finance" | "admin");

      if (error) throw error;

      toast.success(`Role '${role}' removed successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to remove role");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "owner":
        return "bg-purple-500";
      case "finance":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <img src={logo} alt="i-approve" className="h-10 w-10" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              i-approve
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold mb-1">User Management</h2>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading users...</p>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{user.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Current Roles:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            className={`${getRoleBadgeColor(role)} cursor-pointer`}
                            onClick={() => handleRemoveRole(user.id, role)}
                          >
                            {role}
                            {role !== "user" && " ×"}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click on a role to remove it (except 'user')
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Add Role:</p>
                      <Select
                        onValueChange={(value) => handleAddRole(user.id, value)}
                      >
                        <SelectTrigger className="w-full md:w-64">
                          <SelectValue placeholder="Select a role to add" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;
