import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Shield, BarChart3, Users, Clock } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Intelligent Routing",
    description: "AI-powered vendor-department matching ensures invoices reach the right approver instantly.",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Track approval status in real-time with instant notifications and reminders.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with full audit trails and compliance reporting.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Gain insights into approval patterns, bottlenecks, and team performance.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamless multi-level approvals with comments and delegation options.",
  },
  {
    icon: CheckCircle,
    title: "One-Click Approvals",
    description: "Approve or reject with a single click from email, mobile, or web.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Everything You Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to transform your approval process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 bg-card/50 backdrop-blur hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
