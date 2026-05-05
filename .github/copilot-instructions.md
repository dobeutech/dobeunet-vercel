# GitHub Copilot Instructions for DOBEU

Comprehensive AI agent guidelines for working on the DOBEU Tech Solutions codebase.

---

## Project Overview

**DOBEU** is a premium digital services platform offering web development, software solutions, and consulting.

| Category         | Technologies                                   |
| ---------------- | ---------------------------------------------- |
| **Frontend**     | React 18, TypeScript 5, Vite 7                 |
| **UI**           | Tailwind CSS, Radix UI, shadcn/ui              |
| **Animation**    | Framer Motion (`motion/react`)                 |
| **Backend**      | Vercel Serverless Functions (Node)             |
| **Auth**         | Auth0 (SPA + JWT) + Supabase Auth              |
| **Database**     | Supabase (PostgreSQL) — `db-dobeutech-unified` |
| **File Storage** | Supabase Storage                               |
| **Payments**     | Stripe                                         |
| **SMS**          | Twilio                                         |
| **Analytics**    | PostHog, Mixpanel, Google Analytics            |
| **Hosting**      | Vercel (Edge, CDN, Functions)                  |
| **Testing**      | Vitest (unit), Playwright (E2E)                |

---

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── brand/            # Brand kit components
│   ├── forms/            # Form components & templates
│   ├── home/             # Homepage sections
│   ├── layout/           # Layout (Header, Footer, etc.)
│   ├── navigation/       # Nav components
│   ├── seo/              # SEO components (PageMeta)
│   └── ui/               # shadcn/ui components
├── config/               # App configuration
│   ├── env.ts            # Environment validation
│   ├── navigation.ts     # Navigation config
│   └── typeform.ts       # Typeform config
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Auth0 authentication
│   ├── LanguageContext.tsx
│   ├── NavigationContext.tsx
│   └── SettingsContext.tsx
├── hooks/                # Custom React hooks
├── integrations/         # External service clients
│   └── supabase/         # Supabase client
├── lib/                  # Utility libraries
│   ├── api.ts            # API client with Auth0
│   ├── api-client.ts     # Base fetch wrapper
│   ├── mixpanel.ts       # Analytics
│   └── utils.ts          # General utilities
├── pages/                # Page components
│   └── admin/            # Admin portal pages
└── __tests__/            # Test files

api/                      # Vercel serverless API endpoints
├── _helpers/             # Shared helpers
│   ├── auth0.ts          # Auth0 JWT verification
│   ├── supabase.ts       # Supabase server client (getSupabaseClient)
│   └── http.ts           # HTTP utilities
└── *.ts                  # API endpoints

supabase/
├── migrations/           # PostgreSQL migrations
└── config.toml           # Supabase configuration
```

---

## Brand Colors

Use these consistently throughout the codebase:

| Color          | Hex       | CSS Variable           | Usage               |
| -------------- | --------- | ---------------------- | ------------------- |
| Electric Lemon | `#FACC15` | `--primary`            | Primary brand color |
| Azure Tech     | `#3B82F6` | `--secondary`          | Technology accent   |
| Deep Violet    | `#A855F7` | -                      | Premium accent      |
| Neon Rose      | `#EC4899` | -                      | Highlight accent    |
| Void Black     | `#000000` | `--background` (dark)  | Dark backgrounds    |
| Stark White    | `#FFFFFF` | `--background` (light) | Light backgrounds   |

---

## Frontend Patterns

### Component Template

```tsx
import { PageMeta } from "@/components/seo/PageMeta";

export default function PageName() {
  return (
    <>
      <PageMeta
        title="Page Title"
        description="Page description for SEO"
        keywords="relevant, keywords"
        canonical="https://dobeu.net/page-path"
      />
      <div className="min-h-screen pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">{/* Content */}</div>
      </div>
    </>
  );
}
```

### Form Component Pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Invalid email"),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### API Hook Usage

```tsx
import { useApi } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

function MyComponent() {
  const api = useApi();
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await api.get<DataType>("/endpoint");
      setData(result);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
}
```

### Protected Route Pattern

```tsx
// For authenticated users
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// For admin users
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

---

## Backend Patterns (Vercel Functions)

### Basic Function Template

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
      .status(204)
      .end();
    return;
  }

  try {
    // Your logic here
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
}
```

### Authenticated Function

```typescript
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth, Auth0Claims } from "./_helpers/auth0";
import { getSupabaseClient } from "./_helpers/supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Verify JWT and get user claims
    const user: Auth0Claims = await requireAuth(req);

    // Server-side Supabase client (service role)
    const supabase = getSupabaseClient();

    // Query with user context
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", user.sub);
    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    if (error.message.includes("Missing Authorization")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }
    return { statusCode: 500, body: JSON.stringify({ error: "Server error" }) };
  }
}
```

### Admin-Only Function

