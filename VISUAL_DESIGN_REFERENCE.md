# Visual Design Reference - WECARE.DIGITAL

## Color Palette

```
Primary Text:     #000000 (Black)
Background:       #FFFFFF (White)
Error/Validation: #008000 (Green)
Success:          #00AA00 (Green)
Danger:           #FF0000 (Red)
Hover Background: #F5F5F5 (Light Gray)
Placeholder Text: #666666 (Gray)
Mobile Sidebar:   #F7F7F7 (Light Gray)
```

## Typography

```
Font Family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif
Base Size:   14px
Font Weight: 300 (Light)
Line Height: 1.5
```

## Component Specifications

### Buttons

#### Primary Button (Black Pill)
```
Background: #000000
Text: #FFFFFF
Border: 1px solid #000000
Radius: 30px
Padding: 0.75rem 1.5rem
Hover: opacity 0.8
```

#### Secondary Button (White Pill)
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000
Radius: 30px
Padding: 0.75rem 1.5rem
Hover: Invert to black background
```

#### Icon Button (Action)
```
Background: #FFFFFF
Icon Color: #000000
Border: 1px solid #000000
Radius: 30px
Size: 32x32px min
Hover: Invert to black background, white icon
```

### Sidebar

#### Desktop
```
Background: #FFFFFF
Height: 100vh
Padding: 1.5rem 1rem
Border: None
```

#### Mobile (≤768px)
```
Position: Fixed left
Width: 280px
Background: #F7F7F7
Padding: 20px
Border-radius: 0 30px 30px 0
Transform: translateX(-100%) when hidden
Z-index: 999
```

#### Sidebar Buttons (Default)
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000
Radius: 30px
Padding: 0.75rem 1.5rem
```

#### Sidebar Buttons (Active)
```
Background: #000000
Text: #FFFFFF
Border: 1px solid #000000
```

#### Sign Out Button (Exception)
```
Background: #000000
Text: #FFFFFF
Border: 1px solid #000000
Radius: 30px
Always black (primary action)
```

### Tables

#### Container
```
Background: #FFFFFF
Border: 1px solid #000000 (odd) or #008000 (even)
Radius: 30px
Overflow: hidden
Margin-bottom: 2rem
```

#### Headers
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000 (all sides)
Padding: 1rem
Font: 14px, weight 300
```

#### Body Cells
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000 (all sides)
Padding: 1rem
Font: 14px, weight 300
```

#### Row Hover
```
Background: #F5F5F5 (entire row)
```

#### Slim Table Variant
```
Padding: 0.5rem (reduced)
Font: 13px (slightly smaller)
Border: 1px (same as regular)
```

### Pagination

#### Container
```
Background: #FFFFFF
Border: 1px solid transparent
Padding: 1rem
Display: flex
Gap: 0.5rem
```

#### Page Buttons (Default)
```
Background: #000000
Text: #FFFFFF
Border: 1px solid #000000
Radius: 30px
Padding: 0.5rem 1rem
Min-width: 40px
```

#### Page Button (Current)
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000
```

#### Info Pill ("Showing X-Y of Z")
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000
Radius: 30px
Padding: 0.5rem 1rem
Position: margin-left auto (right-aligned)
```

### Inputs & Search

#### Text Input
```
Background: #FFFFFF
Text: #000000
Border: 1px solid #000000
Radius: 30px
Padding: 0.75rem 1.25rem
Font: 14px, weight 300
```

#### Placeholder
```
Color: #666666
Font: 14px, weight 300
```

#### Read-only
```
Background: #F5F5F5
```

#### Focus State
```
Outline: 2px solid #000000
Outline-offset: 2px
Box-shadow: 0 0 0 2px rgba(0,0,0,0.1)
```

### Modals

#### Overlay
```
Background: rgba(0, 0, 0, 0.5)
Z-index: 2000
```

#### Content Box
```
Background: #FFFFFF
Border: 1px solid #000000
Radius: 30px
Padding: 2rem
Z-index: 2001
```

### Notifications

#### Standard
```
Background: #FFFFFF
Border: 1px solid #000000
Text: #000000
Radius: 30px
Padding: 1rem 1.25rem
```

#### Success
```
Border: 1px solid #00AA00
Text: #00AA00
```

#### Danger/Error
```
Border: 1px solid #FF0000
Text: #FF0000
```

### Mobile Menu Toggle

```
Position: Fixed (top: 20px, left: 15px)
Background: transparent
Border: 1px solid #000000
Radius: 30px
Padding: 0.5rem
Z-index: 1000
Icon: 24x24px, black
```

## Spacing System

```
Extra Small: 0.25rem (4px)
Small:       0.5rem (8px)
Medium:      1rem (16px)
Large:       1.5rem (24px)
Extra Large: 2rem (32px)
```

## Focus States

All interactive elements:
```
Outline: 2px solid #000000
Outline-offset: 2px
Box-shadow: none
```

## Transitions

```
Hover effects: opacity 0.2s ease
Background changes: background 0.2s ease, color 0.2s ease
Sidebar slide: transform 0.3s ease
```

## Breakpoints

```
Mobile:  ≤768px
Tablet:  769px - 1023px
Desktop: ≥1024px
```

## Mobile Adjustments (≤768px)

```
Main content padding: 20px left/right
Sidebar: Slide-in drawer (280px wide)
Tables: Horizontal scroll (min-width: 600px)
Buttons: Full-width where appropriate
Font sizes: Maintain 14px (no reduction)
```

## Accessibility Requirements

1. **Focus Indicators**: All interactive elements must show 2px solid black outline
2. **Aria Labels**: All icon-only buttons must have descriptive aria-labels
3. **Aria Hidden**: Decorative icons must have aria-hidden="true"
4. **Color Contrast**: Black on white meets WCAG AAA standards
5. **Keyboard Navigation**: All interactive elements must be keyboard accessible
6. **Screen Reader**: Proper semantic HTML and ARIA attributes

## Icon Usage

```
Folder:     Folder icon (16x16px)
All Links:  List icon (16x16px)
Edit:       Pen icon (16px)
Delete:     X icon (16px)
Link/Copy:  Link icon (14-16px)
Chevron:    Down arrow (16x16px, rotates 180° when expanded)
Hamburger:  Two horizontal lines (24x24px)
```

## Z-Index Hierarchy

```
Base content:        0
Sidebar (mobile):    999
Mobile menu toggle:  1000
Modal overlay:       2000
Modal content:       2001
```

## Best Practices

1. **Consistency**: Always use 30px radius for pills
2. **Borders**: Always 1px, never thicker
3. **White Space**: Generous padding for readability
4. **Hover States**: Subtle opacity or inversion
5. **Mobile First**: Design for mobile, enhance for desktop
6. **Accessibility**: Always include focus states and aria-labels
7. **Performance**: Use CSS transitions, not JavaScript animations
8. **Maintainability**: Keep styles in main.scss, minimize duplication
