import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
  file_url: string | null;
}

const Approvals = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      await loadUserRole(session.user.id);
      loadPendingInvoices();
    };
    checkAuth();
  }, [navigate]);

  const loadUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setUserRole(data.role);
    }
  };

  const loadPendingInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .in("status", ["pending", "approved_by_owner"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (invoice: Invoice) => {
    if (!userRole || !["owner", "finance"].includes(userRole)) {
      toast.error("You don't have permission to approve invoices");
      return;
    }

    try {
      let newStatus = invoice.status;
      if (userRole === "owner" && invoice.status === "pending") {
        newStatus = "approved_by_owner";
      } else if (userRole === "finance" && invoice.status === "approved_by_owner") {
        newStatus = "approved_by_finance";
      }

      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", invoice.id);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("approval_steps").insert({
          invoice_id: invoice.id,
          step_type: userRole === "owner" ? "owner_approval" : "finance_approval",
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          comments: comments[invoice.id] || null,
        });
      }

      toast.success("Invoice approved successfully!");
      loadPendingInvoices();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve invoice");
    }
  };

  const handleReject = async (invoice: Invoice) => {
    if (!userRole || !["owner", "finance"].includes(userRole)) {
      toast.error("You don't have permission to reject invoices");
      return;
    }

    try {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "rejected" })
        .eq("id", invoice.id);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("approval_steps").insert({
          invoice_id: invoice.id,
          step_type: userRole === "owner" ? "owner_approval" : "finance_approval",
          status: "rejected",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          comments: comments[invoice.id] || null,
        });
      }

      toast.success("Invoice rejected");
      loadPendingInvoices();
    } catch (error: any) {
      toast.error(error.message || "Failed to reject invoice");
    }
  };

  const canApprove = (invoice: Invoice) => {
    if (userRole === "owner" && invoice.status === "pending") return true;
    if (userRole === "finance" && invoice.status === "approved_by_owner") return true;
    return false;
  };

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve invoices {userRole && `(Your role: ${userRole})`}
          </p>
        </div>

        {!userRole || !["owner", "finance"].includes(userRole) ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You don't have permission to approve invoices. Please contact an administrator.
              </p>
            </CardContent>
          </Card>
        ) : loading ? (
          <p className="text-center text-muted-foreground">Loading pending approvals...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No pending approvals</p>
              <p className="text-muted-foreground">All invoices are up to date</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{invoice.invoice_number}</CardTitle>
                    <Badge>{invoice.status.replace(/_/g, " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="text-2xl font-bold">${invoice.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {invoice.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p>{invoice.description}</p>
                    </div>
                  )}

                  {invoice.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(invoice.file_url!, "_blank")}
                    >
                      View Attachment
                    </Button>
                  )}

                  {canApprove(invoice) && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label htmlFor={`comments-${invoice.id}`}>
                          Comments (Optional)
                        </Label>
                        <Textarea
                          id={`comments-${invoice.id}`}
                          value={comments[invoice.id] || ""}
                          onChange={(e) =>
                            setComments({ ...comments, [invoice.id]: e.target.value })
                          }
                          placeholder="Add your comments..."
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(invoice)}
                          className="flex-1"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(invoice)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {!canApprove(invoice) && (
                    <p className="text-sm text-muted-foreground pt-4 border-t">
                      {invoice.status === "pending" && userRole === "finance"
                        ? "Waiting for owner approval"
                        : "You cannot approve this invoice at this stage"}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Approvals;
