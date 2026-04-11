import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Lightbulb, Users, Zap, Shield } from "lucide-react";

const voiceAttributes = [
  {
    icon: Lightbulb,
    title: "Professional yet Approachable",
    description:
      "We communicate with expertise while remaining accessible and friendly.",
    example:
      "Instead of: 'Utilize our comprehensive digital solutions.' Say: 'Let's build something amazing together.'",
  },
  {
    icon: Users,
    title: "Clear and Confident",
    description:
      "Direct communication that demonstrates our expertise without unnecessary jargon.",
    example:
      "Instead of: 'We leverage synergistic paradigms.' Say: 'We create solutions that work.'",
  },
  {
    icon: Zap,
    title: "Action-Oriented",
    description: "Focus on outcomes and results with strong, active language.",
    example:
      "Instead of: 'Your website will be optimized.' Say: 'We'll boost your website performance.'",
  },
  {
    icon: Shield,
    title: "Trustworthy and Transparent",
    description: "Honest communication that builds long-term relationships.",
    example:
      "Instead of: 'Best in class solutions.' Say: 'Here's exactly what we'll deliver and when.'",
  },
];

export function VoiceToneSection() {
  return (
    <section id="voice-tone" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Voice & Tone</h2>
        <p className="text-muted-foreground">
          Our brand voice reflects who we are: innovative, reliable, and
          genuinely invested in our clients' success.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {voiceAttributes.map((attribute) => (
          <Card key={attribute.title}>
            <CardHeader>
              <attribute.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{attribute.title}</CardTitle>
              <CardDescription>{attribute.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm italic">{attribute.example}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Writing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use active voice and strong verbs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Keep sentences concise and scannable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Lead with benefits, not features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Use contractions to sound more natural</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Avoid buzzwords and corporate speak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Be specific with numbers and timelines</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
