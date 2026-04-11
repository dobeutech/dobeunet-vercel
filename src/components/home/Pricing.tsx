import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const pricingOptions = [
  {
    title: "Project-Based",
    price: "Custom",
    description: "Perfect for defined scopes and one-time builds",
    features: [
      "Fixed scope & timeline",
      "Detailed project roadmap",
      "Milestone-based delivery",
      "Post-launch support",
      "Source code ownership",
    ],
    cta: "Get a Quote",
    popular: false,
  },
  {
    title: "Monthly Retainer",
    price: "From $3,500",
    period: "/month",
    description: "Ongoing support and continuous development",
    features: [
      "Dedicated development hours",
      "Priority support & updates",
      "Regular sprint cycles",
      "Flexible scope adjustments",
      "Strategic consulting included",
    ],
    cta: "Start Subscription",
    popular: true,
  },
  {
    title: "Hourly Consulting",
    price: "$250",
    period: "/hour",
    description: "Flexible support for specific needs",
    features: [
      "Pay only for what you need",
      "Expert technical guidance",
      "Code review & optimization",
      "Architecture consulting",
      "No long-term commitment",
    ],
    cta: "Book Consultation",
    popular: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container px-4 mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground">
            Choose the engagement model that fits your business needs.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricingOptions.map((option, index) => (
            <motion.div
              key={option.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={cn(
                  "h-full p-6 rounded-xl border",
                  "transition-all duration-200",
                  option.popular
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/30",
                )}
              >
                {/* Popular badge */}
                {option.popular && (
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground mb-4">
                    Most Popular
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {option.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{option.price}</span>
                    {option.period && (
                      <span className="text-muted-foreground ml-1">
                        {option.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {option.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  asChild
                  className={cn(
                    "w-full",
                    option.popular
                      ? ""
                      : "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
                  )}
                  variant={option.popular ? "default" : "secondary"}
                >
                  <Link to="/pricing">{option.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom solution CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <div className="max-w-lg mx-auto p-6 rounded-xl border border-border bg-muted/30">
            <h3 className="font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We'll craft a tailored engagement that perfectly fits your unique
              requirements.
            </p>
            <Button asChild variant="outline" className="rounded-lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
