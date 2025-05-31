# Design System E-commerce - Guia Figma

## 🎨 Paleta de Cores

### Cores Primárias
```
Azul Principal: #2563EB (rgb(37, 99, 235))
Azul Hover: #1D4ED8 (rgb(29, 78, 216))
Azul Claro: #EFF6FF (rgb(239, 246, 255))
Azul Médio: #DBEAFE (rgb(219, 234, 254))
```

### Cores de Apoio
```
Verde Sucesso: #059669 (rgb(5, 150, 105))
Verde Claro: #ECFDF5 (rgb(236, 253, 245))
Vermelho Erro: #DC2626 (rgb(220, 38, 38))
Laranja Aviso: #EA580C (rgb(234, 88, 12))
Laranja Claro: #FFF7ED (rgb(255, 247, 237))
```

### Cores Neutras
```
Cinza 900: #111827 (rgb(17, 24, 39))
Cinza 800: #1F2937 (rgb(31, 41, 55))
Cinza 700: #374151 (rgb(55, 65, 81))
Cinza 600: #4B5563 (rgb(75, 85, 99))
Cinza 500: #6B7280 (rgb(107, 114, 128))
Cinza 400: #9CA3AF (rgb(156, 163, 175))
Cinza 300: #D1D5DB (rgb(209, 213, 219))
Cinza 200: #E5E7EB (rgb(229, 231, 235))
Cinza 100: #F3F4F6 (rgb(243, 244, 246))
Cinza 50: #F9FAFB (rgb(249, 250, 251))
Branco: #FFFFFF
```

### Gradientes
```
Fundo Principal: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%)
Preço Destaque: linear-gradient(90deg, #EFF6FF 0%, #E0E7FF 100%)
Desconto: linear-gradient(90deg, #EF4444 0%, #EC4899 100%)
```

## 📝 Tipografia

### Família de Fontes
```
Principal: Inter, system-ui, -apple-system, sans-serif
Código: ui-monospace, monospace
```

### Escalas de Texto
```
Título Principal: 48px / Bold / Line Height 1.1
Título H1: 36px / Bold / Line Height 1.2
Título H2: 30px / Bold / Line Height 1.3
Título H3: 24px / Semibold / Line Height 1.4
Título H4: 20px / Semibold / Line Height 1.4
Corpo Grande: 18px / Regular / Line Height 1.6
Corpo Normal: 16px / Regular / Line Height 1.5
Corpo Pequeno: 14px / Regular / Line Height 1.4
Caption: 12px / Medium / Line Height 1.3
```

## 📐 Espaçamento

### Grid System
```
Container: 1280px max-width
Margens: 16px (mobile), 24px (tablet), 32px (desktop)
Colunas: 4 (mobile), 8 (tablet), 12 (desktop)
Gap: 16px (mobile), 24px (desktop)
```

### Espaçamentos
```
XS: 4px
SM: 8px
MD: 16px
LG: 24px
XL: 32px
2XL: 48px
3XL: 64px
```

## 🔘 Componentes

### Botões

#### Botão Primário
```
Background: #2563EB
Hover: #1D4ED8
Text: #FFFFFF
Padding: 12px 24px
Border Radius: 12px
Font: 16px Medium
Shadow: 0 1px 3px rgba(0,0,0,0.1)
```

#### Botão Secundário
```
Background: Transparent
Border: 1px solid #D1D5DB
Text: #374151
Hover Background: #F9FAFB
Padding: 12px 24px
Border Radius: 12px
```

#### Botão Ghost
```
Background: Transparent
Text: #4B5563
Hover Background: #F3F4F6
Padding: 8px 12px
Border Radius: 8px
```

### Cards

#### Product Card
```
Background: #FFFFFF
Border Radius: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
Padding: 16px
Hover Shadow: 0 10px 25px rgba(0,0,0,0.1)
Aspect Ratio: 1:1 (imagem)
```

#### Info Card
```
Background: #FFFFFF
Border Radius: 12px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Padding: 24px
```

### Badges

#### Badge Desconto
```
Background: linear-gradient(90deg, #EF4444, #EC4899)
Text: #FFFFFF
Padding: 4px 8px
Border Radius: 6px
Font: 12px Bold
```

#### Badge Status
```
Background: #ECFDF5
Text: #059669
Border: 1px solid #10B981
Padding: 4px 8px
Border Radius: 6px
Font: 12px Medium
```

### Forms

