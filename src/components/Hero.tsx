import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src={logo} alt="i.approve logo" className="h-10 w-10" />
          <span className="text-2xl font-bold text-primary">i.approve</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Trusted by 500+ companies</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Streamline Your
            <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Approval Workflow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Intelligent invoice approval routing powered by AI. Get approvals faster with automatic vendor-department matching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" className="text-lg px-8 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Approval Rate</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">3x</div>
              <div className="text-sm text-muted-foreground">Faster Process</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};
