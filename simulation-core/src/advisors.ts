/**
 * Advisory System — Rule-based advisor message generator.
 *
 * All messages in Czech. 150+ unique messages with context-aware recommendations
 * based on active measures, crisis leader, and simulation state.
 *
 * Each advisor has a background story, area of expertise, and personality.
 */

import { type AdvisorMessage, type EconomicState, type TurnReport } from './types';

// ═══════════════════════════════════════════
// ADVISOR BACKGROUND STORIES
// ═══════════════════════════════════════════

export const ADVISOR_BACKGROUNDS: Record<string, {
  name: string;
  title: string;
  background: string;
  expertise: string[];
  personality: string;
}> = {
  epidemiologist: {
    name: 'MUDr. Jana Nováková, Ph.D.',
    title: 'Hlavní epidemioložka',
    background: 'Absolventka 1. lékařské fakulty UK, 15 let praxe v epidemiologii. Pracovala 3 roky pro WHO v Africe během epidemie Eboly. Vedla tým, který úspěšně zvládl ohnisko MERS v roce 2015. Je známá svým klidným, ale neústupným přístupem k datům. Její mantra: „Čísla nelžou, ale lidé je rádi ignorují."',
    expertise: ['Epidemiologie', 'Modelování šíření', 'Trasování kontaktů', 'Kapacity nemocnic'],
    personality: 'Analytická, přímá, pragmatická. Nemá ráda politické kompromisy na úkor zdraví.',
  },
  economist: {
    name: 'Ing. Martin Dvořák, CSc.',
    title: 'Hlavní ekonomický poradce',
    background: 'Bývalý viceguvernér ČNB, profesor ekonomie na VŠE. Během finanční krize 2008 vedl expertní tým, který navrhl záchranný balíček pro bankovní sektor. Je zastáncem vyváženého přístupu — ekonomika potřebuje zdravé lidi, ale zdraví lidé potřebují fungující ekonomiku. Sbírá starožitné mapy a tvrdí, že ekonomika je jako počasí — předpovídat ji lze, ovládnout ne.',
    expertise: ['Makroekonomie', 'Fiskální politika', 'Trh práce', 'Dopady restrikcí na HDP'],
    personality: 'Rozvážný, ironický, pragmatický. Vždy hledá kompromis mezi zdravím a ekonomikou.',
  },
  politician: {
    name: 'JUDr. Tomáš Svoboda',
    title: 'Politický poradce premiéra',
    background: '20 let v politice, bývalý ministr vnitra. Expert na krizovou komunikaci a veřejné mínění. Má neomylný instinkt pro nálady ve společnosti. Říká se o něm, že dokáže předpovědět výsledky průzkumů dřív, než se udělají. V mládí studoval psychologii, což prý vysvětluje jeho schopnost manipulace — i když on tomu říká „přesvědčování".',
    expertise: ['Veřejné mínění', 'Krizová komunikace', 'Sociální stabilita', 'Politická průchodnost opatření'],
    personality: 'Charismatický, diplomatický, občas cynický. Priority: udržet vládu a veřejný klid.',
  },
  military: {
    name: 'Gen. plk. Miroslav Vlk',
    title: 'Náčelník Generálního štábu AČR',
    background: 'Veterán mírových misí v Kosovu a Afghánistánu. Absolvent NATO Defense College v Římě. Specializace na logistiku a krizové operace. Je známý svými přesnými predikcemi — v armádě mu říkají „Prorok", protože jeho odhady vývoje situace se děsivě často naplní. Vede si deník, do kterého si zapisuje předpovědi a pak je porovnává s realitou. Úspěšnost: přes 80 %.',
    expertise: ['Vojenská logistika', 'Krizové řízení', 'Predikce vývoje situace', 'Polní nemocnice', 'Vynucování opatření'],
    personality: 'Stručný, přesný, bez emocí. Mluví v číslech a faktech. „Válku nevyhráte přáním, ale plánováním."',
  },
  opposition: {
    name: 'Mgr. Petr Čermák',
    title: 'Předseda hlavní opoziční strany',
    background: 'Bývalý investigativní novinář, nyní lídr opozice. Jeho styl je konfrontační, ale férový — pokud vláda komunikuje otevřeně, umí být konstruktivní. Pokud ne, vytáhne celý arzenál mediální války. Má širokou síť kontaktů v médiích. V soukromí je překvapivě přátelský, ale na veřejnosti hraje roli přísného kritika, protože „to je moje práce".',
    expertise: ['Mediální komunikace', 'Kontrola vlády', 'Parlamentní procesy', 'Veřejný tlak'],
    personality: 'Konfrontační veřejně, pragmatický v soukromí. Respektuje transparentnost.',
  },
};

// ═══════════════════════════════════════════
// CONTEXT INTERFACE
// ═══════════════════════════════════════════

interface AdvisorContext {
  estimatedReff: number;
  trueReff: number;
  socialCapital: number;
  hospitalOccupancyFraction: number;
  icuOccupancyFraction: number;
  economicState: EconomicState;
  cumulativeDeaths: number;
  turnNumber: number;
  totalTurns: number;
  activeMeasureCount: number;
  newDeaths: number;
  trendInfections: 'rising' | 'stable' | 'falling';
  detectionRate: number;
  vaccinationActive: boolean;
  intelQuality: number;
  activeMeasureIds?: string[];
  currentHospitalized?: number;
  hospitalCapacity?: number;
  currentICU?: number;
  icuCapacity?: number;
  observedInfections?: number;
  whoConsultationActive?: boolean;
  oppositionBriefings?: number;
  crisisLeader?: 'hygienik' | 'premier';
  daysPerTurn?: number;
}

