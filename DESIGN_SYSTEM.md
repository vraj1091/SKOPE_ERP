# SKOPE ERP - Enterprise Design System

## Overview
A world-class, enterprise-grade design system built for modern business applications. This system emphasizes clarity, consistency, and professional aesthetics without looking AI-generated.

---

## 🎨 Design Philosophy

### Core Principles
1. **Professional First** - Enterprise-grade aesthetics that inspire confidence
2. **Human-Centered** - Natural interactions and intuitive patterns
3. **Performance** - Optimized animations and smooth transitions
4. **Accessibility** - WCAG 2.1 AA compliant
5. **Consistency** - Unified visual language across all components

---

## 🌈 Color System

### Background Colors
```css
background: #0A0E1A          /* Primary background */
background-secondary: #0F1419 /* Secondary background */
background-tertiary: #151B26  /* Tertiary background */
surface: #1A2332             /* Card/surface color */
surface-hover: #212B3D       /* Hover state */
surface-active: #2A3548      /* Active state */
```

### Primary Brand Colors
```css
primary-500: #3B82F6  /* Main brand color */
primary-600: #2563EB  /* Darker variant */
primary-700: #1D4ED8  /* Darkest variant */
primary-400: #60A5FA  /* Lighter variant */
```

### Semantic Colors
```css
success: #10B981   /* Success states */
warning: #F59E0B   /* Warning states */
danger: #EF4444    /* Error/danger states */
info: #3B82F6      /* Informational states */
```

### Text Hierarchy
```css
text-primary: #F8FAFC    /* Headings, important text */
text-secondary: #CBD5E1  /* Body text */
text-tertiary: #94A3B8   /* Secondary text */
text-muted: #64748B      /* Muted/disabled text */
```

---

## 📝 Typography

### Font Families
- **Sans**: Inter (primary UI font)
- **Display**: Outfit (headings, emphasis)
- **Mono**: JetBrains Mono (code, data)

### Type Scale
```
5xl: 3rem (48px)      - Hero headings
4xl: 2.25rem (36px)   - Page titles
3xl: 1.875rem (30px)  - Section headings
2xl: 1.5rem (24px)    - Card titles
xl: 1.25rem (20px)    - Subheadings
lg: 1.125rem (18px)   - Large body
base: 1rem (16px)     - Body text
sm: 0.875rem (14px)   - Small text
xs: 0.75rem (12px)    - Captions, labels
```

### Font Weights
- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700
- Extrabold: 800

---

## 🧩 Component Library

### Buttons

#### Variants
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

#### States
```tsx
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Cards

#### Basic Card
```tsx
<Card>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Variants
```tsx
<Card hover>Hover effect</Card>
<Card glass>Glassmorphism</Card>
<Card gradient>Gradient background</Card>
```

### Inputs

```tsx
<Input 
  label="Email Address"
  type="email"
  placeholder="name@company.com"
  required
  helperText="We'll never share your email"
/>

<Input 
  label="Password"
  type="password"
  error
  helperText="Password must be at least 8 characters"
/>
```

### Badges

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="primary" dot>New</Badge>
```

### Tables

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
      <TableCell><Button size="sm">Edit</Button></TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Stat Cards

```tsx
<StatCard
  title="Total Revenue"
  value="$45,231"
  change={12.5}
  trend="up"
  changeLabel="vs last month"
  icon={<CurrencyDollarIcon className="w-6 h-6" />}
/>
```

---

## 🎭 Animations

### Fade Animations
```css
animate-fade-in        /* Fade in */
animate-fade-in-up     /* Fade in from bottom */
animate-fade-in-down   /* Fade in from top */
```

### Slide Animations
```css
animate-slide-in-right /* Slide from left */
animate-slide-in-left  /* Slide from right */
```

### Scale Animations
```css
animate-scale-in       /* Scale up */
```

### Utility Animations
```css
animate-pulse-subtle   /* Subtle pulse */
animate-bounce-subtle  /* Subtle bounce */
animate-shimmer        /* Loading shimmer */
```

### Hover Effects
```css
hover-lift    /* Lift on hover */
hover-glow    /* Glow effect on hover */
```

---

## 📐 Spacing System

```
0.5: 2px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

