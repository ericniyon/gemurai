import { Step } from "react-joyride"

export const COMMODITY_COLLECTION_TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='collection-form-welcome']",
    title: "Record a New Collection",
    content:
      "This 4-step wizard guides you through recording a milk or commodity collection. Each step gathers specific information needed for accurate payment and quality tracking.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: "[data-tour='collection-step-indicator']",
    title: "Progress Steps",
    content:
      "Follow these steps to complete the collection record. You can navigate back to previous steps if needed. Green checkmarks indicate completed steps.",
    disableBeacon: true,
    placement: "bottom",
  },

  // Step 1: Deliverer
  {
    target: "[data-tour='collection-deliverer']",
    title: "Step 1: Who is Delivering?",
    content:
      "Select whether the milk is being delivered directly by the farmer or by a collection agent (Umucunda). This affects how payments and commissions are calculated.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-farmer-type']",
    title: "Delivery Type",
    content:
      "Choose 'Farmer' if the farmer brought their milk directly, or 'Agent' if a collection agent is delivering on behalf of farmers.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='collection-farmer-code']",
    title: "Farmer Code Lookup",
    content:
      "Enter the farmer's code for quick lookup. Type the code and press Enter or click 'Look Up'. You can also search by name using the dropdown below.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-farmer-select']",
    title: "Select Farmer",
    content:
      "If you don't know the code, use this searchable dropdown to find the farmer by name. Start typing to filter the list.",
    disableBeacon: true,
    placement: "bottom",
  },

  // Step 2: Product Type
  {
    target: "[data-tour='collection-commodity-type']",
    title: "Step 2: Select Commodity Type",
    content:
      "Choose the category of product being collected. This determines which specific commodities and quality parameters are available.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-commodity']",
    title: "Select Specific Commodity",
    content:
      "After selecting a category, choose the specific commodity. For dairy, this is typically 'Fresh Milk'. For crops, select the appropriate item.",
    disableBeacon: true,
    placement: "bottom",
  },

  // Step 3: Quantity & Quality
  {
    target: "[data-tour='collection-quantity']",
    title: "Step 3: Enter Quantity",
    content:
      "Enter the amount collected (liters for milk, kg for crops). Ensure accurate measurement for correct payment calculation.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-price']",
    title: "Price Per Unit",
    content:
      "The price per unit (liter/kg) is typically preset based on current rates. It may be adjusted based on quality grade.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-quality']",
    title: "Quality Parameters",
    content:
      "Enter the results of quality tests. For milk: lactometer reading, fat content, temperature, antibiotic test. These affect the quality grade and price.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='collection-quality-lactometer']",
    title: "Lactometer Reading",
    content:
      "Enter the lactometer reading (26-32°L). This tests for water adulteration. Readings below 28°L may indicate added water.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='collection-quality-fat']",
    title: "Fat Content",
    content:
      "Enter the butterfat percentage. Grade A requires >3.5%, Grade B is 3.0-3.5%, below 3.0% is Grade C.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='collection-advances']",
    title: "Advances & Deductions",
    content:
      "Record any cash advances given to the farmer at collection time. This will be deducted from their final payment.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='collection-deductions']",
    title: "Standard Deductions",
    content:
      "View automatic deductions like Umugabane (community savings), Ejo Heza (pension), and loan repayments. These are calculated based on farmer settings.",
    disableBeacon: true,
    placement: "top",
  },

  // Step 4: Review
  {
    target: "[data-tour='collection-review']",
    title: "Step 4: Review & Submit",
    content:
      "Review all the information before submitting. Check the farmer name, quantity, quality grade, and calculated payment amount.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='collection-summary']",
    title: "Collection Summary",
    content:
      "This shows the final calculation: gross amount, deductions, and net payment to farmer. Verify everything is correct before confirming.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-tour='collection-submit']",
    title: "Confirm Collection",
    content:
      "Click 'Confirm & Save' to record the collection. A receipt can be printed for the farmer. The data is saved and cannot be easily changed.",
    disableBeacon: true,
    placement: "top",
  },
]

export const COMMODITY_COLLECTION_TOUR_ID = "commodity-collection"
