# Minbar Live UI/UX Design System

## Overview
The Minbar Live platform uses a dark-themed design system optimized for readability and professional aesthetics, suitable for a religious presentation context. The design system leverages Tailwind CSS, Radix UI primitives, and a custom set of "shadcn-style" components.

## Color Palette
- **Background (Page)**: `#09090b` (Deep black/zinc)
- **Background (Card/Panel)**: `#121214` (Elevated dark)
- **Background (Hover/Elevated)**: `#1a1a1e`
- **Primary Accent**: Amber (`amber-500`)
- **Success Accent**: Emerald (`emerald-500`)
- **Destructive/Error**: Red (`red-500`)
- **Text (Primary)**: `gray-100` (`#f3f4f6`)
- **Text (Secondary)**: `gray-400` (`#9ca3af`)
- **Text (Muted)**: `gray-500` (`#6b7280`)
- **Borders (Default)**: `zinc-800`
- **Borders (Focus/Interactive)**: `zinc-700`

## Typography
- **Primary Font**: Inter (sans-serif)
- **Arabic Font**: Noto Naskh Arabic (serif, for readability)

## Components

### Core UI Components
Located in `src/components/ui/`, built on top of Radix UI for accessibility.
- **Button**: Variants include default (amber), destructive, outline, secondary, ghost, link. Sizes include default, sm, lg, icon.
- **Inputs & Forms**: Input, Textarea, Select, Checkbox, Switch. Consistent focus rings (`ring-amber-500/50`) and dark background styling.
- **Display**: Card, Badge, Table, Avatar, Progress, Separator.
- **Overlays/Navigation**: Dialog, Tabs, DropdownMenu, Tooltip, Popover, ScrollArea.

### Layout Components
Located in `src/components/layout/`.
- **Sidebar**: Fixed left navigation panel with amber active state highlights.
- **PageShell**: Standardized page wrapper providing a consistent header (title, description, actions) and a scrollable content area.

### Arabic Specialized Components
Located in `src/components/arabic/`.
- **RTLText**: Wraps content with `dir="rtl"` and applies the `font-arabic` class.
- **QuranVerse**: Specialized display for Quranic text featuring a gold (`amber-500`) left border, subtle amber background tint, and a surah/ayah badge.

## Interaction & Accessibility
- All interactive elements use `transition-colors duration-200`.
- Forms and inputs feature a visible focus ring (`focus-visible:ring-2 focus-visible:ring-amber-500/50`).
- Semantic HTML and ARIA labels are maintained through Radix UI primitives.
