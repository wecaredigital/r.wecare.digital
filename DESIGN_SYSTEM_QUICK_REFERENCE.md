# WECARE.DIGITAL Design System - Quick Reference

## Color Palette

```css
/* Primary Colors */
--black: #000000;
--white: #FFFFFF;

/* Grays */
--light-gray: #F5F5F5;      /* Hover states */
--medium-gray: #F7F7F7;     /* Mobile sidebar */
--dark-gray: #666666;       /* Placeholders */

/* Semantic Colors */
--success-green: #00AA00;   /* Success notifications */
--error-green: #008000;     /* Validation errors */
--error-red: #FF0000;       /* System errors */
```

## Typography

```css
font-family: 'Helvetica Light', 'Helvetica Neue', Helvetica, Arial, sans-serif;
font-size: 14px;
font-weight: 300;
line-height: 1.5;
```

## Border Radius

```css
border-radius: 30px;  /* All interactive elements (pill shape) */
```

## Buttons

### Primary Button (Black)
```html
<button class="btn-standard">Button Text</button>
```
```css
background: #000000;
color: #FFFFFF;
border: 1px solid #000000;
border-radius: 30px;
padding: 0.75rem 1.5rem;
```

### Secondary Button (White)
```html
<button class="button is-light">Button Text</button>
```
```css
background: #FFFFFF;
color: #000000;
border: 1px solid #000000;
border-radius: 30px;
```

### Action Button (Icon)
```html
<button class="btn-action" aria-label="Edit">
  <i class="fas fa-pen" aria-hidden="true"></i>
</button>
```
```css
background: #FFFFFF;
color: #000000;
border: 1px solid #000000;
border-radius: 30px;
min-width: 32px;
min-height: 32px;
```

## Icons

### Standard Icons (16px)
- **Edit:** `fa-pen`
- **Delete:** `fa-times` (X)
- **Link/Copy:** `fa-link`
- **Folder:** Custom SVG (16px, stroke-width 1.5)

### Usage
```html
<i class="fas fa-pen" aria-hidden="true"></i>
```

## Tables

```css
.table-container {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  overflow: hidden;
}

.table {
  background: #FFFFFF;
  border-collapse: collapse;
}

.table thead th {
  background: #FFFFFF;
  color: #000000;
  border-bottom: 1px solid #000000;
}

.table tbody tr:hover {
  background: #F5F5F5;
}
```

### Alternating Border Colors
```css
.table-container:nth-of-type(1) { border-color: #000000; }
.table-container:nth-of-type(2) { border-color: #008000; }
.table-container:nth-of-type(3) { border-color: #000000; }
.table-container:nth-of-type(4) { border-color: #008000; }
```

## Forms

### Input Fields
```html
<input class="input" type="text" placeholder="Search">
```
```css
background: #FFFFFF;
color: #000000;
border: 1px solid #000000;
border-radius: 30px;
padding: 0.75rem 1.25rem;
```

### Focus State
```css
input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}
```

## Pagination

### Page Numbers
```html
<button class="pagination-link">1</button>
<button class="pagination-link is-current">2</button>
```
```css
.pagination-link {
  background: #000000;
  color: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
}

.pagination-link.is-current {
  background: #FFFFFF;
  color: #000000;
}
```

### Info Text (Far Right)
```html
<div class="pagination-info">
  Showing 1-20 of 100 links
</div>
```
```css
.pagination-info {
  margin-left: auto;
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.5rem 1rem;
}
```

## Modals

```html
<div class="modal is-active">
  <div class="modal-background"></div>
  <div class="modal-content">
    <div class="box">
      <!-- Content -->
    </div>
  </div>
</div>
```
```css
.modal-background {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.modal-content {
  z-index: 2001;
}

.modal-content .box {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 2rem;
}
```

## Notifications

```html
<div class="notification is-success">
  Success message
</div>
<div class="notification is-danger">
  Error message
</div>
```
```css
.notification {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 1rem 1.25rem;
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

## Sidebar/Menu

### Folder Button (Default)
```html
<button class="folder-btn">
  <span class="folder-name">Folder Name</span>
  <span class="folder-count">5</span>
</button>
```
```css
.folder-btn {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 30px;
  padding: 0.75rem 1.5rem;
}
```

### Folder Button (Active)
```css
.folder-btn.is-active {
  background: #000000;
  color: #FFFFFF;
}
```

## Mobile Responsiveness

### Breakpoints
- **Tablet:** 768px
- **Phone:** 480px

### Mobile Sidebar
```css
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    width: 280px;
    background: #F7F7F7;
    padding: 20px;
    border-radius: 0 30px 30px 0;
    z-index: 999;
  }
}
```

### Mobile Content Padding
```css
@media (max-width: 768px) {
  .dashboard {
    padding-left: 20px;
    padding-right: 20px;
  }
}
```

### Mobile Tables
```css
@media (max-width: 768px) {
  .table-container {
    overflow-x: auto;
  }
  
  .table {
    min-width: 600px;
  }
}
```

## Accessibility

### Focus States
```css
button:focus,
input:focus,
a:focus {
  outline: 2px solid #000000;
  outline-offset: 2px;
}
```

### ARIA Labels
```html
<!-- Icon-only buttons -->
<button aria-label="Edit link">
  <i class="fas fa-pen" aria-hidden="true"></i>
</button>

<!-- Decorative icons -->
<i class="fas fa-link" aria-hidden="true"></i>
```

## Z-Index Hierarchy

```css
--z-mobile-menu: 1000;
--z-sidebar: 999;
--z-modal-background: 2000;
--z-modal-content: 2001;
```

## Spacing Scale

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
```

## Common Patterns

### Pill Button with Icon
```html
<button class="btn-action" aria-label="Action">
  <i class="fas fa-icon" aria-hidden="true"></i>
</button>
```

### Pill Input
```html
<input class="input search-input" type="text" placeholder="Search">
```

### Pill Container
```html
<div class="table-container">
  <table class="table">
    <!-- Content -->
  </table>
</div>
```

### Hover State Pattern
```css
.element:hover:not(:disabled) {
  opacity: 0.8;
}
```

### Disabled State Pattern
```css
.element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## Error Messages

### Validation Errors (Green)
```html
<p class="help is-error">This field is required</p>
```
```css
.help.is-error {
  color: #008000; /* Error Green */
}
```

### System Errors (Red)
```html
<div class="notification is-danger">
  System error occurred
</div>
```
```css
.notification.is-danger {
  border-color: #FF0000;
  color: #FF0000;
}
```

## Best Practices

1. **Always use 30px border-radius** for interactive elements
2. **Use Helvetica Light** for all text (14px, 300 weight)
3. **Black and white** are primary colors
4. **Green for success**, **red for errors**
5. **2px outline with 2px offset** for focus states
6. **0.8 opacity** for hover states (no transforms)
7. **aria-label** for all icon-only buttons
8. **aria-hidden="true"** for decorative icons
9. **20px horizontal padding** on mobile
10. **Z-index hierarchy**: Menu (1000) > Sidebar (999) < Modal (2000+)
