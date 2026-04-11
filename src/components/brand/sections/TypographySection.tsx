import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TypographySection() {
  return (
    <section id="typography" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Typography</h2>
        <p className="text-muted-foreground">
          Our typographic system ensures consistency and readability across all
          platforms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Font Families</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Primary (Headings)
            </p>
            <p className="text-4xl font-bold">Inter</p>
            <p className="text-sm text-muted-foreground mt-1">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p className="text-sm text-muted-foreground">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p className="text-sm text-muted-foreground">0123456789</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Secondary (Body)
            </p>
            <p className="text-2xl">System UI</p>
            <p className="text-sm text-muted-foreground mt-1">
              Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI",
              sans-serif
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Type Scale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-5xl font-bold">Heading 1 - 48px</h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold">Heading 2 - 36px</h2>
          </div>
          <div>
            <h3 className="text-3xl font-bold">Heading 3 - 30px</h3>
          </div>
          <div>
            <h4 className="text-2xl font-bold">Heading 4 - 24px</h4>
          </div>
          <div>
            <h5 className="text-xl font-semibold">Heading 5 - 20px</h5>
          </div>
          <div>
            <p className="text-base">Body Text - 16px</p>
          </div>
          <div>
            <p className="text-sm">Small Text - 14px</p>
          </div>
          <div>
            <p className="text-xs">Extra Small - 12px</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