// ═══════════════════════════════════════════
// HELPER — pick message by turn for variety
// ═══════════════════════════════════════════

function pick(options: string[], turn: number): string {
  return options[turn % options.length];
}

function has(ctx: AdvisorContext, id: string): boolean {
  return ctx.activeMeasureIds?.includes(id) ?? false;
}

function hasAny(ctx: AdvisorContext, ...ids: string[]): boolean {
  return ids.some(id => has(ctx, id));
}

function hasNone(ctx: AdvisorContext, ...ids: string[]): boolean {
  return !ids.some(id => has(ctx, id));
}

// ═══════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════

export function generateAdvisorMessages(ctx: AdvisorContext): AdvisorMessage[] {
  const messages: AdvisorMessage[] = [
    generateEpidemiologist(ctx),
    generateEconomist(ctx),
    generatePolitician(ctx),
  ];

  // Military advisor always present (Gen. Vlk is on the staff), but with different roles
  messages.push(generateMilitary(ctx));

  messages.push(generateOpposition(ctx));

  return messages;
}

// ═══════════════════════════════════════════
// EPIDEMIOLOGIST — MUDr. Nováková
// ═══════════════════════════════════════════

function generateEpidemiologist(ctx: AdvisorContext): AdvisorMessage {
  const bg = ADVISOR_BACKGROUNDS.epidemiologist;
  const name = 'MUDr. Nováková (epidemioložka)';
  const reff = ctx.estimatedReff;
  const hosp = ctx.hospitalOccupancyFraction;
  const icu = ctx.icuOccupancyFraction;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  // ── CRITICAL: ICU overflow ──
  if (icu > 1.0) {
    urgency = 'critical';
    const base = [
      "Dnes jsem musela rozhodovat, kdo dostane poslední ventilátor. Tohle je medicína katastrof, pane premiére.",
      "Márnice nestíhají. Jestli hned teď nezastavíme šíření, budeme ty mrtvé počítat na tisíce týdně.",
      "Personál v nemocnicích se hroutí. Máme sestry, které nebyly doma tři dny. Systém definitivně zkolaboval.",
      "Triage pacientů je realitou. Vybíráme, kdo má šanci přežít a kdo ne. Je to vaše zodpovědnost.",
      "Tohle už není epidemie, to je národní tragédie. Prosím, zastavte to jakýmkoli způsobem!",
      "Máme pacienty na chodbách, v čekárnách, všude. Personál pracuje 16hodinové směny a kolabuje.",
      "Volám vám z ARO. Právě mi pod rukama zemřela čtyřicetiletá žena. Nemáme kde léčit.",
    ];
    message = pick(base, turn);

    // Context-aware suggestion
    if (hasNone(ctx, 'community_lockdown', 'military_lockdown')) {
      suggestion = "Okamžitý lockdown! Nemáme zapnuté žádné omezení pohybu a lidé umírají.";
    } else if (hasNone(ctx, 'bed_restructuring')) {
      suggestion = "Aktivujte restrukturalizaci lůžek — potřebujeme zdvojnásobit kapacitu.";
    } else if (hasNone(ctx, 'army_hospitals')) {
      suggestion = "Dejte armádě rozkaz stavět polní nemocnice. Každé lůžko zachrání život.";
    } else {
      suggestion = "Máme aktivováno maximum. Modlete se, aby opatření zabrala dřív, než systém definitivně zkolabuje.";
    }

  // ── HIGH: Hospital near overflow ──
  } else if (hosp > 0.9 || icu > 0.8) {
    urgency = 'high';
    const base = [
      "Nemocnice jsou na pokraji kolapsu. Kapacity lůžek jsou vyčerpány na 90 %. Jsme krok od propasti.",
      "Situace je kritická, každé další zpoždění znamená zbytečná úmrtí. Musíme jednat hned.",
      "Pacienti leží na chodbách. Převážíme lidi přes celou republiku, ale volná místa docházejí všude.",
      "Odkládáme veškerou péči, i onkologické operace. Ten virus požírá celé naše zdravotnictví.",
      "Lékaři jsou na dně svých sil. Pokud neuvidí rozhodnou akci vlády, přestanou věřit, že to má smysl.",
      "ICU jsou na " + Math.round(icu * 100) + " %. Když překročíme 100 %, začneme rozhodovat, kdo bude žít a kdo ne.",
      "Jsme v režimu válečné medicíny. Normální operace stojí. Celá chirurgie se přeorientovala na COVID.",
    ];
    message = pick(base, turn);

    // Context-aware suggestions
    if (hasNone(ctx, 'school_closure', 'wfh_mandate')) {
      suggestion = "Stále nemáte uzavřené školy ani home-office! Zavřete alespoň jedno, okamžitě.";
    } else if (has(ctx, 'school_closure') && hasNone(ctx, 'wfh_mandate')) {
      suggestion = "Školy jsou zavřené, ale pracoviště jedou naplno. Nařiďte home-office.";
    } else if (hasNone(ctx, 'respirators_mandatory') && has(ctx, 'mask_mandate_indoor')) {
      suggestion = "Roušky nestačí. Přejděte na povinné FFP2 respirátory — filtrují 95 % částic.";
    } else if (hasNone(ctx, 'contact_tracing')) {
      suggestion = "Nemáte zapnuté trasování! Trasování je základ — bez něj střílíme naslepo.";
    } else if (hasNone(ctx, 'community_lockdown')) {
      suggestion = "Zpřísněte opatření na lockdown — omezení pohybu je jediné, co teď může zvrátit křivku.";
    } else {
      suggestion = "Opatření jsou nastavena dobře, ale potřebujeme čas. Držme kurz a sledujme data.";
    }

  // ── MEDIUM: Reff rising ──
  } else if (reff > 1.2) {
    urgency = 'medium';
    const base = [
      `Epidemie nabírá na síle. Reprodukční číslo ${reff.toFixed(2)} znamená, že se nám to vymyká z rukou.`,
      "Záchyt pozitivních roste geometrickou řadou. Pokud nezasáhneme teď, za dva týdny budeme mít v nemocnicích dvojnásobek lidí.",
      "Vidíme exponenciální růst v rizikových skupinách. Tohle je ticho před bouří.",
      "Trasování už nestíhá. Virus je v komunitě a šíří se nekontrolovaně.",
      "Nové mutace jsou agresivnější. Naše současná opatření na ně evidentně nestačí.",
      `R = ${reff.toFixed(2)} — to znamená, že každý nakažený infikuje více než jednoho dalšího. Exponenciála je nemilosrdná.`,
      "Data z krajských hygien ukazují, že jsme ztratili kontrolu nad trasováním. Víme jen o zlomku případů.",
    ];
    message = pick(base, turn);

    // Context-aware suggestions
    if (hasNone(ctx, 'mask_mandate_indoor', 'respirators_mandatory')) {
      suggestion = "Zaveďte alespoň roušky ve vnitřních prostorách. Je to levné a účinné.";
    } else if (has(ctx, 'mask_mandate_indoor') && hasNone(ctx, 'respirators_mandatory') && ctx.cumulativeDeaths > 100) {
      suggestion = "Přejděte z roušek na FFP2 respirátory — podstatně vyšší účinnost.";
    } else if (hasNone(ctx, 'wfh_mandate', 'school_closure')) {
      suggestion = "Zaveďte home-office nebo uzavřete školy — musíme snížit kontakty.";
    } else if (hasNone(ctx, 'contact_tracing')) {
      suggestion = "Aktivujte chytrou karanténu a trasování kontaktů.";
    } else if (has(ctx, 'mask_mandate_outdoor') && hasNone(ctx, 'school_closure')) {
      suggestion = "Venkovní roušky nemají epidemiologický smysl. Raději zavřete školy — to opravdu zabírá.";
    } else if (hasNone(ctx, 'mass_testing_workplace')) {
      suggestion = "Zaveďte povinné testování ve firmách — odhalíme bezpříznakové přenašeče.";
    } else {
      suggestion = "Zvažte zpřísnění — současná opatření nestačí na stlačení R pod 1.";
    }

  // ── LOW: Falling trend ──
  } else if (ctx.trendInfections === 'falling') {
    urgency = 'low';
    const base = [
      "Křivka konečně klesá. Opatření fungují, ale nesmíme polevit příliš brzy, aby nepřišla další vlna.",
      "Vidíme první známky stabilizace. Je to křehké vítězství, nezahoďme ho předčasným uvolněním.",
      "Tlak na nemocnice se mírně uvolňuje. Teď je čas posílit testovací kapacity.",
      "Lidé začínají být optimističtí, ale virus je stále mezi námi. Buďme velmi opatrní.",
      "Dobrá zpráva: počet hospitalizovaných poprvé po týdnech klesl. Pokračujme v nastavené cestě.",
      "Data jsou pozitivní, ale nezapomeňte — vlna může přijít znovu, pokud uvolníme příliš rychle.",
      "Konečně vidím světlo na konci tunelu. Ale prosím, neuvolňujte všechno naráz.",
    ];
    message = pick(base, turn);

    // Context-aware suggestions when things are getting better
    if (ctx.activeMeasureCount > 6) {
      suggestion = "Situace se lepší. Zvažte postupné uvolnění nejdražších opatření — ale po jednom!";
    } else if (has(ctx, 'mask_mandate_outdoor')) {
      suggestion = "Venkovní roušky můžete klidně zrušit, nemají žádný vliv na křivku.";
    } else if (ctx.vaccinationActive) {
      suggestion = "Očkování běží, křivka klesá. Držte stávající opatření, dokud neproočkujeme rizikovky.";
    } else {
      suggestion = "Zůstaňme obezřetní, uvolňujme jen velmi pomalu a po etapách.";
    }

  // ── LOW: Stable ──
  } else {
    urgency = 'low';
    const base = [
      "Situace je stabilní. Máme čas na přípravu dalších kroků a posílení trasování.",
      "Aktuální data nevykazují dramatický růst. Je to ideální moment pro doladění strategie.",
      "Epidemie je pod kontrolou, ale virus nezmizel. Sledujme pečlivě lokální ohniska.",
      "Kapacita nemocnic je dostatečná pro současný počet pacientů.",
      "Můžeme začít uvažovat o mírném uvolnění nejméně efektivních opatření.",
      "Data jsou stabilní. Využijme tento klid k posílení surveillance a přípravě na další vlnu.",
      "Situace je klidná. Doporučuji investovat do trasovacích kapacit — příští vlna přijde.",
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'contact_tracing') && ctx.detectionRate < 0.4) {
      suggestion = "Stabilní situace je ideální pro spuštění trasování — připravíme se na další vlnu.";
    } else if (hasNone(ctx, 'data_dashboard')) {
      suggestion = "Zvažte spuštění veřejného datového dashboardu — zvýší transparentnost a důvěru.";
    } else if (has(ctx, 'mask_mandate_outdoor')) {
      suggestion = "Venkovní roušky jsou zbytečné a dráždí veřejnost. Můžete je bez rizika zrušit.";
    }
  }

  return {
    role: 'epidemiologist',
    name,
    message,
    suggestion,
    urgency,
    background: `${bg.background}\n\nOblasti: ${bg.expertise.join(', ')}\nCharakter: ${bg.personality}`,
  };
}

