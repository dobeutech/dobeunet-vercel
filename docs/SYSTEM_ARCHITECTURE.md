# System Architecture - Digital Wharf Dynamics

**Visual documentation of the complete system architecture**

---

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "CDN & Edge"
        VercelEdge[Vercel Edge Network]
        EdgeFn[Edge Functions]
        CSP[CSP Nonce]
        UABlock[UA Blocker]
        Prerender[Prerender]
    end

    subgraph "Application Layer"
        React[React 18 SPA]
        Router[React Router]
        RQ[React Query]
        Auth0Client[Auth0 SDK]
    end

    subgraph "Serverless Functions"
        AuthFn[_helpers/auth0.ts]
        SupabaseFn[_helpers/supabase.ts]
        ContactFn[contact-submissions.ts]
        ProjectsFn[projects.ts]
        ServicesFn[services.ts]
        NewsFn[news.ts]
        NewsletterFn[newsletter.ts]
        UsersFn[admin-users.ts]
        AuditFn[audit-logs.ts]
        CCPAFn[ccpa-request.ts]
        FilesFn[files.ts]
        CheckoutFn[create-checkout.ts]
        TasksFn[project-tasks.ts]
    end

    subgraph "Authentication"
        Auth0[Auth0]
        JWT[JWT Tokens]
    end

    subgraph "Database"
        Supabase[(Supabase PostgreSQL)]
        SupabaseStorage[Supabase Storage]
    end

    subgraph "External Services"
        Stripe[Stripe API]
        PostHog[PostHog Analytics]
        Mixpanel[Mixpanel Analytics]
        GTM[Google Tag Manager]
        Intercom[Intercom Support]
        Typeform[Typeform]
    end

    Browser --> VercelEdge
    Mobile --> VercelEdge
    VercelEdge --> EdgeFn
    EdgeFn --> CSP
    EdgeFn --> UABlock
    EdgeFn --> Prerender
    VercelEdge --> React
    React --> Router
    React --> RQ
    React --> Auth0Client
    Auth0Client --> Auth0
    Auth0 --> JWT
    RQ --> AuthFn
    RQ --> SupabaseFn
    RQ --> ContactFn
    RQ --> ProjectsFn
    RQ --> ServicesFn
    AuthFn --> Auth0
    SupabaseFn --> Supabase
    ContactFn --> Supabase
    ProjectsFn --> Supabase
    ServicesFn --> Supabase
    NewsFn --> Supabase
    NewsletterFn --> Supabase
    UsersFn --> Supabase
    AuditFn --> Supabase
    CCPAFn --> Supabase
    FilesFn --> SupabaseStorage
    CheckoutFn --> Stripe
    TasksFn --> Supabase
    React --> PostHog
    React --> Mixpanel
    React --> GTM
    React --> Intercom
    React --> Typeform
```

---

## 🔄 Request Flow

```mermaid
sequenceDiagram
    participant User
    participant CDN as Vercel Edge
    participant Edge as Edge Functions
    participant App as React App
    participant Auth as Auth0
    participant Fn as Vercel Functions
    participant DB as Supabase
    participant Ext as External APIs

    User->>CDN: Request Page
    CDN->>Edge: Process Request
    Edge->>Edge: Apply CSP Nonce
    Edge->>Edge: Check User Agent
    Edge->>CDN: Return Response
    CDN->>User: Serve Static Assets

    User->>App: Interact with UI
    App->>Auth: Check Authentication
    Auth-->>App: Return JWT Token

    App->>Fn: API Request + JWT
    Fn->>Auth: Validate Token
    Auth-->>Fn: Token Valid
    Fn->>DB: Query/Update Data
    DB-->>Fn: Return Data
    Fn-->>App: Return Response
    App-->>User: Update UI

    App->>Ext: Track Analytics
    Ext-->>App: Acknowledge
