import { Step } from "react-joyride"

export const MCC_DASHBOARD_TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='mcc-dashboard-welcome']",
    title: "Welcome to Your MCC Dashboard",
    content:
      "This is your central hub for managing milk collections, farmers, sales, and finances. Let's take a quick tour of the key features.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: "[data-tour='mcc-info-card']",
    title: "MCC Information",
    content:
      "Here you can see your MCC details, including name, location, and current operational status. Click to view or update settings.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='quick-actions']",
    title: "Quick Actions",
    content:
      "Use these buttons to quickly perform common tasks like recording a new collection, adding a farmer, or processing a sale.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='dashboard-tabs']",
    title: "Dashboard Sections",
    content:
      "Navigate between different sections: Sales for transactions, Customers for buyers, Suppliers for input providers, Wallet (iKOFI) for digital payments, and Warehouses for inventory.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collections-summary']",
    title: "Collections Overview",
    content:
      "View your daily, weekly, and monthly collection statistics at a glance. Track volumes, quality metrics, and trends.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='farmers-list']",
    title: "Registered Farmers",
    content:
      "See all farmers registered with your MCC. Add new farmers, view their profiles, and track their delivery history.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='harvestplus-section']",
    title: "HarvestPlus Commodities",
    content:
      "Beyond milk, you can collect and manage other agricultural commodities like coffee, maize, and beans through the HarvestPlus module.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='ikofi-wallet']",
    title: "iKOFI Digital Wallet",
    content:
      "The iKOFI wallet enables digital payments to farmers, input purchases, and financial tracking. Farmers can also save and access credit through this system.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='reports-section']",
    title: "Reports & Analytics",
    content:
      "Generate reports for collections, payments, inventory, and farmer performance. Export data for record-keeping or submission.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='help-button']",
    title: "Need Help?",
    content:
      "You can restart this tour anytime by clicking the Help button. Look for the (?) icons throughout the app for contextual help on specific fields.",
    disableBeacon: true,
    placement: "bottom",
  },
]

export const MCC_DASHBOARD_TOUR_ID = "mcc-dashboard"
