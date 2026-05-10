# Design System - GDGoC CNU Build with AI Homepage

## Product Context

- **What this is:** GDGoC CNU chapter homepage for the Build with AI event and follow-up chapter activity.
- **Who it is for:** CNU students, GDGoC chapter members, event participants, mentors, and partner organizers.
- **Project type:** Event/chapter homepage with lightweight product-like sections for agenda, tools, teams, prototypes, and recruiting.
- **Primary implementation target:** React/Next.js or React/Vite using Wanted Montage Web Design System.

## Design Authority

Montage is the base design system. The project should use its Web package and component vocabulary before creating custom UI.

- **Docs:** https://montage.wanted.co.kr/docs/getting-started
- **Web package:** https://github.com/wanteddev/montage-web/blob/main/packages/wds/README.md
- **Core principles:** Extensibility, Consistency, Efficiency.
- **Foundation coverage:** Color, Typography, Grid, Icons, Elevation.

## Package Setup

Montage Web uses GitHub Packages, Emotion, Pretendard, and a ThemeProvider.

```ini
# .npmrc
@wanteddev:registry=https://npm.pkg.github.com/
```

```bash
pnpm i @wanteddev/wds @wanteddev/wds-icon
```

Keep every `@wanteddev/wds-*` package on the same version. Mixed versions can create multiple theme contexts.

Load Pretendard before the app renders:

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" />
<link
  rel="stylesheet"
  as="style"
  crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-jp-dynamic-subset.min.css"
/>
<link
  rel="stylesheet"
  as="style"
  crossorigin
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
/>
```

React entrypoint pattern:

```tsx
import { ThemeProvider } from '@wanteddev/wds';
import '@wanteddev/wds/global.css';

root.render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
```

If the app is created with Next.js App Router, also install the Next.js adapter and wrap routes with `AppRouterCacheProvider`:

```bash
pnpm i @wanteddev/wds-nextjs
```

```tsx
'use client';

import { ThemeProvider } from '@wanteddev/wds';
import { AppRouterCacheProvider } from '@wanteddev/wds-nextjs';
import '@wanteddev/wds/global.css';

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppRouterCacheProvider>{props.children}</AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Aesthetic Direction

- **Direction:** Clean event operating system, not a generic marketing landing page.
- **Mood:** Precise, useful, optimistic, and workshop-ready. The page should feel like a chapter that can help students actually build AI prototypes.
- **Decoration level:** Intentional. Use real event/chapter content, tool logos, screenshots, and prototype output. Avoid generic abstract decoration.
- **Layout approach:** Hybrid. Keep section structure grid-disciplined, but allow the hero and event recap areas to feel more editorial.
- **Color approach:** Montage semantic tokens first, Google AI accent cues second.

## Typography

Use Montage typography utilities or components whenever possible.

- **Family:** Pretendard JP / Pretendard.
- **Display:** Montage Display 2 or Title 1 for first-viewport title only.
- **Section headings:** Title 2, Title 3, or Heading 1.
- **Body:** Body 1/Normal for normal copy; Body 1/Reading for long explanations.
- **Labels:** Label 1/Normal and Caption 1 for metadata, dates, tags, and tool names.
- **Code/tool labels:** Use Montage label styles. Add monospace only for actual code snippets, CLI commands, or environment variables.

Montage typography scale reference:

| Role | Size | Line height |
| --- | ---: | ---: |
| Display 1 | 56px | 72px |
| Display 2 | 40px | 52px |
| Display 3 | 36px | 48px |
| Title 1 | 32px | 44px |
| Title 2 | 28px | 38px |
| Title 3 | 24px | 32px |
| Heading 1 | 22px | 30px |
| Heading 2 | 20px | 28px |
| Headline 1 | 18px | 26px |
| Body 1/Normal | 16px | 24px |
| Body 2/Normal | 15px | 22px |
| Label 1/Normal | 14px | 20px |
| Caption 1 | 12px | 16px |