---

## 🔲 Border Radius

```css
sm: 0.375rem (6px)
DEFAULT: 0.5rem (8px)
md: 0.625rem (10px)
lg: 0.75rem (12px)
xl: 1rem (16px)
2xl: 1.25rem (20px)
3xl: 1.5rem (24px)
```

---

## 🌟 Shadows

```css
shadow-xs: Minimal shadow
shadow-sm: Small shadow
shadow: Default shadow
shadow-md: Medium shadow
shadow-lg: Large shadow
shadow-xl: Extra large shadow
shadow-2xl: Maximum shadow
shadow-glow: Glow effect
shadow-card: Card shadow
shadow-card-hover: Card hover shadow
```

---

## ♿ Accessibility

### Focus States
All interactive elements have visible focus indicators:
```css
focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2
```

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for navigation menus

### Screen Reader Support
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Descriptive link text

### Color Contrast
- All text meets WCAG AA standards
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text

---

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Mobile-First Approach
All components are designed mobile-first and scale up:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🎯 Usage Examples

### Dashboard Layout
```tsx
<div className="space-y-6">
  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <StatCard title="Revenue" value="$45,231" change={12.5} trend="up" />
    <StatCard title="Orders" value="1,234" change={-3.2} trend="down" />
    <StatCard title="Customers" value="5,678" change={8.1} trend="up" />
    <StatCard title="Products" value="234" change={0} />
  </div>

  {/* Content Cards */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold">Recent Orders</h3>
      </CardHeader>
      <CardBody>
        <Table>
          {/* Table content */}
        </Table>
      </CardBody>
    </Card>
  </div>
</div>
```

### Form Layout
```tsx
<Card>
  <CardHeader>
    <h2 className="text-2xl font-bold">Create Product</h2>
  </CardHeader>
  <CardBody>
    <form className="space-y-6">
      <Input label="Product Name" required />
      <Input label="SKU" />
      <Input label="Price" type="number" />
      <Input label="Description" />
    </form>
  </CardBody>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Create Product</Button>
  </CardFooter>
</Card>
```

---

## 🚀 Performance

### Optimization Techniques
1. **CSS-in-Tailwind** - Utility-first approach for minimal CSS
2. **Tree Shaking** - Only import used components
3. **Lazy Loading** - Code splitting for routes
4. **Memoization** - React.memo for expensive components
5. **Debouncing** - Input handlers and search

### Animation Performance
- Use `transform` and `opacity` for animations
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Prefer CSS animations over JavaScript

---

## 🔧 Customization

### Extending Colors
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        50: '#...',
        // ... your custom colors
      }
    }
  }
}
```

### Custom Components
```tsx
// Create custom variants
const CustomCard = ({ children, ...props }) => (
  <Card className="border-2 border-primary-500" {...props}>
    {children}
  </Card>
)
```

---

## 📚 Resources

### Design Tools
- Figma: Design mockups and prototypes
- Tailwind CSS: Utility-first CSS framework
- Heroicons: Icon library
- Recharts: Chart library

### Documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎨 Design Tokens

All design tokens are defined in:
- `tailwind.config.js` - Tailwind configuration
- `index.css` - Global styles and component classes

### Importing Components
```tsx
import { Button, Card, Input, Badge, StatCard } from '@/components/ui'
```

---

## ✅ Best Practices

1. **Consistency** - Use design system components, don't create one-offs
2. **Spacing** - Use the spacing scale, avoid arbitrary values
3. **Colors** - Use semantic colors (success, danger, etc.)
4. **Typography** - Follow the type scale
5. **Accessibility** - Always include labels, alt text, ARIA attributes
6. **Performance** - Lazy load, memoize, debounce
7. **Responsive** - Test on all breakpoints
8. **Dark Mode** - Design system is dark-mode first

---

## 🔄 Updates

### Version 1.0.0 (Current)
- Initial design system release
- Complete component library
- Comprehensive documentation
- Accessibility compliance
- Performance optimizations

---

## 📞 Support

For questions or issues with the design system:
1. Check this documentation
2. Review component examples
3. Consult Tailwind CSS docs
4. Contact the development team

---

**Built with ❤️ for enterprise applications**
