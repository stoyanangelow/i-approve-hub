import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, DollarSign } from "lucide-react";
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

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      loadInvoices();
    };
    checkAuth();
  }, [navigate]);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved_by_owner":
        return "bg-blue-500";
      case "approved_by_finance":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">All Invoices</h2>
            <p className="text-muted-foreground">View and track your invoice submissions</p>
          </div>
          <Button onClick={() => navigate("/invoices/new")}>
            Upload New Invoice
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">No invoices yet</p>
              <p className="text-muted-foreground mb-4">Start by uploading your first invoice</p>
              <Button onClick={() => navigate("/invoices/new")}>
                Upload Invoice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold">
                    {invoice.invoice_number}
                  </CardTitle>
                  <Badge className={getStatusColor(invoice.status)}>
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold">
                        ${invoice.amount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {invoice.description && (
                    <p className="mt-4 text-muted-foreground">{invoice.description}</p>
                  )}
                  {invoice.file_url && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(invoice.file_url!, "_blank")}
                      >
                        View Attachment
                      </Button>
                    </div>
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

export default Invoices;
