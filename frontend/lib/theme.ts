// Theme configuration for the application
// This centralizes our color palette and makes it easier to maintain

export const theme = {
  colors: {
    // Primary colors
    primary: {
      main: "#C3FF00", // Bright lime green
      light: "#D4FF33",
      dark: "#A3D600",
      contrastText: "#1F1F1F",
    },
    // Background colors
    background: {
      main: "#1D1D1D", // Dark gray (almost black) - from create page
      paper: "#333333", // Medium gray for content areas - from create page
      light: "#444444", // Light gray background - from create page
      dark: "#111111", // Very dark gray/black
      input: "#252525", // Input field background - from create page
    },
    // Text colors
    text: {
      primary: "#FFFFFF", // White text
      secondary: "#E0E0E0", // Light gray for secondary text
      disabled: "#AAAAAA", // Medium gray for disabled text - from create page
      hint: "#888888", // Hint text - from create page
    },
    // Other colors
    divider: "#444444", // From create page
    border: "#444444", // From create page
    success: {
      main: "#4CAF50",
      light: "#81C784",
      dark: "#388E3C",
    },
    error: {
      main: "#F44336",
      light: "#E57373",
      dark: "#D32F2F",
    },
    warning: {
      main: "#FFC107",
      light: "#FFD54F",
      dark: "#FFA000",
    },
    info: {
      main: "#2196F3",
      light: "#64B5F6",
      dark: "#1976D2",
    },
    // UI element specific colors
    card: {
      background: "#333333", // Card background - from create page
      border: "#444444", // Card border - from create page
    },
    button: {
      primary: "#C3FF00", // Primary button color
      hover: "#D4FF33", // Button hover state
      text: "#1F1F1F", // Button text color for primary buttons
    },
    input: {
      background: "#252525", // Input background - from create page
      border: "#444444", // Input border - from create page
      placeholder: "#888888", // Placeholder text color - from create page
    },
    // For the jars page specifically:
    explore: {
      background: "#1F1F1F", // Main background color for explore/jars page
      card: "#2A2A2A", // Card background color
      border: "#444444", // Border color for cards and elements
      counterBox: "#2A2A2A", // Background for the counter box
      counterBorder: "#C3FF00", // Border for the counter box
    },
  },
  // You can add more theme properties here as needed
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "1rem",
    xl: "2rem",
    full: "9999px",
  },
}

// Type definitions for the theme
export type Theme = typeof theme

// Helper function to access theme values in a type-safe way
export const getThemeValue = <T extends keyof typeof theme, U extends keyof (typeof theme)[T]>(
  category: T,
  value: U,
): (typeof theme)[T][U] => {
  return theme[category][value]
}
