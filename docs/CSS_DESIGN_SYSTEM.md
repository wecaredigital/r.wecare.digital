# WECARE.DIGITAL Dashboard - CSS Design System Documentation

## Table of Contents
1. [Global Theme](#global-theme)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Layout Structure](#layout-structure)
5. [Components](#components)
6. [Responsive Design](#responsive-design)
7. [Interactions & States](#interactions--states)

---

## Global Theme

### Base Styles
```css
* {
  font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  font-weight: 300;
}
```

### Design Principles
- **Minimalist**: Clean, simple, no clutter
- **Monochrome**: Black and white color scheme
- **Flat Design**: No shadows or gradients (except subtle shadows for depth)
- **Rounded Corners**: 30px border-radius for buttons and inputs
- **Consistent Spacing**: 1rem, 1.5rem, 2rem increments

---

## Color Palette

### Primary Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| White | `#FFFFFF` | Backgrounds, inverted text |
| Black | `#000000` | Text, borders, primary buttons |
| Light Gray | `#F7F7F7` | Mobile menu background |
| Medium Gray | `#F5F5F5` | Hover states, disabled backgrounds |
| Dark Gray | `#666666` | Placeholder text |

### Semantic Colors
| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Success Green | `#00AA00` | Success notifications |
| Error Green | `#008000` | Form validation errors (intentional green) |
| Error Red | `#FF0000` | System error notifications |

---

## Typography

### Font Families
- **Primary**: `'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Weight**: 300 (Light) for body text
- **Error Messages**: `"Helvetica", Arial, sans-serif` at 14px

### Font Sizes
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Brand Title | 16px | 300 | WECARE.DIGITAL header |
| Body Text | 14px | 300 | All standard text |
| Table Text | 14px | 300 | Table content |
| Button Text | 14px | 300 | All buttons |
| Error Messages | 14px | 300 | Validation errors |
| Icons | 16px | - | Action icons |

---

## Layout Structure

### Main Layout
```
┌─────────────────────────────────────────┐
│  Mobile Menu Toggle (mobile only)      │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │  Main Dashboard Content      │
│          │                              │
│ (Fixed)  │  - Header Card               │
│          │  - Pagination                │
│          │  - Table                     │
│          │                              │
└──────────┴──────────────────────────────┘
```

### Sidebar (Desktop)
- **Width**: `is-2-tablet is-narrow`
- **Background**: `#FFFFFF`
- **Border**: `1px solid #FFFFFF` (invisible)
- **Padding**: `1.5rem 1rem`
- **Height**: `100vh`

### Sidebar (Mobile)
- **Width**: `280px`
- **Background**: `#F7F7F7` (light gray)
- **Padding**: `20px` (left and right)
- **Position**: Fixed, slides in from left
- **Transform**: `translateX(-100%)` when hidden

### Main Dashboard
- **Background**: `#FFFFFF`
- **Padding**: `2rem` (desktop), `1rem` (tablet), `0.5rem` (mobile)
- **Min Height**: `100vh`

---

## Components

### 1. Mobile Menu Toggle

#### Desktop
- **Display**: Hidden on tablet and above

#### Mobile
```css
.mobile-menu-toggle {
  position: fixed;
  top: 20px;
  left: 15px;
  z-index: 1000;
  background: transparent;
  border: none;
  padding: 0;
}

.hamburger-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.hamburger-btn svg {
  width: 24px;
  height: 24px;
  stroke: #000000;
  stroke-width: 2;
}
```

**Icon**: Two horizontal lines (minimal hamburger)

---

### 2. Folder Buttons

#### All Links Button
```css
.folder-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
}

.folder-btn:hover {
  opacity: 0.8;
}

.folder-btn.is-active {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
}
```

#### Folder Dropdown Toggle
```css
.folder-dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 0.5rem;
}
```

**Features**:
- Chevron icon rotates 180deg when expanded
- Folder list shows/hides on click
- Individual folder items slightly smaller (13px font, 0.6rem padding)

---

### 3. Sign Out Button

```css
.btn-signout {
  background: #000000 !important;
  color: #FFFFFF !important;
  border: 1px solid #000000 !important;
}

.btn-signout:hover {
  opacity: 0.8 !important;
}
```

**Placement**: Bottom of sidebar with 2rem top margin

---

### 4. Header Card

```css
.header-card {
  background: #FFFFFF;
  border: none;
  padding: 1.5rem 0;
  margin-bottom: 1.5rem;
}
```

**Contents**:
- Brand title: "WECARE.DIGITAL" (16px)
- Link count with icon: "Total links: X" (14px)
- Search input
- Refresh button
- Create Link button

---

### 5. Search Input

```css
.search-input {
  background: #FFFFFF !important;
  color: #000000 !important;
  border: 1px solid #000000 !important;
  border-radius: 30px !important;
  padding: 0.75rem 1.25rem !important;
  font-size: 14px !important;
  font-weight: 300 !important;
  width: 100%;
}

.search-input::placeholder {
  color: #666666;
  font-size: 14px;
  font-weight: 300;
}

.search-input:focus {
  outline: none;
  border-color: #000000 !important;
  box-shadow: none !important;
}
```

**Placeholder**: "Search" (no icon inside input)

---

### 6. Standard Buttons

```css
.btn-standard {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 300;
}

.btn-standard:hover:not(:disabled) {
  opacity: 0.8;
}

.btn-standard:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Usage**: Refresh, Create Link, Pagination buttons, Modal buttons

---

### 7. Table

#### Container
```css
.table-container {
  background: #FFFFFF;
  border: 1px solid #000000;
  overflow: hidden;
  margin-bottom: 2rem;
}
```

#### Table Structure
```css
.table {
  width: 100%;
  background: #FFFFFF;
  border-collapse: collapse;
  margin: 0;
}

.table thead th {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
  padding: 1rem;
  text-align: left;
  font-size: 14px;
  font-weight: 300;
}

.table tbody td {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
  padding: 1rem;
  font-size: 14px;
  font-weight: 300;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr:hover {
  background: #F5F5F5;
}
```

**Columns**: #, ID, URL, Folder, Remark, Actions

---

### 8. Action Buttons (Edit/Delete)

```css
.btn-action {
  background: transparent;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.25rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  line-height: 1;
  min-width: 32px;
  min-height: 32px;
}

.btn-action:hover {
  opacity: 0.6;
}

.btn-action i {
  font-size: 16px;
  display: block;
  line-height: 1;
}
```

**Icons**:
- Edit: `fas fa-pen`
- Delete: `fas fa-trash-alt`

---

### 9. Copy Button

```css
.btn-copy {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-copy:hover {
  background: #000000;
  color: #FFFFFF;
}
```

**Icon**: 📋 (emoji)

---

### 10. Pagination

#### Container
```css
.pagination {
  background: #FFFFFF;
  border: 1px solid #FFFFFF; /* Invisible border */
  padding: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
```

#### Pagination Links
```css
.pagination-link {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 300;
  min-width: 40px;
  text-align: center;
}

.pagination-link:hover:not(.is-current) {
  opacity: 0.8;
}

.pagination-link.is-current {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
}
```

#### Pagination Info
```css
.pagination-info {
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  color: #000000;
  font-size: 14px;
  font-weight: 300;
  background: #FFFFFF;
  border: 1px solid #FFFFFF; /* Invisible border */
  padding: 0.75rem;
}
```

**Text**: "Showing X-Y of Z links"

---

### 11. Modal

#### Background
```css
.modal-background {
  background-color: rgba(0, 0, 0, 0.5);
}
```

#### Content Box
```css
.modal-content .box {
  background: #FFFFFF;
  border: 1px solid #000000;
  padding: 2rem;
}

.modal-content .box .subtitle {
  color: #000000;
  font-size: 16px;
  font-weight: 300;
  margin-bottom: 1.5rem;
}
```

#### Form Inputs
```css
.modal-content .input {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.25rem;
  font-size: 14px;
  font-weight: 300;
  width: 100%;
}

.modal-content .input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: none;
}

.modal-content .input:read-only {
  background: #F5F5F5;
}
```

#### Error Messages
```css
.modal-content .help.is-error {
  color: #008000; /* Green */
  font-family: "Helvetica", Arial, sans-serif;
  font-size: 14px;
}
```

**Error Messages**:
- ID exists: "This ID is already in use. Please enter a unique ID."
- Invalid URL: "This URL isn't valid. Please enter a complete URL starting with http:// or https://"

---

### 12. Notifications

```css
.notification {
  background: #FFFFFF;
  border: 1px solid #000000;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  font-size: 14px;
  font-weight: 300;
}

.notification.is-success {
  border-color: #00AA00;
  color: #00AA00;
}

.notification.is-danger {
  border-color: #FF0000;
  color: #FF0000;
}
```

---

## Responsive Design

### Breakpoints
- **Mobile**: `max-width: 480px`
- **Tablet**: `max-width: 768px`
- **Desktop**: `min-width: 769px`

### Mobile Adjustments (max-width: 768px)

#### Sidebar
- Fixed position, slides in from left
- Width: 280px
- Background: #F7F7F7 (light gray)
- Padding: 20px left and right
- Transform: translateX(-100%) when hidden

#### Dashboard
- Padding: 1rem

#### Header Card
- Padding: 1rem

#### Brand Title
- Font size: 14px

#### Table
- Min-width: 600px (horizontal scroll)
- Overflow-x: auto

#### Pagination
- Padding: 1rem
- Flex-wrap: wrap

### Mobile Adjustments (max-width: 480px)

#### Dashboard
- Padding: 0.5rem

#### Header Card
- Padding: 0.75rem

#### Table
- Min-width: 500px

#### Buttons
- Padding: 0.5rem 1rem

---

## Interactions & States

### Hover States
| Element | Hover Effect |
|---------|--------------|
| Buttons | `opacity: 0.8` |
| Action Icons | `opacity: 0.6` |
| Table Rows | `background: #F5F5F5` |
| Links | `opacity: 0.7` |
| Copy Button | `background: #000000; color: #FFFFFF` |

### Active States
| Element | Active Effect |
|---------|---------------|
| Folder Button | `background: #FFFFFF; color: #000000` |
| Pagination Link | `background: #FFFFFF; color: #000000` |

### Disabled States
| Element | Disabled Effect |
|---------|-----------------|
| Buttons | `opacity: 0.5; cursor: not-allowed` |

### Focus States
| Element | Focus Effect |
|---------|--------------|
| Inputs | `border-color: #000000; box-shadow: none` |

### Transitions
- **Duration**: `0.2s` to `0.3s`
- **Easing**: `ease`
- **Properties**: `all`, `opacity`, `transform`

---

## Icons

### Icon Library
**Font Awesome 6.4.0** (loaded from CDN)

### Icon Sizes
| Usage | Size |
|-------|------|
| Folder Icons | 16px |
| Data Icon | 16px |
| Action Icons | 16px |
| Chevron Icon | 16px |
| Hamburger Menu | 24px |

### Icon Styling
```css
.folder-icon,
.data-icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 1.5;
  flex-shrink: 0;
}
```

### Icon Types Used
- **List Icon**: Data/statistics (link count)
- **Folder Icon**: Folders
- **Chevron Down**: Dropdown toggle
- **Hamburger**: Mobile menu (2 lines)
- **Pencil**: Edit action
- **Trash**: Delete action
- **Copy**: 📋 emoji

---

## Spacing System

### Padding Scale
- **0.25rem** = 4px (tight spacing)
- **0.5rem** = 8px (small spacing)
- **0.75rem** = 12px (medium spacing)
- **1rem** = 16px (standard spacing)
- **1.25rem** = 20px (comfortable spacing)
- **1.5rem** = 24px (large spacing)
- **2rem** = 32px (extra large spacing)

### Margin Scale
Same as padding scale

### Gap Scale (Flexbox)
- **0.5rem** = 8px (tight gap)
- **1rem** = 16px (standard gap)

---

## Border System

### Border Widths
- **Standard**: `1px solid`

### Border Colors
| Element | Color |
|---------|-------|
| Tables | `#000000` (black) |
| Buttons | `#000000` (black) |
| Inputs | `#000000` (black) |
| Sidebar | `#FFFFFF` (invisible) |
| Pagination | `#FFFFFF` (invisible) |
| Action Buttons | `#000000` (black) |

### Border Radius
- **Buttons**: `30px` (pill-shaped)
- **Inputs**: `30px` (pill-shaped)
- **Modal**: No border-radius
- **Table Container**: No border-radius

---

## Z-Index Layers

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Mobile Menu Toggle | 1000 | Always on top |
| Mobile Sidebar | 999 | Above content |
| Modal Background | Default | Overlay |
| Modal Content | Default | Above overlay |

---

## Animation & Transitions

### Sidebar Slide (Mobile)
```css
transform: translateX(-100%);
transition: transform 0.3s ease;
```

### Chevron Rotation
```css
transform: rotate(180deg);
transition: transform 0.2s ease;
```

### Button Hover
```css
transition: all 0.2s ease;
opacity: 0.8;
```

---

## Accessibility Considerations

### Focus Indicators
- Inputs: Border color change to black
- Buttons: Opacity change on hover

### Color Contrast
- Black text on white background: AAA compliant
- White text on black buttons: AAA compliant

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab order follows visual order

### Screen Reader Support
- Semantic HTML elements used
- ARIA labels on icon-only buttons
- Form labels properly associated

---

## Browser Compatibility

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### CSS Features Used
- Flexbox
- CSS Grid (Bulma columns)
- CSS Transitions
- CSS Transforms
- SVG support

---

## Future Considerations

### Potential Enhancements
1. **Dark Mode**: Add theme toggle with dark color scheme
2. **Multiple Tables**: Implement alternating border colors (black/green)
3. **Loading States**: Add skeleton screens or spinners
4. **Animations**: Add subtle entrance animations
5. **Micro-interactions**: Enhanced feedback on user actions

### Scalability
- Design system is modular and reusable
- CSS classes follow BEM-like naming
- Easy to extend with new components
- Consistent spacing and sizing system

---

## Summary

This design system provides a **clean, minimal, and professional** interface with:
- ✅ Consistent black and white color scheme
- ✅ Helvetica Light typography throughout
- ✅ 30px border-radius for rounded elements
- ✅ Clear visual hierarchy
- ✅ Responsive design for all screen sizes
- ✅ Accessible and user-friendly
- ✅ Fast and lightweight

**Last Updated**: December 2024
**Version**: 1.0