// ═══════════════════════════════════════════
// ECONOMIST — Ing. Dvořák
// ═══════════════════════════════════════════

function generateEconomist(ctx: AdvisorContext): AdvisorMessage {
  const bg = ADVISOR_BACKGROUNDS.economist;
  const name = 'Ing. Dvořák (ekonom)';
  const gdp = ctx.economicState.gdpImpact;
  const unemployment = ctx.economicState.unemploymentDelta;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  // ── CRITICAL: Economic collapse ──
  if (gdp < -10) {
    urgency = 'critical';
    const base = [
      `Ekonomika je v troskách. Propad HDP o ${Math.abs(gdp).toFixed(1)} % je nejhorší v historii země.`,
      "Státní pokladna je prázdná. Půjčujeme si za úroky, které nás zničí. Lockdown musí skončit.",
      "Průmysl stojí. Dodavatelské řetězce jsou přetrhané. Tohle nebude recese, to bude deprese.",
      "Firmy krachují po tisících. Jestli neotevřeme obchody, nebude co zachraňovat.",
      "Investoři utíkají ze země. Naše ratingy padají. Musíme vyslat signál, že ekonomika je prioritou.",
      "Dluhový strop je vyčerpán. Nemáme na kompenzace, nemáme na zdravotnictví. Musíme otevřít.",
      "Potravinové banky hlásí trojnásobek klientů. Lidé nemají na jídlo. To není ekonomická krize, to je humanitární.",
    ];
    message = pick(base, turn);

    if (has(ctx, 'community_lockdown') || has(ctx, 'military_lockdown')) {
      suggestion = "Lockdown nás ničí. Zkuste přejít na cílená opatření — testování, trasování, roušky.";
    } else if (hasNone(ctx, 'business_support') && hasNone(ctx, 'kurzarbeit')) {
      suggestion = "Aktivujte Kurzarbeit a kompenzace — bez nich se ekonomika nezotaví ani po konci epidemie.";
    } else {
      suggestion = "Musíme začít uvolňovat ekonomiku, i za cenu jistého epidemiologického rizika.";
    }

  // ── HIGH: Unemployment ──
  } else if (unemployment > 5) {
    urgency = 'high';
    const base = [
      "Nezaměstnanost roste alarmujícím tempem. Lidé přicházejí o práci a spotřeba domácností zamrzla.",
      "Fronty na úřadech práce jsou nekonečné. Sociální systém je pod obrovským tlakem.",
      "Ztráta práce vede k sociálním nepokojům. Lidé nemají na nájmy, musíme jednat.",
      "Služby jsou zdecimované. Gastronomie a turismus prakticky přestaly existovat.",
      "Potřebujeme masivní injekci do soukromého sektoru, jinak se trh práce zhroutí úplně.",
      `Nezaměstnanost vzrostla o ${unemployment.toFixed(1)} procentních bodů. To je ${Math.round(unemployment * 50000)} lidí bez práce navíc.`,
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'kurzarbeit')) {
      suggestion = "Aktivujte Kurzarbeit! Je to jediný způsob, jak udržet lidi v zaměstnání během restrikcí.";
    } else if (hasNone(ctx, 'business_support')) {
      suggestion = "Kurzarbeit běží, ale firmy potřebují i přímé kompenzace na fixní náklady.";
    } else {
      suggestion = "Kompenzační programy běží, ale nestačí. Musíme začít uvolňovat ekonomiku.";
    }

  // ── MEDIUM: Too many expensive measures ──
  } else if (ctx.activeMeasureCount > 8) {
    urgency = 'medium';
    const base = [
      "Máte aktivní příliš mnoho drahých opatření. Každý týden této uzávěry nás stojí miliardy.",
      "Kombinace všech těchto zákazů je pro rozpočet neúnosná. Musíme vybrat jen ta nejúčinnější.",
      "Náklady na plošné testování a kompenzace rostou rychleji než příjmy státu.",
      "Ekonomika krvácí. Nemůžeme si dovolit udržovat všechna tato omezení naráz.",
      "Efektivita některých opatření neodpovídá jejich ekonomické ceně. Udělejte revizi.",
      `Máte zapnuto ${ctx.activeMeasureCount} opatření naráz. To je fiskální sebevražda.`,
    ];
    message = pick(base, turn);

    if (has(ctx, 'mask_mandate_outdoor')) {
      suggestion = "Venkovní roušky stojí politický kapitál a nic nedělají. Ušetřete tam.";
    } else if (has(ctx, 'eat_vitamins')) {
      suggestion = 'Kampaň "Jezte vitamíny" stojí peníze a nezpomaluje virus. Zrušte ji.';
    } else {
      suggestion = "Zvažte, zda jsou všechna plošná omezení nezbytná. Méně je někdy více.";
    }

  // ── MEDIUM: Lockdown active but economy holding ──
  } else if (hasAny(ctx, 'community_lockdown', 'military_lockdown') && gdp > -10) {
    urgency = 'medium';
    const base = [
      "Lockdown funguje epidemiologicky, ale ekonomicky je to katastrofa. Sledujte HDP — klesá každý den.",
      "Pokud lockdown potrvá déle než jedno kolo, dopady na podnikatele budou nevratné.",
      "Zavřené obchody, prázdné restaurace. Rozumím proč to děláme, ale musíme mít plán na konec.",
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'business_support', 'kurzarbeit')) {
      suggestion = "Máte lockdown bez kompenzací! Aktivujte Kurzarbeit a podporu podnikatelům, jinak se ekonomika nezotaví.";
    } else {
      suggestion = "Kompenzace zmírňují dopady, ale lockdown nemůže trvat věčně. Připravte plán uvolnění.";
    }

  // ── LOW: Economy stable ──
  } else {
    urgency = 'low';
    const base = [
      "Ekonomika zatím drží, ale rozpočtový deficit začíná být problémem.",
      "Podnikatelská sféra je nervózní, ale zatím spolupracuje. Potřebují však jasný výhled.",
      "Aktuální propad HDP je v rámci očekávání. Máme prostor pro další stabilizační kroky.",
      "Průmyslová výroba se adaptovala na hygienická opatření. To je dobrá zpráva.",
      "Můžeme si dovolit mírné zvýšení výdajů na podporu očkování nebo testování.",
      "Ekonomika drží, ale situace je křehká. Jeden špatný krok a spadneme do spirály.",
    ];
    message = pick(base, turn);

    if (ctx.vaccinationActive && hasNone(ctx, 'business_support')) {
      suggestion = "Očkování běží — zvažte kompenzace pro firmy, které musí kvůli vakcinaci omezit provoz.";
    } else if (has(ctx, 'wfh_mandate') && hasNone(ctx, 'kurzarbeit')) {
      suggestion = "Home-office je fajn, ale některé firmy to nezvládnou bez Kurzarbeitu.";
    }
  }

  return {
    role: 'economist',
    name,
    message,
    suggestion,
    urgency,
    background: `${bg.background}\n\nOblasti: ${bg.expertise.join(', ')}\nCharakter: ${bg.personality}`,
  };
}

