# Guia Prático: Criando Components no Figma

## 🚀 Como Implementar o Design System

### 1. Preparando o Arquivo Figma

1. **Crie um novo arquivo** chamado "E-commerce Design System"
2. **Configure as páginas:**
   - 🎨 Colors & Typography
   - 🧩 Components
   - 📱 Mobile Screens
   - 💻 Desktop Screens

### 2. Configurando Cores

**Criar Local Variables:**
```
1. Vá em Local variables (ícone de variáveis)
2. Crie uma Collection chamada "Colors"
3. Adicione as variáveis:

Primitives:
- blue-50: #EFF6FF
- blue-500: #2563EB
- blue-600: #1D4ED8
- gray-50: #F9FAFB
- gray-100: #F3F4F6
- gray-200: #E5E7EB
- gray-600: #4B5563
- gray-900: #111827
- white: #FFFFFF
- green-50: #ECFDF5
- green-600: #059669
- red-500: #EF4444
- orange-50: #FFF7ED
- orange-600: #EA580C

Semantic:
- primary: blue-500
- primary-hover: blue-600
- background: gray-50
- surface: white
- text-primary: gray-900
- text-secondary: gray-600
- success: green-600
- error: red-500
- warning: orange-600
```

### 3. Configurando Tipografia

**Text Styles:**
```
1. Pressione T para ferramenta de texto
2. Digite um texto exemplo
3. Configure cada estilo:

Display Large:
- Font: Inter Bold
- Size: 48px
- Line Height: 120%

Heading 1:
- Font: Inter Bold
- Size: 36px
- Line Height: 120%

Heading 2:
- Font: Inter Bold
- Size: 30px
- Line Height: 130%

Heading 3:
- Font: Inter Semibold
- Size: 24px
- Line Height: 140%

Body Large:
- Font: Inter Regular
- Size: 18px
- Line Height: 160%

Body:
- Font: Inter Regular
- Size: 16px
- Line Height: 150%

Body Small:
- Font: Inter Regular
- Size: 14px
- Line Height: 140%

Caption:
- Font: Inter Medium
- Size: 12px
- Line Height: 130%

4. Selecione o texto e crie Style (ícone dos 4 pontos)
```

### 4. Criando Effect Styles (Sombras)

```
1. Crie um retângulo
2. Configure os efeitos:

Shadow 1:
- Type: Drop Shadow
- X: 0, Y: 1
- Blur: 3
- Color: #000000 10%

Shadow 2:
- Type: Drop Shadow
- X: 0, Y: 4
- Blur: 6
- Color: #000000 10%

Shadow 3:
- Type: Drop Shadow
- X: 0, Y: 10
- Blur: 15
- Color: #000000 10%

3. Selecione e crie Effect Style
```

### 5. Componente: Botão Primário

```
1. Desenhe um retângulo:
   - Width: 120px
   - Height: 44px
   - Corner Radius: 12px
   - Fill: primary variable

2. Adicione texto:
   - Text: "Button"
   - Style: Body
   - Color: white
   - Center align

3. Selecione ambos e Create Component (Ctrl+Alt+K)
4. Renomeie para "Button/Primary"

5. Adicione variantes:
   - Duplicate o component
   - Crie variações: Default, Hover, Disabled
   - Configure Interactive Components:
     - Trigger: On Hover
     - Action: Change to Hover variant
```

### 6. Componente: Product Card

```
1. Crie um frame:
   - Width: 280px
   - Height: 360px
   - Corner Radius: 16px
   - Fill: white
   - Effect: Shadow 1

2. Adicione elementos:

Image Container:
   - Width: 248px (32px margin)
   - Height: 200px
   - Corner Radius: 12px
   - Fill: gray-100
   - Position: 16px from top/left/right

Price Badge (se houver desconto):
   - Width: auto
   - Height: 24px
   - Corner Radius: 6px
   - Fill: gradient (red-500 to pink-500)
   - Text: "-20%"
   - Position: absolute, 8px from top-left of image

Brand Badge:
   - Text: "Apple"
   - Style: Caption
   - Color: blue-600
   - Background: blue-50
   - Padding: 4px 8px
   - Corner Radius: 6px

Product Title:
   - Text: "Product Name"
   - Style: Heading 3
   - Color: text-primary
   - Max width: 248px

Price Container:
   - Layout: Horizontal
   - Spacing: 8px
   
Current Price:
   - Text: "R$ 299,99"
   - Style: Body Large
   - Color: text-primary
   - Weight: Bold

Original Price (se houver):
   - Text: "R$ 399,99"
   - Style: Body
   - Color: text-secondary
   - Text Decoration: Line Through

Add to Cart Button:
   - Use Button/Primary component
   - Text: "Adicionar"
   - Width: 100%

3. Selecione tudo e Create Component
4. Adicione Properties:
   - Product Image (Instance Swap)
   - Product Name (Text)
   - Current Price (Text)
   - Original Price (Text + Boolean show/hide)
   - Brand Name (Text)
   - Discount Badge (Boolean show/hide)
```

