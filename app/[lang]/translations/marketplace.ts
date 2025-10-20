interface MarketplaceTranslation {
  hero: {
    title: string
    subtitle: string
    badges: {
      quality: string
      commission: string
      providers: string
    }
    stats: {
      value: string
      label: string
    }
  }
  filters: {
    search: {
      placeholder: string
    }
    category: {
      label: string
      all: string
      preventative: string
      water: string
      reproductive: string
    }
    provider: {
      label: string
      all: string
    }
    price: {
      label: string
      min: string
      max: string
    }
    sort: {
      label: string
      featured: string
      priceLow: string
      priceHigh: string
      newest: string
      bestSelling: string
    }
  }
  products: {
    stock: string
    commission: string
    rating: string
    addToCart: string
    viewDetails: string
    bestSeller: string
    new: string
    discount: string
  }
  cart: {
    title: string
    empty: string
    total: string
    checkout: string
    items: string
    added: {
      title: string
      description: string
    }
    error: {
      title: string
      description: string
    }
  }
  wishlist: {
    add: {
      title: string
      description: string
    }
    remove: {
      title: string
      description: string
    }
  }
}

export const marketplaceTranslations: Record<string, MarketplaceTranslation> = {
  en: {
    hero: {
      title: "Health Products Marketplace",
      subtitle: "Access quality health products from trusted providers. Earn commissions while serving your community.",
      badges: {
        quality: "Quality Assured",
        commission: "Earn Commission",
        providers: "Trusted Providers"
      },
      stats: {
        value: "15%",
        label: "Average Commission"
      }
    },
    filters: {
      search: {
        placeholder: "Search products..."
      },
      category: {
        label: "Category",
        all: "All Categories",
        preventative: "Preventative Care",
        water: "Water Treatment",
        reproductive: "Reproductive Health"
      },
      provider: {
        label: "Provider",
        all: "All Providers"
      },
      price: {
        label: "Price Range",
        min: "Min Price",
        max: "Max Price"
      },
      sort: {
        label: "Sort By",
        featured: "Featured",
        priceLow: "Price: Low to High",
        priceHigh: "Price: High to Low",
        newest: "Newest",
        bestSelling: "Best Selling"
      }
    },
    products: {
      stock: "In Stock",
      commission: "Commission",
      rating: "Rating",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      bestSeller: "Best Seller",
      new: "New",
      discount: "Off"
    },
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      total: "Total",
      checkout: "Checkout",
      items: "items",
      added: {
        title: "Added to Cart",
        description: "{product} has been added to your cart."
      },
      error: {
        title: "Error",
        description: "Failed to add item to cart. Please try again."
      }
    },
    wishlist: {
      add: {
        title: "Added to Wishlist",
        description: "{product} added to your wishlist."
      },
      remove: {
        title: "Removed from Wishlist",
        description: "{product} removed from your wishlist."
      }
    }
  },
  fr: {
    hero: {
      title: "Marché des Produits de Santé",
      subtitle: "Accédez à des produits de santé de qualité auprès de fournisseurs de confiance. Gagnez des commissions tout en servant votre communauté.",
      badges: {
        quality: "Qualité Garantie",
        commission: "Gagnez une Commission",
        providers: "Fournisseurs de Confiance"
      },
      stats: {
        value: "15%",
        label: "Commission Moyenne"
      }
    },
    filters: {
      search: {
        placeholder: "Rechercher des produits..."
      },
      category: {
        label: "Catégorie",
        all: "Toutes les Catégories",
        preventative: "Soins Préventifs",
        water: "Traitement de l'Eau",
        reproductive: "Santé Reproductive"
      },
      provider: {
        label: "Fournisseur",
        all: "Tous les Fournisseurs"
      },
      price: {
        label: "Fourchette de Prix",
        min: "Prix Minimum",
        max: "Prix Maximum"
      },
      sort: {
        label: "Trier Par",
        featured: "En Vedette",
        priceLow: "Prix: Croissant",
        priceHigh: "Prix: Décroissant",
        newest: "Plus Récent",
        bestSelling: "Meilleures Ventes"
      }
    },
    products: {
      stock: "En Stock",
      commission: "Commission",
      rating: "Évaluation",
      addToCart: "Ajouter au Panier",
      viewDetails: "Voir les Détails",
      bestSeller: "Meilleure Vente",
      new: "Nouveau",
      discount: "de Réduction"
    },
    cart: {
      title: "Panier",
      empty: "Votre panier est vide",
      total: "Total",
      checkout: "Commander",
      items: "articles",
      added: {
        title: "Ajouté au Panier",
        description: "{product} a été ajouté à votre panier."
      },
      error: {
        title: "Erreur",
        description: "Impossible d'ajouter l'article au panier. Veuillez réessayer."
      }
    },
    wishlist: {
      add: {
        title: "Ajouté aux Favoris",
        description: "{product} ajouté à vos favoris."
      },
      remove: {
        title: "Retiré des Favoris",
        description: "{product} retiré de vos favoris."
      }
    }
  },
  rw: {
    hero: {
      title: "Isoko ry'Ibikoresho by'Ubuzima",
      subtitle: "Bona ibikoresho by'ubuzima by'ireme biturutse ku batanga serivisi bizewe. Bona amafaranga mu gihe ukorera umuryango wawe.",
      badges: {
        quality: "Ubuziranenge Bwizewe",
        commission: "Bona Amafaranga",
        providers: "Abatanga Serivisi Bizewe"
      },
      stats: {
        value: "15%",
        label: "Amafaranga yo Hagati"
      }
    },
    filters: {
      search: {
        placeholder: "Shakisha ibicuruzwa..."
      },
      category: {
        label: "Icyiciro",
        all: "Ibyiciro Byose",
        preventative: "Kwirinda Indwara",
        water: "Gutunganya Amazi",
        reproductive: "Ubuzima bw'Imyororokere"
      },
      provider: {
        label: "Utanga Serivisi",
        all: "Abatanga Serivisi Bose"
      },
      price: {
        label: "Igiciro",
        min: "Igiciro Gito",
        max: "Igiciro Kinini"
      },
      sort: {
        label: "Gutondeka",
        featured: "Ibyamamaye",
        priceLow: "Igiciro: Gito kugeza Kinini",
        priceHigh: "Igiciro: Kinini kugeza Gito",
        newest: "Bishya",
        bestSelling: "Bigurishwa Cyane"
      }
    },
    products: {
      stock: "Bihari",
      commission: "Amafaranga",
      rating: "Amanota",
      addToCart: "Shyira mu Gikoni",
      viewDetails: "Reba Birambuye",
      bestSeller: "Kigurishwa Cyane",
      new: "Gishya",
      discount: "Kugabanywa"
    },
    cart: {
      title: "Igikoni",
      empty: "Igikoni cyawe kirimo ubusa",
      total: "Igiteranyo",
      checkout: "Kwishyura",
      items: "ibintu",
      added: {
        title: "Byashyizwe mu Gikoni",
        description: "{product} byashyizwe mu gikoni cyawe."
      },
      error: {
        title: "Ikosa",
        description: "Ntibishoboye gushyirwa mu gikoni. Nyamuneka ongera ugerageze."
      }
    },
    wishlist: {
      add: {
        title: "Byashyizwe ku Rutonde",
        description: "{product} byashyizwe ku rutonde rwawe."
      },
      remove: {
        title: "Byakuwe ku Rutonde",
        description: "{product} byakuwe ku rutonde rwawe."
      }
    }
  }
} 