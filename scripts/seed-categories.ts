import { db } from "../src/lib/db";

const categories = [
  {
    name: "Khakhra",
    slug: "khakhra",
    description:
      "Khakhra is a thin, crispy flatbread originating from Gujarat, India. Made from whole wheat flour, oil, and spices, it is rolled paper-thin and slow-roasted until brittle — a healthy, crunchy snack enjoyed across India.",
    image:
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600",
    sortOrder: 1,
    isActive: true,
    heroTitle: "The Crunch That Wins Every Bite",
    heroSubtitle: "Hand-rolled · Slow-roasted · 100% Natural",
    heroDescription:
      "Our khakhra is crafted the traditional Gujarati way — thin, crisp, and full of flavour. Made from premium whole wheat and finished with a touch of ghee, it's the snack you can feel good about.",
    contentSplitImage:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600",
    contentSplitHeading: "Rolled Thin. Roasted to Perfection.",
    contentSplitParagraph:
      "Each khakhra is hand-rolled to paper-thinness and slow-roasted on a hot tawa. No oil, no preservatives — just the pure, earthy taste of roasted wheat with a hint of jeera and black pepper.",
    contentSplitBullets: JSON.stringify([
      "Made with 100% whole wheat flour",
      "Zero preservatives & no transfat",
      "Slow-roasted for max crunch",
      "Available in 12+ flavours",
      "Shelf-stable for 6 months",
    ]),
    cardsTitle: "Our Khakhra Range",
    cardsMaxCount: 8,
    cardsColumns: 4,
    cardsProductIds: "[]",
    ctaHeading: "Looking to Stock Khakhra in Bulk?",
    ctaDescription:
      "We supply khakhra to retailers, distributors, and cafes across India and overseas. Get wholesale pricing, private labelling, and custom packaging.",
    ctaBulkText: "Enquire for Bulk Order →",
    ctaBulkLink: "/contact-us",
    ctaPrivateLabelText: "Private Label Options",
    ctaPrivateLabelLink: "/contact-us",
    ctaBackgroundColor: "dark",
    processTitle: "From Our Kitchen to Your Shelf",
    processSubtitle: "Every batch follows a time-honoured 4-step process",
    processSteps: JSON.stringify([
      {
        title: "Dough Preparation",
        description:
          "Whole wheat flour, salt, carom seeds, and a dash of oil are kneaded into a stiff dough and rested for 20 minutes.",
      },
      {
        title: "Hand Rolling",
        description:
          "Small dough balls are rolled into ultra-thin rounds using a traditional belan — each piece is checked for uniform thickness.",
      },
      {
        title: "Slow Roasting",
        description:
          "Khakhras are roasted on a cast-iron tawa over low flame, pressed gently to achieve that signature golden-brown crispness.",
      },
      {
        title: "Cooling & Packing",
        description:
          "Fresh khakhras are cooled in a dehumidified room, quality-checked, and packed immediately in moisture-proof pouches.",
      },
    ]),
    infographicImage:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600",
    infographicCaption:
      "Traditional Gujarati khakhra — thin, crisp, and healthy.",
    infographicAltText: "Stack of crispy khakhra flatbreads",
  },
  {
    name: "Makhana",
    slug: "makhana",
    description:
      "Makhana (fox nuts / Euryale ferox) is a highly nutritious seed harvested from lotus ponds across Bihar and Uttar Pradesh. Light, crunchy, and packed with protein, it is a premium snack and superfood ingredient.",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    sortOrder: 2,
    isActive: true,
    heroTitle: "India's Ancient Superfood, Roasted to Order",
    heroSubtitle: "Hand-harvested · High Protein · Zero Cholesterol",
    heroDescription:
      "Our makhana is sourced directly from the Mithila region of Bihar, where every seed is hand-picked from lotus ponds, roasted over a slow fire, and graded for size and whiteness.",
    contentSplitImage:
      "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600",
    contentSplitHeading: "From Lotus Pond to Premium Pack",
    contentSplitParagraph:
      "Each makhana seed is dried, roasted in controlled temperatures, and sorted by size. We supply both raw (unroasted) and roasted variants, in plain, salted, masala, and peri-peri flavours — ideal for retail, HORECA, and ingredient buyers.",
    contentSplitBullets: JSON.stringify([
      "Protein-rich (12-15g per 100g)",
      "Contains zero cholesterol",
      "Gluten-free & keto-friendly",
      "Sourced from certified Bihar farms",
      "Available in bulk (25 kg sacks) & retail packs",
    ]),
    cardsTitle: "Shop Makhana by Variant",
    cardsMaxCount: 8,
    cardsColumns: 4,
    cardsProductIds: "[]",
    ctaHeading: "Bulk Makhana Supply? We're India's Largest Exporter.",
    ctaDescription:
      "We ship makhana in bulk to buyers across USA, Canada, UK, Australia, Middle East, and Southeast Asia. HACCP-compliant facility, export documentation, and door-to-door logistics.",
    ctaBulkText: "Get Bulk Quote →",
    ctaBulkLink: "/contact-us",
    ctaPrivateLabelText: "Private Labelling Available",
    ctaPrivateLabelLink: "/contact-us",
    ctaBackgroundColor: "dark",
    processTitle: "The Makhana Journey",
    processSubtitle: "From harvest to export, every step matters",
    processSteps: JSON.stringify([
      {
        title: "Hand Harvesting",
        description:
          "Seeds are hand-collected from wild lotus ponds in Darbhanga and Madhubani districts during the winter harvest (October–January).",
      },
      {
        title: "Sun Drying & Tempering",
        description:
          "Raw seeds are sun-dried for 2–3 days, then tempered in clay pots to loosen the outer shell.",
      },
      {
        title: "Roasting & Popping",
        description:
          "Tempered seeds are roasted in a rotating drum over a controlled flame. The kernels puff up into white, airy pops.",
      },
      {
        title: "Grading & Packing",
        description:
          "Popped makhana is graded by size (A, B, C), colour-sorted, and packed in food-grade liners inside export-ready cartons.",
      },
    ]),
    infographicImage:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    infographicCaption:
      "Premium-grade popped makhana ready for export packaging.",
    infographicAltText: "Bowl of popped white makhana seeds",
  },
  {
    name: "Papad",
    slug: "papad",
    description:
      "Papad is a thin, crispy disc-shaped savoury traditionally made from black gram (urad dal) flour, rice flour, or potato starch, seasoned with spices and sun-dried. A staple across Indian meals.",
    image:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    sortOrder: 3,
    isActive: true,
    heroTitle: "Papad That Pops — Made the Village Way",
    heroSubtitle: "Sun-dried · Stone-ground · Authentic",
    heroDescription:
      "Our papad is still made the traditional way — stone-ground lentils kneaded with chilli, black pepper, and asafoetida, rolled by hand, and sun-dried on bamboo mats.",
    contentSplitImage:
      "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600",
    contentSplitHeading: "Generations of Expertise in Every Disc",
    contentSplitParagraph:
      "Each papad is rolled to a consistent 6-inch diameter, sun-dried for 12 hours, and checked for brittleness by hand. We produce urad, moong, masala, garlic, and sabudana papad — all fried or roasted to a golden crisp.",
    contentSplitBullets: JSON.stringify([
      "Made from stone-ground urad dal",
      "No artificial colours or preservatives",
      "Sun-dried naturally (never machine-dried)",
      "Available in 6 traditional flavours",
      "Bulk packs (5 kg, 10 kg, 25 kg)",
    ]),
    cardsTitle: "Explore Our Papad Range",
    cardsMaxCount: 8,
    cardsColumns: 4,
    cardsProductIds: "[]",
    ctaHeading: "Supply Papad to Indian Grocers Worldwide?",
    ctaDescription:
      "We are one of the largest papad manufacturers in Gujarat, supplying to Indian stores across USA, UK, Canada, Singapore, and UAE. FSSAI-licensed and export-ready.",
    ctaBulkText: "Bulk Enquiry →",
    ctaBulkLink: "/contact-us",
    ctaPrivateLabelText: "Custom Branding Options",
    ctaPrivateLabelLink: "/contact-us",
    ctaBackgroundColor: "dark",
    processTitle: "Papad Making — A 5-Step Tradition",
    processSubtitle: "From lentil to crisp, every step is artisanal",
    processSteps: JSON.stringify([
      {
        title: "Soaking & Grinding",
        description:
          "Black gram is soaked overnight, then stone-ground to a fine paste. Spices are added in exact proportions.",
      },
      {
        title: "Kneading & Resting",
        description:
          "The dough is kneaded thoroughly and rested for 2 hours to develop elasticity.",
      },
      {
        title: "Hand Rolling",
        description:
          "Portions are rolled into thin discs using a wooden board and pin — each piece is checked for roundness and thickness.",
      },
      {
        title: "Sun Drying",
        description:
          "Papads are set on bamboo mats under direct sun for 8–12 hours, depending on humidity.",
      },
      {
        title: "Packing & Dispatch",
        description:
          "Dried papads are stacked, inspected for cracks, and packed in airtight polybags or metal tins.",
      },
    ]),
    infographicImage:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    infographicCaption:
      "Traditional sun-dried papad — the quintessential Indian crunch.",
    infographicAltText: "Stacked round papads drying on a bamboo mat",
  },
  {
    name: "Spices",
    slug: "spices",
    description:
      "Premium-grade Indian spices sourced directly from spice-growing regions — turmeric from Erode, chilli from Guntur, cardamom from Idukki, and cumin from Unjha.",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    sortOrder: 4,
    isActive: true,
    heroTitle: "India's Finest Spices, Direct from the Farm",
    heroSubtitle: "Single-origin · Freshly ground · No fillers",
    heroDescription:
      "We source our spices from GI-tagged regions across India and process them in our ISO 22000-certified facility. Every batch is tested for purity, volatile oil content, and microbial safety.",
    contentSplitImage:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
    contentSplitHeading: "Traceability from Seed to Spice Rack",
    contentSplitParagraph:
      "We work directly with farmer cooperatives in Kerala, Andhra, Rajasthan, and Madhya Pradesh. Each spice is cleaned, sun-dried (or mechanically dried), ground in a chilled mill, and nitrogen-packed to lock in aroma.",
    contentSplitBullets: JSON.stringify([
      "Direct farm sourcing, no middlemen",
      "Tested for purity (no adulterants)",
      "Retains volatile oils for max aroma",
      "Available whole, ground, or blended",
      "Bulk (1 kg – 50 kg) and retail packs",
    ]),
    cardsTitle: "Our Spice Catalogue",
    cardsMaxCount: 8,
    cardsColumns: 4,
    cardsProductIds: "[]",
    ctaHeading: "Looking for a Reliable Spice Supplier?",
    ctaDescription:
      "We supply spices to manufacturers, restaurants, hotels, and retailers across 20+ countries. ASTA-certified, FSSAI-licensed, and ready for private labelling.",
    ctaBulkText: "Request Wholesale Price List →",
    ctaBulkLink: "/contact-us",
    ctaPrivateLabelText: "Private Label Spice Blends",
    ctaPrivateLabelLink: "/contact-us",
    ctaBackgroundColor: "dark",
    processTitle: "Farm-to-Facility Excellence",
    processSubtitle:
      "Our supply chain ensures purity from harvest to dispatch",
    processSteps: JSON.stringify([
      {
        title: "Farm Procurement",
        description:
          "Spices are sourced directly from GI-tagged regions — Erode turmeric, Guntur chillies, Alleppey ginger, and Unjha cumin.",
      },
      {
        title: "Cleaning & Grading",
        description:
          "Raw spices pass through gravity separators, magnetic separators, and colour sorters to remove impurities.",
      },
      {
        title: "Grinding & Blending",
        description:
          "Spices are ground in a chilled hammer mill (below 40°C) to preserve volatile oils. Blends are mixed in ribbon blenders per client specifications.",
      },
      {
        title: "Packaging & Export",
        description:
          "Finished spices are packed in multi-layer stand-up pouches with oxygen scavengers, or in HDPE bags for bulk orders, and shipped worldwide.",
      },
    ]),
    infographicImage:
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600",
    infographicCaption:
      "Premium Indian spices — vibrant colour, intense aroma, authentic flavour.",
    infographicAltText:
      "Assorted Indian spices in wooden bowls displaying vibrant colours",
  },
  {
    name: "Namkeen",
    slug: "namkeen",
    description:
      "Traditional Indian namkeen — crispy, spiced savoury snacks made from gram flour, rice, lentils, and nuts. From classic bhujia to modern fusion mixes, we have it all.",
    image:
      "https://images.unsplash.com/photo-1600959908209-7550a32d0ae0?w=600",
    sortOrder: 5,
    isActive: true,
    heroTitle: "Namkeen That Tastes Like Home",
    heroSubtitle: "Traditional recipes · Modern hygiene · Bulk supply",
    heroDescription:
      "Our namkeen range brings together generations-old family recipes from Rajasthan, Uttar Pradesh, and Gujarat — produced in a modern FSSAI-certified facility with uncompromising quality.",
    contentSplitImage:
      "https://images.unsplash.com/photo-1600959908209-7550a32d0ae0?w=600",
    contentSplitHeading: "Crunchy. Spiced. Irresistible.",
    contentSplitParagraph:
      "From the iconic Rajasthan bhujia to Lucknow's shakkarpara, each snack is made from fresh ingredients, fried in premium vegetable oil, and seasoned with a proprietary spice mix. Available in 40+ variants — in retail packs, family pouches, and bulk tins.",
    contentSplitBullets: JSON.stringify([
      "Made from fresh, never-reheated oil",
      "Hygienically packed in nitrogen-flushed pouches",
      "40+ regional varieties across India",
      "Available in 50g to 5 kg packs",
      "Private labelling for international grocers",
    ]),
    cardsTitle: "Browse Our Namkeen Collection",
    cardsMaxCount: 8,
    cardsColumns: 4,
    cardsProductIds: "[]",
    ctaHeading: "Stock Authentic Indian Namkeen in Your Store?",
    ctaDescription:
      "We export namkeen to Indian grocery stores in USA, Canada, UK, Australia, New Zealand, and the Middle East. MOQ from 10 kg with custom branding.",
    ctaBulkText: "Begin Partnership →",
    ctaBulkLink: "/contact-us",
    ctaPrivateLabelText: "Your Brand, Our Recipe",
    ctaPrivateLabelLink: "/contact-us",
    ctaBackgroundColor: "dark",
    processTitle: "From Family Kitchen to Global Pantry",
    processSubtitle:
      "We scaled up traditional recipes without cutting corners",
    processSteps: JSON.stringify([
      {
        title: "Ingredient Preparation",
        description:
          "Gram flour, rice flour, lentils, peanuts, and spices are measured, sifted, and mixed according to each snack's recipe.",
      },
      {
        title: "Dough Making & Shaping",
        description:
          "Each snack has its own dough and shaping method — bhujia is extruded through a press, sev is hand-piped, and mixture is tumble-coated.",
      },
      {
        title: "Deep Frying",
        description:
          "Shaped snacks are fried in temperature-controlled kettles using fresh palmolein oil. Oil is filtered and tested for FFA levels after every batch.",
      },
      {
        title: "Seasoning & Packing",
        description:
          "Freshly fried snacks are seasoned with spice powders, cooled on a stainless-steel conveyor, and immediately packed in nitrogen-flushed pouches to retain crunch.",
      },
    ]),
    infographicImage:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600",
    infographicCaption:
      "Colourful assortment of Indian namkeen — crunchy snacks for every palate.",
    infographicAltText:
      "Assorted Indian namkeen snacks in various shapes and colours in a platter",
  },
];

async function main() {
  console.log("Seeding product categories...");

  for (const cat of categories) {
    const existing = await db.category.findFirst({
      where: { slug: cat.slug },
    });

    if (existing) {
      console.log(`  Skipping "${cat.name}" (already exists)`);
      continue;
    }

    await db.category.create({ data: cat });
    console.log(`  Created "${cat.name}"`);
  }

  console.log("Done! 5 categories seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
