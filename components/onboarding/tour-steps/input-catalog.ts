import { Step } from "react-joyride"

export const INPUT_CATALOG_TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='input-catalog-welcome']",
    title: "Input Catalog Management",
    content:
      "The Input Catalog allows you to define and manage farm inputs (feed, veterinary products, fertilizers, etc.) that farmers can purchase through the MCC.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: "[data-tour='input-commodity-select']",
    title: "Select Commodity",
    content:
      "First, select the commodity this input catalog is for. Different commodities (Digital, Coffee, Maize) have different input requirements.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='input-add-button']",
    title: "Add New Input",
    content:
      "Click here to add a new input item to the catalog. You can add feeds, medicines, fertilizers, seeds, and more.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='input-list']",
    title: "Input Items List",
    content:
      "View all inputs available for the selected commodity. Each item shows name, category, unit, and reference price.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='input-category']",
    title: "Input Categories",
    content:
      "Inputs are organized by category: Feed, Veterinary, Fertilizer, Seed, Pesticide, Equipment, and more. This helps farmers find what they need.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='input-pricing']",
    title: "Pricing Reference",
    content:
      "Set a reference price in RWF for each input. This helps with budgeting and can be used for input credit programs.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: "[data-tour='input-preload']",
    title: "Pre-load Standard Inputs",
    content:
      "Use the 'Import Standard Inputs' button to quickly populate the catalog with commonly used inputs based on official recommendations.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='input-actions']",
    title: "Edit or Delete",
    content:
      "Use these action buttons to edit input details or remove items from the catalog. Deleted items can be added back later.",
    disableBeacon: true,
    placement: "left",
  },
]

export const INPUT_CATALOG_TOUR_ID = "input-catalog"
