# Planning Guide

A comprehensive OID (Object Identifier) Registry Explorer and Management Platform for BrainSAIT Enterprise (IANA PEN 61026) that visualizes the hierarchical namespace structure, generates implementation code for various systems, and manages the organization's digital identity architecture.

**Experience Qualities**:
1. **Technical Precision** - Every OID path is validated, displayed with exact notation, and generates production-ready integration code
2. **Visual Hierarchy** - The tree structure of nested OIDs should be immediately comprehensible through spatial organization and visual cues
3. **Enterprise Authority** - The interface should convey the gravitas of managing a globally-registered organizational namespace used in healthcare and AI systems

**Complexity Level**: Light Application (multiple features with basic state)
- The app manages a predefined OID tree structure with CRUD operations for leaf nodes, code generation features, and visual exploration without requiring complex multi-view navigation or advanced state synchronization

## Essential Features

### OID Tree Visualization
- **Functionality**: Interactive tree display showing the complete BrainSAIT OID hierarchy from root (1.3.6.1.4.1.61026) through all branches
- **Purpose**: Allows users to understand the organizational namespace structure at a glance and navigate to specific nodes
- **Trigger**: Loads on application start
- **Progression**: User sees root node → Expands branches (Geographic, Organization, Products) → Clicks leaf nodes → Views detailed metadata
- **Success criteria**: All OID paths are correctly displayed with proper dot notation, expandable/collapsible branches work smoothly

### Node Detail Panel
- **Functionality**: Displays comprehensive information about selected OID node including full path, description, use cases, and implementation examples
- **Purpose**: Provides context and guidance for how each OID branch should be used in production systems
- **Trigger**: User clicks any node in the tree
- **Progression**: Node selection → Panel slides in → Shows metadata → Displays code examples → Offers copy/export actions
- **Success criteria**: Information is clear, contextual, and immediately actionable

### Code Generator
- **Functionality**: Generates implementation code for selected OID in multiple contexts (FHIR extensions, MCP URNs, X.509 certificates, API headers)
- **Purpose**: Eliminates manual transcription errors and accelerates integration with external systems
- **Trigger**: User selects "Generate Code" for a specific implementation type
- **Progression**: Select node → Choose implementation type (FHIR/MCP/X.509/API) → View generated code → Copy to clipboard
- **Success criteria**: Generated code is syntactically correct and follows best practices for each target system

### Custom OID Registration
- **Functionality**: Add new leaf nodes to existing branches with description and metadata
- **Purpose**: Allows organization to extend the namespace as new products or services are created
- **Trigger**: User clicks "Add Child Node" on any branch
- **Progression**: Select parent → Enter name and description → Assign next available ID → Validate uniqueness → Save to registry
- **Success criteria**: New OIDs are properly nested, globally unique within the tree, and persist between sessions

### Quick Search
- **Functionality**: Filter OID tree by keyword, path segment, or use case
- **Purpose**: Rapid location of specific nodes in large hierarchy
- **Trigger**: User types in search input
- **Progression**: Type query → Tree filters in real-time → Matching nodes highlight → Non-matches dim
- **Success criteria**: Search is instant and highlights all relevant results

## Edge Case Handling

- **Empty Search Results**: Show "No matching OIDs found" with suggestion to browse full tree
- **Invalid OID Format**: Validation feedback when user attempts to create malformed OID paths
- **Duplicate Child IDs**: Prevent creation of duplicate numeric IDs under same parent node
- **Deep Nesting**: Tree gracefully handles 6+ levels of depth with proper indentation
- **Long Descriptions**: Text truncates with "read more" expansion for lengthy metadata

## Design Direction

The design should evoke the feeling of a **technical blueprint** or **architectural schematic** - precise, authoritative, and slightly futuristic. Think ISO standards documentation meets modern dev tools. The interface should feel like you're working with the foundational infrastructure of an enterprise, not a consumer app.

## Color Selection

A technical, enterprise-grade palette with high contrast and clinical precision:

- **Primary Color**: Deep Technical Blue `oklch(0.35 0.12 250)` - Communicates trust, standards compliance, and technical depth. Used for primary actions and the root OID node
- **Secondary Colors**: 
  - Steel Gray `oklch(0.55 0.02 250)` - Supporting UI elements, borders, secondary text
  - Carbon `oklch(0.25 0.01 250)` - Backgrounds for code blocks and technical panels