// ═══════════════════════════════════════════
// POLITICIAN — JUDr. Svoboda
// ═══════════════════════════════════════════

function generatePolitician(ctx: AdvisorContext): AdvisorMessage {
  const bg = ADVISOR_BACKGROUNDS.politician;
  const name = 'JUDr. Svoboda (politik)';
  const capital = ctx.socialCapital;
  const turn = ctx.turnNumber;
  const leader = ctx.crisisLeader ?? 'hygienik';

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  // ── CRITICAL: Near civil unrest ──
  if (capital < 20) {
    urgency = 'critical';
    const base = [
      "Lidé už nás mají dost. V ulicích to vře a vymahatelnost opatření je téměř nulová.",
      "Policie hlásí masové ignorování vládních nařízení. Stát ztrácí svou autoritu.",
      "Jsme na hraně občanské neposlušnosti. Jediný chybný krok a situace v ulicích vybuchne.",
      "Důvěra ve státní instituce je na historickém minimu. Takhle se nedá vládnout.",
      "Lidé se přestali bát viru a začali se bát vládních opatření. To je konečná.",
      "Naše průzkumy ukazují, že 75 % občanů nedůvěřuje vládě. To je předrevoluční stav.",
      "Demonstrace se konají každý den. Někteří policisté odmítají zasahovat — sympatizují s demonstranty.",
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'opposition_briefing')) {
      suggestion = "Okamžitě informujte opozici! Potřebujeme alespoň zdání jednoty.";
    } else if (hasNone(ctx, 'mental_health_support')) {
      suggestion = "Spusťte program psychické podpory — lidé jsou na pokraji zhroucení.";
    } else if (has(ctx, 'military_lockdown')) {
      suggestion = "Armáda v ulicích situaci jen zhoršuje. Zvažte přechod na měkčí opatření.";
    } else {
      suggestion = "Potřebujeme velké gesto dobré vůle — uvolněte alespoň symbolická opatření.";
    }

  // ── HIGH: Trust collapsing ──
  } else if (capital < 40) {
    urgency = 'high';
    const base = [
      "Důvěra veřejnosti se hroutí. Každé nové omezení vyvolává vlnu odporu na sociálních sítích.",
      "Naše politické přežití je v sázce. Opozice cítí krev a veřejnost je na její straně.",
      "Společenská smlouva je vážně poškozena. Lidé nechápou smysl vašich kroků.",
      "Kritika v médiích je zdrcující. Potřebujeme změnit narativ a ukázat výsledky.",
      "Sociální kapitál je vyčerpán. Bez spolupráce občanů tu epidemii nikdy nezastavíme.",
      "Průzkumy mluví jasně: většina lidí považuje opatření za nepřiměřená. Musíme něco změnit.",
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'media_transparency')) {
      suggestion = "Spusťte transparentní mediální komunikaci — denní tiskové konference s daty.";
    } else if (hasNone(ctx, 'public_campaign')) {
      suggestion = "Informační kampaň by pomohla vysvětlit důvody opatření. Lidé potřebují pochopit proč.";
    } else if (hasNone(ctx, 'community_leaders')) {
      suggestion = "Zapojte komunitní lídry — starosty, faráře, místní autority. Lidé jim věří víc než vládě.";
    } else {
      suggestion = "Zlepšete komunikaci, přestaňte jen zakazovat a začněte lidem naslouchat.";
    }

  // ── MEDIUM: Too many measures fatigue ──
  } else if (ctx.activeMeasureCount > 10) {
    urgency = 'medium';
    const base = [
      "Příliš mnoho zákazů lidi unavuje. Společenská soudržnost má své meze a my je právě testujeme.",
      "Lidé jsou zmatení z množství pravidel. Nikdo už neví, co vlastně platí.",
      "Snažíte se regulovat každý detail lidského života. To se nám politicky vymstí.",
      "Opatření jsou vnímána jako chaotická. Musíme systém zjednodušit.",
      "Sociální únava je realitou. I ti nejdisciplinovanější začínají pravidla obcházet.",
    ];
    message = pick(base, turn);

    if (has(ctx, 'mask_mandate_outdoor') && has(ctx, 'eat_vitamins')) {
      suggestion = "Máte zapnuté venkovní roušky i vitamínovou kampaň — oboje je zbytečné a dráždí lidi.";
    } else {
      suggestion = "Zjednodušte pravidla — málo srozumitelných opatření funguje lépe než mnoho nejasných.";
    }

  // ── MEDIUM: Hygienik leading too long ──
  } else if (leader === 'hygienik' && ctx.cumulativeDeaths > 5000 && capital < 60) {
    urgency = 'medium';
    message = "Veřejnost se ptá, proč situaci stále řídí hygienik a ne premiér. Vnímají to jako absenci politického vedení.";
    suggestion = "Zvažte, zda by premiér neměl převzít řízení krizového štábu — symbolika je důležitá.";

  // ── LOW: Stable ──
  } else {
    urgency = 'low';
    const base = [
      "Veřejnost je zatím klidná a většinou spolupracuje. Máme prostor pro nutné kroky.",
      "Politická situace je stabilní. Máme mandát k řešení krize, využijme ho rozumně.",
      "Důvěra ve vládní experty je vysoká. Lidé věří, že víme, co děláme.",
      "Společnost je jednotná v boji proti viru. Tohle je náš největší spojenec.",
      "Můžeme si dovolit i některá nepopulární opatření, pokud budou dobře vysvětlena.",
      "Máme okno příležitosti. Sociální kapitál je dostatečný na zavedení potřebných opatření.",
    ];
    message = pick(base, turn);

    if (ctx.activeMeasureCount === 0 && ctx.trendInfections === 'rising') {
      suggestion = "Nemáte zapnuté žádné opatření a epidemie roste. Veřejnost čeká akci, ne pasivitu.";
    } else if (hasNone(ctx, 'opposition_briefing') && turn > 3) {
      suggestion = "Doporučuji pravidelné briefy pro opozici — předejdeme politické krizi.";
    }
  }

  return {
    role: 'politician',
    name,
    message,
    suggestion,
    urgency,
    background: `${bg.background}\n\nOblasti: ${bg.expertise.join(', ')}\nCharakter: ${bg.personality}`,
  };
}

