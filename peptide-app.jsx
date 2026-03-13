import { useState, useCallback, useRef, useEffect } from "react";

const PEPTIDES = [
  {
    id: "semaglutide", name: "Semaglutide (GLP-1)", category: "Fat Loss / Metabolic",
    purpose: "Weight loss, blood sugar regulation, appetite suppression via GLP-1 receptor agonism",
    dosage: { typical: "0.25–2.0 mg", unit: "mg", min: 0.25, max: 2.0 },
    frequency: "1x weekly", timing: "AM or PM", cycle: "8–48 weeks", route: "SubQ injection",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Decreased appetite", "Fatigue", "Injection site reactions"],
    warnings: ["Titrate monthly: 0.25→0.5→0.75→1.0→2.0 mg", "Potential risk of thyroid C-cell tumors (animal data)", "Contraindicated with personal/family history of medullary thyroid carcinoma", "Monitor for pancreatitis symptoms", "Not for use without supervision in T1DM"],
    notes: "Most studied GLP-1 agonist. Monthly titration mandatory to minimise GI side effects.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["NEJM STEP Trials (2021) – PMID: 34706426", "FDA Wegovy Approval 2021"]
  },
  {
    id: "tirzepatide", name: "Tirzepatide (GLP-1/GIP)", category: "Fat Loss / Metabolic",
    purpose: "Dual GLP-1/GIP agonist for enhanced weight loss, metabolic health, and blood sugar regulation",
    dosage: { typical: "2.5–7.5 mg", unit: "mg", min: 2.5, max: 7.5 },
    frequency: "1x weekly", timing: "AM or PM", cycle: "8–48 weeks", route: "SubQ injection",
    sideEffects: ["Nausea", "Vomiting", "Diarrhea", "Reduced appetite", "Fatigue", "Injection site reactions", "Hypoglycemia (with insulin)"],
    warnings: ["Monthly titration: 2.5→5→7.5 mg", "Consider split microdosing for GI tolerance", "More potent than semaglutide – titrate cautiously", "Monitor for pancreatitis", "Contraindicated in MEN2 or medullary thyroid carcinoma history"],
    notes: "Dual agonist – potentially superior fat loss to semaglutide alone. SURMOUNT trials showed >20% body weight reduction.",
    reconstitution: { vialMg: 10, bacMl: 1, concentration: 10 },
    sources: ["NEJM SURMOUNT-1 (2022) – PMID: 36331190", "FDA Mounjaro Approval 2022"]
  },
  {
    id: "retatrutide", name: "Retatrutide (GLP-1/GIP/Glucagon)", category: "Fat Loss / Metabolic",
    purpose: "Triple agonist for intensive metabolic support, thermogenesis, and fat oxidation",
    dosage: { typical: "0.5–2.0 mg", unit: "mg", min: 0.5, max: 2.0 },
    frequency: "1x weekly", timing: "AM or PM", cycle: "8–48 weeks", route: "SubQ injection",
    sideEffects: ["Nausea", "Vomiting", "GI distress", "Dizziness", "Injection site reactions"],
    warnings: ["Early-phase research – titrate very slowly: 0.5→1→2 mg", "Triple agonism = stronger effects, higher risk profile", "Monitor cardiovascular response", "Limited long-term human safety data"],
    notes: "Emerging triple agonist. Phase 2 trials showed remarkable metabolic outcomes. Research use only.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["NEJM Phase 2 Trial (2023) – PMID: 37505497", "Eli Lilly Pipeline Data"]
  },
  {
    id: "aod9604", name: "AOD-9604", category: "Fat Loss / Metabolic",
    purpose: "Targeted lipolysis (fat burning) without affecting blood glucose or growth",
    dosage: { typical: "300 mcg daily (or 250 mcg BID)", unit: "mcg", min: 250, max: 500 },
    frequency: "3–5x weekly", timing: "AM (fasted)", cycle: "4–8 weeks", route: "SubQ injection",
    sideEffects: ["Injection site redness", "Mild fatigue", "Headache (rare)"],
    warnings: ["Avoid eating 30 min post-dose", "C-terminal fragment of HGH – does not raise IGF-1", "Not for continuous long-term use"],
    notes: "HGH fragment 176-191. Stimulates lipolysis and inhibits lipogenesis. Pairs well with L-Carnitine.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Heffernan et al. (2001) Int J Obesity", "Ng et al. (2000) – PMID: 11158310"]
  },
  {
    id: "motsc", name: "MOTS-c", category: "Fat Loss / Metabolic",
    purpose: "Mitochondrial energy regulation, insulin sensitisation, metabolic homeostasis",
    dosage: { typical: "0.5–1.0 mg", unit: "mg", min: 0.5, max: 1.0 },
    frequency: "3–5x weekly", timing: "AM (pre-workout)", cycle: "6–8 weeks", route: "SubQ injection",
    sideEffects: ["Generally well tolerated", "Mild injection site reactions"],
    warnings: ["Best used pre-workout for optimal metabolic effect", "Pairs with NAD+ for synergistic benefit", "Research use only – limited human data"],
    notes: "Mitochondria-encoded peptide. Regulates AMPK pathway and exercise capacity.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Lee et al. (2015) Cell Metabolism – PMID: 25738459", "Kim et al. (2018) Nat Commun"]
  },
  {
    id: "tesamorelin", name: "Tesamorelin", category: "Muscle Building / Strength",
    purpose: "Potent GHRH analog for GH stimulation, lean muscle mass, and visceral fat reduction",
    dosage: { typical: "1.0 mg", unit: "mg", min: 1.0, max: 1.0 },
    frequency: "5 days on / 2 off", timing: "AM or PM (fasted)", cycle: "6–12 weeks", route: "SubQ injection",
    sideEffects: ["Water retention", "Joint pain", "Carpal tunnel symptoms", "Tingling/numbness", "Injection site reactions", "Increased IGF-1"],
    warnings: ["Must be administered in fasted state for optimal GH pulse", "Monitor IGF-1 levels", "Avoid in active malignancy", "Caution in diabetics – can affect insulin sensitivity"],
    notes: "FDA-approved (Egrifta) for HIV-associated lipodystrophy. Strong GHRH analog.",
    reconstitution: { vialMg: 5, bacMl: 1, concentration: 5 },
    sources: ["Falutz et al. (2010) JCEM – PMID: 20818903", "FDA Egrifta Label 2010"]
  },
  {
    id: "ipamorelin", name: "Ipamorelin", category: "Muscle Building / Strength",
    purpose: "Growth hormone releasing peptide – lean mass, recovery, anti-aging, minimal side effects",
    dosage: { typical: "200–300 mcg", unit: "mcg", min: 200, max: 300 },
    frequency: "5 days on / 2 off", timing: "PM (fasted 2–3h)", cycle: "6–12 weeks", route: "SubQ injection",
    sideEffects: ["Mild water retention", "Tingling sensation", "Increased hunger", "Injection site reactions"],
    warnings: ["Fasted state required for optimal GH pulse", "Low cortisol/prolactin impact vs other GHRPs", "Stack with CJC-1295 for dual-pathway GH release"],
    notes: "Most selective GHRP. Excellent safety profile. First-line recommendation for GH peptide beginners.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Raun et al. (1998) Eur J Endocrinol", "Bowers et al. (1991) – PMID: 8222114"]
  },
  {
    id: "cjc1295", name: "CJC-1295 (no DAC)", category: "Muscle Building / Strength",
    purpose: "Short-acting GHRH analog for natural GH pulsation, muscle repair, fat loss",
    dosage: { typical: "200–250 mcg", unit: "mcg", min: 200, max: 250 },
    frequency: "5 days on / 2 off", timing: "PM (fasted 2–3h)", cycle: "6–12 weeks", route: "SubQ injection",
    sideEffects: ["Water retention", "Fatigue", "Flushing", "Headache"],
    warnings: ["No DAC preferred for physiologic pulsatile release (vs sustained)", "Must be fasted for efficacy", "Combine with Ipamorelin for dual-pathway GH release"],
    notes: "Short half-life (~30 min). Mimics natural GHRH. Synergistic with Ipamorelin.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Teichman et al. (2006) JCEM – PMID: 16822960", "Alba et al. (2006)"]
  },
  {
    id: "sermorelin", name: "Sermorelin Acetate", category: "Muscle Building / Strength",
    purpose: "Physiologic GH pulses, anti-aging, sleep quality improvement, lean mass support",
    dosage: { typical: "200–250 mcg", unit: "mcg", min: 200, max: 250 },
    frequency: "5 days on / 2 off", timing: "PM (fasted 2–3h)", cycle: "6–12 weeks", route: "SubQ injection",
    sideEffects: ["Flushing", "Headache", "Dizziness", "Injection site pain", "Mild water retention"],
    warnings: ["Oldest and most studied GHRH analog", "Fast before administration", "Contraindicated in active malignancy"],
    notes: "First 29 amino acids of GHRH. FDA-approved for GH deficiency in children. Well-established safety data.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Walker et al. (1990) JCEM", "FDA Geref Approval Data"]
  },
  {
    id: "bpc157", name: "BPC-157", category: "Healing / Regeneration / Gut",
    purpose: "Accelerated tissue healing, gut repair, tendon/ligament regeneration, anti-inflammatory",
    dosage: { typical: "250–500 mcg daily", unit: "mcg", min: 250, max: 500 },
    frequency: "Daily", timing: "AM or PM", cycle: "4–12 weeks", route: "SubQ injection (or oral for gut)",
    sideEffects: ["Generally very well tolerated", "Mild injection site reactions", "Nausea (rare, high doses)"],
    warnings: ["No completed human clinical trials – animal data only", "Derived from gastric juice protein BPC", "Oral route less bioavailable but effective for GI issues", "Theoretical concern: may promote angiogenesis in tumors"],
    notes: "Body Protective Compound-157. Highly researched healing peptide. Pairs with TB-500. One of the most popular research peptides.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Sikiric et al. (2018) Curr Pharm Des – PMID: 29500758", "Chang et al. (2011) – PMID: 21205884"]
  },
  {
    id: "tb500", name: "TB-500 (Thymosin Beta-4 analog)", category: "Healing / Regeneration / Gut",
    purpose: "Tissue repair, angiogenesis, anti-inflammatory, cell migration, muscle healing",
    dosage: { typical: "500 mcg daily", unit: "mcg", min: 500, max: 500 },
    frequency: "Daily", timing: "AM", cycle: "6–12 weeks", route: "SubQ injection",
    sideEffects: ["Injection site reactions", "Mild fatigue", "Head rush (rare, high doses)"],
    warnings: ["Not full Thymosin Beta-4 – synthetic analog fragment", "Research use only", "Theoretical oncogenic concern at very high doses"],
    notes: "Active fragment of Thymosin Beta-4. Promotes actin polymerisation, angiogenesis, and tissue remodelling.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Goldstein et al. (2012) Ann NY Acad Sci", "Sosne et al. (2007) – PMID: 17428493"]
  },
  {
    id: "ghkcu", name: "GHK-Cu (Copper Peptide)", category: "Healing / Regeneration / Gut",
    purpose: "Skin and tissue regeneration, collagen synthesis, wound healing, anti-inflammatory",
    dosage: { typical: "1.7–2.0 mg daily", unit: "mg", min: 1.7, max: 2.0 },
    frequency: "Daily", timing: "AM", cycle: "4–8 weeks", route: "SubQ injection or topical",
    sideEffects: ["Injection site stinging/burning", "Skin discoloration (topical)", "Mild redness"],
    warnings: ["Can sting significantly – dilute with additional BAC water to reduce burn", "Higher concentration vials require greater dilution", "Avoid near eyes"],
    notes: "Naturally occurring copper-binding tripeptide. Strong evidence for collagen synthesis and antioxidant activity.",
    reconstitution: { vialMg: 50, bacMl: 3, concentration: 17 },
    sources: ["Pickart & Margolina (2018) Biomolecules – PMID: 29785516", "Pickart (2008) J Biomater Sci"]
  },
  {
    id: "kpv", name: "KPV", category: "Healing / Regeneration / Gut",
    purpose: "Anti-inflammatory, gut lining repair, IBD support, melanocortin pathway modulation",
    dosage: { typical: "250–500 mcg per dose", unit: "mcg", min: 250, max: 500 },
    frequency: "5 days on / 2 off", timing: "AM", cycle: "8 weeks", route: "SubQ injection or oral",
    sideEffects: ["Generally very well tolerated", "Mild injection site reactions"],
    warnings: ["Pairs with BPC-157 for enhanced gut healing", "Research use only – limited human data"],
    notes: "C-terminal tripeptide of alpha-MSH (Lys-Pro-Val). Strong anti-inflammatory, especially gut mucosa.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Catania & Lipton (1993) – PMID: 7678583", "Martin et al. (2009) JPET"]
  },
  {
    id: "epitalon", name: "Epitalon", category: "Longevity / Mitochondrial",
    purpose: "Telomere extension, pineal regulation, anti-aging, melatonin production support",
    dosage: { typical: "1–2 mg nightly", unit: "mg", min: 1, max: 2 },
    frequency: "Daily (20-day courses)", timing: "PM", cycle: "20 days; repeat 2–3x/year", route: "SubQ injection",
    sideEffects: ["Generally very well tolerated", "Mild injection site reactions"],
    warnings: ["Course-based only – not for continuous use", "Maximum 2–3 cycles per year", "Long-term human safety data limited"],
    notes: "Tetrapeptide developed by Prof. Vladimir Khavinson. Activates telomerase enzyme. Extensively studied in Russian longevity research.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Khavinson et al. (2003) Neuroendocrinol Lett – PMID: 12660824", "Anisimov et al. (2006)"]
  },
  {
    id: "nadplus", name: "NAD+", category: "Longevity / Mitochondrial",
    purpose: "Cellular energy production, DNA repair, sirtuin activation, cognitive and metabolic support",
    dosage: { typical: "20–100 mg per injection", unit: "mg", min: 20, max: 100 },
    frequency: "2–3x weekly", timing: "AM", cycle: "Ongoing", route: "SubQ injection (IM optional)",
    sideEffects: ["Flushing", "Nausea", "Transient fatigue", "Chest tightness (IV route)", "Injection site reactions"],
    warnings: ["IV route requires strict medical supervision", "SubQ/IM are safer preferred routes", "Start at 20 mg to assess tolerance", "May temporarily worsen fatigue before improving energy"],
    notes: "Essential coenzyme for 500+ enzymatic reactions. Critical for sirtuin (SIRT1-7) activation and NAD+/NADH ratio.",
    reconstitution: { vialMg: 500, bacMl: 5, concentration: 100 },
    sources: ["Rajman et al. (2018) Cell Metabolism – PMID: 29514064", "Yoshino et al. (2021) Science"]
  },
  {
    id: "ss31", name: "SS-31 (Elamipretide)", category: "Longevity / Mitochondrial",
    purpose: "Targeted mitochondrial repair, cardiolipin stabilisation, oxidative stress reduction",
    dosage: { typical: "0.5–1 mg per injection", unit: "mg", min: 0.5, max: 1.0 },
    frequency: "5 days on / 2 off", timing: "AM", cycle: "6–8 weeks", route: "SubQ injection",
    sideEffects: ["Injection site reactions", "Generally well tolerated"],
    warnings: ["In clinical trials for heart failure – limited human safety data", "Research use only", "Contact reputable source for protocol guidance"],
    notes: "Szeto-Schiller peptide. Targets inner mitochondrial membrane cardiolipin. Promising in heart failure Phase 2/3 trials.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Szeto (2014) Pharm Res – PMID: 24122777", "Gibson et al. (2022) JACC Heart Failure"]
  },
  {
    id: "semax", name: "Semax", category: "Brain / Cognitive / Mood",
    purpose: "Cognitive enhancement, BDNF upregulation, focus, neuroprotection, stroke recovery support",
    dosage: { typical: "0.5–1 mg per dose", unit: "mg", min: 0.5, max: 1.0 },
    frequency: "2–3 days/week", timing: "AM only", cycle: "4–6 weeks", route: "Intranasal or SubQ",
    sideEffects: ["Nasal irritation (intranasal route)", "Mild anxiety or irritability (high doses)", "Headache (rare)", "Sleep disturbance if taken late"],
    warnings: ["Take morning only – may significantly disrupt sleep if taken after noon", "Cycle off to prevent tolerance buildup", "Do not use continuously", "May exacerbate anxiety in sensitive individuals"],
    notes: "ACTH(4-7)PGP analog. Used clinically in Russia for ischemic stroke. Strong BDNF stimulator.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Dolotov et al. (2006) CNS Drug Rev – PMID: 17227286", "Levitskaya et al. (2008)"]
  },
  {
    id: "selank", name: "Selank", category: "Brain / Cognitive / Mood",
    purpose: "Anxiety reduction, mood stabilisation, GABA pathway modulation, mild cognitive support",
    dosage: { typical: "250 mcg per dose", unit: "mcg", min: 250, max: 250 },
    frequency: "2–3 days/week", timing: "AM", cycle: "4–6 weeks", route: "Intranasal or SubQ",
    sideEffects: ["Mild drowsiness", "Nasal irritation (intranasal)", "Generally very well tolerated"],
    warnings: ["GABA-linked mechanism – may cause mild sedation", "Do not combine with benzodiazepines", "Cycle to prevent tolerance", "Potential for psychological dependency – limited data"],
    notes: "Heptapeptide derived from tuftsin. Anxiolytic without dependency profile. Developed at Institute of Molecular Genetics, Moscow.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Semenova et al. (2010) CNS Drug Rev", "Zolotarev et al. (2006)"]
  },
  {
    id: "pinealon", name: "Pinealon", category: "Brain / Cognitive / Mood",
    purpose: "Brain longevity, neuroprotection, cognitive aging support, pineal gland modulation",
    dosage: { typical: "2 mg per dose", unit: "mg", min: 2, max: 2 },
    frequency: "Daily", timing: "PM", cycle: "30 days", route: "SubQ injection",
    sideEffects: ["Generally well tolerated", "Mild transient fatigue"],
    warnings: ["Course-based – 30 days then take a break", "Limited human clinical data", "Research use only"],
    notes: "Tripeptide (EDR) from pineal gland. Developed by Prof. Khavinson. Neuroprotective and brain longevity research.",
    reconstitution: { vialMg: 5, bacMl: 1, concentration: 5 },
    sources: ["Khavinson et al. (2012) Bull Exp Biol Med", "Tendler et al. (2013)"]
  },
  {
    id: "dsip", name: "DSIP (Delta Sleep-Inducing Peptide)", category: "Sleep & Sexual Health",
    purpose: "Deep sleep induction, sleep architecture improvement, cortisol reduction",
    dosage: { typical: "250 mcg per dose", unit: "mcg", min: 250, max: 250 },
    frequency: "5 days on / 2 off", timing: "1–3 hours before bed", cycle: "6–8 weeks", route: "SubQ injection or intranasal",
    sideEffects: ["Drowsiness", "Mild dizziness", "Generally well tolerated"],
    warnings: ["Do not operate machinery after administration", "Administer only before bed", "Research use only – limited modern human data"],
    notes: "Naturally occurring neuropeptide. Modulates delta-wave sleep. Reduces LH and corticotropin.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Graf & Kastin (1984) Neurosci Biobehav Rev", "Kastin et al. (1981) – PMID: 6117538"]
  },
  {
    id: "pt141", name: "PT-141 (Bremelanotide)", category: "Sleep & Sexual Health",
    purpose: "Libido enhancement, sexual arousal, erectile function support (both sexes)",
    dosage: { typical: "200–500 mcg as needed", unit: "mcg", min: 200, max: 500 },
    frequency: "As needed", timing: "30–60 min pre-activity", cycle: "As needed", route: "SubQ injection, IM optional, or nasal spray",
    sideEffects: ["Nausea", "Flushing", "Headache", "Transient blood pressure increase", "Hyperpigmentation (repeated use)", "Yawning"],
    warnings: ["Can cause significant transient hypertension – caution with cardiovascular conditions", "Do not use more than once per 72 hours", "Monitor for unusual mole changes (hyperpigmentation risk)", "FDA-approved Vyleesi (1.75 mg SC) for premenopausal HSDD"],
    notes: "Melanocortin-4 receptor agonist. Works centrally (brain), not peripherally like PDE5 inhibitors. FDA-approved version exists.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["FDA Vyleesi Approval (2019)", "Diamond et al. (2006) – PMID: 16812650"]
  },
  {
    id: "kisspeptin", name: "Kisspeptin", category: "Sleep & Sexual Health",
    purpose: "Reproductive hormone axis regulation, libido enhancement, LH/FSH stimulation",
    dosage: { typical: "125 mcg nightly", unit: "mcg", min: 125, max: 125 },
    frequency: "Daily", timing: "1 hour before bed", cycle: "30 days on / 30 days off", route: "SubQ injection",
    sideEffects: ["Generally well tolerated", "Mild injection site reactions", "Hormonal fluctuations"],
    warnings: ["Strict 30 days on / 30 days off cycling required", "May affect hormonal contraception efficacy", "Avoid during pregnancy or fertility treatments without supervision"],
    notes: "Regulates GnRH pulse secretion. Supports natural hypothalamic-pituitary-gonadal (HPG) axis.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Skorupskaite et al. (2014) – PMID: 24847104", "Jayasena et al. (2014) J Clin Endocrinol"]
  },
  {
    id: "melanotan1", name: "Melanotan I", category: "Beauty & Skin",
    purpose: "Skin photoprotection, melanin stimulation, UV-independent tanning",
    dosage: { typical: "250 mcg per dose", unit: "mcg", min: 250, max: 250 },
    frequency: "2x per week", timing: "PM (or post-food to reduce nausea)", cycle: "6–8 weeks", route: "SubQ injection",
    sideEffects: ["Nausea", "Facial flushing", "Yawning", "Fatigue"],
    warnings: ["Take with food to reduce nausea", "Lower sexual side effects than Melanotan II", "Monitor all skin lesions/moles for changes", "Avoid in personal/family history of melanoma"],
    notes: "Alpha-MSH analog. Stimulates melanocytes for protective tanning. Less potent sexual effects than MT-II.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Dorr et al. (1994) JAMA", "Levine et al. (1991) J Invest Dermatol"]
  },
  {
    id: "melanotan2", name: "Melanotan II", category: "Beauty & Skin",
    purpose: "Enhanced tanning, libido stimulation, appetite suppression",
    dosage: { typical: "250 mcg per dose", unit: "mcg", min: 100, max: 250 },
    frequency: "2x per week", timing: "PM (post-food)", cycle: "6–8 weeks", route: "SubQ injection",
    sideEffects: ["Nausea", "Facial flushing", "Spontaneous erections (males)", "Darkening of moles/freckles", "Decreased appetite", "Hypertension"],
    warnings: ["More potent than MT-I with significant sexual side effects", "Start very low (100 mcg) to assess tolerance", "Monitor all skin lesions carefully – can cause significant hyperpigmentation", "NOT recommended with history of melanoma or dysplastic nevi", "Strong blood pressure effects – monitor closely"],
    notes: "Highly potent cyclic analog. Significant melanotropic and sexual effects. Monitor skin lesions diligently.",
    reconstitution: { vialMg: 10, bacMl: 2, concentration: 5 },
    sources: ["Hadley (2005) Peptides – PMID: 15638013", "Dorr et al. (1996)"]
  },
  {
    id: "thymosin_alpha1", name: "Thymosin Alpha-1 (TA1)", category: "Immunity / Resilience",
    purpose: "T-cell maturation, immune modulation, antiviral defense, cancer adjunct therapy",
    dosage: { typical: "0.8–1.6 mg per dose", unit: "mg", min: 0.8, max: 1.6 },
    frequency: "5 days on / 2 off", timing: "AM", cycle: "6–8 weeks", route: "SubQ injection",
    sideEffects: ["Generally very well tolerated", "Mild injection site reactions", "Rare: fatigue"],
    warnings: ["Avoid during active autoimmune disease flares without medical supervision", "FDA-approved in 37+ countries for hepatitis B/C (Zadaxin)", "May interact with immunosuppressant medications"],
    notes: "FDA-approved (Zadaxin) in many countries. Gold standard peptide for immune modulation. Activates T-helper cells and NK cells.",
    reconstitution: { vialMg: 5, bacMl: 2, concentration: 2.5 },
    sources: ["Goldstein et al. (1981) Science – PMID: 7291992", "Thymalfasin clinical reviews"]
  },
];