```typescript
import { requireAuth, requirePermission } from "./_auth0";

export const handler: Handler = async (event) => {
  const user = await requireAuth(event);
  requirePermission(user, "admin:access"); // Throws if missing

  // Admin-only logic here
};
```

---

## Database

All data lives in Supabase Postgres project **`db-dobeutech-unified`**
(`https://qdwvcrmdqweojverdmmz.supabase.co`). There is no MongoDB.

### Supabase Operations

```typescript
import { getSupabaseClient } from "./_helpers/supabase";

const supabase = getSupabaseClient();

// Select
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("user_id", userId);

// Insert
await supabase.from("table_name").insert({ ...data });

// Update
await supabase
  .from("table_name")
  .update({ ...updates })
  .eq("id", id);

// Delete
await supabase.from("table_name").delete().eq("id", id);
```

### Supabase Tables

| Table                    | Purpose                          |
| ------------------------ | -------------------------------- |
| `services`               | Service catalog                  |
| `purchases`              | Payment records                  |
| `projects`               | Client projects                  |
| `project_tasks`          | Project todo items               |
| `client_files`           | File metadata (3-year retention) |
| `newsletter_posts`       | Newsletter content               |
| `newsletter_subscribers` | Email subscribers                |
| `rate_limits`            | API rate limiting                |

### Migration Template

```sql
-- Description
CREATE TABLE IF NOT EXISTS public.table_name (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    -- columns
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_table_column ON public.table_name(column);

-- Enable RLS
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data"
ON public.table_name FOR SELECT
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_table_updated_at
BEFORE UPDATE ON public.table_name
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

---

## UI Components (shadcn/ui)

Import from `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

### Common Class Patterns

```tsx
// Card with shadow
<Card className="shadow-material hover:shadow-material-lg transition-material">

// Gradient text
<span className="gradient-primary bg-clip-text text-transparent">

// Responsive container
<div className="container mx-auto px-4 max-w-4xl">

// Page layout
<div className="min-h-screen pt-24 pb-20 px-4">

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## Testing

### Unit Test (Vitest)

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Updated")).toBeInTheDocument();
  });
});
```

### E2E Test (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("user can submit contact form", async ({ page }) => {
  await page.goto("/contact");

  await page.fill('[name="name"]', "Test User");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="message"]', "Test message");

  await page.click('button[type="submit"]');

  await expect(page.getByText("Message sent")).toBeVisible();
});
```

---

## Environment Variables

### Frontend (Vite)

```env
# Auth0
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your_auth0_spa_client_id
VITE_AUTH0_AUDIENCE=https://api.dobeu.netlify.app

# Supabase (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Analytics
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Backend (Vercel Functions)

```env
# Auth0
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://api.dobeu.net

# Supabase (db-dobeutech-unified)
SUPABASE_URL=https://qdwvcrmdqweojverdmmz.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Stripe
STRIPE_SECRET_KEY=sk_...
```

---

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start dev server (port 8080) |
| `npm run build`      | Production build             |
| `npm run lint`       | Run ESLint                   |
| `npm run lint:fix`   | Fix lint errors              |
| `npm run test`       | Run unit tests               |
| `npm run test:e2e`   | Run E2E tests                |
| `npm run type-check` | TypeScript check             |
| `npm run verify`     | Verify setup                 |

---

## Code Style Guidelines

### TypeScript

- Use explicit types, avoid `any`
- Use `unknown` instead of `any` for generic handlers
- Define interfaces for all data structures

### React

- Use functional components with hooks
- Use `useCallback` for functions passed to `useEffect` dependencies
- Memoize expensive computations with `useMemo`

### CSS/Tailwind

- Use Tailwind utilities, avoid custom CSS
- Follow mobile-first responsive design
- Use CSS variables from the theme (`hsl(var(--primary))`)

### Forms

- Always use Zod for validation
- Use react-hook-form with zodResolver
- Show field-level error messages

### API

- Validate all inputs with Zod schemas
- Return consistent error formats
- Use proper HTTP status codes

### Git

- Commit message format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

---

## Common Pitfalls to Avoid

1. **Don't use `any`** - Use proper types or `unknown`
2. **Don't forget PageMeta** - All pages need SEO metadata
3. **Don't skip error handling** - Wrap async operations in try/catch
4. **Don't hardcode secrets** - Use environment variables
5. **Don't forget RLS policies** - All Supabase tables need RLS
6. **Don't log sensitive data** - Never log tokens, passwords, URIs
7. **Don't skip loading states** - Show skeletons/spinners
8. **Don't forget mobile** - Test responsive layouts

---

## Related Documentation

- `AGENTS.md` - Comprehensive agent guide
- `README.md` - Project overview
- `OUTSTANDING_ITEMS_CHECKLIST.md` - Current task list
- `docs/SYSTEM_ARCHITECTURE.md` - Architecture diagrams
- `docs/OPERATIONAL_RUNBOOK.md` - Operations guide