// ═══════════════════════════════════════════
// MILITARY — Gen. Vlk (with predictions!)
// ═══════════════════════════════════════════

function generateMilitary(ctx: AdvisorContext): AdvisorMessage {
  const bg = ADVISOR_BACKGROUNDS.military;
  const name = 'Gen. Vlk (armáda)';
  const turn = ctx.turnNumber;
  const reff = ctx.estimatedReff;
  const hosp = ctx.hospitalOccupancyFraction;
  const icu = ctx.icuOccupancyFraction;
  const trend = ctx.trendInfections;
  const hasArmyMeasures = ctx.activeMeasureIds?.some(id => id.startsWith('army_') || id.startsWith('military_')) ?? false;
  const daysPerTurn = ctx.daysPerTurn ?? 14;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  // ── Generate predictions ──
  const prediction14d = generatePrediction14d(ctx);
  const prediction1m = generatePrediction1m(ctx);

  // ── CRITICAL: Logistics collapse ──
  if (hosp > 1.0) {
    urgency = 'critical';
    const base = [
      "Logistické řetězce jsou přetíženy. Převážíme pacienty mezi kraji, ale volná místa docházejí.",
      "Armáda začíná stavět polní nemocnice. Potřebujeme ale civilní personál, který nemáme.",
      "Stavíme stany pro triage před nemocnicemi. Situace připomíná válečnou zónu.",
      "Naše zásoby kyslíku a ventilátorů jsou na kritické úrovni. Distribuce je prioritou.",
      "Vojenská policie pomáhá s ostrahou nemocnic, dochází k incidentům se zoufalými příbuznými.",
      "Selhává distribuce léků. Kamiony stojí, personál chybí. Nasazuji zálohy.",
      "Situace na zemi je kritická. Hlásím: nemáme kde skladovat zemřelé. To není nadsázka.",
    ];
    message = pick(base, turn);

    if (hasNone(ctx, 'army_hospitals')) {
      suggestion = "Okamžitý rozkaz ke stavbě polních nemocnic. Čekáme na vaše rozhodnutí.";
    } else if (hasNone(ctx, 'army_logistics')) {
      suggestion = "Aktivujte armádní logistiku — potřebujeme koordinovat zásobování.";
    } else {
      suggestion = "Veškeré armádní kapacity jsou nasazeny. Bez dalších opatření to nevyhrajeme.";
    }

  // ── HIGH: Army active, situation tense ──
  } else if (hasArmyMeasures && hosp > 0.6) {
    urgency = 'high';
    const base = [
      "Armádní jednotky jsou nasazeny. Operace probíhá dle plánu, ale potřebujeme více času.",
      "Hlásím: polní nemocnice jsou operabilní. Kapacita je omezená, ale funguje.",
      "Vojáci pomáhají s testováním a logistikou. Morálka je dobrá, ale situace se musí zlepšit.",
      "Armádní kontroly dodržování opatření fungují. Compliance se zvýšila o 30 %.",
    ];
    message = pick(base, turn);
    suggestion = "Armáda plní úkoly. Doporučuji doplnit civilní opatření pro synergický efekt.";

  // ── MEDIUM: Warning about incoming situation ──
  } else if (trend === 'rising' && reff > 1.3 && !hasArmyMeasures) {
    urgency = 'medium';
    const base = [
      "Z mého pohledu sledujeme vývoj, který povede ke kolapsu během 2-3 týdnů. Měli bychom být připraveni.",
      "Analyzuji trendy — nemocnice budou plné za přibližně 20 dní. Doporučuji preventivní přípravu.",
      "Armáda je v pohotovosti. Pokud řeknete slovo, můžeme být na místě do 48 hodin.",
      "Studuji data. Křivka připomíná situaci v severní Itálii před kolapsem. Varoval bych.",
    ];
    message = pick(base, turn);
    suggestion = "Doporučuji preventivně aktivovat armádní logistiku — až bude pozdě, nezbyde čas.";

  // ── LOW: Standard updates ──
  } else if (hasArmyMeasures) {
    urgency = 'low';
    const base = [
      "Armáda plní zadané úkoly. Logistika vakcín a testů funguje podle plánu.",
      "Jsme připraveni na jakýkoli rozkaz. Naše jednotky jsou v pohotovosti.",
      "Pomáháme s odběry v krajích, kde civilní kapacity selhávají.",
      "Zahraniční mise byly omezeny, veškeré zdroje soustředíme na domácí frontu.",
      "Logistika ochranných pomůcek je zajištěna. Centrální sklady jsou doplňovány.",
    ];
    message = pick(base, turn);

  } else {
    urgency = 'low';
    const base = [
      "Armáda je v pohotovosti a sleduje situaci. Pokud bude potřeba, jsme připraveni.",
      "Nemám aktivní rozkazy. Analyzuji situaci a připravuji plány pro různé scénáře.",
      "Sledujeme vývoj. Z logistického hlediska jsme připraveni na případnou eskalaci.",
      "Bez aktivních rozkazů provádíme cvičení a přípravu krizových plánů.",
      "Hlásím: armáda je připravena. Čekáme na vaše rozhodnutí o nasazení.",
    ];
    message = pick(base, turn);

    if (hosp > 0.5 && hasNone(ctx, 'army_logistics')) {
      suggestion = "Nemocnice se plní. Zvažte preventivní nasazení armádní logistiky.";
    }
  }

  return {
    role: 'military',
    name,
    message,
    suggestion,
    urgency,
    background: `${bg.background}\n\nOblasti: ${bg.expertise.join(', ')}\nCharakter: ${bg.personality}`,
    prediction14d,
    prediction1m,
  };
}

