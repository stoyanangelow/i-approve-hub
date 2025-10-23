import { Upload, Brain, CheckCircle2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Invoices",
    description: "Simply upload invoices or integrate with your existing systems.",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Routing",
    description: "Our AI automatically routes to the right approver based on vendor and department.",
    step: "02",
  },
  {
    icon: CheckCircle2,
    title: "Quick Approval",
    description: "Approvers receive notifications and can approve with one click.",
    step: "03",
  },
  {
    icon: TrendingUp,
    title: "Track & Analyze",
    description: "Monitor approval velocity and gain insights into your workflow.",
    step: "04",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative group animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-br from-primary to-accent opacity-20 rounded-full blur-xl group-hover:opacity-30 transition-opacity" />
                  <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent text-accent-foreground font-bold flex items-center justify-center text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-accent/50 to-transparent -z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