### 7. Componente: Input Field

```
1. Crie um frame:
   - Width: 280px
   - Height: 44px
   - Corner Radius: 8px
   - Border: 1px gray-200
   - Fill: white

2. Adicione texto:
   - Text: "Placeholder text"
   - Style: Body
   - Color: text-secondary
   - Padding: 12px 16px

3. Create Component e adicione variantes:
   - Default
   - Focused (border: blue-500)
   - Error (border: red-500)
   - Disabled (background: gray-50)
```

### 8. Layouts Mobile

```
1. Crie um frame Mobile:
   - iPhone 14: 390x844px
   - Background: background variable

2. Componentes principais:

Header Mobile:
   - Height: 64px
   - Background: white/95% opacity
   - Backdrop blur effect
   - Border bottom: 1px gray-200

Product Grid:
   - 2 colunas
   - Gap: 16px
   - Margin: 16px

Bottom Action Bar:
   - Height: 80px
   - Background: white
   - Border top: 1px gray-200
   - Position: Fixed bottom
   - Safe area bottom
```

### 9. Auto Layout Best Practices

```
Configurações essenciais:

Product Grid:
- Direction: Vertical
- Spacing: 16px
- Padding: 16px
- Fill container: Width

Product Card:
- Direction: Vertical
- Spacing: 12px
- Padding: 16px
- Hug contents: Both

Header:
- Direction: Horizontal
- Spacing: 16px
- Padding: 0 16px
- Fill container: Width
- Alignment: Space between
```

### 10. Interactive Prototyping

```
Configurações de interação:

Button Hover:
- Trigger: On Hover
- Action: Change to
- Destination: Hover variant
- Animation: Smart animate
- Duration: 150ms

Card Tap:
- Trigger: On Tap
- Action: Navigate to
- Destination: Product Detail screen
- Animation: Move in
- Direction: Left

Navigation:
- Trigger: On Tap
- Action: Scroll to
- Destination: Section
- Animation: Ease out
- Duration: 300ms
```

### 11. Responsivo: Breakpoints

```
Crie frames para cada breakpoint:

Mobile: 390px
- Product Grid: 2 colunas
- Navigation: Bottom tabs
- Typography: Scales down

Tablet: 768px
- Product Grid: 3 colunas
- Navigation: Top header
- Sidebar: Filters

Desktop: 1280px
- Product Grid: 4 colunas
- Navigation: Full header
- Sidebar: Always visible
- Typography: Full scale
```

### 12. Component Documentation

```
Para cada component, adicione:

1. Description:
   - Propósito do componente
   - Quando usar
   - Variações disponíveis

2. Properties:
   - Liste todas as props
   - Valores padrão
   - Tipos aceitos

3. Usage Guidelines:
   - Spacing requirements
   - Content guidelines
   - Accessibility notes

4. Examples:
   - Different states
   - Use cases
   - Do's and Don'ts
```

### 13. Exportando Assets

```
Configurações de export:

Icons:
- Format: SVG
- Scale: 1x

Images:
- Format: PNG
- Scale: 2x para Retina

Components:
- Format: PNG
- Scale: 2x
- Include background

Code:
- Use Dev Mode
- Copy CSS properties
- Export component code
```

### 14. Organizando o Arquivo

```
Estrutura de páginas:

📚 Cover Page
🎨 Design Tokens
   - Colors
   - Typography
   - Spacing
   - Effects

🧩 Components
   - Atoms (Button, Input, Badge)
   - Molecules (Card, Navigation)
   - Organisms (Header, Footer)

📱 Mobile Designs
   - Landing
   - Product Catalog
   - Product Detail
   - Cart
   - Checkout

💻 Desktop Designs
   - All screens in desktop layout

📋 Documentation
   - Usage guidelines
   - Component specs
   - Change log
```

### 15. Checklist Final

✅ **Design Tokens configurados**
- [ ] Variables de cores criadas
- [ ] Text styles definidos
- [ ] Effect styles configurados

✅ **Components básicos**
- [ ] Buttons (todos os estados)
- [ ] Input fields
- [ ] Cards
- [ ] Navigation
- [ ] Badges

✅ **Layouts**
- [ ] Mobile screens
- [ ] Desktop screens
- [ ] Responsive behavior

✅ **Interactions**
- [ ] Hover states
- [ ] Navigation flows
- [ ] Micro-interactions

✅ **Documentation**
- [ ] Component descriptions
- [ ] Usage guidelines
- [ ] Code specifications

Este guia te permitirá recriar todo o design system do e-commerce no Figma, mantendo consistência com a implementação atual!