// ── Prediction helpers for Gen. Vlk ──

function generatePrediction14d(ctx: AdvisorContext): string {
  const reff = ctx.estimatedReff;
  const hosp = ctx.hospitalOccupancyFraction;
  const trend = ctx.trendInfections;

  if (reff > 1.5 && trend === 'rising') {
    const projHosp = Math.round(hosp * 100 * Math.pow(reff, 1));
    return `Predikce 14 dní: Exponenciální růst pokračuje. Očekávaná obsazenost nemocnic: ~${Math.min(projHosp, 200)} %. Denní nové případy se pravděpodobně zdvojnásobí. Doporučuji připravit záložní kapacity.`;
  }
  if (reff > 1.2 && trend === 'rising') {
    return `Predikce 14 dní: Růst pokračuje mírnějším tempem. Nemocnice se budou plnit — obsazenost vzroste o ~${Math.round((reff - 1) * 50)} procentních bodů. Situace se nezlepší bez zásahu.`;
  }
  if (reff > 1.0 && reff <= 1.2) {
    return `Predikce 14 dní: Pomalý růst. Nárůst hospitalizací bude pozvolný, ale kumulativní. Bez zpřísnění se za 14 dní dostaneme o stupeň výš.`;
  }
  if (trend === 'falling' && reff < 1.0) {
    return `Predikce 14 dní: Pokles pokračuje. Očekávám úlevu v nemocnicích za ~10 dní (zpoždění mezi nákazou a hospitalizací). R = ${reff.toFixed(2)} je dobrá zpráva.`;
  }
  if (trend === 'stable') {
    return `Predikce 14 dní: Stabilní situace. Bez výrazných změn v opatřeních očekávám podobný stav. Plató může trvat týdny.`;
  }
  return `Predikce 14 dní: Situace je nepřehledná. R = ${reff.toFixed(2)}, trend je ${trend === 'rising' ? 'rostoucí' : trend === 'falling' ? 'klesající' : 'stabilní'}. Potřebuji lepší data pro přesnější odhad.`;
}