```

---

## 🗄️ Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend State"
        UI[UI Components]
        Forms[Form Components]
        State[React State]
        Cache[React Query Cache]
    end

    subgraph "API Layer"
        API[API Client]
        Auth[Auth Interceptor]
        Error[Error Handler]
    end

    subgraph "Backend"
        Functions[Vercel Functions]
        Validation[Input Validation]
        Business[Business Logic]
    end

    subgraph "Data Store"
        Supabase[(Supabase PostgreSQL)]
        Tables[Tables]
        Indexes[Indexes]
        Storage[Supabase Storage]
    end

    UI --> Forms
    Forms --> State
    State --> Cache
    Cache --> API
    API --> Auth
    Auth --> Error
    Error --> Functions
    Functions --> Validation
    Validation --> Business
    Business --> Supabase
    Supabase --> Tables
    Supabase --> Indexes
    Supabase --> Storage
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as React App
    participant Auth0SDK as Auth0 SDK
    participant Auth0 as Auth0 Service
    participant Fn as Vercel Function
    participant DB as Supabase

    User->>App: Click Login
    App->>Auth0SDK: loginWithRedirect()
    Auth0SDK->>Auth0: Redirect to Login
    Auth0->>User: Show Login Form
    User->>Auth0: Enter Credentials
    Auth0->>Auth0: Validate Credentials
    Auth0->>Auth0SDK: Redirect with Code
    Auth0SDK->>Auth0: Exchange Code for Token
    Auth0-->>Auth0SDK: Return JWT + Refresh Token
    Auth0SDK-->>App: User Authenticated

    App->>Fn: API Request + JWT
    Fn->>Auth0: Verify JWT
    Auth0-->>Fn: Token Valid + User Info
    Fn->>DB: Query User Data
    DB-->>Fn: Return User Data
    Fn-->>App: Return Response
    App-->>User: Show Protected Content
```

---

## 📦 Component Architecture

```mermaid
graph TB
    subgraph "Pages"
        Home[Home]
        About[About]
        Services[Services]
        Projects[Projects]
        Contact[Contact]
        Admin[Admin Portal]
    end

    subgraph "Layout Components"
        Header[Header]
        Footer[Footer]
        Nav[Navigation]
        Sidebar[Sidebar]
    end

    subgraph "Feature Components"
        Hero[Hero Section]
        ServiceCard[Service Cards]
        ProjectCard[Project Cards]
        ContactForm[Contact Form]
        Newsletter[Newsletter]
    end

    subgraph "UI Components"
        Button[Button]
        Input[Input]
        Card[Card]
        Dialog[Dialog]
        Toast[Toast]
        Form[Form]
    end

    subgraph "Shared Components"
        ErrorBoundary[Error Boundary]
        LoadingSpinner[Loading Spinner]
        SEO[SEO Components]
        Analytics[Analytics]
    end

    Home --> Header
    Home --> Hero
    Home --> ServiceCard
    Home --> Footer
    Services --> Header
    Services --> ServiceCard
    Services --> Footer
    Projects --> Header
    Projects --> ProjectCard
    Projects --> Footer
    Contact --> Header
    Contact --> ContactForm
    Contact --> Footer
    Admin --> Sidebar
    Admin --> Nav

    Hero --> Button
    ServiceCard --> Card
    ProjectCard --> Card
    ContactForm --> Form
    Form --> Input
    Form --> Button

    Home --> ErrorBoundary
    Home --> SEO
    Home --> Analytics
```

---

