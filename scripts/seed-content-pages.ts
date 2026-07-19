import { db } from "../src/lib/db";

const STORE_SLUG = process.env.DEFAULT_STORE_SLUG || "biotic-naturals";

async function getStoreId(): Promise<string | null> {
  const store = await db.store.findFirst({ where: { slug: STORE_SLUG } });
  return store?.id || null;
}

async function upsertPage(storeId: string | null, slug: string, title: string, content: string, blocks: string, metaTitle: string, metaDescription: string, sortOrder: number) {
  const existing = await db.contentPage.findFirst({ where: { slug, storeId } });
  if (existing) {
    console.log(`  Updating "${title}" (${slug})...`);
    await db.contentPage.update({
      where: { id: existing.id },
      data: { title, content, blocks, metaTitle, metaDescription, isActive: true, sortOrder },
    });
  } else {
    console.log(`  Creating "${title}" (${slug})...`);
    await db.contentPage.create({
      data: { storeId, title, slug, content, blocks, metaTitle, metaDescription, isActive: true, sortOrder },
    });
  }
}

async function main() {
  const storeId = await getStoreId();
  if (!storeId) {
    console.error(`Store with slug "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Seeding content pages for store ID: ${storeId}\n`);

  // ════════════════════════════════════════
  // 1. HOMEPAGE
  // ════════════════════════════════════════
  await upsertPage(
    storeId,
    "homepage",
    "Homepage",
    `<p>Welcome to Biotic Ayurveda — rooted in classical Ayurvedic texts, tested against modern lab standards. Explore our dosha-balanced formulations for skin, hair, and wellness.</p>`,
    JSON.stringify([
      {
        id: "homepage-hero",
        type: "homepage-content",
        data: {
          hero: {
            title: "Rooted in Wellness",
            subtitle: "Ayurvedic formulations for skin, hair and wellness. Small-batch, lab-tested, dosha-balanced.",
            buttonText: "Explore Formulations",
            buttonLink: "/shop",
          },
          features: {
            title: "The Biotic Standard",
            items: [
              { title: "Lab-Tested", description: "Every batch third-party tested for potency, heavy metals, and microbial safety.", icon: "FlaskConical" },
              { title: "Small-Batch", description: "Made in small quantities by hand, with the attention a vaidya gives a patient they know.", icon: "FlaskRound" },
              { title: "Text-Based", description: "Every formula begins with a classical text — Charaka Samhita, Sushruta Samhita, or Ashtanga Hridayam.", icon: "BookOpen" },
            ],
          },
          cta: {
            title: "Ready to begin your ritual?",
            description: "Browse our full range of dosha-balanced formulations, each with complete ingredient traceability.",
            buttonText: "Shop Now",
            buttonLink: "/shop",
          },
        },
      },
    ]),
    "Biotic Ayurveda — Rooted in Wellness",
    "Ayurvedic formulations for skin, hair and wellness. Small-batch, lab-tested, dosha-balanced. Made in India.",
    1
  );
  console.log("  ✅ Homepage (homepage-content block)\n");

  // ════════════════════════════════════════
  // 2. ABOUT US
  // ════════════════════════════════════════
  await upsertPage(
    storeId,
    "about-us",
    "About Us",
    `<p>Every formula we make begins with a classical Ayurvedic text and ends with a lab report. Founded in 2012 in Jaipur, Rajasthan — Biotic Ayurveda bridges ancient wisdom and modern quality standards.</p>`,
    JSON.stringify([
      {
        id: "about-hero-1",
        type: "about-page-content",
        data: {
          hero: {
            title: "Rooted in the Vedas, refined for today.",
            subtitle: "Every formula we make starts with a classical text and ends with a lab report.",
            estYear: "Est. 2012 · Jaipur, Rajasthan",
            backgroundImage: "",
            backgroundColor: "#2F4A3C",
            pattern: "none",
            overlayColor: "#1c1917",
            overlayOpacity: "0.3",
            badge: "",
          },
          stats: [
            { value: "120+", label: "Formulations" },
            { value: "40k+", label: "Rituals shipped" },
            { value: "4.8/5", label: "Average rating" },
            { value: "100%", label: "Lab-tested batches" },
          ],
          story: {
            heading: "The Biotic difference",
            subtitle: "Ayurveda that honours both the past and the proof",
            narrative: [
              "Every formulation we make begins with a classical Ayurvedic text — the Charaka Samhita, the Sushruta Samhita, or the Ashtanga Hridayam. From there, we work with vaidyas who have spent decades studying these texts, not interpreting them through a modern lens.",
              "Once a formula is finalised, it goes through third-party lab testing for potency, heavy metals, and microbial safety. Tradition and science don't have to be at odds — they're both part of the same standard.",
              "We source from farming cooperatives we've visited. You can trace each ingredient back to the region it was grown in. Every batch is made in small quantities, by hand, with the same attention a vaidya would give a patient they know by name.",
            ],
            ctaText: "Shop our formulations →",
            ctaPage: "shop",
            timeline: [
              { year: "2012", title: "Founded in Jaipur", desc: "A small workshop with two Ayurvedic vaidyas and a belief that classical formulas deserved a modern audience." },
              { year: "2015", title: "First lab partnership", desc: "Partnered with an NABL-accredited lab in Pune to test every batch for safety and potency." },
              { year: "2018", title: "40,000th ritual shipped", desc: "Crossed a milestone that proved people were ready for long-term wellness routines." },
              { year: "2026", title: "Biotic today", desc: "Still small-batch. Still rooted in the texts. Still made by people who care about the process.", current: true },
            ],
          },
          directors: [
            {
              name: "Dr. Ananya Sharma",
              role: "Chief Ayurvedic Formulator",
              bio: "15+ years in Ayurvedic pharmacology. Specialises in classical text interpretation and dosage standardisation.",
              imageUrl: "",
              authorImage: "",
            },
            {
              name: "Rahul Varma",
              role: "Head of Sourcing & Sustainability",
              bio: "Leads our farm-direct sourcing network across 6 states. Ensures every ingredient is traceable to its origin.",
              imageUrl: "",
              authorImage: "",
            },
          ],
          quote: {
            text: "\"We don't reinvent Ayurveda. We honour it by doing the basics well — the right ingredients, the right process, and the honesty to lab-test every batch.\"",
            author: "Dr. Ananya Sharma, Chief Formulator",
          },
          ctaCard: {
            title: "Visit our shop",
            desc: "Explore our full range of dosha-balanced formulations.",
            cta: "Shop Now →",
          },
          missionVisionValues: [
            {
              icon: "Leaf", color: "text-biotic-green", bg: "bg-biotic-green-tint",
              label: "Mission",
              title: "Make classical Ayurveda accessible",
              desc: "To formulate authentic Ayurvedic products that are lab-tested, traceable, and made for modern rituals.",
            },
            {
              icon: "Eye", color: "text-biotic-gold", bg: "bg-biotic-gold-tint",
              label: "Vision",
              title: "Restore trust in Ayurvedic wellness",
              desc: "To set a new standard for transparency in Ayurvedic manufacturing — where every claim is backed by a test report.",
            },
            {
              icon: "HeartHandshake", color: "text-biotic-red", bg: "bg-rose-50",
              label: "Values",
              title: "Text first · Lab always · People matter",
              desc: "We don't cut corners. If it isn't in the classical texts, it doesn't go in. If it isn't lab-tested, it doesn't ship.",
            },
          ],
          location: {
            factoryAddress: "42, Hawa Sadak\nBani Park, Jaipur — 302 016\nRajasthan, India",
            googleMapsEmbedUrl: "",
            logistics: [
              { icon: "Train", label: "Nearest railway station", value: "Jaipur Junction — 4 km" },
              { icon: "Plane", label: "Nearest airport", value: "Jaipur International — 14 km" },
              { icon: "Route", label: "Nearest highway", value: "NH-48 — 2 km" },
              { icon: "Factory", label: "Nearest major city", value: "Jaipur — 4 km" },
            ],
            dispatchTags: ["Pan-India dispatch", "Road + rail", "Small-batch tracked"],
            dispatchDesc: "We dispatch to all major markets across India via road and rail freight. Consignments dispatched within agreed lead times.",
          },
          cta: {
            title: "Experience Biotic Ayurveda",
            cards: [
              { icon: "Package", title: "Browse formulations", desc: "Explore our full range of skin, hair and wellness products.", cta: "Shop now →", page: "shop", useForm: false },
              { icon: "Mail", title: "Bulk / wholesale enquiry", desc: "Looking for bulk supply or partnership? Send us your requirement.", cta: "Send enquiry →", page: "contact", useForm: true },
              { icon: "MapPin", title: "Visit our workshop", desc: "By appointment — schedule a visit to see our process in person.", cta: "Book a visit →", page: "contact", useForm: true },
            ],
          },
        },
      },
    ]),
    "About Us — Biotic Ayurveda",
    "Rooted in classical Ayurvedic texts, tested against modern lab standards. Small-batch formulations made with integrity.",
    2
  );
  console.log("  ✅ About Us (about-page-content block)\n");

  // ════════════════════════════════════════
  // 3. SHOP
  // ════════════════════════════════════════
  await upsertPage(
    storeId,
    "products",
    "Shop",
    `<p>Browse our complete range of Ayurvedic formulations for skin, hair, and wellness. Dosha-balanced and lab-tested. Made in small batches in Jaipur, Rajasthan.</p>`,
    JSON.stringify([
      {
        id: "products-hero-1",
        type: "products-page-content",
        data: {
          hero: {
            title: "Ayurvedic formulations for every dosha",
            subtitle: "Shop by category, ingredient, or dosha — every product is lab-tested and made in small batches.",
          },
          categories: {
            title: "Shop by Category",
            showAll: true,
            featured: ["skin-care", "hair-care", "wellness", "immunity"],
          },
          filters: {
            enabled: true,
            options: ["category", "price", "brand"],
          },
          display: {
            itemsPerPage: 12,
            sortOptions: ["featured", "price_asc", "price_desc", "name_asc"],
            defaultSort: "featured",
          },
          cta: {
            title: "Looking for bulk or wholesale?",
            description: "Contact us for bulk orders, private labelling, or partnership enquiries.",
            buttonText: "Send Enquiry",
            buttonLink: "/contact",
          },
        },
      },
    ]),
    "Shop — Biotic Ayurveda",
    "Browse our complete range of Ayurvedic formulations for skin, hair, and wellness. Dosha-balanced and lab-tested.",
    3
  );
  console.log("  ✅ Shop (products-page-content block)\n");

  // ════════════════════════════════════════
  // 4. CONTACT
  // ════════════════════════════════════════
  await upsertPage(
    storeId,
    "contact",
    "Contact Us",
    `<p>Get in touch with the Biotic team. Questions on dosha matching, an order, or a bulk/wholesale enquiry — write to us directly. We reply within one business day.</p>`,
    JSON.stringify([
      {
        id: "contact-hero-1",
        type: "contact-page-content",
        data: {
          hero: {
            title: "We reply within one business day.",
            subtitle: "Questions on dosha matching, an order, or a bulk/wholesale enquiry — write to us directly.",
            topLabel: "Get in touch",
            backgroundColor: "#2F4A3C",
            pattern: "none",
            overlayColor: "#1c1917",
            overlayOpacity: "0.3",
            requirementTypes: [
              { id: "enquiry", label: "General enquiry", icon: "HelpCircle" },
              { id: "order", label: "Order support", icon: "ShoppingBag" },
              { id: "wholesale", label: "Wholesale / Bulk", icon: "Package" },
              { id: "partnership", label: "Partnership", icon: "Handshake" },
              { id: "other", label: "Other", icon: "MoreHorizontal" },
            ],
          },
          formSection: {
            title: "Send us a message",
            subtitle: "We respond within 24 working hours.",
          },
          responsePromise: {
            title: "Our response commitment",
            items: [
              { label: "General enquiries", time: "Within 24 hours" },
              { label: "Order support", time: "Within 4 hours" },
              { label: "Wholesale/Bulk", time: "Within 48 hours" },
            ],
            footer: "Mon–Sat, 9am–6pm IST",
          },
          locations: {
            title: "Visit us",
            cards: [
              {
                type: "factory",
                title: "Jaipur Workshop",
                subtitle: "Primary",
                address: "42, Hawa Sadak\nBani Park, Jaipur — 302 016\nRajasthan, India",
                accessibility: "Jaipur Junction 4km · Jaipur Airport 14km",
                buttons: [
                  { text: "Get directions", icon: "MapPin", link: "" },
                  { text: "Book visit", icon: "Factory", link: "#contact-form" },
                ],
              },
              {
                type: "office",
                title: "Registered Office",
                subtitle: "",
                address: "D-108, Sector 7\nMalviya Nagar, Jaipur — 302 017\nRajasthan, India",
                accessibility: "Mon–Sat · 9am–6pm IST",
                buttons: [{ text: "Get directions", icon: "MapPin", link: "" }],
              },
              {
                type: "visit",
                title: "Planning a visit?",
                subtitle: "",
                description: "We welcome visits by appointment. Schedule in advance to meet our formulation team and see the workshop.",
                highlights: [
                  "Meet our Ayurvedic formulators",
                  "See the small-batch production process",
                  "Product sampling on request",
                ],
                cta: "Schedule a visit →",
                link: "#contact-form",
              },
            ],
          },
        },
      },
    ]),
    "Contact Us — Biotic Ayurveda",
    "Get in touch with the Biotic team. Questions on dosha matching, orders, or bulk enquiries — we reply within one business day.",
    4
  );
  console.log("  ✅ Contact (contact-page-content block)\n");

  // ════════════════════════════════════════
  // 5. BLOG / JOURNAL
  // ════════════════════════════════════════
  await upsertPage(
    storeId,
    "blog",
    "Journal",
    `<p>Long-form writing on doshas, ingredients, and the science behind formulas that are centuries old. Explore the wisdom of classical Ayurveda through modern lenses.</p>`,
    JSON.stringify([
      {
        id: "blog-hero-1",
        type: "hero",
        data: {
          title: "Journal — Biotic Ayurveda",
          subtitle: "Long-form writing on doshas, ingredients, and the science behind formulas that are centuries old.",
          buttonText: "Read Latest",
          buttonLink: "/blog",
          backgroundImage: "",
          height: "medium",
          alignment: "center",
        },
      },
      {
        id: "blog-text-1",
        type: "text",
        data: {
          content: "<p>Explore the wisdom of classical Ayurveda through modern lenses. Our journal covers dosha theory, ingredient deep-dives, ritual guides, and conversations with vaidyas who have spent decades studying the Charaka Samhita, Sushruta Samhita, and Ashtanga Hridayam.</p><p>Whether you are new to Ayurveda or a seasoned practitioner, these writings are meant to inform — not simplify.</p>",
        },
      },
      {
        id: "blog-cta-1",
        type: "cta",
        data: {
          title: "Stay rooted in wellness",
          description: "Subscribe to our newsletter for new journal entries, formulation releases, and seasonal wellness guides.",
          buttonText: "Subscribe",
          buttonLink: "/contact",
          backgroundColor: "primary",
        },
      },
    ]),
    "Journal — Biotic Ayurveda",
    "Long-form writing on doshas, ingredients, and the science behind formulas that are centuries old.",
    5
  );
  console.log("  ✅ Journal (hero + text + cta blocks)\n");

  console.log("All content pages seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