function generatePrediction1m(ctx: AdvisorContext): string {
  const reff = ctx.estimatedReff;
  const hosp = ctx.hospitalOccupancyFraction;
  const trend = ctx.trendInfections;
  const vax = ctx.vaccinationActive;

  if (reff > 1.5 && trend === 'rising') {
    return `Predikce 1 měsíc: Bez zásahu očekávám kolaps zdravotního systému. Kumulativní úmrtnost se může zdvojnásobit. Armáda bude muset stavět polní nemocnice. Situace bude vyžadovat tvrdý lockdown.`;
  }
  if (reff > 1.2) {
    return `Predikce 1 měsíc: Pokud nezpřísníme opatření, nemocnice budou na hranici kapacit. Odhadovaný nárůst hospitalizací: ${Math.round((reff - 1) * 150)} %. Musíme stlačit R pod 1.`;
  }
  if (reff > 1.0 && !vax) {
    return `Predikce 1 měsíc: Pomalý růst přeroste v problém. Bez vakcinace a bez zpřísnění skončíme v pozici, ze které se těžko vrací. Doporučuji preventivní akci.`;
  }
  if (reff > 1.0 && vax) {
    return `Predikce 1 měsíc: Vakcinace pomáhá, ale R je stále nad 1. Závod mezi virem a vakcínou — záleží na tempu očkování. Optimistický scénář: stabilizace za 3-4 týdny.`;
  }
  if (trend === 'falling' && reff < 0.9) {
    return `Predikce 1 měsíc: Pokud udržíme stávající opatření, epidemie bude pod kontrolou. ${vax ? 'Vakcinace výrazně pomáhá.' : 'Zvažte přípravu na vakcinaci.'} Tlak na nemocnice klesne na únosnou úroveň.`;
  }
  if (trend === 'falling') {
    return `Predikce 1 měsíc: Pokles by měl pokračovat, ale existuje riziko odrazové vlny při předčasném uvolnění. Doporučuji opatrné uvolňování po etapách.`;
  }
  return `Predikce 1 měsíc: Stabilní situace s nejistým výhledem. ${vax ? 'Vakcinace je klíčová — závisí na tempu.' : 'Bez vakcíny závisíme na opatřeních.'} Připravuji plány pro oba scénáře.`;
}