## 🗂️ Database Schema

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : creates
    USERS ||--o{ AUDIT_LOGS : generates
    USERS ||--o{ CCPA_REQUESTS : submits
    PROJECTS ||--o{ PROJECT_TASKS : contains
    PROJECTS ||--o{ FILES : has

    USERS {
        string id PK
        string email
        string name
        string role
        datetime created_at
        datetime updated_at
    }

    PROJECTS {
        string id PK
        string title
        string description
        string status
        string user_id FK
        datetime created_at
        datetime updated_at
    }

    PROJECT_TASKS {
        string id PK
        string project_id FK
        string title
        string status
        datetime due_date
        datetime created_at
    }

    SERVICES {
        string id PK
        string name
        string description
        decimal price
        boolean active
        datetime created_at
    }

    CONTACT_SUBMISSIONS {
        string id PK
        string name
        string email
        string phone
        string message
        boolean sms_consent
        datetime created_at
    }

    NEWSLETTER_SUBSCRIBERS {
        string id PK
        string email
        boolean active
        datetime subscribed_at
    }

    NEWS {
        string id PK
        string title
        string content
        string author
        datetime published_at
    }

    AUDIT_LOGS {
        string id PK
        string user_id FK
        string action
        string resource
        json metadata
        datetime created_at
    }

    CCPA_REQUESTS {
        string id PK
        string user_id FK
        string request_type
        string status
        datetime created_at
        datetime processed_at
    }

    FILES {
        string id PK
        string project_id FK
        string filename
        string content_type
        int size
        string file_path
        datetime uploaded_at
    }
```

---

## 🚀 Deployment Pipeline

```mermaid
graph LR
    subgraph "Development"
        Dev[Local Dev]
        Git[Git Commit]
        PR[Pull Request]
    end

    subgraph "CI/CD"
        GHA[GitHub Actions]
        Lint[ESLint]
        Test[Vitest]
        Build[Vite Build]
        E2E[Playwright E2E]
    end

    subgraph "Deployment"
        Preview[Preview Deploy]
        Prod[Production Deploy]
        Rollback[Rollback Option]
    end

    subgraph "Monitoring"
        Netlify[Netlify Logs]
        PostHog[PostHog Events]
        SBMetrics[Supabase Logs & Metrics]
    end

    Dev --> Git
    Git --> PR
    PR --> GHA
    GHA --> Lint
    GHA --> Test
    GHA --> Build
    GHA --> E2E
    Build --> Preview
    PR --> Prod
    Prod --> Netlify
    Prod --> PostHog
    Prod --> Supa
    Prod --> Rollback
```

---

## 🔌 Integration Architecture

```mermaid
graph TB
    subgraph "Application"
        App[React App]
    end

    subgraph "Authentication"
        Auth0[Auth0]
        AuthSDK[Auth0 React SDK]
    end

    subgraph "Analytics"
        PH[PostHog]
        MP[Mixpanel]
        GTM[Google Tag Manager]
        GA[Google Analytics]
    end

    subgraph "Support"
        IC[Intercom]
        TF[Typeform]
    end

    subgraph "Payments"
        Stripe[Stripe]
    end

    subgraph "Database"
        Supa[Supabase Postgres db-dobeutech-unified]
    end

    App --> AuthSDK
    AuthSDK --> Auth0
    App --> PH
    App --> MP
    App --> GTM
    GTM --> GA
    App --> IC
    App --> TF
    App --> Stripe
    App --> Supa
```

---

## 📱 Frontend Stack

```mermaid
graph TB
    subgraph "Build Tools"
        Vite[Vite 7]
        TS[TypeScript 5]
        ESLint[ESLint]
    end

    subgraph "Framework"
        React[React 18]
        Router[React Router 6]
        RQ[React Query]
    end

    subgraph "UI Library"
        Tailwind[Tailwind CSS]
        Radix[Radix UI]
        Shadcn[shadcn/ui]
    end

    subgraph "Forms"
        RHF[React Hook Form]
        Zod[Zod Validation]
    end

    subgraph "State Management"
        Context[React Context]
        Query[React Query Cache]
    end

    Vite --> TS
    Vite --> ESLint
    Vite --> React
    React --> Router
    React --> RQ
    React --> Context
    RQ --> Query
    React --> Tailwind
    Tailwind --> Radix
    Radix --> Shadcn
    React --> RHF
    RHF --> Zod
```

---

## 🔧 Backend Stack

```mermaid
graph TB
    subgraph "Hosting"
        Netlify[Netlify]
        CDN[Global CDN]
        Edge[Edge Functions]
    end

    subgraph "Functions"
        Node[Node.js 20]
        TS[TypeScript]
        Functions[Serverless Functions]
    end

    subgraph "Database"
        Supa[Supabase Postgres db-dobeutech-unified]
        SupaStor[Supabase Storage]
        Indexes[Indexes]
    end

    subgraph "Authentication"
        Auth0[Auth0]
        JWT[JWT Tokens]
    end

    Netlify --> CDN
    Netlify --> Edge
    Netlify --> Functions
    Functions --> Node
    Functions --> TS
    Functions --> Supa
    Supa --> SupaStor
    Supa --> Indexes
    Functions --> Auth0
    Auth0 --> JWT
```

---

## 🔒 Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        CSP[Content Security Policy]
        CORS[CORS Headers]
        HSTS[HSTS]
        XSS[XSS Protection]
    end

    subgraph "Authentication"
        OAuth[OAuth 2.0]
        JWT[JWT Tokens]
        Refresh[Refresh Tokens]
    end

    subgraph "API Security"
        RateLimit[Rate Limiting]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
    end

    subgraph "Database Security"
        Encryption[Encryption at Rest]
        TLS[TLS in Transit]
        X509[X.509 Certificates]
        RBAC[Role-Based Access]
    end

    subgraph "Monitoring"
        Audit[Audit Logs]
        Alerts[Security Alerts]
    end

    CSP --> OAuth
    CORS --> OAuth
    OAuth --> JWT
    JWT --> Refresh
    JWT --> RateLimit
    RateLimit --> Validation
    Validation --> Sanitization
    Sanitization --> Encryption
    Encryption --> TLS
    TLS --> X509
    X509 --> RBAC
    RBAC --> Audit
    Audit --> Alerts
```

---

## 📊 Monitoring & Observability

```mermaid
graph TB
    subgraph "Application Monitoring"
        PostHog[PostHog]
        Mixpanel[Mixpanel]
        GTM[Google Tag Manager]
    end

    subgraph "Infrastructure Monitoring"
        Netlify[Netlify Analytics]
        Functions[Function Logs]
        CDN[CDN Metrics]
    end

    subgraph "Database Monitoring"
        Supa[Supabase Postgres db-dobeutech-unified]
        Perf[Performance Advisor]
        Slow[Slow Query Logs]
    end

    subgraph "Error Tracking"
        Console[Console Errors]
        Boundary[Error Boundaries]
        Toast[Toast Notifications]
    end

    subgraph "Alerting"
        Email[Email Alerts]
        Slack[Slack Notifications]
        PagerDuty[PagerDuty]
    end

    PostHog --> Console
    Mixpanel --> Console
    Console --> Boundary
    Boundary --> Toast
    Netlify --> Functions
    Functions --> CDN
    Supa --> Perf
    Perf --> Slow
    Slow --> Email
    Email --> Slack
    Slack --> PagerDuty
```

---

## 🌐 Network Architecture

```mermaid
graph TB
    subgraph "DNS"
        Domain[dobeu.net]
        Netlify[Netlify DNS]
    end

    subgraph "CDN"
        Edge1[Edge Node US-East]
        Edge2[Edge Node US-West]
        Edge3[Edge Node EU]
        Edge4[Edge Node Asia]
    end

    subgraph "Origin"
        Functions[Vercel Functions]
        Static[Static Assets]
    end

    subgraph "Database"
        Primary[Supabase Primary]
        Replica1[Supabase Read Replica 1]
        Replica2[Supabase Read Replica 2]
    end

    Domain --> Netlify
    Netlify --> Edge1
    Netlify --> Edge2
    Netlify --> Edge3
    Netlify --> Edge4
    Edge1 --> Functions
    Edge1 --> Static
    Edge2 --> Functions
    Edge2 --> Static
    Functions --> Primary
    Primary --> Replica1
    Primary --> Replica2
```

---

## 📈 Scalability Architecture

```mermaid
graph TB
    subgraph "Horizontal Scaling"
        CDN[CDN Edge Nodes]
        Functions[Serverless Functions]
        DB[Supabase Read Replicas + Connection Pooling]
    end

    subgraph "Caching"
        Browser[Browser Cache]
        CDNCache[CDN Cache]
        QueryCache[React Query Cache]
        PGBouncer[Supabase pgbouncer pool]
    end

    subgraph "Optimization"
        CodeSplit[Code Splitting]
        LazyLoad[Lazy Loading]
        Compression[Gzip/Brotli]
        Images[Image Optimization]
    end

    CDN --> Browser
    Functions --> CDNCache
    DB --> QueryCache
    QueryCache --> DBCache
    CodeSplit --> LazyLoad
    LazyLoad --> Compression
    Compression --> Images
```

---

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: User Action
    Loading --> Success: Data Received
    Loading --> Error: Request Failed
    Success --> Idle: Reset
    Error --> Idle: Retry
    Success --> Updating: Update Action
    Updating --> Success: Update Complete
    Updating --> Error: Update Failed

    state Loading {
        [*] --> FetchingData
        FetchingData --> ValidatingAuth
        ValidatingAuth --> ProcessingRequest
    }

    state Success {
        [*] --> CachingData
        CachingData --> RenderingUI
        RenderingUI --> [*]
    }

    state Error {
        [*] --> LoggingError
        LoggingError --> ShowingToast
        ShowingToast --> [*]
    }
```

---

## 📝 Form Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant Form as Form Component
    participant RHF as React Hook Form
    participant Zod as Zod Validator
    participant API as API Client
    participant Fn as Vercel Function
    participant DB as Supabase

    User->>Form: Fill Form
    User->>Form: Submit
    Form->>RHF: handleSubmit()
    RHF->>Zod: Validate Schema

    alt Validation Fails
        Zod-->>RHF: Validation Errors
        RHF-->>Form: Show Errors
        Form-->>User: Display Error Messages
    else Validation Passes
        Zod-->>RHF: Valid Data
        RHF->>API: POST Request
        API->>Fn: HTTP Request + JWT
        Fn->>Fn: Validate Input
        Fn->>DB: Insert Document
        DB-->>Fn: Success
        Fn-->>API: 200 OK
        API-->>Form: Success Response
        Form->>Form: Reset Form
        Form-->>User: Show Success Toast
    end
```

---

## 🎨 Styling Architecture

```mermaid
graph TB
    subgraph "Design System"
        Tokens[Design Tokens]
        Colors[Color Palette]
        Typography[Typography Scale]
        Spacing[Spacing Scale]
    end

    subgraph "Tailwind"
        Config[tailwind.config.ts]
        Base[Base Styles]
        Components[Component Classes]
        Utilities[Utility Classes]
    end

    subgraph "UI Components"
        Shadcn[shadcn/ui]
        Radix[Radix Primitives]
        Custom[Custom Components]
    end

    subgraph "Themes"
        Light[Light Theme]
        Dark[Dark Theme]
        System[System Preference]
    end

    Tokens --> Config
    Colors --> Config
    Typography --> Config
    Spacing --> Config
    Config --> Base
    Config --> Components
    Config --> Utilities
    Base --> Shadcn
    Components --> Shadcn
    Shadcn --> Radix
    Radix --> Custom
    Custom --> Light
    Custom --> Dark
    Custom --> System
```

---

## 🧪 Testing Architecture

```mermaid
graph TB
    subgraph "Unit Tests"
        Vitest[Vitest]
        RTL[React Testing Library]
        Components[Component Tests]
        Hooks[Hook Tests]
        Utils[Utility Tests]
    end

    subgraph "Integration Tests"
        API[API Tests]
        Forms[Form Tests]
        Auth[Auth Tests]
    end

    subgraph "E2E Tests"
        Playwright[Playwright]
        Flows[User Flows]
        Critical[Critical Paths]
    end

    subgraph "Coverage"
        Istanbul[Istanbul]
        Reports[Coverage Reports]
        Threshold[Coverage Threshold]
    end

    Vitest --> RTL
    RTL --> Components
    RTL --> Hooks
    RTL --> Utils
    Components --> API
    API --> Forms
    Forms --> Auth
    Auth --> Playwright
    Playwright --> Flows
    Flows --> Critical
    Critical --> Istanbul
    Istanbul --> Reports
    Reports --> Threshold
```

---

## 📚 Documentation Structure

```mermaid
graph TB
    subgraph "User Documentation"
        README[README.md]
        QuickStart[QUICK_START.md]
        Setup[SETUP_GUIDE.md]
    end

    subgraph "Developer Documentation"
        Architecture[SYSTEM_ARCHITECTURE.md]
        API[API_DOCUMENTATION.md]
        Components[COMPONENT_GUIDE.md]
        Forms[FORM_COMPONENTS_GUIDE.md]
    end

    subgraph "Operations Documentation"
        Runbook[OPERATIONAL_RUNBOOK.md]
        Monitoring[MONITORING_SETUP.md]
        Incidents[QUICK_INCIDENT_RESPONSE.md]
    end

    subgraph "Code Documentation"
        JSDoc[JSDoc Comments]
        TypeDoc[TypeDoc]
        Storybook[Storybook]
    end

    README --> QuickStart
    QuickStart --> Setup
    Setup --> Architecture
    Architecture --> API
    API --> Components
    Components --> Forms
    Forms --> Runbook
    Runbook --> Monitoring
    Monitoring --> Incidents
    Incidents --> JSDoc
    JSDoc --> TypeDoc
    TypeDoc --> Storybook
```

---

**Last Updated:** 2025-12-15  
**Version:** 1.0  
**Maintained By:** Engineering Team
