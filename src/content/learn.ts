export type Excerpt = { text: string; source?: string };

export type Section = {
  heading: string;
  body?: string[];
  bullets?: string[];
  excerpt?: Excerpt;
  table?: { columns: string[]; rows: string[][] };
};

export type Topic = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  sections: Section[];
};

const BOOK = "The New Perimenopause — Mary Claire Haver, MD";

export const TOPICS: Topic[] = [
  {
    slug: "stages",
    title: "The four stages",
    kicker: "Where you are",
    summary:
      "Premenopause, perimenopause, menopause, postmenopause — defined clearly, in the words of the book.",
    sections: [
      {
        heading: "Perimenopause",
        excerpt: {
          text: "Perimenopause: A transitional stage that happens before menopause and is heralded by fluctuations in hormone levels, primarily estrogen and progesterone. This stage may also be referred to as the menopausal transition and can begin in the forties or even in the mid-thirties. The duration of perimenopause varies, with the average being reported to be around four years, but it can last as long as ten.",
          source: BOOK,
        },
      },
      {
        heading: "Menopause",
        excerpt: {
          text: "One moment in time that happens when you've reached twelve months after your last period. This date will mark the end of your menstrual cycle and natural reproductive capabilities. The average age of menopause is fifty-one, with normal menopause falling between forty-five and fifty-five years of age.",
          source: BOOK,
        },
      },
      {
        heading: "Postmenopause",
        excerpt: {
          text: "Postmenopause: The rest of your life after menopause. In postmenopause, we see the highest prevalence of vasomotor symptoms, such as hot flashes, heart palpitations, and sweating. Such symptoms may last between 4.5 and 9.5 years after the final menstrual period.",
          source: BOOK,
        },
      },
      {
        heading: "A note on language",
        body: [
          "In some cases, the word menopausal is used in the scientific literature to refer broadly to any or all of the above stages — which is part of why the conversation gets so confusing.",
        ],
      },
    ],
  },
  {
    slug: "why-chaotic",
    title: "Why perimenopause is so chaotic",
    kicker: "The mechanism",
    summary:
      "It isn't random hormones. It's a changing egg supply and a brain shouting louder to compensate.",
    sections: [
      {
        heading: "The real driver",
        body: [
          "The reason for this isn't that your hormones are randomly changing — it's that your egg supply has changed in quantity and quality, and increasing levels of brain hormones are needed to stimulate the release of an egg.",
          "In perimenopause the ovaries begin to struggle to produce viable eggs, which creates the fluctuations in estrogen and progesterone that you feel as unpredictability.",
        ],
      },
      {
        heading: "The brain changes before the body",
        excerpt: {
          text: "What studies have revealed is that the majority of women will experience neurological symptoms during perimenopause. These may be changes in cognitive function, such as diminished verbal learning and memory and reduced processing speed, attention, and working memory. You may experience this as brain fog and find it difficult to concentrate, recall words, or make decisions.",
          source: BOOK,
        },
      },
      {
        heading: "The cascade of missed connections",
        bullets: [
          "As estrogen levels decline, glucose metabolism in the brain begins to slow and it has to search for other sources of fuel, often catabolizing its own white matter to generate ketones.",
          "Decreases in progesterone alter the ability of GABA to calm the nervous system, making you more sensitive to stress and more likely to experience sleep disruptions.",
          "Estrogen withdrawal interferes with serotonin, dopamine, and norepinephrine pathways — disturbed sleep cycles, mood instability, greater risk of anxiety or depression, reduced pleasure, lost motivation, compromised learning, and difficulty with decision-making.",
        ],
        excerpt: { text: "Excerpted and condensed from the book.", source: BOOK },
      },
    ],
  },
  {
    slug: "misdiagnosis",
    title: "Misdiagnosis watch",
    kicker: "Take this to your doctor",
    summary:
      "Five diagnoses commonly handed out when the real answer may be perimenopause — with what to ask for.",
    sections: [
      {
        heading: "Diagnosed: fibromyalgia · Could be: musculoskeletal syndrome of menopause",
        body: [
          "MSM is defined as declines in muscle mass, strength, joint integrity, and overall physical function brought on by the loss of estrogen. This pattern strongly overlaps with what we see in fibromyalgia.",
          "Ask your clinician to consider perimenopause as a factor in musculoskeletal complaints rather than defaulting to a chronic pain or mood disorder diagnosis.",
        ],
      },
      {
        heading: "Diagnosed: interstitial cystitis / bladder pain syndrome · Could be: GSM",
        body: [
          "Urinary urgency and frequency, nocturia, pelvic discomfort, painful intercourse and bladder pain are also indicative of the genitourinary syndrome of menopause.",
          "If you are thirty-five or older and raising these symptoms, GSM should be considered.",
        ],
        bullets: [
          "Assess menopausal status — even if you still have regular periods.",
          "Examine vulvovaginal tissues for atrophy, loss of elasticity, or pallor.",
          "Use symptom questionnaires that screen for both bladder pain and genitourinary atrophy.",
          "Consider a trial of local estrogen therapy when pelvic pain coexists with dryness, dyspareunia, or urinary symptoms.",
        ],
      },
      {
        heading: "Diagnosed: long COVID · Could be: perimenopause",
        body: [
          "Long COVID is characterised by prolonged, multisystem symptoms after infection — fatigue, brain fog and muscle pain. The same triad is the everyday texture of perimenopause.",
        ],
      },
      {
        heading: "Diagnosed: adrenal fatigue · Could be: HPA-axis disruption",
        body: [
          "Brain fog, sleep disturbance, fatigue, irritability, low libido and an inability to handle stress closely mirror perimenopause. The adrenal glands do play a role — not because they are 'tired', but because perimenopausal fluctuations in estradiol disrupt the hypothalamic-pituitary-adrenal axis.",
        ],
      },
      {
        heading: "Before settling on 'estrogen dominance'",
        bullets: [
          "Is PCOS present but undiagnosed?",
          "Is there thyroid dysfunction or hypothalamic-pituitary-ovarian axis disruption?",
          "Is she experiencing chronic stress, underfueling, or sleep disruption?",
        ],
      },
    ],
  },
  {
    slug: "traditions",
    title: "Traditional medicine atlas",
    kicker: "Six systems, one transition",
    summary:
      "How Ayurveda, TCM, Unani, Siddha, Traditional Arabic/Islamic Medicine and Native American healing read the same symptoms.",
    sections: [
      {
        heading: "1 · Vasomotor symptoms — hot flashes, night sweats, palpitations",
        bullets: [
          "Ayurveda: excess Pitta (fire) trapped in the blood tissue (Rakta Dhatu).",
          "TCM: Kidney Yin deficiency leading to 'empty fire' flaring upward.",
          "Unani: accumulated metabolic vapours (Bukhārat) rising with a shift toward Barid Yabis.",
          "Siddha: aggravation of Azhi (fire humor) disrupting heat regulation.",
          "TAM: burnout of intrinsic moisture causing flares of innate heat.",
          "Native American: internal fire imbalance; heat trapped in the upper energetic centres.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            [
              "Ayurveda",
              "Sheetali pranayama; coconut oil or ghee on the soles before sleep",
              "Shatavari, Guduchi, Chandanasava",
            ],
            [
              "TCM",
              "Avoid spicy/fried food, alcohol, late hot baths; cooling Qigong",
              "Er-Xian Decoction, Liu Wei Di Huang Wan",
            ],
            [
              "Unani",
              "Cold-water foot baths; avoid heavy, spicy, stale foods",
              "Anisoon, Khameera Abshar, rosewater infusions",
            ],
            [
              "Siddha",
              "Ennei Muzhukku — cooling herbal oil baths",
              "Shatavari Chooranam, Mathulai Manappagu",
            ],
            [
              "TAM",
              "Cold-infused floral waters; sun avoidance at peak hours; hijama when indicated",
              "Damask rose, hibiscus, spearmint, wild rue",
            ],
            [
              "Native American",
              "Sweetgrass or sage smudge baths; forest walking; cold river foot dips",
              "Black cohosh, sage tea, blue cohosh",
            ],
          ],
        },
      },
      {
        heading: "2 · Neurological & cognitive — brain fog, memory lapses, poor focus",
        bullets: [
          "Ayurveda: Vata invading Manovaha Srotas, the mind channels.",
          "TCM: Kidney Essence (Jing) failing to nourish the 'Sea of Marrow'.",
          "Unani: coldness affecting the anterior ventricle, dulling Quwwat-e-Hafiza.",
          "Siddha: depletion of Ojas with elevated Vazhi in the head.",
          "TAM: dry-cold humor accumulating in the Dimaagh, slowing signal translation.",
          "Native American: disconnection of the mind-spirit axis; loss of grounding root energy.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            ["Ayurveda", "Daily nasya with warm oil; grounding meditation", "Brahmi, Gotu Kola, Saraswatarishta"],
            ["TCM", "Slow Tai Chi; sleep before 11 PM to protect Jing", "Yi Gan San, Tian Wang Bu Xin Dan"],
            ["Unani", "Rose or lavender inhalation; warm head massage", "Badranjboya, Khamira Gaozaban, Ustukhuddus"],
            ["Siddha", "Varmam point stimulation at head and neck", "Vallarai Chooranam, Seenthil Chooranam"],
            ["TAM", "Steam with black seed and rosemary; frankincense head oil", "Habb-e-Ayaarij, Nigella sativa, lemon balm"],
            ["Native American", "Morning sun gazing; storytelling; drumming", "Ginkgo, American ginseng, cedar leaf, skullcap"],
          ],
        },
      },
      {
        heading: "3 · Mental health — anxiety, irritability, low mood",
        bullets: [
          "Ayurveda: Vata drives panic; excess Pitta drives sharp irritability.",
          "TCM: Liver Qi stagnation creating heat, or Heart-Kidney non-interaction.",
          "Unani: abnormal Sauda (black bile) disturbing the Ruh.",
          "Siddha: imbalance between Vazhi (panic) and Azhi (irritability).",
          "TAM: trapped black-bile vapours disrupting the vital spirit.",
          "Native American: imbalance between the eastern and southern quadrants of the medicine wheel.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            ["Ayurveda", "Abhyanga with warm sesame oil; nadi shodhana", "Ashwagandha, Jatamansi, Mukta Vati"],
            ["TCM", "Journaling and light walking; avoid repressed emotion", "Jia Wei Xiao Yao San"],
            ["Unani", "Dalk massage; pleasant auditory stimulation", "Zafran, Asgandh, Jawarish Shahi"],
            ["Siddha", "Grounding practice; mineral-rich foods", "Amuri preparations, Aswagandhi Chooranam"],
            ["TAM", "Calming recitation or nature sound; herbal steam; community", "Saffron, chamomile, borage, St John's wort"],
            ["Native American", "Sweat lodge; sage, sweetgrass and cedar smudge", "Passionflower, lemon balm, motherwort, birch bark"],
          ],
        },
      },
      {
        heading: "4 · Musculoskeletal — joint ache, weakness, bone loss",
        bullets: [
          "Ayurveda: depletion of Asthi and Mamsa Dhatu driven by high Vata.",
          "TCM: weakening Kidneys (bones) and Liver/Spleen (tendons, muscles).",
          "Unani: Barid Yabis dominance in the joints and sinews.",
          "Siddha: Thathu Ksheyam — tissue decay, specifically bone.",
          "TAM: dryness overriding synovial fluid, causing friction.",
          "Native American: drying of the earth element; loss of marrow strength.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            ["Ayurveda", "Progressive resistance training; castor oil packs", "Yograj Guggulu, Lakshadi Guggulu, Hadjod"],
            ["TCM", "Weight-bearing movement; moxibustion on joint points", "Du Huo Ji Sheng Tang, Guchuanning"],
            ["Unani", "Warm hydrotherapy; Roghan-e-Malkangni locally", "Suranjan, Asgandh, Kushta preparations"],
            ["Siddha", "Varmam therapy at bone and joint junctions", "Nandhi Mezhugu, mineral bhasmas"],
            ["TAM", "Warm oil liniment; clay poultices on knees and low back", "Colchicum, frankincense, fenugreek, olive oil"],
            ["Native American", "Warm river stone compresses; daily gentle walking", "Horsetail, yucca root, willow bark, Solomon's seal"],
          ],
        },
      },
      {
        heading: "5 · Genitourinary / GSM — dryness, pain, urgency",
        bullets: [
          "Ayurveda: Vata dryness in Artava Vaha Srotas.",
          "TCM: lack of Yin fluids; weakened Ren and Chong vessels.",
          "Unani: loss of Rutoobat in the uterine tissues.",
          "Siddha: drying of reproductive fluids from elevated Vazhi.",
          "TAM: loss of innate pelvic moisture balance.",
          "Native American: recession of the water element in the womb space.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            ["Ayurveda", "Yoni pichu with Shatavari oil or ghee", "Shatavari, Phala Ghrita"],
            ["TCM", "Pelvic floor awareness; avoid douching and harsh soaps", "Zuo Gui Wan, Zi Yin herb baths"],
            ["Unani", "Pashoya — warm herbal sitz baths", "Gul-e-Tesu sitz baths, Aabzen formulations"],
            ["Siddha", "Cooling medicated sesame oil applications", "Shatavari Ghiritham, Triphala washes"],
            ["TAM", "Sitz baths with mucilaginous herbs; pelvic oiling", "Marshmallow root, malva, rose petals, myrrh"],
            ["Native American", "Pelvic warmth rituals; gentle womb steams", "Slippery elm, marshmallow root, uva ursi, cranberry leaf"],
          ],
        },
      },
      {
        heading: "6 · Metabolic & digestive — visceral weight, insulin resistance",
        bullets: [
          "Ayurveda: weakened Agni allowing Ama to accumulate.",
          "TCM: Spleen Qi deficiency causing dampness and phlegm.",
          "Unani: Du'f-e-Hazm allowing abnormal Balgham to build.",
          "Siddha: sluggish Iyam causing tissue congestion.",
          "TAM: failure of the first and second concoctions in stomach and liver.",
          "Native American: slowed internal fire; stagnant inner river currents.",
        ],
        table: {
          columns: ["Tradition", "Daily practice", "Classical remedies"],
          rows: [
            ["Ayurveda", "12–14 hour overnight fast; largest meal at midday", "Triphala, Trikatu, Vrikshamla"],
            ["TCM", "No iced or raw food; warm, cooked, easy meals", "Shen Ling Bai Zhu San"],
            ["Unani", "Walk after meals; warm bitter greens", "Ajwain, Zeera, Jawarish Kamuni"],
            ["Siddha", "Bitter greens, millets, fibre-forward eating", "Sukhukku compounds, Nandhi Mezhugu"],
            ["TAM", "Warm honey water in the morning; no raw food after sunset", "Cumin, black seed, ginger, cinnamon"],
            ["Native American", "Wild, unrefined, bitter-rich diet; post-meal walks", "Dandelion root, nopal, juniper berry, wild ginger"],
          ],
        },
      },
      {
        heading: "The universal synthesis",
        bullets: [
          "Moisten and nourish the dryness — warm healthy fats and mucilaginous herbs.",
          "Clear trapped internal heat — cooling bitters, flower infusions, breathwork.",
          "Protect the nervous system and spirit — daily grounding, not occasional rescue.",
          "Ignite and protect metabolic fire — warm cooked meals, bitter roots, digestive spices.",
          "Reframe the stage — not a disease of deficiency, but a transition into wisdom.",
        ],
      },
    ],
  },
  {
    slug: "estrogen-map",
    title: "Estrogen body map",
    kicker: "Head to toe",
    summary: "Every part of the body where the loss of estrogen shows up.",
    sections: [
      {
        heading: "Why one hormone touches everything",
        body: [
          "Estrogen receptors are not confined to the reproductive tract. They sit in the brain, bone, skin, gut, blood vessels, joints, bladder and eyes — which is why the transition is felt everywhere at once, and why single-symptom medicine keeps missing it.",
        ],
      },
    ],
  },
];

