type Card = {
  title: string
  description: string
  action: string
}

type Cards = {
  applications: Card
  profile: Card
  settings: Card
}

interface DashboardTranslation {
  title: string
  subtitle: string
  stats: {
    totalProducts: {
      title: string
      description: string
    }
    totalDCCs: {
      title: string
      description: string
    }
    applications: {
      title: string
      description: string
    }
    totalOrders: {
      title: string
      description: string
    }
  }
  analytics: {
    title: string
    subtitle: string
    marketplace: {
      title: string
      description: string
      metrics: {
        sales: string
        revenue: string
        products: string
      }
    }
    applications: {
      title: string
      description: string
      metrics: {
        total: string
        pending: string
        approved: string
      }
    }
    dccManagement: {
      title: string
      description: string
      metrics: {
        active: string
        inactive: string
        performance: string
      }
    }
  }
  interactiveData: {
    title: string
    subtitle: string
    filters: {
      timeRange: string
      category: string
      status: string
    }
    charts: {
      sales: string
      revenue: string
      applications: string
      performance: string
    }
  }
  dcc: {
    code: {
      title: string
      subtitle: string
      share: string
    }
    application: {
      title: string
      status: string
      viewDetails: string
    }
    earnings: {
      title: string
      total: string
    }
    products: {
      title: string
      subtitle: string
      total: string
      sales: string
      stock: string
    }
    capital: {
      title: string
      total: string
      viewBreakdown: string
    }
    highlights: {
      title: string
      subtitle: string
      updates: {
        title: string
        subtitle: string
        items: {
          products: string
          training: string
          inquiries: string
        }
        cta: string
      }
      rankings: {
        title: string
        subtitle: string
        metrics: {
          sales: {
            label: string
            value: string
          }
          rating: {
            label: string
            value: string
          }
          response: {
            label: string
            value: string
          }
        }
        cta: {
          text: string
          button: string
        }
      }
      sales: {
        title: string
        subtitle: string
        benefits: {
          points: string
          levels: string
          priority: string
        }
        cta: {
          record: string
          rewards: string
        }
      }
    }
    overview: {
      title: string
      subtitle: string
      timeframe: string
    }
  }
}

