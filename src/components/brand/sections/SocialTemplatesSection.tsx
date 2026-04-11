import { SocialPostTemplate } from "../kit/SocialPostTemplate";
import { Logo } from "@/components/layout/Logo";

export function SocialTemplatesSection() {
  return (
    <section id="social-templates" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Social Media Templates</h2>
        <p className="text-muted-foreground">
          Ready-to-use templates for various social media platforms.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SocialPostTemplate
          platform="Instagram Post"
          dimensions="1080x1080px"
          preview={
            <div className="w-64 h-64 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <Logo variant="white" className="h-12" />
            </div>
          }
        />
        <SocialPostTemplate
          platform="Twitter/X Post"
          dimensions="1200x675px"
          preview={
            <div className="w-64 h-36 bg-gradient-to-r from-background to-muted rounded-lg flex items-center justify-center border">
              <Logo className="h-10" />
            </div>
          }
        />
        <SocialPostTemplate
          platform="LinkedIn Post"
          dimensions="1200x627px"
          preview={
            <div className="w-64 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border">
              <Logo className="h-10" />
            </div>
          }
        />
        <SocialPostTemplate
          platform="Facebook Post"
          dimensions="1200x630px"
          preview={
            <div className="w-64 h-32 bg-card rounded-lg flex items-center justify-center border shadow-sm">
              <Logo className="h-10" />
            </div>
          }
        />
        <SocialPostTemplate
          platform="Instagram Story"
          dimensions="1080x1920px"
          preview={
            <div className="w-36 h-64 bg-gradient-to-b from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Logo variant="white" className="h-10" />
            </div>
          }
        />
        <SocialPostTemplate
          platform="LinkedIn Banner"
          dimensions="1584x396px"
          preview={
            <div className="w-64 h-16 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-lg flex items-center justify-center">
              <Logo variant="white" className="h-8" />
            </div>
          }
        />
      </div>
    </section>
  );
}
