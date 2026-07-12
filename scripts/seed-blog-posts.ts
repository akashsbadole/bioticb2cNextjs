import { db } from "../src/lib/db";

const STORE_SLUG = process.env.DEFAULT_STORE_SLUG || "vedika-ayurveda";

async function getStoreId(): Promise<string | null> {
  const store = await db.store.findFirst({ where: { slug: STORE_SLUG } });
  return store?.id || null;
}

const POSTS = [
  {
    slug: "how-to-identify-your-dominant-dosha-at-home",
    title: "How to identify your dominant dosha at home",
    excerpt: "A simple self-assessment based on classical Ayurvedic principles — no quiz, no app required.",
    category: "Dosha Guide",
    content: `<p>In Ayurveda, there is no one-size-fits-all. Your constitution — or <em>prakriti</em> — is a combination of the three doshas: Vata, Pitta, and Kapha. One of these is typically dominant, and knowing which one can guide everything from your skincare routine to your meal choices.</p>
<p>This is not a buzzfeed quiz. It is a simplified version of the classical assessment a vaidya would perform — stripped down so you can begin observing yourself today.</p>
<h2>Start with your body frame</h2>
<p><strong>Vata-dominant</strong> individuals tend to have a light, thin frame. Joints may be prominent. Weight gain is difficult; weight loss can happen quickly under stress. Skin is often dry, and hands and feet run cold.</p>
<p><strong>Pitta-dominant</strong> individuals have a medium, athletic build. They gain and lose weight relatively easily. Skin is warm, often sensitive to heat, and prone to redness or breakouts. Body temperature runs warm.</p>
<p><strong>Kapha-dominant</strong> individuals have a heavier, broader frame. Weight gain comes easily and is hard to lose. Skin is thick, oily, and smooth. Body temperature is steady and cool.</p>
<h2>Observe your digestion</h2>
<p><strong>Vata:</strong> Irregular appetite. Sometimes ravenous, sometimes not hungry. Prone to bloating, gas, and constipation. Digestion is erratic.</p>
<p><strong>Pitta:</strong> Strong, sharp appetite. Can get irritable if meals are delayed. Prone to heartburn, acid reflux, loose stools. Digestion is fast and intense.</p>
<p><strong>Kapha:</strong> Steady, slow appetite. Can skip meals without discomfort. Digestion is sluggish. Prone to heaviness after eating and mucus formation.</p>
<h2>Look at your sleep patterns</h2>
<p><strong>Vata:</strong> Light sleeper. Wakes easily. Difficulty falling asleep. Dreams are active, sometimes anxious.</p>
<p><strong>Pitta:</strong> Falls asleep easily. Wakes up during the night feeling hot or thirsty. Dreams are vivid, sometimes competitive.</p>
<p><strong>Kapha:</strong> Deep, heavy sleeper. Can sleep 9+ hours. Wakes up groggy and slow to get moving.</p>
<h2>Notice your natural tendencies</h2>
<p><strong>Vata:</strong> Quick to learn, quick to forget. Energetic in bursts, then fatigued. Naturally creative, talkative, and adaptable — but prone to anxiety under stress.</p>
<p><strong>Pitta:</strong> Sharp intellect, strong focus. Organised, articulate, and goal-oriented. Prone to irritability and perfectionism when imbalanced.</p>
<p><strong>Kapha:</strong> Slow to learn, but remembers forever. Steady, calm, and loyal. Prone to procrastination and resistance to change.</p>
<h2>What to do next</h2>
<p>Read through each category and note which description fits you most consistently — not just today, but across your life.</p>
<p>If Vata stood out in most areas, you are likely Vata-dominant. Same for Pitta or Kapha. Some people are dual-dosha (e.g., Vata-Pitta), which means two doshas are nearly equal in strength.</p>
<p>Once you know your dominant dosha, you can start making small adjustments: the right Abhyanga oil, the ideal morning routine, the foods that balance rather than aggravate. That is where the real work — and the real benefit — begins.</p>`,
    tags: JSON.stringify(["Dosha Guide", "Ayurveda Basics", "Prakriti"]),
    publishedAt: "2026-06-12T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
  {
    slug: "turmeric-vs-saffron-which-one-belongs-in-your-routine",
    title: "Turmeric vs. saffron: which one belongs in your routine?",
    excerpt: "Both are gold-standard ingredients in Ayurveda, but they serve very different purposes. Here's how to choose.",
    category: "Ingredients",
    content: `<p>Turmeric and saffron share a colour palette and a reputation in Ayurveda, but they are not interchangeable. One is a daily workhorse; the other is a targeted intervention. Understanding the difference helps you use each where it belongs.</p>
<h2>Turmeric: the daily digestive and anti-inflammatory</h2>
<p>Turmeric (<em>Curcuma longa</em>) is one of the most extensively studied herbs in Ayurveda. Its primary active compound, curcumin, is a potent anti-inflammatory and antioxidant.</p>
<p>In Ayurvedic terms, turmeric is <strong>katu</strong> (pungent) and <strong>tikta</strong> (bitter) in taste, with a <strong>ushna</strong> (heating) potency. It is used classically for:</p>
<ul>
<li>Purifying the blood (<em>rakta shodhana</em>)</li>
<li>Supporting digestion and liver function</li>
<li>Reducing joint inflammation</li>
<li>Supporting skin health from within</li>
</ul>
<p>Because of its heating nature, turmeric is best taken with food and often combined with black pepper (piperine) to enhance absorption. A daily dose of 500 mg to 1 g of good-quality powder is a reasonable maintenance amount.</p>
<h2>Saffron: the mood elevator and reproductive tonic</h2>
<p>Saffron (<em>Crocus sativus</em>) is the most expensive spice in the world by weight — and for good reason. It takes approximately 75,000 flowers to produce one pound of saffron.</p>
<p>In Ayurveda, saffron is <strong>madhura</strong> (sweet) and <strong>tikta</strong> (bitter), with a <strong>sheeta</strong> (cooling) potency. It is classically used for:</p>
<ul>
<li>Uplifting mood and supporting the nervous system</li>
<li>Nourishing the female reproductive system</li>
<li>Supporting healthy skin complexion and radiance</li>
<li>Promoting alertness and mental clarity</li>
</ul>
<p>Saffron is typically used in small quantities — a few strands soaked in warm milk or water. It is not a daily necessity for everyone, but it is exceptionally useful during periods of low mood, hormonal shifts, or when the skin needs a brightness boost.</p>
<h2>Which one should you choose?</h2>
<p>Think of turmeric as the foundation and saffron as the accent. If you are looking for daily anti-inflammatory and digestive support, turmeric is the clear choice. If you are addressing mood, reproductive health, or want to add brightness to your routine, saffron is worth the investment.</p>
<p>They can absolutely be used together — and in fact, some classical formulations combine both. But respect their differences: turmeric for daily resilience, saffron for specific support.</p>`,
    tags: JSON.stringify(["Ingredients", "Turmeric", "Saffron", "Herbs"]),
    publishedAt: "2026-06-02T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
  {
    slug: "a-10-minute-dinacharya-for-people-who-hate-routines",
    title: "A 10-minute Dinacharya for people who hate routines",
    excerpt: "If a 20-step morning ritual sounds overwhelming, start here. The minimum viable daily practice.",
    category: "Rituals",
    content: `<p>We have read the classical Dinacharya descriptions. Tongue scraping, oil pulling, Abhyanga, Nasya, meditation, yoga asana, pranayama — the full practice can easily stretch to 90 minutes. And that is precisely why most people never start.</p>
<p>Here is a 10-minute version that captures the essence. You can expand it over time, but this minimum viable practice will already move the needle.</p>
<h2>Minute 0–1: Tongue scrape</h2>
<p>Before you drink anything, take a copper or stainless steel tongue scraper and gently scrape from back to front 5–7 times. This removes <em>ama</em> (toxins) that accumulated on the tongue overnight. It also triggers a digestive signal to the stomach.</p>
<h2>Minute 1–2: Drink warm water</h2>
<p>Sip a glass of warm water — ideally in a copper vessel if you have one, but any mug works. This hydrates the tissues and gently stimulates peristalsis. Do not add lemon or honey yet; the point is simple warmth.</p>
<h2>Minute 2–5: Self-massage (Abhyanga) — abbreviated</h2>
<p>You do not need a full-body oil massage. Take 2–3 minutes to massage warm sesame or coconut oil into your feet, hands, and scalp. These are <em>marma</em> points that ground the nervous system. If you have dry skin, add oil to your shins and forearms.</p>
<p>Let the oil sit while you do the next step.</p>
<h2>Minute 5–8: Move your body</h2>
<p>Do not worry about a full asana sequence. Do 3 rounds of Sun Salutation (Surya Namaskar) at a comfortable pace, or simply stretch whichever parts of your body feel stiff. The goal is to move lymph and wake up the joints, not to achieve a pose.</p>
<h2>Minute 8–10: Sit in silence</h2>
<p>Sit on the floor or in a chair with your spine reasonably straight. Close your eyes. Take 5 slow breaths — in through the nose, out through the nose. That is it. You are not trying to empty your mind; you are trying to arrive in your body before the day claims your attention.</p>
<h2>What about the rest?</h2>
<p>Oil pulling, Nasya, Neti, meditation — these are valuable additions, and you can add them one at a time as the 10-minute version becomes a habit. But do not let the perfect Dinacharya be the enemy of the good one. Consistency matters more than completeness.</p>
<p>Do this for 40 days and observe what changes.</p>`,
    tags: JSON.stringify(["Rituals", "Dinacharya", "Daily Routine"]),
    publishedAt: "2026-05-24T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
  {
    slug: "why-we-still-formulate-by-hand-and-by-text",
    title: "Why we still formulate by hand (and by text)",
    excerpt: "In an age of machine blending, every Vedika formulation is still hand-weighed and hand-mixed in small batches.",
    category: "Behind the Brand",
    content: `<p>If you visit our Jaipur workshop on a production day, the first thing you will notice is the quiet. There are no automated blenders running 50-kilo batches. There is no conveyor belt. There are people — weighing ingredients by hand on calibrated scales, mixing them in copper vessels, and checking the texture, colour, and aroma of every batch before it moves to the next stage.</p>
<p>This is not a marketing choice. It is a formulation choice.</p>
<h2>Why hand-mixing matters</h2>
<p>Ayurvedic powders are not homogeneous in the way a synthetic compound is. When you combine Licorice root powder with Manjistha and Turmeric, the particle sizes, densities, and moisture contents are different. A machine blending 50 kg at once will separate these by density during transport and storage. The end user might get a jar that is mostly one ingredient at the top and another at the bottom.</p>
<p>Hand-mixing in small batches — 2 to 5 kg at a time — allows our formulators to ensure uniform distribution of every ingredient. They can feel when the blend is consistent. They can see it. That sensory feedback is lost in automation.</p>
<h2>Following the text, not the trend</h2>
<p>Every Vedika formula begins with a classical source: the Charaka Samhita, the Sushruta Samhita, or the Ashtanga Hridayam. These texts specify not just the ingredients and their proportions, but also the method of preparation (<em>kalpana</em>). Some preparations require specific grinding media, specific soaking times, or specific sequences of adding ingredients.</p>
<p>These instructions exist for a reason. The order in which ingredients are combined can affect the bioavailability of the active compounds. The grinding method can change the particle size distribution, which affects absorption. When you scale up a classical formula for mass production, these details are often the first to be sacrificed. We refuse to sacrifice them.</p>
<h2>The cost of doing it right</h2>
<p>Hand-formulating is slower and more expensive. It limits our production capacity. It means we cannot compete on price with mass-market brands that use spray-dried extracts and flow agents.</p>
<p>But it also means that when you open a jar of a Vedika formulation, you are getting exactly what the text intended — not a commercial approximation. Every batch is weighed, mixed, inspected, and tested before it ships. That is a standard we will not compromise on.</p>`,
    tags: JSON.stringify(["Behind the Brand", "Formulation", "Quality"]),
    publishedAt: "2026-05-10T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
  {
    slug: "the-three-doshas-explained-simply",
    title: "The three doshas explained simply",
    excerpt: "Vata, Pitta, Kapha — what they actually mean for your day-to-day choices in food, skincare, and lifestyle.",
    category: "Dosha Guide",
    content: `<p>The three doshas — Vata, Pitta, and Kapha — are often described in abstract terms that make them sound like personality types rather than physiological principles. Here is a grounded explanation of what each one actually represents, with practical implications for your daily choices.</p>
<h2>Vata: the principle of movement</h2>
<p>Vata is responsible for all movement in the body: breathing, circulation, nerve impulses, peristalsis, and the flow of thoughts. It is made of the air and ether elements.</p>
<p><strong>When balanced:</strong> You feel creative, energetic, adaptable. Your digestion is regular, your sleep is sound, and your mind is clear.</p>
<p><strong>When imbalanced:</strong> You feel anxious, scattered, and fatigued. Your skin and hair become dry. Digestion becomes erratic — constipation, bloating, or undigested food. Sleep is light and easily disturbed.</p>
<p><strong>Practical balance tips:</strong> Warm, oily, and grounding foods. Sesame oil massage. Regular routine. Avoid cold, dry, and raw foods. Favour cooked grains, root vegetables, and warm milk with spices.</p>
<h2>Pitta: the principle of transformation</h2>
<p>Pitta governs digestion, metabolism, body temperature, and intellectual processing. It is made of the fire and water elements.</p>
<p><strong>When balanced:</strong> You have strong digestion, sharp focus, and good leadership qualities. Your skin is clear and warm. You sleep well and wake up refreshed.</p>
<p><strong>When imbalanced:</strong> You feel irritable, impatient, and overheated. Heartburn, acid reflux, and skin inflammation (acne, rashes) appear. You may wake up in the night feeling hot or thirsty.</p>
<p><strong>Practical balance tips:</strong> Cooling, calming foods. Coconut oil, cucumber, mint, and sweet fruits. Avoid spicy, sour, and deep-fried foods. Favour bitter greens, sweet vegetables, and cooling herbs like coriander and fennel.</p>
<h2>Kapha: the principle of structure</h2>
<p>Kapha provides stability, lubrication, and immunity. It forms the body's structural tissues — muscles, bones, fat, and synovial fluid. It is made of the water and earth elements.</p>
<p><strong>When balanced:</strong> You are calm, steady, and strong. Your immunity is robust. Your skin is smooth and well-moisturised. You have endurance and emotional stability.</p>
<p><strong>When imbalanced:</strong> You feel heavy, sluggish, and congested. Weight gain is easy and stubborn. Mucus accumulates — sinuses, chest, throat. You feel resistant to change and can be prone to depression.</p>
<p><strong>Practical balance tips:</strong> Light, warm, and stimulating foods. Ginger tea, raw honey, and bitter greens. Avoid heavy, oily, and sweet foods. Favour legumes, pungent spices, and a consistent exercise routine.</p>
<h2>How to use this knowledge</h2>
<p>Most people are a combination of two doshas, with one dominant. Observe which imbalances you tend toward under stress — that is usually a sign of your dominant dosha. Make small adjustments in your diet and routine during that season of imbalance. Over time, those adjustments become second nature, and the doshas move from abstract concepts to practical tools you use every day.</p>`,
    tags: JSON.stringify(["Dosha Guide", "Vata", "Pitta", "Kapha", "Ayurveda Basics"]),
    publishedAt: "2026-04-28T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
  {
    slug: "what-to-look-for-in-an-ashwagandha-supplement",
    title: "What to look for in an Ashwagandha supplement",
    excerpt: "Not all Ashwagandha is created equal. Here's how to read labels, choose the right extract, and avoid common pitfalls.",
    category: "Ingredients",
    content: `<p>Ashwagandha (<em>Withania somnifera</em>) is one of the most popular Ayurvedic herbs in the world — and also one of the most adulterated. A supplement shelf in any health store will display a dozen different Ashwagandha products, and most of them will not tell you what you actually need to know.</p>
<p>Here is how to evaluate an Ashwagandha supplement with the same scrutiny a vaidya would apply.</p>
<h2>1. Root or leaf?</h2>
<p>Classical Ayurvedic texts specify the use of Ashwagandha <strong>root</strong>. The root contains the full spectrum of withanolides — the active compounds responsible for the herb's adaptogenic effects.</p>
<p>Many commercial supplements use leaf extracts because they are cheaper to harvest and can be standardised to a higher withanolide percentage on paper. But leaf withanolides are chemically different from root withanolides and do not produce the same clinical effects.</p>
<p><strong>What to look for:</strong> The label should say "root" or "root extract." If it only says "Ashwagandha extract" without specifying the part, assume it is leaf or a blend.</p>
<h2>2. Withanolide content, not percentage</h2>
<p>Most brands advertise "5% withanolides" or "10% withanolides." This percentage is calculated relative to the extract ratio — and extract ratios are not standardised across brands. A 10:1 extract with 5% withanolides is not the same as a 5:1 extract with 5% withanolides.</p>
<p><strong>What to look for:</strong> Look for the actual milligrams of withanolides per serving, not just the percentage. A clinically effective dose typically provides 10–20 mg of total withanolides per day.</p>
<h2>3. Third-party testing</h2>
<p>Ashwagandha is frequently adulterated with starches, fillers, or even synthetic withanolides. Without third-party lab testing, there is no way to verify that what is on the label matches what is in the jar.</p>
<p><strong>What to look for:</strong> A certificate of analysis (CoA) from an independent lab, testing for both potency and heavy metals. If the brand does not publish or share CoAs on request, consider that a red flag.</p>
<h2>4. Dosage that matches classical use</h2>
<p>Classical Ayurvedic texts recommend Ashwagandha root powder at doses of 3–6 grams per day. Modern concentrated extracts allow smaller doses — typically 300–600 mg of a 5:1 or 8:1 extract — but the dose should still correspond to a meaningful amount of whole-herb equivalent.</p>
<p><strong>What to look for:</strong> A daily dose that provides at least 3 g of whole-herb equivalent (for powder) or 300–600 mg of a standardised root extract. Avoid products that require you to take sub-therapeutic doses to fit the serving size.</p>
<h2>5. Formulation context</h2>
<p>In classical Ayurveda, Ashwagandha is rarely used alone. It is often combined with supporting herbs like Ghee, Honey, Piper longum (Pippali), or Yashtimadhu (Licorice) to enhance absorption and balance its effects.</p>
<p>Stand-alone Ashwagandha extracts can be effective, but a well-formulated compound may produce better results — especially for long-term use.</p>`,
    tags: JSON.stringify(["Ingredients", "Ashwagandha", "Supplements", "Quality"]),
    publishedAt: "2026-04-15T00:00:00.000Z",
    isPublished: true,
    coverImage: "",
  },
];

async function main() {
  const storeId = await getStoreId();
  if (!storeId) {
    console.error(`Store with slug "${STORE_SLUG}" not found`);
    process.exit(1);
  }
  console.log(`Seeding blog posts for store ID: ${storeId}\n`);

  let created = 0;
  let skipped = 0;

  for (const post of POSTS) {
    const existing = await db.blogPost.findFirst({
      where: { slug: post.slug, storeId },
    });

    if (existing) {
      console.log(`  Updating "${post.title}"...`);
      await db.blogPost.update({
        where: { id: existing.id },
        data: {
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          publishedAt: new Date(post.publishedAt),
          isPublished: true,
          coverImage: post.coverImage || null,
        },
      });
      skipped++;
    } else {
      console.log(`  Creating "${post.title}"...`);
      await db.blogPost.create({
        data: {
          storeId,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          publishedAt: new Date(post.publishedAt),
          isPublished: true,
          coverImage: post.coverImage || null,
        },
      });
      created++;
    }
  }

  console.log(`\nDone! Created: ${created}, Skipped (already exist): ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