- **Accent Color**: Vivid Cyan `oklch(0.70 0.15 200)` - CTAs, active states, highlights for selected nodes. Evokes digital precision
- **Foreground/Background Pairings**: 
  - Background (Off-White) `oklch(0.98 0.005 250)`: Deep Technical Blue text `oklch(0.35 0.12 250)` - Ratio 8.9:1 ✓
  - Carbon Background `oklch(0.25 0.01 250)`: Off-White text `oklch(0.98 0.005 250)` - Ratio 13.2:1 ✓
  - Accent (Vivid Cyan) `oklch(0.70 0.15 200)`: Carbon text `oklch(0.25 0.01 250)` - Ratio 5.7:1 ✓

## Font Selection

The typography should communicate **precision, authority, and technical sophistication** appropriate for enterprise infrastructure tooling.

- **Typographic Hierarchy**:
  - H1 (App Title): JetBrains Mono Bold / 32px / -0.02em letter spacing
  - H2 (Section Headers): JetBrains Mono SemiBold / 20px / -0.01em
  - H3 (OID Paths): JetBrains Mono Medium / 16px / 0em - The monospace ensures perfect alignment of dot-notation
  - Body Text: Space Grotesk Regular / 15px / 1.6 line height
  - Code Blocks: JetBrains Mono Regular / 14px / 1.5 line height
  - Labels/Metadata: Space Grotesk Medium / 13px / 0.01em

## Animations

Animations should feel **technical and purposeful** - like watching infrastructure snap into place rather than consumer app flourishes. Motion communicates the hierarchy and relationships between OID nodes.

- **Tree Expansion**: 250ms ease-out with slight vertical slide, suggesting unfurling of nested structure
- **Node Selection**: Immediate visual feedback (50ms) with subtle pulse effect on the node border
- **Panel Transitions**: 300ms slide-in from right for detail panels, establishing spatial relationship
- **Code Copy Feedback**: Brief scale pulse (150ms) on copy button with checkmark replacement
- **Search Filtering**: Smooth 200ms opacity transition as non-matching nodes fade

## Component Selection

- **Components**:
  - `Accordion` for collapsible tree branches (modified with custom chevron icons and deeper indentation)
  - `Card` for OID node containers and detail panels (sharp corners to feel technical)
  - `Tabs` for switching between different code generation formats
  - `Dialog` for creating new OID registrations with form validation
  - `Button` for all actions (sharp, high-contrast variants)
  - `Input` for search and new node entry with clear validation states
  - `Badge` for OID status indicators (active/deprecated/experimental)
  - `ScrollArea` for tree navigation and code display
  - `Separator` for visual hierarchy between sections
  - `Tooltip` for hovering over nodes to see quick metadata

- **Customizations**:
  - Custom TreeNode component with connecting lines between parent/child
  - CodeBlock component with syntax highlighting and one-click copy
  - OIDPath component that formats dot-notation with proper spacing
  - BreadcrumbNav showing current position in OID hierarchy

- **States**:
  - Buttons: Default has sharp edges with subtle shadow, Hover adds cyan border glow, Active scales down 98%, Disabled reduces opacity to 40%
  - Tree Nodes: Unselected has subtle gray border, Selected gets cyan left border + light background, Hover adds slight background tint
  - Inputs: Default has steel border, Focus gets cyan ring + border, Error shows red left border with message, Success shows brief green check

- **Icon Selection**:
  - Tree (for root node)
  - FolderOpen / FolderClosed (for branch nodes)
  - CircleDot (for leaf nodes)
  - Code (for code generation)
  - Copy / Check (for clipboard operations)
  - Plus / Trash (for CRUD operations)
  - MagnifyingGlass (for search)
  - CaretDown / CaretRight (for tree expansion)

- **Spacing**:
  - Section padding: `p-6`
  - Card internal spacing: `p-4`
  - Between tree levels: `ml-6` for each indentation
  - Button padding: `px-4 py-2`
  - Panel gaps: `gap-4` for related elements, `gap-8` for major sections

- **Mobile**:
  - Tree switches to full-width with horizontal scrolling for deep nests
  - Detail panel becomes bottom sheet instead of right sidebar
  - Code generation tabs collapse to dropdown select
  - Touch targets expanded to minimum 44px for all interactive elements
  - Search becomes sticky at top of viewport
