export type BusinessCategory =
  | "Retail Shop / Store"
  | "Supermarket Chain"
  | "Grocery & Provision"
  | "F&B / Restaurant"
  | "Apparel & Clothing"
  | "Electronics & Hardware"
  | "Pharmacy & Healthcare"
  | "Wholesale & Distribution"
  | "Other Enterprise";

export interface IndustryKpi {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trend: string;
  trendPositive: boolean;
  color: string;
}

export interface IndustryAiRec {
  id: string;
  title: string;
  description: string;
  actionText: string;
  impact: string;
  badge: string;
}

export interface IndustryShortcut {
  label: string;
  path: string;
  iconName: string;
  desc: string;
}

export interface IndustryConfig {
  category: BusinessCategory;
  badgeTitle: string;
  badgeColor: string;
  tagline: string;
  kpis: IndustryKpi[];
  aiRecommendations: IndustryAiRec[];
  shortcuts: IndustryShortcut[];
  realtimeAnomaly: {
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  };
}

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  "F&B / Restaurant": {
    category: "F&B / Restaurant",
    badgeTitle: "F&B & Restaurant OS",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    tagline: "Live Kitchen KOT Telemetry, Recipe Food Cost & Perishable Spoilage Guard",
    kpis: [
      {
        id: "table_turnover",
        label: "Table Turnover Rate",
        value: "4.6x / day",
        subtext: "Avg seating duration: 38 mins",
        trend: "+14.2% vs last week",
        trendPositive: true,
        color: "text-amber-400",
      },
      {
        id: "kot_time",
        label: "Kitchen KOT Prep Time",
        value: "12.4 mins",
        subtext: "98% orders within 15 min SLA",
        trend: "-2.1 min faster",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "food_cost",
        label: "Food Cost % (COGS)",
        value: "27.8%",
        subtext: "Optimal benchmark: <30%",
        trend: "-1.4% cost savings",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "order_mix",
        label: "Dine-In vs Delivery",
        value: "62% / 38%",
        subtext: "Swiggy/Zomato delivery mix",
        trend: "+8% delivery volume",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "fb_rec_1",
        title: "Perishable Dairy & Produce Dynamic Markdown",
        description: "Fresh cream & paneer inventory expiring in 24h. Auto-trigger 25% discount on dessert combos to avoid food waste.",
        actionText: "Apply Combo Special",
        impact: "Save ₹4,800 loss",
        badge: "Zero-Waste AI",
      },
      {
        id: "fb_rec_2",
        title: "Weekend Dinner Rush Prep Auto-Order",
        description: "Predicted +35% footfall this Saturday evening. Auto-draft restock PO for poultry, mozzarella, and beverage kegs.",
        actionText: "Approve Vendor PO",
        impact: "+₹22,000 revenue cap",
        badge: "Predictive Restock",
      },
      {
        id: "fb_rec_3",
        title: "Slow-Moving Menu Item Pricing Optimization",
        description: "Truffle Pasta order velocity dropped 18%. Recommend bundle pairing with bestselling mocktails to boost margins.",
        actionText: "Bundle Item",
        impact: "+4.2% margin",
        badge: "Menu Engineering",
      },
    ],
    shortcuts: [
      { label: "Kitchen KOT View", path: "/billing", iconName: "ChefHat", desc: "Live kitchen tickets" },
      { label: "Recipe Costing", path: "/products", iconName: "Utensils", desc: "Ingredient yield & margins" },
      { label: "Food Spoilage Radar", path: "/expiry", iconName: "AlertTriangle", desc: "Perishable stock health" },
      { label: "Delivery Orders", path: "/sales", iconName: "Truck", desc: "Online vs offline orders" },
    ],
    realtimeAnomaly: {
      title: "Cooking Oil Discrepancy Flagged",
      description: "Fryer station oil consumption exceeded expected batch recipe variance by 18.4% today.",
      severity: "HIGH",
    },
  },

  "Pharmacy & Healthcare": {
    category: "Pharmacy & Healthcare",
    badgeTitle: "Pharmacy & Healthcare OS",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    tagline: "FEFO Batch Expiry Radar, Schedule-H Rx Audit & Cold-Chain Compliance",
    kpis: [
      {
        id: "fefo_health",
        label: "FEFO Batch Health",
        value: "99.2%",
        subtext: "First-Expiry-First-Out active",
        trend: "0 expired sales",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "schedule_h",
        label: "Schedule-H Rx Audit",
        value: "100%",
        subtext: "Prescription attached & logged",
        trend: "Fully compliant",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "fridge_temp",
        label: "Cold-Chain Vaccine Temp",
        value: "3.8 °C",
        subtext: "Safe zone: 2.0°C to 8.0°C",
        trend: "Optimal sensor lock",
        trendPositive: true,
        color: "text-cyan-400",
      },
      {
        id: "critical_stock",
        label: "Critical Drug Availability",
        value: "99.8%",
        subtext: "Essential life-saving formulary",
        trend: "Zero stockouts",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "rx_rec_1",
        title: "90-Day Stockist Return for Near-Expiry Antibiotics",
        description: "Amoxicillin Batch #AM-884 expires in 75 days. Auto-generate debit note and dispatch to distributor for 100% credit note refund.",
        actionText: "Issue Stockist Return",
        impact: "Recover ₹14,200",
        badge: "FEFO Protection",
      },
      {
        id: "rx_rec_2",
        title: "Seasonal Monsoon Antiviral Demand Spike",
        description: "Regional fever index increased by 28%. AI forecasts +40% surge in Paracetamol, Cough Syrups, and ORS over next 14 days.",
        actionText: "Auto-Restock Stockist",
        impact: "Prevent stockout",
        badge: "Epidemic Forecasting",
      },
      {
        id: "rx_rec_3",
        title: "Chronic Refill WhatsApp Reminders",
        description: "42 diabetic & hypertensive patients due for monthly medicine refills this week. Dispatch automated WhatsApp refill alerts.",
        actionText: "Send Refill Alerts",
        impact: "+₹18,500 recurring sales",
        badge: "Patient Retention",
      },
    ],
    shortcuts: [
      { label: "Batch Expiry Tracker", path: "/expiry", iconName: "CalendarClock", desc: "FEFO batch matrix" },
      { label: "Schedule-H Rx Log", path: "/billing", iconName: "FileCheck", desc: "Doctor prescription records" },
      { label: "Stockist Debit Notes", path: "/suppliers", iconName: "Receipt", desc: "Near-expiry vendor claims" },
      { label: "Cold-Chain Sensor", path: "/utilities", iconName: "Thermometer", desc: "Vaccine storage logs" },
    ],
    realtimeAnomaly: {
      title: "Batch Near-Expiry Lock Triggered",
      description: "Batch #CT-209 locked from POS billing due to <30 day shelf-life threshold. Stockist return generated.",
      severity: "MEDIUM",
    },
  },

  "Grocery & Provision": {
    category: "Grocery & Provision",
    badgeTitle: "Supermarket & Grocery OS",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/30",
    tagline: "Shrinkage Control, Dynamic FMCG Markdown & High-Speed Barcode Billing",
    kpis: [
      {
        id: "shrinkage",
        label: "Inventory Shrinkage %",
        value: "1.4%",
        subtext: "Benchmark: <2.5% loss",
        trend: "-0.8% reduction",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "basket_size",
        label: "Average Basket Value",
        value: "₹920",
        subtext: "7.8 items / checkout cart",
        trend: "+11.4% vs last month",
        trendPositive: true,
        color: "text-amber-400",
      },
      {
        id: "fmcg_velocity",
        label: "Fast-Moving FMCG Rate",
        value: "186 units / hr",
        subtext: "Peak evening footfall volume",
        trend: "+18% velocity",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "markdown_recovery",
        label: "Dynamic Markdown Sell-Through",
        value: "89.4%",
        subtext: "Bakery & dairy revenue recovered",
        trend: "₹18,400 saved",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "groc_rec_1",
        title: "Evening Dairy & Bakery Dynamic 30% Markdown",
        description: "Fresh bread and milk crates reach day-2 freshness at 7 PM. Auto-apply 30% dynamic discount on POS to achieve 100% sell-through.",
        actionText: "Activate 7 PM Sale",
        impact: "Zero dump loss",
        badge: "Dynamic Markdown",
      },
      {
        id: "groc_rec_2",
        title: "Festive Oil & Sugar Fast-Moving Bulk Restock",
        description: "Cooking oil and basmati rice safety stock buffer down to 2.5 days. AI generated composite PO to regional wholesale hub.",
        actionText: "Send Bulk PO",
        impact: "Save 6% bulk margin",
        badge: "Smart Restock",
      },
      {
        id: "groc_rec_3",
        title: "High-Margin Impulse Shelf Arrangement",
        description: "Place chocolates and dry fruits at billing counter aisles to lift impulse purchase conversion by 22%.",
        actionText: "View Planogram",
        impact: "+₹8,200 / week",
        badge: "Visual Merchandising",
      },
    ],
    shortcuts: [
      { label: "Rapid POS Checkout", path: "/billing", iconName: "Barcode", desc: "High-speed barcode scanner" },
      { label: "Dairy & Produce Expiry", path: "/expiry", iconName: "Clock", desc: "Daily expiry management" },
      { label: "Wholesale Supplier POs", path: "/purchase-orders", iconName: "Truck", desc: "Direct manufacturer orders" },
      { label: "Customer Loyalty", path: "/customers", iconName: "HeartHandshake", desc: "Grocery reward points" },
    ],
    realtimeAnomaly: {
      title: "Atta & Edible Oil Price Spike Alert",
      description: "Wholesale mandi rate surged 4.2% overnight. AI adjusted retail MRP to preserve 16% gross margin.",
      severity: "MEDIUM",
    },
  },

  "Supermarket Chain": {
    category: "Supermarket Chain",
    badgeTitle: "Supermarket Chain OS",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/30",
    tagline: "Multi-Aisle Telemetry, FMCG Sell-Through & Centralized Warehouse Restock",
    kpis: [
      {
        id: "shrinkage",
        label: "Inventory Shrinkage %",
        value: "1.2%",
        subtext: "Benchmark: <2.0% loss",
        trend: "-0.6% reduction",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "basket_size",
        label: "Average Basket Value",
        value: "₹1,180",
        subtext: "9.4 items / checkout cart",
        trend: "+14.2% vs last month",
        trendPositive: true,
        color: "text-amber-400",
      },
      {
        id: "fmcg_velocity",
        label: "Aisle Scan Throughput",
        value: "210 units / hr",
        subtext: "Peak weekend volume",
        trend: "+22% velocity",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "markdown_recovery",
        label: "Produce Markdown Conversion",
        value: "91.2%",
        subtext: "Perishable revenue captured",
        trend: "₹24,000 saved",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "sm_rec_1",
        title: "Perishables Dynamic Markdown Strategy",
        description: "Fresh bakery and dairy reach threshold at 7 PM. Auto-trigger 30% dynamic discount on POS.",
        actionText: "Activate Markdown",
        impact: "Zero dump loss",
        badge: "Zero-Waste AI",
      },
      {
        id: "sm_rec_2",
        title: "Central Warehouse Cross-Docking Restock",
        description: "Top 20 FMCG SKUs depleted to 3-day buffer. Dispatched automated replenishment order.",
        actionText: "Approve Replenishment",
        impact: "+₹45,000 revenue cap",
        badge: "Smart Restock",
      },
      {
        id: "sm_rec_3",
        title: "Aisle Endcap Promotional Placement",
        description: "Reposition high-margin breakfast cereals to aisle endcaps to lift sales velocity by 18%.",
        actionText: "Apply Placement",
        impact: "+₹14,000 / week",
        badge: "Merchandising",
      },
    ],
    shortcuts: [
      { label: "Fast POS Barcode", path: "/billing", iconName: "Barcode", desc: "Multi-counter checkout" },
      { label: "Produce Expiry Radar", path: "/expiry", iconName: "Clock", desc: "Daily expiry management" },
      { label: "Warehouse Restock", path: "/purchase-orders", iconName: "Truck", desc: "Direct depot replenishment" },
      { label: "Shopper Loyalty Club", path: "/customers", iconName: "HeartHandshake", desc: "Digital points & coupons" },
    ],
    realtimeAnomaly: {
      title: "Produce Temperature Deviation Flagged",
      description: "Chiller Bay 3 temperature reached 8.4°C. Maintenance alert dispatched to store technician.",
      severity: "HIGH",
    },
  },

  "Apparel & Clothing": {
    category: "Apparel & Clothing",
    badgeTitle: "Fashion & Apparel OS",
    badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30",
    tagline: "Size/Color Matrix Velocity, Deadstock Liquidation & Fitting Room Conversion",
    kpis: [
      {
        id: "deadstock_idx",
        label: "Deadstock Index (>60d)",
        value: "2.8%",
        subtext: "Fast-clearing seasonal lines",
        trend: "-4.5% deadstock",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "fitting_conversion",
        label: "Trial-to-Buy Conversion",
        value: "71.2%",
        subtext: "Fitting room try-on success",
        trend: "+6.8% conversion",
        trendPositive: true,
        color: "text-pink-400",
      },
      {
        id: "return_rate",
        label: "Return / Exchange Rate",
        value: "1.9%",
        subtext: "Industry standard: 4.5%",
        trend: "Extremely low returns",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "sell_through",
        label: "Seasonal Sell-Through Rate",
        value: "92.4%",
        subtext: "Summer collection clearance",
        trend: "+8.5% faster turnover",
        trendPositive: true,
        color: "text-amber-400",
      },
    ],
    aiRecommendations: [
      {
        id: "app_rec_1",
        title: "End-of-Season Size Variant Bundle Clearance",
        description: "Denim Jeans Size 30 & 38 have 45 units remaining. Launch 'Buy 2 Get 1' bundle promotion to liquidate inventory before new season arrival.",
        actionText: "Launch Bundle Offer",
        impact: "Liquidate ₹42,000 stock",
        badge: "Deadstock AI",
      },
      {
        id: "app_rec_2",
        title: "Fast-Moving Medium/Large Tees Restock",
        description: "Graphic Tee Black (Size M & L) sales velocity +60% over weekend. Auto-dispatch urgent re-order to garment manufacturer.",
        actionText: "Re-order Sizes M & L",
        impact: "Prevent ₹18,000 lost sales",
        badge: "Size Demand Radar",
      },
      {
        id: "app_rec_3",
        title: "Festive Ethnic Wear Cross-Sell",
        description: "Customer purchasing Kurta sets convert 44% higher when paired with matching dupattas and mojaris. Auto-prompt cashier.",
        actionText: "Enable POS Cross-Sell",
        impact: "+18% basket size",
        badge: "Smart Cross-Sell",
      },
    ],
    shortcuts: [
      { label: "Size & Color Matrix", path: "/products", iconName: "Grid", desc: "SKU variant inventory" },
      { label: "Clearance Sales", path: "/billing", iconName: "Tag", desc: "Dynamic bundle promotions" },
      { label: "Garment Vendors", path: "/suppliers", iconName: "Layers", desc: "Fabric & mill suppliers" },
      { label: "VIP Fashion Club", path: "/customers", iconName: "Crown", desc: "High-value shopper tiers" },
    ],
    realtimeAnomaly: {
      title: "Unsold Seasonal Line Accumulation",
      description: "Seasonal winter wear velocity dropped 85%. Transition clearance campaign recommended.",
      severity: "LOW",
    },
  },

  "Electronics & Hardware": {
    category: "Electronics & Hardware",
    badgeTitle: "Electronics & Tech OS",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    tagline: "Serial / IMEI Tracking, Extended Warranty Attach & Brand Distributor Rebates",
    kpis: [
      {
        id: "imei_tracked",
        label: "Serial/IMEI Tracked Units",
        value: "100%",
        subtext: "284 active serialized units",
        trend: "Zero serial mismatch",
        trendPositive: true,
        color: "text-cyan-400",
      },
      {
        id: "high_ticket_margin",
        label: "Gross Product Margin",
        value: "26.4%",
        subtext: "Weighted hardware + accessory mix",
        trend: "+3.8% margin lift",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "emi_rate",
        label: "EMI / Finance Conversion",
        value: "46.2%",
        subtext: "Bajaj / HDFC / Pine Labs EMI",
        trend: "+12% high-ticket sales",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "vendor_rebate",
        label: "Distributor Rebate Target",
        value: "₹64,200",
        subtext: "Quarterly volume tier unlocked",
        trend: "94% target completed",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "elec_rec_1",
        title: "High-Margin Accessory Attach at Checkout",
        description: "Smartphone buyers without Tempered Glass or 65W Fast Charger represent ₹800 missed gross margin per sale. Auto-prompt cashier.",
        actionText: "Enable 1-Click Attach",
        impact: "+₹28,000 monthly profit",
        badge: "Margin Optimizer",
      },
      {
        id: "elec_rec_2",
        title: "Quarterly Target Push for 3% Brand Cashback",
        description: "Only 12 laptop units needed in next 6 days to unlock ₹50,000 brand distributor tier rebate. Run flash corporate offer.",
        actionText: "Launch Laptop Push",
        impact: "Unlock ₹50,000 rebate",
        badge: "Rebate Hunter",
      },
      {
        id: "elec_rec_3",
        title: "Aging Flagship Model Price Protection Claim",
        description: "Brand announced price cut on Model Pro 5G. Auto-file price protection claim for 8 units in store stock with distributor.",
        actionText: "File Protection Claim",
        impact: "Recover ₹16,000 refund",
        badge: "Price Protection",
      },
    ],
    shortcuts: [
      { label: "IMEI / Serial Lookup", path: "/products", iconName: "Cpu", desc: "Warranty & serial validator" },
      { label: "EMI & Split Billing", path: "/billing", iconName: "CreditCard", desc: "Finance & down payments" },
      { label: "Distributor Rebates", path: "/suppliers", iconName: "Award", desc: "Brand quarterly targets" },
      { label: "Service & Repairs", path: "/sales", iconName: "Wrench", desc: "Customer warranty claims" },
    ],
    realtimeAnomaly: {
      title: "Accessory Attach Ratio Drop",
      description: "Counter 2 accessory attach rate dropped to 14% (Store average: 48%). Staff coaching alert generated.",
      severity: "LOW",
    },
  },

  "Wholesale & Distribution": {
    category: "Wholesale & Distribution",
    badgeTitle: "Wholesale & B2B Distribution OS",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    tagline: "B2B Trade Credit Ledger, Fleet Logistics On-Time & Bulk MOQ Fulfillment",
    kpis: [
      {
        id: "dso_days",
        label: "B2B Credit DSO",
        value: "19.4 Days",
        subtext: "Target credit term: <30 days",
        trend: "-4.2 days faster collection",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "bulk_moq",
        label: "Pallet MOQ Fill Rate",
        value: "98.4%",
        subtext: "Full truckload dispatch rate",
        trend: "Zero split backorders",
        trendPositive: true,
        color: "text-indigo-400",
      },
      {
        id: "fleet_otif",
        label: "Fleet On-Time Delivery (OTIF)",
        value: "97.2%",
        subtext: "16 delivery vans on live routes",
        trend: "+2.4% on-time rating",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "volume_margin",
        label: "Net B2B Trading Margin",
        value: "14.8%",
        subtext: "High-volume tier-1 distribution",
        trend: "+1.2% net yield",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "ws_rec_1",
        title: "Automated Credit Hold for 45+ Day Overdue Retailers",
        description: "Retailer #R-104 exceeded ₹2.5L credit limit by 18 days. Auto-pause new dispatches until 50% outstanding cleared via UPI.",
        actionText: "Apply Credit Lock",
        impact: "Protect ₹2,50,000 cash",
        badge: "Credit Risk AI",
      },
      {
        id: "ws_rec_2",
        title: "Fleet Route Clustering for 14% Diesel Cost Cut",
        description: "Combine North Zone retail deliveries into 2 high-capacity EV vans. Reduce daily delivery transit time by 1.8 hours.",
        actionText: "Optimize Fleet Route",
        impact: "Save ₹12,400 diesel/mo",
        badge: "Logistics Engine",
      },
      {
        id: "ws_rec_3",
        title: "Bulk Volume Tier-2 Discount Trigger",
        description: "5 Supermarket accounts close to 500-crate monthly tier. Dispatch automated bulk pricing quotation to secure contract renewal.",
        actionText: "Send Bulk Quotations",
        impact: "+₹4,80,000 contract value",
        badge: "B2B Deal Closer",
      },
    ],
    shortcuts: [
      { label: "B2B Credit Ledger", path: "/accounts", iconName: "BookOpen", desc: "Retailer credit & aging DSO" },
      { label: "Fleet Logistics GPS", path: "/logistics", iconName: "Navigation", desc: "Live van route tracking" },
      { label: "Bulk Order Invoicing", path: "/billing", iconName: "FileSpreadsheet", desc: "GST e-Way bills & bulk POs" },
      { label: "Manufacturer Hub", path: "/suppliers", iconName: "Factory", desc: "Factory direct procurement" },
    ],
    realtimeAnomaly: {
      title: "Delayed Delivery Dispatch Flagged",
      description: "Route #4 van delayed by 45 mins due to city traffic. AI rerouted 4 drop-offs to prevent SLA breach.",
      severity: "MEDIUM",
    },
  },

  "Retail Shop / Store": {
    category: "Retail Shop / Store",
    badgeTitle: "Omni-Channel Retail OS",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    tagline: "Unified Multi-Store Telemetry, AI Markdown Pricing & Real-Time Cash Flow",
    kpis: [
      {
        id: "gross_margin",
        label: "Net Operating Margin",
        value: "31.4%",
        subtext: "Blended product margin",
        trend: "+4.1% vs last month",
        trendPositive: true,
        color: "text-amber-400",
      },
      {
        id: "turnover_rate",
        label: "Inventory Turnover",
        value: "6.2x / yr",
        subtext: "Healthy capital velocity",
        trend: "+0.8x faster turnover",
        trendPositive: true,
        color: "text-emerald-400",
      },
      {
        id: "customer_retention",
        label: "Repeat Customer Rate",
        value: "54.8%",
        subtext: "Verified loyalty shoppers",
        trend: "+8.2% retention",
        trendPositive: true,
        color: "text-blue-400",
      },
      {
        id: "cash_conversion",
        label: "Cash Conversion Cycle",
        value: "14 Days",
        subtext: "Fastest in retail tier",
        trend: "-3 days cash velocity",
        trendPositive: true,
        color: "text-purple-400",
      },
    ],
    aiRecommendations: [
      {
        id: "ret_rec_1",
        title: "Slow-Moving Batch Dynamic Price Markdown",
        description: "Items in Home & Kitchen department have >45 days aging. Auto-apply 18% dynamic discount to release trapped working capital.",
        actionText: "Apply 18% Markdown",
        impact: "Release ₹38,000 cash",
        badge: "Capital Velocity",
      },
      {
        id: "ret_rec_2",
        title: "Restock Fast-Moving Essentials Before Weekend",
        description: "Bestseller items predicted to stock out by Friday evening. AI generated automated PO to prime suppliers.",
        actionText: "Send Restock PO",
        impact: "+₹24,500 revenue",
        badge: "Predictive Restock",
      },
      {
        id: "ret_rec_3",
        title: "WhatsApp Loyalty Points Expiry Notification",
        description: "68 loyalty members have points expiring in 7 days. Dispatch WhatsApp reminder to drive immediate store visits.",
        actionText: "Dispatch WhatsApp Campaign",
        impact: "+35 store visits",
        badge: "Loyalty Booster",
      },
    ],
    shortcuts: [
      { label: "POS Billing Desk", path: "/billing", iconName: "Receipt", desc: "Fast multi-mode checkout" },
      { label: "Stock & Inventory", path: "/products", iconName: "Package", desc: "Catalog & shelf counts" },
      { label: "AI Decisions Suite", path: "/ai-decisions", iconName: "Sparkles", desc: "Autonomous profit engine" },
      { label: "Financial Ledger", path: "/accounts", iconName: "DollarSign", desc: "Double-entry P&L sheets" },
    ],
    realtimeAnomaly: {
      title: "Footfall-to-Billing Discrepancy",
      description: "Footfall increased 24% at 4 PM, but checkout volume remained flat. Possible billing counter congestion.",
      severity: "HIGH",
    },
  },
};