Custom CSS guardrail: keep custom `letter-spacing` at `0`. Let WDS own its internal typography behavior.

## Color

Use semantic tokens instead of hard-coded hex values in app code.

- **Primary actions:** `theme.semantic.primary.normal`, `strong`, and `heavy`.
- **Text:** `theme.semantic.label.normal`, `strong`, `neutral`, `alternative`, `assistive`, `disable`.
- **Surfaces:** `theme.semantic.background.*`, `theme.semantic.fill.*`, and `theme.semantic.line.*`.
- **Status:** `theme.semantic.status.positive`, `cautionary`, and `negative`.
- **Accents:** Use WDS accent tokens sparingly for Google tool groupings:
  - Gemini / AI Studio: blue or violet foreground/background tokens.
  - Firebase: orange or red-orange tokens.
  - Stitch / design workflows: cyan or light-blue tokens.
  - Labs / experimental prototypes: lime or green tokens.

Do not make the whole site a Google-blue page. The dominant read should be Montage neutral surfaces with selective accent moments.

## Spacing

- **Base unit:** 4px.
- **Default section rhythm:** 64px desktop, 40px tablet, 28px mobile.
- **Dense tool grids:** 12px to 16px gaps.
- **Repeated cards:** 16px to 24px inner padding.
- **Hero:** Keep enough height for impact, but always reveal the next section on desktop and mobile.

## Layout

- **Max content width:** 1120px for standard content; 1280px for dense grids or schedule sections.
- **Grid:** 12 columns desktop, 6 tablet, 4 mobile.
- **Cards:** Use cards only for repeated items such as tools, sessions, organizers, projects, or announcements.
- **Radius:** Prefer 8px or less for normal UI. Use larger radius only for avatars or circular icon buttons.
- **First viewport:** Show "GDGoC CNU" and "Build with AI" clearly, then immediately expose event value and next action.

## Component Rules

- Use `Button` for primary actions. Solid primary for the main action, outlined assistive for secondary actions.
- Use `TextButton` for low-priority links such as "Details" or "Learn more".
- Use `SectionHeader` for section starts.
- Use `ContentBadge`, chips, or WDS badge-like components for tool names, session levels, and statuses.
- Use `Box`, `FlexBox`, and `sx` for layout and token access rather than ad-hoc CSS modules when feasible.
- Use `@wanteddev/wds-icon` or an existing icon library for interface actions. Do not hand-roll common UI icons.

## Motion

- **Approach:** Minimal-functional.
- **Duration:** 120ms to 180ms for hover/focus; 180ms to 260ms for disclosure or filtering.
- **Use motion for:** hover affordance, section reveal, tab/filter changes, schedule expansion.
- **Avoid:** scroll-heavy choreography, decorative looping animations, and motion that hides event information.

## Content Tone

- Korean-first, with English product/tool names preserved.
- Write like an operator, not a hype page.
- Explain what participants can build, what tools they will use, and what proof of work they will leave with.
- Avoid generic AI slogans unless they connect to a concrete workshop outcome.

## Implementation Checklist

- [ ] Install WDS packages through GitHub Packages.
- [ ] Load Pretendard and `@wanteddev/wds/global.css`.
- [ ] Wrap the app in `ThemeProvider`.
- [ ] Build with WDS components before custom components.
- [ ] Keep custom styling token-based through `theme.semantic`, `theme.opacity`, and WDS utilities.
- [ ] Run visual QA on desktop and mobile before considering the homepage ready.

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-05-11 | Adopt Wanted Montage Web Design System as the primary UI foundation | The user requested Montage; it gives a Korean product-grade component and token baseline. |
| 2026-05-11 | Use semantic WDS tokens instead of copying color hex values into the project | This keeps the site aligned with Montage and avoids token drift when WDS updates. |
| 2026-05-11 | Use Korean-first event copy with preserved English tool names | The audience is local CNU students, while the event and tools are global Google AI programs. |
