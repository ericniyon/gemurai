interface CartTranslation {
  hero: {
    title: string
    subtitle: string
  }
  cart: {
    empty: {
      message: string
      button: string
    }
    table: {
      product: string
      price: string
      quantity: string
      total: string
      actions: string
    }
    actions: {
      remove: string
      update: string
      clear: string
    }
    summary: {
      title: string
      subtotal: string
      shipping: string
      tax: string
      total: string
      checkout: string
    }
  }
  checkout: {
    title: string
    subtitle: string
    billing: {
      title: string
      nameLabel: string
      emailLabel: string
      phoneLabel: string
      addressLabel: string
      cityLabel: string
      provinceLabel: string
      postalLabel: string
    }
    shipping: {
      title: string
      sameAsBilling: string
      nameLabel: string
      phoneLabel: string
      addressLabel: string
      cityLabel: string
      provinceLabel: string
      postalLabel: string
    }
    payment: {
      title: string
      cardName: string
      cardNumber: string
      expiry: string
      cvv: string
    }
    submit: {
      button: string
      terms: string
    }
  }
}

export const cartTranslations: Record<string, CartTranslation> = {
  en: {
    hero: {
      title: "Shopping Cart",
      subtitle: "Review and manage your cart items"
    },
    cart: {
      empty: {
        message: "Your cart is empty",
        button: "Continue Shopping"
      },
      table: {
        product: "Product",
        price: "Price",
        quantity: "Quantity",
        total: "Total",
        actions: "Actions"
      },
      actions: {
        remove: "Remove",
        update: "Update",
        clear: "Clear Cart"
      },
      summary: {
        title: "Cart Summary",
        subtotal: "Subtotal",
        shipping: "Shipping",
        tax: "Tax",
        total: "Total",
        checkout: "Proceed to Checkout"
      }
    },
    checkout: {
      title: "Checkout",
      subtitle: "Complete your purchase",
      billing: {
        title: "Billing Information",
        nameLabel: "Full Name",
        emailLabel: "Email Address",
        phoneLabel: "Phone Number",
        addressLabel: "Street Address",
        cityLabel: "City",
        provinceLabel: "Province",
        postalLabel: "Postal Code"
      },
      shipping: {
        title: "Shipping Information",
        sameAsBilling: "Same as billing address",
        nameLabel: "Full Name",
        phoneLabel: "Phone Number",
        addressLabel: "Street Address",
        cityLabel: "City",
        provinceLabel: "Province",
        postalLabel: "Postal Code"
      },
      payment: {
        title: "Payment Information",
        cardName: "Name on Card",
        cardNumber: "Card Number",
        expiry: "Expiry Date",
        cvv: "CVV"
      },
      submit: {
        button: "Place Order",
        terms: "By placing your order, you agree to our terms and conditions"
      }
    }
  },
  rw: {
    hero: {
      title: "Igitebo",
      subtitle: "Reba kandi ucunge ibiri mu gitebo cyawe"
    },
    cart: {
      empty: {
        message: "Igitebo cyawe kirimo ubusa",
        button: "Komeza Kugura"
      },
      table: {
        product: "Igicuruzwa",
        price: "Igiciro",
        quantity: "Ingano",
        total: "Igiteranyo",
        actions: "Ibikorwa"
      },
      actions: {
        remove: "Gukuramo",
        update: "Kuvugurura",
        clear: "Gusiba Byose"
      },
      summary: {
        title: "Incamake y'Igitebo",
        subtotal: "Igiteranyo",
        shipping: "Gutwara",
        tax: "Imisoro",
        total: "Igiteranyo Rusange",
        checkout: "Komeza Kwishyura"
      }
    },
    checkout: {
      title: "Kwishyura",
      subtitle: "Rangiza kugura",
      billing: {
        title: "Amakuru yo Kwishyura",
        nameLabel: "Amazina Yombi",
        emailLabel: "Imeyili",
        phoneLabel: "Telefoni",
        addressLabel: "Aderesi",
        cityLabel: "Umujyi",
        provinceLabel: "Intara",
        postalLabel: "Kode y'Iposita"
      },
      shipping: {
        title: "Amakuru yo Gutumiza",
        sameAsBilling: "Kimwe n'aderesi yo kwishyura",
        nameLabel: "Amazina Yombi",
        phoneLabel: "Telefoni",
        addressLabel: "Aderesi",
        cityLabel: "Umujyi",
        provinceLabel: "Intara",
        postalLabel: "Kode y'Iposita"
      },
      payment: {
        title: "Amakuru yo Kwishyura",
        cardName: "Izina riri kuri Karita",
        cardNumber: "Numero ya Karita",
        expiry: "Itariki Izarangiriraho",
        cvv: "CVV"
      },
      submit: {
        button: "Ohereza Gahunda",
        terms: "Mu kohereza gahunda yawe, wemera amabwiriza n'amategeko yacu"
      }
    }
  }
} 