const CATEGORIES = ["All", ...new Set(PEPTIDES.map(p => p.category))];

const CAT_COLORS = {
  "Fat Loss / Metabolic": "#f59e0b",
  "Muscle Building / Strength": "#ef4444",
  "Healing / Regeneration / Gut": "#10b981",
  "Longevity / Mitochondrial": "#8b5cf6",
  "Brain / Cognitive / Mood": "#3b82f6",
  "Sleep & Sexual Health": "#ec4899",
  "Beauty & Skin": "#f97316",
  "Immunity / Resilience": "#06b6d4"
};

const CAT_ICONS = {
  "Fat Loss / Metabolic": "🔥",
  "Muscle Building / Strength": "💪",
  "Healing / Regeneration / Gut": "🌿",
  "Longevity / Mitochondrial": "⚡",
  "Brain / Cognitive / Mood": "🧠",
  "Sleep & Sexual Health": "🌙",
  "Beauty & Skin": "✨",
  "Immunity / Resilience": "🛡️"
};

const FREQ_DAYS = {
  "Daily": [0,1,2,3,4,5,6],
  "1x weekly": [1],
  "5 days on / 2 off": [1,2,3,4,5],
  "3–5x weekly": [1,3,5],
  "2–3 days/week": [1,3,5],
  "2x per week": [1,4],
  "As needed": [],
  "Daily (20-day courses)": [0,1,2,3,4,5,6],
};

