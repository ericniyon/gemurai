import { Step } from "react-joyride"

export const FARMER_REGISTRATION_TOUR_STEPS: Step[] = [
  {
    target: "[data-tour='farmer-form-welcome']",
    title: "Register a New Farmer",
    content:
      "This form helps you register new dairy farmers with your MCC. Complete all required fields marked with (*) to ensure accurate records and smooth operations.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: "[data-tour='farmer-personal-info']",
    title: "Step 1: Personal Information",
    content:
      "Enter the farmer's name, contact details, and identification. The National ID is important for payment processing and verification.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='farmer-name']",
    title: "Farmer Name",
    content:
      "Enter the farmer's full name as it appears on their National ID. This name will be used for payments and official communications.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-phone']",
    title: "Phone Number",
    content:
      "Enter the farmer's primary mobile number. This is used for SMS notifications about payments, collections, and important updates.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-national-id']",
    title: "National ID",
    content:
      "Enter the 16-digit National ID number. This is required for identity verification and financial compliance. Double-check for accuracy.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-location']",
    title: "Step 2: Location Details",
    content:
      "Select the farmer's administrative location: District, Sector, Cell, and Village. This helps with route planning and regional reporting.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='farmer-district']",
    title: "District Selection",
    content:
      "Select the district where the farmer is located. The sectors, cells, and villages will update based on your selection.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-gps']",
    title: "GPS Location",
    content:
      "Capture the farmer's GPS coordinates for mapping and route optimization. Ensure you have the farmer's consent before capturing location.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-farm-details']",
    title: "Step 3: Farm Details",
    content:
      "Enter information about the farmer's dairy operation including herd size and cooperative membership.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='farmer-herd-size']",
    title: "Herd Size",
    content:
      "Enter the total number of dairy cattle owned. This helps estimate expected milk production and plan collection routes.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-cooperative']",
    title: "Cooperative Membership",
    content:
      "Indicate if the farmer is a member of a dairy cooperative. Cooperative members may have different payment terms and deductions.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-payment']",
    title: "Step 4: Payment Setup",
    content:
      "Configure how the farmer will receive payments for their milk deliveries.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-tour='farmer-payment-method']",
    title: "Payment Method",
    content:
      "Choose the preferred payment method: Mobile Money (fastest), Bank Transfer (for larger amounts), Cash, or iKOFI Wallet (for input purchases).",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-tour='farmer-review']",
    title: "Review & Submit",
    content:
      "Review all entered information carefully before submitting. A unique Farmer Code will be generated automatically after successful registration.",
    disableBeacon: true,
    placement: "top",
  },
]

export const FARMER_REGISTRATION_TOUR_ID = "farmer-registration"