// ═══════════════════════════════════════════
// OPPOSITION — Mgr. Čermák
// ═══════════════════════════════════════════

function generateOpposition(ctx: AdvisorContext): AdvisorMessage {
  const bg = ADVISOR_BACKGROUNDS.opposition;
  const name = 'Mgr. Čermák (opozice)';
  const briefings = ctx.oppositionBriefings ?? 0;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'medium';
  let message = "";
  let suggestion: string | undefined;

  // ── Cooperative (3+ briefings) ──
  if (briefings >= 3) {
    urgency = 'low';
    const base = [
      "Oceňuji pravidelné informace. V této chvíli nebudeme situaci hrotit. Společný nepřítel je virus.",
      "I když máme výhrady, oceňujeme vaši snahu o transparentnost. Budeme konstruktivní.",
      "Data, která jste nám poskytli, analyzujeme. Máme některé návrhy na vylepšení kompenzací.",
      "V krizových momentech musíme držet spolu. Děkuji za pravidelné konzultace.",
      "Opozice je připravena podpořit prodloužení nouzového stavu, pokud udržíte tento dialog.",
      "Naši experti analyzovali vaše modely a souhlasí s většinou závěrů. Pár drobností bychom ladili.",
      "Budeme hlasovat pro prodloužení nouzového stavu. Transparentnost má výsledky — děkujeme.",
    ];
    message = pick(base, turn);

    // Constructive suggestions based on what's missing
    if (ctx.cumulativeDeaths > 1000 && hasNone(ctx, 'data_dashboard')) {
      suggestion = "Jako opozice navrhujeme veřejný datový dashboard — zvýší důvěru občanů v rozhodování.";
    } else if (hasNone(ctx, 'mental_health_support') && ctx.socialCapital < 50) {
      suggestion = "Náš výbor doporučuje program psychické podpory — lidé trpí nejen virem.";
    }

  // ── No briefings: Hostile ──
  } else if (briefings === 0) {
    urgency = 'high';
    const base = [
      "Vláda naprosto selhává v komunikaci! Opatření jsou chaotická a my se o nich dozvídáme z Twitteru.",
      "Vaše arogance je neuvěřitelná. Ignorujete opozici, jako bychom neexistovali. Budeme žádat o nedůvěru.",
      "Takhle se krize neřídí. Děláte si z toho vlastní PR show a na lidi kašlete.",
      "Zatajujete nám data! Proč se bojíte ukázat analýzy, na základě kterých ničíte lidem životy?",
      "Vaše vládnutí připomíná spíše absolutismus než parlamentní demokracii. To si nenecháme líbit.",
      "Svolávám mimořádnou schůzi Sněmovny. Budeme požadovat vysvětlení každého vašeho rozhodnutí.",
      "Máme důkazy, že vláda ignorovala varování odborníků. Zveřejníme to v médiích.",
    ];
    message = pick(base, turn);

    // Hostile opposition provides no helpful suggestion, just pressure
    if (ctx.cumulativeDeaths > 500) {
      suggestion = `${ctx.cumulativeDeaths.toLocaleString()} mrtvých a stále nás ignorujete? Budeme žádat hlasování o nedůvěře!`;
    }

  // ── Partially cooperative (1-2 briefings) ──
  } else {
    urgency = 'medium';
    const base = [
      "Díky za ten jeden briefing, ale je to málo. Potřebujeme průběžné informace.",
      "Informovali jste nás, až když bylo rozhodnuto. To není spolupráce, to je jen oznámení.",
      "Zaslané podklady jsou neúplné. Chceme vidět modely vývoje na příští měsíc.",
      "Vaše snaha o dialog je zatím jen polovičatá. Očekáváme více schůzek.",
      "Máme pocit, že nás informujete jen tehdy, když se vám to politicky hodí.",
      "Ocenili jsme briefing, ale nemůžete informovat jednou a pak čekat mlčenlivou podporu.",
    ];
    message = pick(base, turn);

    suggestion = "Budeme konstruktivnější, pokud s námi budete komunikovat pravidelně, ne jen jednorázově.";
  }

  return {
    role: 'opposition',
    name,
    message,
    suggestion,
    urgency,
    background: `${bg.background}\n\nOblasti: ${bg.expertise.join(', ')}\nCharakter: ${bg.personality}`,
  };
}