export const dashboardTranslations: Record<string, DashboardTranslation> = {
  en: {
    title: "Dashboard",
    subtitle: "Welcome to your dashboard",
    stats: {
      totalProducts: {
        title: "Total Products",
        description: "Active products in marketplace"
      },
      totalDCCs: {
        title: "Total DCCs",
        description: "Active DCCs in network"
      },
      applications: {
        title: "Applications",
        description: "Pending applications"
      },
      totalOrders: {
        title: "Total Orders",
        description: "Orders across all DCCs"
      }
    },
    analytics: {
      title: "Analytics Overview",
      subtitle: "Key metrics and performance indicators",
      marketplace: {
        title: "Marketplace Analytics",
        description: "Performance metrics for your marketplace",
        metrics: {
          sales: "Total Sales",
          revenue: "Revenue",
          products: "Active Products"
        }
      },
      applications: {
        title: "Applications Analytics",
        description: "Overview of DCC applications",
        metrics: {
          total: "Total Applications",
          pending: "Pending Review",
          approved: "Approved"
        }
      },
      dccManagement: {
        title: "DCC Management",
        description: "Network performance metrics",
        metrics: {
          active: "Active DCCs",
          inactive: "Inactive DCCs",
          performance: "Average Performance"
        }
      }
    },
    interactiveData: {
      title: "Interactive Data",
      subtitle: "Explore detailed analytics",
      filters: {
        timeRange: "Time Range",
        category: "Category",
        status: "Status"
      },
      charts: {
        sales: "Sales Trend",
        revenue: "Revenue Analysis",
        applications: "Application Status",
        performance: "DCC Performance"
      }
    },
    dcc: {
      code: {
        title: "DCC Code",
        subtitle: "Your unique identifier",
        share: "Share with customers"
      },
      application: {
        title: "Application Status",
        status: "Under Review",
        viewDetails: "View details"
      },
      earnings: {
        title: "Total Earnings",
        total: "RWF {amount}"
      },
      products: {
        title: "Products",
        subtitle: "Your product performance",
        total: "{count}",
        sales: "{count} units sold",
        stock: "{count} in stock"
      },
      capital: {
        title: "Capital",
        total: "RWF {amount}",
        viewBreakdown: "View breakdown"
      },
      highlights: {
        title: "Today's Highlights",
        subtitle: "Your latest achievements and updates",
        updates: {
          title: "Latest Updates",
          subtitle: "What's new today",
          items: {
            products: "New health products available",
            training: "Training session at 2 PM",
            inquiries: "3 new customer inquiries"
          },
          cta: "View All Updates"
        },
        rankings: {
          title: "Your Rankings",
          subtitle: "Performance metrics",
          metrics: {
            sales: {
              label: "Sales Rank",
              value: "#{rank} of {total}"
            },
            rating: {
              label: "Customer Rating",
              value: "{rating}/5.0"
            },
            response: {
              label: "Response Time",
              value: "{percent}%"
            }
          },
          cta: {
            text: "See how you compare!",
            button: "View Full Rankings"
          }
        },
        sales: {
          title: "Record Your Sales",
          subtitle: "Get rewarded for tracking sales",
          benefits: {
            points: "Earn points for each recorded sale",
            levels: "Unlock higher DCC levels",
            priority: "Get priority on new products"
          },
          cta: {
            record: "Record Physical Sale",
            rewards: "View Rewards Program"
          }
        }
      },
      overview: {
        title: "Overview",
        subtitle: "Your performance this month",
        timeframe: "This Month"
      }
    }
  },
  rw: {
    title: "Ikibaho Nyobozi",
    subtitle: "Murakaza neza ku kibaho cyanyu nyobozi",
    stats: {
      totalProducts: {
        title: "Igiteranyo cy'Ibicuruzwa",
        description: "Ibicuruzwa bikora ku isoko"
      },
      totalDCCs: {
        title: "Igiteranyo cya DCCs",
        description: "DCCs zikora ubu"
      },
      applications: {
        title: "Ubusabe",
        description: "Ubusabe butegereje gusuzumwa"
      },
      totalOrders: {
        title: "Igiteranyo cy'Ibicuruzwa Byagurishijwe",
        description: "Ibicuruzwa byagurishijwe kuri DCCs zose"
      }
    },
    analytics: {
      title: "Incamake y'Imibare Ngenderwaho",
      subtitle: "Imibare y'ingenzi n'ibipimo by'imikorere",
      marketplace: {
        title: "Imibare y'Isoko",
        description: "Ibipimo by'imikorere y'isoko",
        metrics: {
          sales: "Igiteranyo cy'Ibyagurishijwe",
          revenue: "Amafaranga Yinjiye",
          products: "Ibicuruzwa Bikora"
        }
      },
      applications: {
        title: "Imibare y'Ubusabe",
        description: "Incamake y'ubusabe bwa DCC",
        metrics: {
          total: "Ubusabe Bwose",
          pending: "Butegereje Gusuzumwa",
          approved: "Bwemewe"
        }
      },
      dccManagement: {
        title: "Imicungire ya DCC",
        description: "Ibipimo by'imikorere ya DCC",
        metrics: {
          active: "DCCs Zikora",
          inactive: "DCCs Zitakora",
          performance: "Impuzandengo y'Imikorere"
        }
      }
    },
    interactiveData: {
      title: "Imibare Ishobora Guhindurwa",
      subtitle: "Reba imibare irambuye",
      filters: {
        timeRange: "Igihe",
        category: "Icyiciro",
        status: "Imimerere"
      },
      charts: {
        sales: "Uko Ibyagurishijwe Byagiye Bihinduka",
        revenue: "Isesengura ry'Amafaranga Yinjiye",
        applications: "Imimerere y'Ubusabe",
        performance: "Imikorere ya DCC"
      }
    },
    dcc: {
      code: {
        title: "Kode ya DCC",
        subtitle: "Ikiranga cyawe kidasanzwe",
        share: "Gusangiza abakiriya"
      },
      application: {
        title: "Imimerere y'Ubusabe",
        status: "Burimo Gusuzumwa",
        viewDetails: "Reba birambuye"
      },
      earnings: {
        title: "Igiteranyo cy'Amafaranga",
        total: "RWF {amount}"
      },
      products: {
        title: "Ibicuruzwa Byagurishijwe",
        subtitle: "Imikorere y'ibicuruzwa byawe",
        total: "{count}",
        sales: "{count} units sold",
        stock: "{count} in stock"
      },
      capital: {
        title: "Imari Shingiro",
        total: "RWF {amount}",
        viewBreakdown: "Kanda urebe ibisobanuro birambuye"
      },
      highlights: {
        title: "Ibyagezweho uyu Munsi",
        subtitle: "Ibyagezweho n'amakuru mashya",
        updates: {
          title: "Amakuru Mashya",
          subtitle: "Ibishya by'uyu munsi",
          items: {
            products: "Ibicuruzwa bishya by'ubuzima bihari",
            training: "Amahugurwa saa 8:00",
            inquiries: "Ibibazo 3 bishya by'abakiriya"
          },
          cta: "Reba Amakuru Yose"
        },
        rankings: {
          title: "Aho Ugeze",
          subtitle: "Ibipimo by'imikorere",
          metrics: {
            sales: {
              label: "Urwego rw'Ibyagurishijwe",
              value: "#{rank} kuri {total}"
            },
            rating: {
              label: "Uko Abakiriya Babibona",
              value: "{rating}/5.0"
            },
            response: {
              label: "Igihe cyo Gusubiza",
              value: "{percent}%"
            }
          },
          cta: {
            text: "Reba uko uhagaze ugereranyije n'abandi!",
            button: "Reba Inzego Zose"
          }
        },
        sales: {
          title: "Andika Ibyagurishijwe",
          subtitle: "Bona ibihembo mu kwandika ibyagurishijwe",
          benefits: {
            points: "Bona amanota kuri buri cyagurishijwe cyanditswe",
            levels: "Zamuka mu nzego za DCC",
            priority: "Bona ibicuruzwa bishya mbere y'abandi"
          },
          cta: {
            record: "Andika Ibyagurishijwe",
            rewards: "Reba Gahunda y'Ibihembo"
          }
        }
      },
      overview: {
        title: "Incamake",
        subtitle: "Imikorere yawe y'uku kwezi",
        timeframe: "Uku Kwezi"
      }
    }
  }
} as const 