export function getIndustryConfig(businessType?: string | null, companyName?: string | null): IndustryConfig {
  const clean = (businessType || "").trim();
  if (INDUSTRY_CONFIGS[clean]) {
    return INDUSTRY_CONFIGS[clean];
  }

  // Smart keyword matcher
  const name = (companyName || "").toLowerCase() + " " + clean.toLowerCase();
  if (name.includes("restaurant") || name.includes("cafe") || name.includes("food") || name.includes("dine") || name.includes("kitchen") || name.includes("f&b")) {
    return INDUSTRY_CONFIGS["F&B / Restaurant"];
  }
  if (name.includes("pharmacy") || name.includes("chemist") || name.includes("med") || name.includes("health") || name.includes("drug") || name.includes("pharma")) {
    return INDUSTRY_CONFIGS["Pharmacy & Healthcare"];
  }
  if (name.includes("supermarket") || name.includes("chain")) {
    return INDUSTRY_CONFIGS["Supermarket Chain"];
  }
  if (name.includes("grocery") || name.includes("mart") || name.includes("provision") || name.includes("kirana")) {
    return INDUSTRY_CONFIGS["Grocery & Provision"];
  }
  if (name.includes("cloth") || name.includes("apparel") || name.includes("fashion") || name.includes("wear") || name.includes("boutique") || name.includes("garment")) {
    return INDUSTRY_CONFIGS["Apparel & Clothing"];
  }
  if (name.includes("electric") || name.includes("hardware") || name.includes("tech") || name.includes("mobile") || name.includes("gadget") || name.includes("computer")) {
    return INDUSTRY_CONFIGS["Electronics & Hardware"];
  }
  if (name.includes("wholesale") || name.includes("distribut") || name.includes("bulk") || name.includes("logistics") || name.includes("supply")) {
    return INDUSTRY_CONFIGS["Wholesale & Distribution"];
  }

  return INDUSTRY_CONFIGS["Retail Shop / Store"];
}
