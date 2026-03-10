# Frontend Changes Log

This document tracks all frontend aesthetic and functional changes made to the AidConnect client application.

## [2026-03-09] - UI Refinements & Aesthetics

### Authentication Pages
- **Login screen**: Replaced the plain gradient background left-panel with an immersive image background (`/login-hero.jpg`) while ensuring text readability with a `mix-blend-multiply` gradient overlay structure.

### Admin Dashboard & Main Navigation
- **Dynamic Scroll-Responsive Navigation Bar**:
  - Extracted the static `nav` element into a global reusable `<NavBar />` component.
  - Implemented an animated scroll listener: When the page is at the top, the navigation bar spans the full width of the screen.
  - As the user scrolls down, the navigation bar fluidly detaches, minimizes, and docks to the top-left of the screen as a floating "pill" hamburger button.
  - Expanding the floating button reveals a beautifully animated glassmorphism menu window containing navigation links and the user profile button.
  - Link items feature custom underline sliding hover animations and background highlights.
- **Ambient Animated Background Mesh**:
  - Implemented dynamic, slow-moving CSS blob physics to the global layout of all admin portal pages (`Dashboard`, `Beneficiaries`, `AidRequests`, `Deliveries`, `Reports`).
  - Implemented intersecting colorful light meshes (gradients of purple, blue, pink, green) with 3D blur filters to interact behind the dashboard cards, creating an immersive, premium, "glass" aesthetic feel.

### Beneficiary Portal
- **Refactoring**: Ported the dynamic `<NavBar />` and ambient background mesh over to the Beneficiary Portal interface.
- **Role-based Navigation**: Updated the `<NavBar />` logic to conditionally render navigation links based on user role (e.g. hiding admin dashboards from beneficiaries).

### Global Dark Mode Implementation
- **Theme Configuration**: Configured `tailwind.config.js` to accept `darkMode: 'class'`.
- **State Management**: Created a `ThemeContext` tracking state and syncing preferences with system settings or `localStorage`.
- **Utility Modifications**: Sprinkled the application with thousands of specific `dark:bg-*`, `dark:text-*`, and `dark:border-*` utilities to assure contrast across all portals (`Dashboard`, `Deliveries`, `AidRequests`, etc.).
- **Toggle Mechanism**: Built a glowing animated Sun/Moon SVG switch inside `<NavBar />`.

### New Landing Page
- **Immersive Design**: Constructed a new generic `/` route rendering `Landing.jsx` (inspired by waabi.ai aesthetics).
- **Waabi-Inspired Scroll Mechanics**: 
  - Overhauled the Hero section to use a tall `300vh` scroll container combined with a `sticky` positioning block.
  - As the user scrolls, React tracks the `scrollY` state to dynamically calculate CSS `transform` (scale, translate) and `opacity` algorithms. 
  - The main background image starts full-screen and slowly scales down (shrinks) and dims, revealing secondary floating images that border the central text.
  - Implemented **Scroll Choreography**: The central Header text is mapped to quickly fade out and translate upward as the user begins scrolling, ensuring it never overlaps with the grid.
  - As the grid components lock into their final `[0vh, 0vw]` layout positions, a secondary Text Block smoothly fades underneath to utilize the previously empty scrolling space created by the `300vh` sticky wrapper.
- **Visual Engagement**: Employed `radial-gradient` backgrounds, glowing orb physics, and backdrop blur cards to modernize immediate visual impressions.