#### Input Field
```
Background: #FFFFFF
Border: 1px solid #D1D5DB
Focus Border: #2563EB
Padding: 12px 16px
Border Radius: 8px
Font: 16px Regular
```

#### Select Dropdown
```
Background: #FFFFFF
Border: 1px solid #D1D5DB
Padding: 12px 16px
Border Radius: 8px
Icon: Chevron Down
```

## 📱 Layout Mobile

### Breakpoints
```
Mobile: 0-640px
Tablet: 641-1024px
Desktop: 1025px+
```

### Mobile Patterns
```
Fixed Bottom Bar: Height 80px
Sticky Header: Height 64px
Card Padding: 16px
Grid Columns: 1-2
Touch Target: 44px minimum
```

### Navigation

#### Mobile Header
```
Height: 64px
Background: #FFFFFF/95 (backdrop-blur)
Border Bottom: 1px solid #E5E7EB
Padding: 0 16px
Position: Sticky top
```

#### Bottom Action Bar
```
Height: 80px
Background: #FFFFFF
Border Top: 1px solid #E5E7EB
Padding: 16px
Position: Fixed bottom
Z-index: 50
```

## 🎯 Estados Interativos

### Hover States
```
Buttons: Darkened background (-20% lightness)
Cards: Enhanced shadow + scale(1.02)
Links: Color change to primary blue
Icons: Opacity 0.8
```

### Active States
```
Buttons: Pressed effect scale(0.98)
Form Fields: Border color primary blue
Tabs: Underline + bold text
```

### Loading States
```
Skeleton: #F3F4F6 background with shimmer
Spinner: 2px border, primary blue color
Button Loading: Disabled state + spinner icon
```

## 📐 Layout Patterns

### Product Grid
```
Desktop: 4 columns
Tablet: 3 columns
Mobile: 2 columns
Gap: 24px (desktop), 16px (mobile)
```

### Product Detail Layout
```
Desktop: 2 columns (1:1 ratio)
Mobile: Stacked layout
Image: Square aspect ratio
Actions: Fixed bottom on mobile
```

### Filter Sidebar
```
Desktop: 280px width
Mobile: Full-screen overlay
Background: #FFFFFF
Padding: 24px
```

## 🔧 Componentes Específicos

### Navbar
```
Height: 64px
Background: #FFFFFF
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Logo: 32px height
Search: Full-width on mobile
Cart Icon: Badge with count
```

### Product Filter
```
Desktop: Sidebar layout
Mobile: Collapsible sections
Background: #F9FAFB
Border Radius: 12px
Padding: 16px
```

### Cart Item
```
Layout: Horizontal
Image: 80px square
Remove Button: Top-right corner
Quantity: +/- controls
```

### Price Display
```
Current Price: Large, bold, primary color
Original Price: Strikethrough, gray
Discount: Badge with percentage
Installments: Small text, secondary
```

## 📸 Assets e Ícones

### Ícones
```
Biblioteca: Lucide React
Tamanho Padrão: 20px
Stroke Width: 2px
Cores: Inherit from parent
```

### Imagens
```
Product Images: Square (1:1)
Placeholders: Shopping cart icon
Quality: WebP preferred
Sizes: 300px, 600px, 1200px
```

## 🎨 Material Design Elements

### Shadows (Material)
```
Level 1: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
Level 2: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
Level 3: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
Level 4: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
```

### Animations
```
Transition Duration: 150ms (fast), 300ms (normal), 500ms (slow)
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Hover Scale: scale(1.02)
Loading Spin: 360deg infinite 1s linear
```

## 📋 Checklist para Figma

### Cores
- [ ] Criar paleta de cores primárias
- [ ] Adicionar cores de apoio
- [ ] Definir gradientes
- [ ] Criar estilos de cores

### Tipografia
- [ ] Configurar fonte Inter
- [ ] Criar estilos de texto
- [ ] Definir line-height
- [ ] Estabelecer hierarquia

### Componentes
- [ ] Criar botões (primário, secundário, ghost)
- [ ] Desenvolver cards de produto
- [ ] Fazer inputs e formulários
- [ ] Criar badges e tags
- [ ] Desenvolver navegação

### Layout
- [ ] Definir grid system
- [ ] Criar breakpoints
- [ ] Estabelecer espaçamentos
- [ ] Fazer layouts responsivos

### Estados
- [ ] Criar estados hover
- [ ] Definir estados ativos
- [ ] Fazer estados de loading
- [ ] Criar estados de erro

Este design system está baseado na implementação atual do seu e-commerce e segue as melhores práticas de design mobile-first que aplicamos!