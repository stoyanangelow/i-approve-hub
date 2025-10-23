import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-12 md:p-16 text-center shadow-[var(--shadow-soft)] animate-fade-in">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Ready to Transform Your Approvals?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join hundreds of companies streamlining their approval workflow with i.approve
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 bg-white text-primary hover:bg-white/90 group"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  );
};