export const BODY_MAP: {
  id: string;
  region: string;
  title: string;
  effects: string[];
  side: "left" | "right";
  top: string;
}[] = [
  {
    id: "brain",
    region: "Brain",
    title: "Brain & nerves",
    side: "left",
    top: "6%",
    effects: [
      "Slowed glucose metabolism, brain fog, word-finding trouble",
      "GABA calming disrupted — anxiety, stress sensitivity",
      "Serotonin, dopamine and norepinephrine pathways destabilised",
      "Hypothalamic thermostat misfires — hot flashes, night sweats",
    ],
  },
  {
    id: "eyes",
    region: "Eyes & mouth",
    title: "Eyes, mouth & skin",
    side: "right",
    top: "17%",
    effects: [
      "Dry eye, altered tear film",
      "Dry mouth, burning mouth, gum recession",
      "Collagen loss — thinner, drier, slower-healing skin",
      "Hair thinning at the crown, new facial hair",
    ],
  },
  {
    id: "heart",
    region: "Heart",
    title: "Heart & vessels",
    side: "left",
    top: "30%",
    effects: [
      "Palpitations and blood pressure shifts",
      "Rising LDL, falling HDL",
      "Loss of estrogen's vascular protection",
    ],
  },
  {
    id: "breast",
    region: "Breast",
    title: "Breasts",
    side: "right",
    top: "38%",
    effects: ["Tenderness and swelling with hormone swings", "Density and texture changes"],
  },
  {
    id: "metabolism",
    region: "Metabolism",
    title: "Metabolism & gut",
    side: "left",
    top: "50%",
    effects: [
      "Fat redistribution toward the abdomen",
      "Reduced insulin sensitivity",
      "Bloating, altered gut motility and microbiome",
    ],
  },
  {
    id: "pelvis",
    region: "Pelvis",
    title: "Genitourinary (GSM)",
    side: "right",
    top: "60%",
    effects: [
      "Vaginal dryness, loss of elasticity, painful intercourse",
      "Urinary urgency, frequency, nocturia",
      "Recurrent UTIs, altered vaginal flora",
    ],
  },
  {
    id: "bones",
    region: "Bones",
    title: "Bones, joints & muscle",
    side: "left",
    top: "72%",
    effects: [
      "Accelerated bone resorption",
      "Cartilage thinning, frozen shoulder, joint ache",
      "Sarcopenia — muscle mass and strength decline (MSM)",
    ],
  },
  {
    id: "sleep",
    region: "Sleep",
    title: "Sleep & energy",
    side: "right",
    top: "84%",
    effects: [
      "Fragmented sleep and 3 AM waking",
      "Night sweats interrupting restorative rest",
      "Daytime fatigue that rest doesn't fix",
    ],
  },
];

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}