export default function PeptideApp() {
  const [tab, setTab] = useState("library");
  const [search, setSearch] = useState("");
  const [selCat, setSelCat] = useState("All");
  const [selPeptide, setSelPeptide] = useState(null);
  const [scheduled, setScheduled] = useState([]);
  const [calMonth, setCalMonth] = useState(new Date(2026, 2, 1));
  const [aiMsgs, setAiMsgs] = useState([{
    role:"assistant",
    content:"Hello! I'm your **Peptide Research AI**, powered by reputable scientific literature.\n\nI can help with:\n• Protocol guidance & stacking strategies\n• Side effect management\n• Reconstitution & dosing calculations\n• Research citations & study summaries\n\n⚠️ *Educational/research use only. Always consult a qualified healthcare professional before use.*"
  }]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [conc, setConc] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("mcg");
  const [vialMg, setVialMg] = useState("");
  const [bacMl, setBacMl] = useState("");
  const [schedModal, setSchedModal] = useState(null);
  const [schedForm, setSchedForm] = useState({ startDate: new Date().toISOString().split("T")[0], weeks: 8, time: "AM", dose: "" });
  // Inline reconstitution + dose calculator state (per peptide detail view)
  const [inlineVialMg, setInlineVialMg] = useState("");
  const [inlineBacMl, setInlineBacMl] = useState("");
  const [inlineDose, setInlineDose] = useState("");
  const [inlineDoseUnit, setInlineDoseUnit] = useState("mcg");
  const chatRef = useRef(null);

  // Seed inline calculator whenever a peptide is selected
  useEffect(() => {
    if (selPeptide) {
      setInlineVialMg(String(selPeptide.reconstitution.vialMg));
      setInlineBacMl(String(selPeptide.reconstitution.bacMl));
      const startDose = selPeptide.dosage.min;
      const unit = selPeptide.dosage.unit;
      setInlineDose(String(startDose));
      setInlineDoseUnit(unit);
    }
  }, [selPeptide]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiMsgs]);

  const filtered = PEPTIDES.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) || p.purpose.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (selCat === "All" || p.category === selCat)
    );
  });

  const calcResult = useCallback(() => {
    const c = parseFloat(conc), d = parseFloat(dose);
    if (!c || !d || c <= 0) return null;
    const dMg = doseUnit === "mcg" ? d / 1000 : d;
    const vol = dMg / c;
    const units = vol * 100;
    return { vol: vol.toFixed(3), units: units.toFixed(1), volRnd: (Math.round(vol * 200) / 200).toFixed(3) };
  }, [conc, dose, doseUnit]);

  const inlineCalc = useCallback(() => {
    const vMg = parseFloat(inlineVialMg);
    const bMl = parseFloat(inlineBacMl);
    const d = parseFloat(inlineDose);
    if (!vMg || !bMl || bMl <= 0 || !d || d <= 0) return null;
    const concentrationMgMl = vMg / bMl;
    const doseMg = inlineDoseUnit === "mcg" ? d / 1000 : d;
    const volMl = doseMg / concentrationMgMl;
    const syringeUnits = volMl * 100;
    return {
      concentration: concentrationMgMl.toFixed(3).replace(/\.?0+$/, ""),
      vol: volMl.toFixed(3),
      volRounded: (Math.round(volMl * 200) / 200).toFixed(3),
      units: syringeUnits.toFixed(1),
    };
  }, [inlineVialMg, inlineBacMl, inlineDose, inlineDoseUnit]);
    const m = parseFloat(vialMg), b = parseFloat(bacMl);
    if (!m || !b || b <= 0) return null;
    const c = m / b;
    return { conc: c.toFixed(2), per100: (c * 0.1 * 1000).toFixed(1) };
  }, [vialMg, bacMl]);

  const getDayDoses = (y, m, d) => {
    const date = new Date(y, m, d);
    const dow = date.getDay();
    return scheduled.filter(sp => {
      const start = new Date(sp.startDate);
      const end = new Date(sp.endDate);
      start.setHours(0,0,0,0); end.setHours(23,59,59,999); date.setHours(12,0,0,0);
      if (date < start || date > end) return false;
      const days = FREQ_DAYS[sp.frequency] || [];
      if (!days.length) return false;
      if (sp.frequency === "5 days on / 2 off") {
        const diff = Math.floor((date - start) / 86400000);
        return (diff % 7) < 5;
      }
      return days.includes(dow);
    });
  };

  const addToCalendar = () => {
    if (!schedModal || !schedForm.startDate) return;
    const start = new Date(schedForm.startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + parseInt(schedForm.weeks) * 7);
    const displayDose = schedForm.dose || schedModal.dosage.typical + " " + schedModal.dosage.unit;
    setScheduled(prev => [...prev, {
      ...schedModal,
      startDate: schedForm.startDate,
      endDate: end.toISOString().split("T")[0],
      scheduledTime: schedForm.time,
      customDose: displayDose,
      schedId: Date.now()
    }]);
    setSchedModal(null);
    setTab("calendar");
  };

  const sendAI = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const msg = aiInput.trim();
    setAiInput("");
    const newMsgs = [...aiMsgs, { role:"user", content: msg }];
    setAiMsgs(newMsgs);
    setAiLoading(true);
    try {
      const ctx = PEPTIDES.map(p =>
        `${p.name}|${p.category}|Dose:${p.dosage.typical} ${p.dosage.unit}|${p.frequency}|${p.timing}|Cycle:${p.cycle}|Purpose:${p.purpose}|Warnings:${p.warnings.slice(0,2).join("; ")}`
      ).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are a rigorous peptide research assistant backed by peer-reviewed scientific literature. You provide accurate, evidence-based information drawing from PubMed, clinical trial data, and reputable pharmacology sources. You must:
1. ALWAYS cite specific studies (PMID, journal, year) when making claims
2. Distinguish between animal data and human clinical trial data
3. Include safety warnings and contraindications
4. Never give personalised medical advice – always remind users to consult a qualified healthcare professional
5. Be honest about research gaps and limitations
6. When discussing protocols, reference the peptide data below

PEPTIDE DATABASE:
${ctx}

DISCLAIMER: Always end responses with "⚠️ For educational/research purposes only. Consult a qualified healthcare professional before use."`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Unable to generate response. Please try again.";
      setAiMsgs(prev => [...prev, { role:"assistant", content: reply }]);
    } catch {
      setAiMsgs(prev => [...prev, { role:"assistant", content:"⚠️ Connection error. Please check your connection and try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth()+1, 0).getDate();
  const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const s = {
    root: { minHeight:"100vh", background:"#080c18", color:"#dde3f0", fontFamily:"'DM Sans',system-ui,sans-serif", display:"flex", flexDirection:"column" },
    header: { background:"linear-gradient(135deg,#0d1525 0%,#111b35 100%)", borderBottom:"1px solid #1e2d4a", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:60, flexShrink:0 },
    logo: { display:"flex", alignItems:"center", gap:12 },
    logoIcon: { width:36, height:36, background:"linear-gradient(135deg,#00d4b8,#0088ff)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 },
    logoText: { fontSize:18, fontWeight:700, color:"#fff", letterSpacing:"-0.3px" },
    logoSub: { fontSize:11, color:"#5a7a9a", letterSpacing:"0.5px", textTransform:"uppercase" },
    badge: { background:"rgba(0,212,184,0.12)", color:"#00d4b8", border:"1px solid rgba(0,212,184,0.3)", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600 },
    nav: { display:"flex", background:"#0d1525", borderBottom:"1px solid #1a2840", flexShrink:0 },
    navBtn: (active) => ({ padding:"14px 20px", cursor:"pointer", border:"none", background:"none", color: active ? "#00d4b8" : "#6b8099", fontSize:13, fontWeight:600, borderBottom: active ? "2px solid #00d4b8" : "2px solid transparent", transition:"all 0.2s", display:"flex", alignItems:"center", gap:6 }),
    main: { flex:1, overflow:"auto", padding:24 },
    disclaimer: { background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:10, padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:10, fontSize:12, color:"#c8a340" },
    searchRow: { display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" },
    input: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:10, padding:"10px 14px", color:"#dde3f0", fontSize:14, outline:"none", flex:1, minWidth:200 },
    select: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:10, padding:"10px 14px", color:"#dde3f0", fontSize:13, outline:"none", cursor:"pointer" },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 },
    card: (cat) => ({ background:"#0d1525", border:`1px solid ${CAT_COLORS[cat] || "#1e2d4a"}22`, borderRadius:14, padding:20, cursor:"pointer", transition:"all 0.2s", position:"relative", overflow:"hidden" }),
    catTag: (cat) => ({ display:"inline-flex", alignItems:"center", gap:5, background:`${CAT_COLORS[cat] || "#1e2d4a"}18`, color: CAT_COLORS[cat] || "#6b8099", border:`1px solid ${CAT_COLORS[cat] || "#1e2d4a"}44`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600, marginBottom:10 }),
    cardTitle: { fontSize:15, fontWeight:700, color:"#e8edf5", marginBottom:6 },
    cardPurpose: { fontSize:12, color:"#7a95b0", lineHeight:1.5, marginBottom:12 },
    cardMeta: { display:"flex", gap:8, flexWrap:"wrap" },
    metaPill: { background:"#111b35", border:"1px solid #1e2d4a", borderRadius:6, padding:"3px 8px", fontSize:11, color:"#8aa5bf" },
    detailPanel: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:16, padding:28 },
    detailHeader: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 },
    detailTitle: { fontSize:22, fontWeight:800, color:"#e8edf5", marginBottom:6 },
    closeBtn: { background:"#111b35", border:"1px solid #1e2d4a", borderRadius:8, padding:"6px 14px", color:"#8aa5bf", cursor:"pointer", fontSize:13 },
    section: { marginBottom:24 },
    sectionTitle: { fontSize:12, fontWeight:700, color:"#4a6a85", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 },
    infoBox: { background:"#111b35", border:"1px solid #1e2d4a", borderRadius:10, padding:16 },
    pillRow: { display:"flex", flexWrap:"wrap", gap:8 },
    sePill: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", borderRadius:20, padding:"4px 12px", fontSize:12 },
    warnItem: { display:"flex", gap:8, padding:"8px 0", borderBottom:"1px solid #1a2535", fontSize:13, color:"#c8a340", alignItems:"flex-start" },
    srcItem: { fontSize:12, color:"#5a8aaa", padding:"4px 0", borderBottom:"1px solid #111b35" },
    actionBtn: (color) => ({ background:`linear-gradient(135deg,${color}22,${color}11)`, border:`1px solid ${color}44`, color, borderRadius:10, padding:"10px 18px", cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }),
    calcBox: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:16, padding:28, maxWidth:560 },
    calcTitle: { fontSize:20, fontWeight:800, color:"#e8edf5", marginBottom:6 },
    calcDesc: { fontSize:13, color:"#6b8099", marginBottom:24 },
    label: { fontSize:12, color:"#5a7a9a", marginBottom:6, display:"block", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" },
    calcInput: { width:"100%", background:"#111b35", border:"1px solid #1e2d4a", borderRadius:10, padding:"12px 14px", color:"#dde3f0", fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:16 },
    resultBox: { background:"linear-gradient(135deg,rgba(0,212,184,0.08),rgba(0,136,255,0.08))", border:"1px solid rgba(0,212,184,0.25)", borderRadius:12, padding:20, marginTop:8 },
    resultBig: { fontSize:36, fontWeight:800, color:"#00d4b8", lineHeight:1 },
    resultSub: { fontSize:13, color:"#5a8aaa", marginTop:4 },
    calHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
    calNav: { background:"#111b35", border:"1px solid #1e2d4a", borderRadius:8, padding:"6px 12px", cursor:"pointer", color:"#8aa5bf", fontSize:16 },
    calMonthTitle: { fontSize:20, fontWeight:800, color:"#e8edf5" },
    calGrid: { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 },
    calDayName: { textAlign:"center", fontSize:11, color:"#4a6a85", fontWeight:600, padding:"6px 0", textTransform:"uppercase" },
    calCell: (hasDoses, isToday) => ({ minHeight:70, background: isToday ? "rgba(0,212,184,0.08)" : "#0d1525", border: isToday ? "1px solid rgba(0,212,184,0.4)" : "1px solid #1a2535", borderRadius:8, padding:6, cursor: hasDoses ? "pointer" : "default", transition:"all 0.15s" }),
    calNum: (isToday) => ({ fontSize:12, fontWeight:700, color: isToday ? "#00d4b8" : "#6b8099", marginBottom:3 }),
    calDot: (cat) => ({ width:6, height:6, borderRadius:"50%", background: CAT_COLORS[cat] || "#888", display:"inline-block", margin:"1px 1px" }),
    chat: { display:"flex", flexDirection:"column", height:"calc(100vh - 200px)", background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:16, overflow:"hidden" },
    chatHeader: { padding:"16px 20px", borderBottom:"1px solid #1a2535", background:"#111b35" },
    chatMsgs: { flex:1, overflow:"auto", padding:20, display:"flex", flexDirection:"column", gap:16 },
    userMsg: { alignSelf:"flex-end", background:"linear-gradient(135deg,#0055cc,#003a99)", color:"#e8edf5", borderRadius:"16px 16px 4px 16px", padding:"12px 16px", maxWidth:"75%", fontSize:14, lineHeight:1.6 },
    asstMsg: { alignSelf:"flex-start", background:"#111b35", border:"1px solid #1a2535", borderRadius:"4px 16px 16px 16px", padding:"12px 16px", maxWidth:"80%", fontSize:13, lineHeight:1.7, color:"#c8d8e8" },
    chatInput: { display:"flex", gap:10, padding:16, borderTop:"1px solid #1a2535", background:"#111b35" },
    chatTxt: { flex:1, background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:10, padding:"10px 14px", color:"#dde3f0", fontSize:14, outline:"none", resize:"none" },
    sendBtn: { background:"linear-gradient(135deg,#00d4b8,#0088ff)", border:"none", borderRadius:10, padding:"10px 20px", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 },
    modal: { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 },
    modalBox: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:16, padding:28, width:"100%", maxWidth:440 },
    schedBox: { background:"#0d1525", border:"1px solid #1e2d4a", borderRadius:14, padding:20, marginBottom:16 },
    sidePanel: { display:"grid", gridTemplateColumns:"320px 1fr", gap:20, alignItems:"start" },
  };

  const renderMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#e8edf5">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:#a0bcd4">$1</em>')
      .replace(/•/g, '•')
      .split('\n').map((line, i) => `<div key="${i}" style="min-height:4px">${line || ' '}</div>`).join('');
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div style={s.root}>
      {/* HEADER */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>🧬</div>
          <div>
            <div style={s.logoText}>PeptideOS</div>
            <div style={s.logoSub}>Research & Dosing Platform</div>
          </div>
        </div>
        <div style={s.badge}>Research Use Only</div>
      </div>

      {/* NAV */}
      <div style={s.nav}>
        {[
          { id:"library", icon:"🔬", label:"Peptide Library" },
          { id:"calculator", icon:"🧮", label:"Dose Calculator" },
          { id:"calendar", icon:"📅", label:"Dosing Calendar" },
          { id:"ai", icon:"🤖", label:"AI Research Assistant" },
        ].map(t => (
          <button key={t.id} style={s.navBtn(tab===t.id)} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={s.main}>
        {/* DISCLAIMER */}
        <div style={s.disclaimer}>
          <span style={{fontSize:18}}>⚠️</span>
          <div><strong style={{color:"#f0b840"}}>Important Disclaimer:</strong> All information is for educational and research purposes only. These peptides are research-use only (RUO) compounds. Nothing herein constitutes medical advice. Always consult a qualified healthcare professional before starting any peptide protocol. Sources referenced are peer-reviewed literature and clinical data.</div>
        </div>

        {/* LIBRARY TAB */}
        {tab === "library" && !selPeptide && (
          <>
            <div style={s.searchRow}>
              <input style={s.input} placeholder="🔍  Search peptides by name, purpose, or category..." value={search} onChange={e=>setSearch(e.target.value)} />
              <select style={s.select} value={selCat} onChange={e=>setSelCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c === "All" ? "All Categories" : `${CAT_ICONS[c] || ""} ${c}`}</option>)}
              </select>
            </div>
            <div style={{fontSize:12,color:"#4a6a85",marginBottom:16}}>{filtered.length} peptide{filtered.length!==1?"s":""} found</div>
            <div style={s.grid}>
              {filtered.map(p => (
                <div key={p.id} style={s.card(p.category)} onClick={()=>setSelPeptide(p)}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=`${CAT_COLORS[p.category]}55`}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.borderColor=`${CAT_COLORS[p.category]}22`}}>
                  <div style={{position:"absolute",top:0,right:0,width:80,height:80,background:`radial-gradient(circle at top right,${CAT_COLORS[p.category]}0a,transparent)`,borderRadius:"0 14px 0 0"}}/>
                  <div style={s.catTag(p.category)}>{CAT_ICONS[p.category]} {p.category}</div>
                  <div style={s.cardTitle}>{p.name}</div>
                  <div style={s.cardPurpose}>{p.purpose.slice(0,100)}{p.purpose.length>100?"...":""}</div>
                  <div style={s.cardMeta}>
                    <span style={s.metaPill}>💉 {p.dosage.typical}</span>
                    <span style={s.metaPill}>🔄 {p.frequency}</span>
                    <span style={s.metaPill}>⏱ {p.cycle}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PEPTIDE DETAIL */}
        {tab === "library" && selPeptide && (
          <div style={s.detailPanel}>
            <div style={s.detailHeader}>
              <div>
                <div style={s.catTag(selPeptide.category)}>{CAT_ICONS[selPeptide.category]} {selPeptide.category}</div>
                <div style={s.detailTitle}>{selPeptide.name}</div>
                <div style={{fontSize:13,color:"#6b8099"}}>{selPeptide.route}</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={s.closeBtn} onClick={()=>setSelPeptide(null)}>← Back to Library</button>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
              {/* Purpose */}
              <div style={{...s.infoBox, gridColumn:"1/-1"}}>
                <div style={s.sectionTitle}>Purpose & Mechanism</div>
                <div style={{fontSize:14,color:"#b8cfe0",lineHeight:1.7}}>{selPeptide.purpose}</div>
              </div>

              {/* Dosing */}
              <div style={s.infoBox}>
                <div style={s.sectionTitle}>📊 Dosing Protocol</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    ["Typical Dose", selPeptide.dosage.typical + " " + selPeptide.dosage.unit],
                    ["Frequency", selPeptide.frequency],
                    ["Timing", selPeptide.timing],
                    ["Cycle Length", selPeptide.cycle],
                    ["Route", selPeptide.route],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{fontSize:10,color:"#4a6a85",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{k}</div>
                      <div style={{fontSize:13,color:"#c8d8e8",fontWeight:600}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INLINE RECONSTITUTION + DOSE CALCULATOR */}
              <div style={{...s.infoBox, gridColumn:"1/-1", border:"1px solid rgba(0,212,184,0.25)", background:"rgba(0,212,184,0.03)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{...s.sectionTitle, color:"#00b89a", marginBottom:2}}>🧪 Reconstitution & Dose Calculator</div>
                    <div style={{fontSize:11,color:"#4a7a6a"}}>Pre-filled with recommended starting dose · Adjust vial or BAC water to recalculate</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(0,212,184,0.08)",border:"1px solid rgba(0,212,184,0.2)",borderRadius:8,padding:"6px 12px"}}>
                    <span style={{fontSize:11,color:"#5aaa9a"}}>Starting dose:</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#00d4b8"}}>{selPeptide.dosage.min} {selPeptide.dosage.unit}</span>
                    <span style={{fontSize:10,color:"#4a8a7a"}}>↔ max {selPeptide.dosage.max} {selPeptide.dosage.unit}</span>
                  </div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:16}}>
                  {/* Vial size */}
                  <div>
                    <label style={{fontSize:10,color:"#4a8a7a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>
                      Vial Amount (mg)
                    </label>
                    <div style={{display:"flex",gap:8}}>
                      <input
                        type="number" min="0" step="0.5"
                        value={inlineVialMg}
                        onChange={e=>setInlineVialMg(e.target.value)}
                        style={{flex:1,background:"#0d1525",border:"1px solid #1e3a50",borderRadius:8,padding:"9px 12px",color:"#dde3f0",fontSize:14,outline:"none"}}
                      />
                      <span style={{display:"flex",alignItems:"center",fontSize:12,color:"#5a8a7a",whiteSpace:"nowrap"}}>mg</span>
                    </div>
                    <div style={{fontSize:10,color:"#3a6a5a",marginTop:3}}>Ref: {selPeptide.reconstitution.vialMg} mg</div>
                  </div>
                  {/* BAC Water */}
                  <div>
                    <label style={{fontSize:10,color:"#4a8a7a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>
                      BAC Water (mL)
                    </label>
                    <div style={{display:"flex",gap:8}}>
                      <input
                        type="number" min="0" step="0.5"
                        value={inlineBacMl}
                        onChange={e=>setInlineBacMl(e.target.value)}
                        style={{flex:1,background:"#0d1525",border:"1px solid #1e3a50",borderRadius:8,padding:"9px 12px",color:"#dde3f0",fontSize:14,outline:"none"}}
                      />
                      <span style={{display:"flex",alignItems:"center",fontSize:12,color:"#5a8a7a",whiteSpace:"nowrap"}}>mL</span>
                    </div>
                    <div style={{fontSize:10,color:"#3a6a5a",marginTop:3}}>Ref: {selPeptide.reconstitution.bacMl} mL</div>
                  </div>
                  {/* Desired dose */}
                  <div>
                    <label style={{fontSize:10,color:"#4a8a7a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",display:"block",marginBottom:5}}>
                      Desired Dose
                    </label>
                    <div style={{display:"flex",gap:6}}>
                      <input
                        type="number" min="0"
                        value={inlineDose}
                        onChange={e=>setInlineDose(e.target.value)}
                        style={{flex:1,background:"#0d1525",border:"1px solid #1e3a50",borderRadius:8,padding:"9px 12px",color:"#dde3f0",fontSize:14,outline:"none"}}
                      />
                      <select
                        value={inlineDoseUnit}
                        onChange={e=>setInlineDoseUnit(e.target.value)}
                        style={{background:"#0d1525",border:"1px solid #1e3a50",borderRadius:8,padding:"9px 10px",color:"#dde3f0",fontSize:13,outline:"none",cursor:"pointer"}}
                      >
                        <option value="mcg">mcg</option>
                        <option value="mg">mg</option>
                      </select>
                    </div>
                    <div style={{fontSize:10,color:"#3a6a5a",marginTop:3}}>Range: {selPeptide.dosage.min}–{selPeptide.dosage.max} {selPeptide.dosage.unit}</div>
                  </div>
                </div>

                {/* Result strip */}
                {inlineCalc() ? (() => {
                  const r = inlineCalc();
                  const doseInRange = (() => {
                    const d = parseFloat(inlineDose);
                    const dMg = inlineDoseUnit === "mcg" ? d/1000 : d;
                    const minMg = selPeptide.dosage.unit === "mcg" ? selPeptide.dosage.min/1000 : selPeptide.dosage.min;
                    const maxMg = selPeptide.dosage.unit === "mcg" ? selPeptide.dosage.max/1000 : selPeptide.dosage.max;
                    if (dMg < minMg) return "low";
                    if (dMg > maxMg) return "high";
                    return "ok";
                  })();
                  return (
                    <div style={{background:"linear-gradient(135deg,rgba(0,212,184,0.08),rgba(0,136,255,0.05))",border:"1px solid rgba(0,212,184,0.2)",borderRadius:12,padding:16,marginBottom:16}}>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
                        {[
                          ["Concentration", `${r.concentration} mg/mL`, "#00d4b8"],
                          ["Draw Volume", `${r.vol} mL`, "#3b9eff"],
                          ["Syringe Units", `${r.units} U`, "#a78bfa"],
                          ["Dose Status", doseInRange === "ok" ? "✓ In range" : doseInRange === "low" ? "↓ Below min" : "↑ Above max",
                            doseInRange === "ok" ? "#34d399" : doseInRange === "low" ? "#fbbf24" : "#f87171"],
                        ].map(([label, val, color]) => (
                          <div key={label} style={{textAlign:"center"}}>
                            <div style={{fontSize:10,color:"#3a7a6a",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:4}}>{label}</div>
                            <div style={{fontSize:20,fontWeight:800,color,lineHeight:1.1}}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{fontSize:11,color:"#3a6a5a",background:"rgba(0,0,0,0.2)",borderRadius:6,padding:"6px 10px",fontFamily:"monospace"}}>
                        {inlineDose} {inlineDoseUnit} ÷ {inlineDoseUnit==="mcg"?1000:1} × (1 ÷ {r.concentration} mg/mL) = {r.vol} mL = {r.units} units
                      </div>
                      {doseInRange !== "ok" && (
                        <div style={{marginTop:8,fontSize:11,color: doseInRange==="low" ? "#d97706" : "#ef4444",display:"flex",alignItems:"center",gap:6}}>
                          <span>⚠️</span>
                          {doseInRange==="low"
                            ? `Dose is below the recommended minimum of ${selPeptide.dosage.min} ${selPeptide.dosage.unit}. Consider starting at the minimum.`
                            : `Dose exceeds the recommended maximum of ${selPeptide.dosage.max} ${selPeptide.dosage.unit}. Please consult a healthcare professional.`}
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div style={{background:"rgba(0,0,0,0.15)",borderRadius:10,padding:"14px 16px",marginBottom:16,fontSize:12,color:"#3a5a70",textAlign:"center"}}>
                    Enter vial size, BAC water, and desired dose to calculate →
                  </div>
                )}

                {/* Dose presets */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10,color:"#3a6a5a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:8}}>Quick dose presets</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {[
                      { label:"Starting", value: selPeptide.dosage.min },
                      { label:"Mid", value: Math.round((selPeptide.dosage.min + selPeptide.dosage.max) / 2 * 100) / 100 },
                      { label:"Max", value: selPeptide.dosage.max },
                    ].map(preset => (
                      <button key={preset.label}
                        onClick={() => { setInlineDose(String(preset.value)); setInlineDoseUnit(selPeptide.dosage.unit); }}
                        style={{background: parseFloat(inlineDose) === preset.value ? "rgba(0,212,184,0.2)" : "rgba(0,212,184,0.06)", border: parseFloat(inlineDose) === preset.value ? "1px solid rgba(0,212,184,0.5)" : "1px solid rgba(0,212,184,0.15)", borderRadius:8, padding:"5px 12px", color: parseFloat(inlineDose) === preset.value ? "#00d4b8" : "#5a9a8a", cursor:"pointer", fontSize:12, fontWeight:600}}>
                        {preset.label}: {preset.value} {selPeptide.dosage.unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dosing protocol summary + Add to Calendar */}
                <div style={{display:"flex",gap:12,alignItems:"stretch",flexWrap:"wrap"}}>
                  <div style={{flex:1,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"10px 14px",minWidth:180}}>
                    <div style={{fontSize:10,color:"#3a6a5a",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.4px",marginBottom:6}}>Protocol summary</div>
                    {[
                      ["Frequency", selPeptide.frequency],
                      ["Timing", selPeptide.timing],
                      ["Cycle", selPeptide.cycle],
                      ["Route", selPeptide.route],
                    ].map(([k,v]) => (
                      <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                        <span style={{fontSize:11,color:"#4a7a6a"}}>{k}</span>
                        <span style={{fontSize:11,color:"#8ad4c0",fontWeight:600}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const dose = inlineDose && inlineDoseUnit ? `${inlineDose} ${inlineDoseUnit}` : selPeptide.dosage.typical;
                      const weeks = parseInt(selPeptide.cycle) || 8;
                      setSchedForm(f => ({ ...f, dose, weeks }));
                      setSchedModal(selPeptide);
                    }}
                    style={{background:"linear-gradient(135deg,rgba(0,212,184,0.2),rgba(0,136,255,0.15))",border:"1px solid rgba(0,212,184,0.4)",borderRadius:12,padding:"14px 22px",color:"#00d4b8",cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,minWidth:160}}>
                    <span style={{fontSize:22}}>📅</span>
                    <span>Add to Calendar</span>
                    {inlineDose && <span style={{fontSize:11,color:"#5aaa9a",fontWeight:400}}>@ {inlineDose} {inlineDoseUnit}</span>}
                  </button>
                </div>
              </div>

              {/* Side Effects */}
              <div style={s.infoBox}>
                <div style={s.sectionTitle}>⚡ Side Effects</div>
                <div style={s.pillRow}>
                  {selPeptide.sideEffects.map(se => (
                    <span key={se} style={s.sePill}>{se}</span>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              <div style={{...s.infoBox, background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{...s.sectionTitle, color:"#b87a20"}}>⚠️ Warnings & Protocols</div>
                {selPeptide.warnings.map((w,i) => (
                  <div key={i} style={s.warnItem}>
                    <span style={{color:"#f59e0b",fontSize:10,marginTop:3}}>▶</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div style={s.infoBox}>
                <div style={s.sectionTitle}>📋 Research Notes</div>
                <div style={{fontSize:13,color:"#8ab0c8",lineHeight:1.7}}>{selPeptide.notes}</div>
              </div>

              {/* Sources */}
              <div style={s.infoBox}>
                <div style={s.sectionTitle}>📚 Reputable Sources</div>
                {selPeptide.sources.map((src,i) => (
                  <div key={i} style={s.srcItem}>{i+1}. {src}</div>
                ))}
                <div style={{fontSize:11,color:"#3a5570",marginTop:10}}>Sources: PubMed, FDA, peer-reviewed journals only.</div>
              </div>
            </div>
          </div>
        )}

        {/* CALCULATOR TAB */}
        {tab === "calculator" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:24,maxWidth:900}}>
            {/* Volume Calculator */}
            <div style={s.calcBox}>
              <div style={s.calcTitle}>💉 Injection Volume Calculator</div>
              <div style={s.calcDesc}>Calculate how many mL to draw based on desired dose and peptide concentration.</div>
              <label style={s.label}>Concentration (mg/mL)</label>
              <input style={s.calcInput} type="number" placeholder="e.g. 2.5" value={conc} onChange={e=>setConc(e.target.value)} min="0" step="0.1" />
              <label style={s.label}>Desired Dose</label>
              <div style={{display:"flex",gap:10,marginBottom:16}}>
                <input style={{...s.calcInput,marginBottom:0,flex:1}} type="number" placeholder="e.g. 250" value={dose} onChange={e=>setDose(e.target.value)} min="0" />
                <select style={{...s.select,minWidth:80}} value={doseUnit} onChange={e=>setDoseUnit(e.target.value)}>
                  <option value="mcg">mcg</option>
                  <option value="mg">mg</option>
                </select>
              </div>
              {calcResult() ? (
                <div style={s.resultBox}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    <div>
                      <div style={{fontSize:11,color:"#4a8a7a",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Volume</div>
                      <div style={s.resultBig}>{calcResult().vol}</div>
                      <div style={s.resultSub}>mL to draw</div>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:"#4a8a7a",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Syringe Units</div>
                      <div style={s.resultBig}>{calcResult().units}</div>
                      <div style={s.resultSub}>units (U-100 syringe)</div>
                    </div>
                  </div>
                  <div style={{marginTop:16,fontSize:12,color:"#5a8a7a",background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 12px"}}>
                    Formula: {dose} {doseUnit} ÷ {doseUnit==="mcg"?1000:1} × (1 ÷ {conc} mg/mL) = {calcResult().vol} mL
                  </div>
                </div>
              ) : (
                <div style={{padding:20,textAlign:"center",color:"#3a5570",fontSize:13}}>Enter values above to calculate →</div>
              )}
            </div>

            {/* Reconstitution Calculator */}
            <div style={s.calcBox}>
              <div style={s.calcTitle}>🧪 Reconstitution Calculator</div>
              <div style={s.calcDesc}>Calculate your peptide concentration after adding bacteriostatic water.</div>
              <label style={s.label}>Vial Amount (mg)</label>
              <input style={s.calcInput} type="number" placeholder="e.g. 5" value={vialMg} onChange={e=>setVialMg(e.target.value)} min="0" step="0.5" />
              <label style={s.label}>BAC Water to Add (mL)</label>
              <input style={s.calcInput} type="number" placeholder="e.g. 2" value={bacMl} onChange={e=>setBacMl(e.target.value)} min="0" step="0.5" />
              {concResult() ? (
                <div style={s.resultBox}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                    <div>
                      <div style={{fontSize:11,color:"#4a8a7a",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Concentration</div>
                      <div style={s.resultBig}>{concResult().conc}</div>
                      <div style={s.resultSub}>mg/mL</div>
                    </div>
                    <div>
                      <div style={{fontSize:11,color:"#4a8a7a",marginBottom:4,fontWeight:600,textTransform:"uppercase"}}>Per 10 units (0.1mL)</div>
                      <div style={s.resultBig}>{concResult().per100}</div>
                      <div style={s.resultSub}>mcg per 10 units</div>
                    </div>
                  </div>
                  <div style={{marginTop:16,fontSize:12,color:"#5a8a7a",background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"8px 12px"}}>
                    Formula: {vialMg} mg ÷ {bacMl} mL = {concResult().conc} mg/mL
                  </div>
                </div>
              ) : (
                <div style={{padding:20,textAlign:"center",color:"#3a5570",fontSize:13}}>Enter values above to calculate →</div>
              )}
            </div>

            {/* Quick Reference */}
            <div style={{...s.calcBox,gridColumn:"1/-1"}}>
              <div style={s.calcTitle}>📋 Quick Reference – Syringe Unit Guide</div>
              <div style={s.calcDesc}>U-100 insulin syringe: 1 mL = 100 units. Use this table for common dose volumes.</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{background:"#111b35"}}>
                      {["Volume (mL)","Syringe Units","@ 2.5 mg/mL","@ 5 mg/mL","@ 10 mg/mL"].map(h=>(
                        <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,color:"#4a6a85",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:"1px solid #1a2535"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[[0.05,5,125,250,500],[0.10,10,250,500,1000],[0.20,20,500,1000,2000],[0.30,30,750,1500,3000],[0.40,40,1000,2000,4000],[0.50,50,1250,2500,5000]].map(([vol,units,a,b,c])=>(
                      <tr key={vol} style={{borderBottom:"1px solid #111b35"}}>
                        {[vol,units,`${a} mcg`,`${b} mcg`,`${c} mcg`].map((v,i)=>(
                          <td key={i} style={{padding:"9px 14px",color:i===0?"#00d4b8":i===1?"#e8edf5":"#8aa5bf",fontWeight:i<2?700:400}}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === "calendar" && (
          <div>
            <div style={s.calHeader}>
              <div>
                <div style={{fontSize:22,fontWeight:800,color:"#e8edf5"}}>{monthNames[calMonth.getMonth()]} {calMonth.getFullYear()}</div>
                <div style={{fontSize:13,color:"#5a7a9a"}}>{scheduled.length} peptide protocol{scheduled.length!==1?"s":""} active</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <button style={s.calNav} onClick={()=>setCalMonth(m=>new Date(m.getFullYear(),m.getMonth()-1,1))}>◀</button>
                <button style={{...s.calNav,padding:"6px 14px",fontSize:13}} onClick={()=>setCalMonth(new Date(2026,2,1))}>Today</button>
                <button style={s.calNav} onClick={()=>setCalMonth(m=>new Date(m.getFullYear(),m.getMonth()+1,1))}>▶</button>
              </div>
            </div>

            {/* Active Protocols */}
            {scheduled.length > 0 && (
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12,color:"#4a6a85",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:10}}>Active Protocols</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                  {scheduled.map(sp => (
                    <div key={sp.schedId} style={{background:"#0d1525",border:`1px solid ${CAT_COLORS[sp.category]}33`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLORS[sp.category],flexShrink:0}}/>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:"#c8d8e8"}}>{sp.name}</div>
                        <div style={{fontSize:11,color:"#5a7a9a"}}>{sp.startDate} → {sp.endDate} · {sp.scheduledTime} {sp.customDose ? `· ${sp.customDose}` : ""}</div>
                      </div>
                      <button onClick={()=>setScheduled(prev=>prev.filter(s=>s.schedId!==sp.schedId))}
                        style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:6,padding:"3px 8px",color:"#f87171",cursor:"pointer",fontSize:11,marginLeft:4}}>Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div style={{background:"#0d1525",border:"1px solid #1e2d4a",borderRadius:14,padding:20}}>
              <div style={s.calGrid}>
                {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                  <div key={d} style={s.calDayName}>{d}</div>
                ))}
                {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth},(_,i)=>i+1).map(day=>{
                  const y=calMonth.getFullYear(),m=calMonth.getMonth();
                  const doses=getDayDoses(y,m,day);
                  const dateStr=`${y}-${String(m+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                  const isToday=dateStr===todayStr;
                  return (
                    <div key={day} style={s.calCell(doses.length>0,isToday)}>
                      <div style={s.calNum(isToday)}>{day}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                        {doses.slice(0,6).map((d,i)=>(
                          <div key={i} style={{...s.calDot(d.category)}} title={`${d.name} ${d.scheduledTime}`}/>
                        ))}
                        {doses.length>6&&<div style={{fontSize:9,color:"#5a7a9a"}}>+{doses.length-6}</div>}
                      </div>
                      {doses.length>0&&<div style={{fontSize:9,color:"#4a6a85",marginTop:2}}>{doses.length} dose{doses.length!==1?"s":""}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {scheduled.length===0&&(
              <div style={{textAlign:"center",padding:"40px 20px",color:"#3a5570"}}>
                <div style={{fontSize:40,marginBottom:12}}>📅</div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:6}}>No protocols scheduled</div>
                <div style={{fontSize:13}}>Go to the Peptide Library, select a peptide, and click "Add to Calendar"</div>
              </div>
            )}
          </div>
        )}

        {/* AI TAB */}
        {tab === "ai" && (
          <div style={s.chat}>
            <div style={s.chatHeader}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,background:"linear-gradient(135deg,#00d4b8,#0088ff)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"#e8edf5"}}>Peptide Research AI</div>
                  <div style={{fontSize:11,color:"#4a8a7a"}}>Powered by Claude · Cites peer-reviewed literature · Research use only</div>
                </div>
              </div>
            </div>
            <div style={s.chatMsgs} ref={chatRef}>
              {aiMsgs.map((m,i)=>(
                <div key={i} style={m.role==="user"?s.userMsg:s.asstMsg}
                  dangerouslySetInnerHTML={{__html:renderMarkdown(m.content)}}/>
              ))}
              {aiLoading&&(
                <div style={s.asstMsg}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {[0,1,2].map(i=>(
                      <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#00d4b8",animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`}}/>
                    ))}
                    <span style={{fontSize:12,color:"#5a8a7a",marginLeft:6}}>Searching research literature...</span>
                  </div>
                </div>
              )}
            </div>
            <div style={s.chatInput}>
              <textarea style={s.chatTxt} rows={2} placeholder="Ask about peptide protocols, stacking, side effects, research citations..."
                value={aiInput} onChange={e=>setAiInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAI()}}}/>
              <button style={s.sendBtn} onClick={sendAI} disabled={aiLoading}>
                {aiLoading?"⏳":"Send →"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {schedModal && (
        <div style={s.modal} onClick={e=>{if(e.target===e.currentTarget)setSchedModal(null)}}>
          <div style={s.modalBox}>
            <div style={{fontSize:18,fontWeight:800,color:"#e8edf5",marginBottom:4}}>📅 Schedule Protocol</div>
            <div style={s.catTag(schedModal.category)}>{CAT_ICONS[schedModal.category]} {schedModal.name}</div>
            <div style={{fontSize:12,color:"#5a7a9a",marginBottom:4}}>{schedModal.frequency} · {schedModal.timing} · {schedModal.cycle}</div>

            {/* Dose preview from calculator */}
            {schedForm.dose && (
              <div style={{background:"rgba(0,212,184,0.08)",border:"1px solid rgba(0,212,184,0.25)",borderRadius:8,padding:"8px 12px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#5aaa9a"}}>Calculated dose:</span>
                <span style={{fontSize:14,fontWeight:700,color:"#00d4b8"}}>{schedForm.dose}</span>
              </div>
            )}

            <label style={s.label}>Start Date</label>
            <input style={{...s.calcInput}} type="date" value={schedForm.startDate}
              onChange={e=>setSchedForm(f=>({...f,startDate:e.target.value}))} />
            <label style={s.label}>Cycle Length (weeks)</label>
            <input style={s.calcInput} type="number" value={schedForm.weeks} min={1} max={52}
              onChange={e=>setSchedForm(f=>({...f,weeks:e.target.value}))} />
            <label style={s.label}>Time of Day</label>
            <select style={{...s.select,width:"100%",marginBottom:20}} value={schedForm.time}
              onChange={e=>setSchedForm(f=>({...f,time:e.target.value}))}>
              <option value="AM">AM (Morning)</option>
              <option value="PM">PM (Evening)</option>
              <option value="Pre-bed">Pre-bed (1–3h before sleep)</option>
              <option value="Pre-workout">Pre-workout</option>
              <option value="As needed">As needed</option>
            </select>
            <div style={{display:"flex",gap:10}}>
              <button style={{...s.actionBtn("#00d4b8"),flex:1,justifyContent:"center"}} onClick={addToCalendar}>Add to Calendar ✓</button>
              <button style={{...s.closeBtn,padding:"10px 16px"}} onClick={()=>setSchedModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #3a5570; }
        textarea::placeholder { color: #3a5570; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #080c18; }
        ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 3px; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
