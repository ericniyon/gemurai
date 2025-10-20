export const smartSchoolTheme = {
  // Font Families
  fonts: {
    primary: "font-['Roboto',_'Nunito',_system-ui,_-apple-system]",
    secondary: "font-['Open_Sans',_'Poppins',_sans-serif]",
    heading: "font-['Montserrat',_'Roboto',_sans-serif]",
  },

  // Font Sizes
  text: {
    xs: "text-xs", // 12px
    sm: "text-sm", // 14px
    base: "text-base", // 16px
    lg: "text-lg", // 18px
    xl: "text-xl", // 20px
    "2xl": "text-2xl", // 24px
    "3xl": "text-3xl", // 30px
    "4xl": "text-4xl", // 36px
  },

  // Font Weights
  fontWeight: {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  },

  // Colors
  colors: {
    primary: {
      light: "#0d6efd",
      DEFAULT: "#0a58ca",
      dark: "#084298",
    },
    secondary: {
      light: "#6c757d",
      DEFAULT: "#5c636a",
      dark: "#4d5154",
    },
    success: {
      light: "#198754",
      DEFAULT: "#146c43",
      dark: "#0f5132",
    },
    info: {
      light: "#0dcaf0",
      DEFAULT: "#087990",
      dark: "#055160",
    },
    warning: {
      light: "#ffc107",
      DEFAULT: "#cc9a06",
      dark: "#997404",
    },
    danger: {
      light: "#dc3545",
      DEFAULT: "#b02a37",
      dark: "#842029",
    },
    background: {
      light: "#f8f9fa",
      DEFAULT: "#f0f2f5",
      dark: "#e9ecef",
    },
  },

  // Gradients
  gradients: {
    primary: "bg-gradient-to-r from-[#0a58ca] to-[#0d6efd]",
    secondary: "bg-gradient-to-r from-[#5c636a] to-[#6c757d]",
    card: "bg-gradient-to-r from-[#f8f9fa] to-white",
    cardHover: "hover:bg-gradient-to-r hover:from-white hover:to-[#f8f9fa]",
  },

  // Shadows
  shadows: {
    sm: "shadow-[0_1px_2px_rgba(15,_34,_58,_0.12)]",
    DEFAULT: "shadow-[0_2px_4px_rgba(15,_34,_58,_0.12)]",
    md: "shadow-[0_4px_6px_rgba(15,_34,_58,_0.12)]",
    lg: "shadow-[0_8px_12px_rgba(15,_34,_58,_0.12)]",
    hover: "hover:shadow-[0_4px_8px_rgba(15,_34,_58,_0.2)]",
  },

  // Border Radius
  rounded: {
    sm: "rounded",
    DEFAULT: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  },

  // Spacing
  spacing: {
    px: "p-px",
    0: "p-0",
    1: "p-1",
    2: "p-2",
    3: "p-3",
    4: "p-4",
    5: "p-5",
    6: "p-6",
    8: "p-8",
    10: "p-10",
    12: "p-12",
  },

  // Layout
  layout: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-12 sm:py-16 lg:py-20",
    card: "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200",
  },

  // Transitions
  transitions: {
    DEFAULT: "transition-all duration-200",
    fast: "transition-all duration-150",
    slow: "transition-all duration-300",
  },

  // Component Specific
  components: {
    // Button Styles
    button: {
      base: "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      primary: "bg-[#0a58ca] text-white hover:bg-[#084298]",
      secondary: "bg-[#6c757d] text-white hover:bg-[#5c636a]",
      outline: "border-2 border-[#0a58ca] text-[#0a58ca] hover:bg-[#0a58ca] hover:text-white",
      sizes: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    
    // Card Styles
    card: {
      base: "bg-white rounded-lg overflow-hidden",
      header: "px-6 py-4 border-b border-gray-200",
      body: "p-6",
      footer: "px-6 py-4 bg-gray-50",
      hover: "hover:shadow-lg transition-shadow duration-200",
    },

    // Input Styles
    input: {
      base: "block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0a58ca] focus:ring focus:ring-[#0a58ca] focus:ring-opacity-50",
      sizes: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-4 py-2.5 text-lg",
      },
    },

    // Table Styles
    table: {
      base: "min-w-full divide-y divide-gray-200",
      header: "bg-gray-50",
      headerCell: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      cell: "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
      row: "hover:bg-gray-50",
    },

    // Badge Styles
    badge: {
      base: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      primary: "bg-[#0a58ca]/10 text-[#0a58ca]",
      success: "bg-[#198754]/10 text-[#198754]",
      warning: "bg-[#ffc107]/10 text-[#997404]",
      danger: "bg-[#dc3545]/10 text-[#842029]",
    },

    // Tab Styles
    tabs: {
      base: "border-b border-gray-200",
      tab: "px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#0a58ca] hover:border-[#0a58ca]",
      selected: "text-[#0a58ca] border-b-2 border-[#0a58ca]",
    },
  },
} as const; 