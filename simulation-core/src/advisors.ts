/**
 * Advisory System — Rule-based advisor message generator.
 *
 * Five advisors may attend each crisis staff meeting:
 * 1. MUDr. Nováková (epidemiologist) — clinical impact, emotional about patients
 * 2. Ing. Dvořák (economist) — GDP, unemployment, dry humor about costs
 * 3. JUDr. Svoboda (politician) — social capital, public mood, pragmatic/cynical
 * 4. Gen. Vlk (military) — appears only when army measures active; stoic projections
 * 5. Mgr. Čermák (opposition) — always present, sarcastic critic, softens with briefings
 */

import { type AdvisorMessage, type EconomicState, type TurnReport } from './types';

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
  // new fields for army advisor
  activeMeasureIds?: string[];
  currentHospitalized?: number;
  hospitalCapacity?: number;
  currentICU?: number;
  icuCapacity?: number;
  observedInfections?: number;
  // WHO early detection
  whoConsultationActive?: boolean;
  // Opposition dynamics
  oppositionBriefings?: number;
}

export function generateAdvisorMessages(ctx: AdvisorContext): AdvisorMessage[] {
  const messages: AdvisorMessage[] = [
    generateEpidemiologist(ctx),
    generateEconomist(ctx),
    generatePolitician(ctx),
  ];

  // General Vlk appears only when any army measure is active
  const armyActive = ctx.activeMeasureIds?.some(id => id.startsWith('army_')) ?? false;
  if (armyActive) {
    messages.push(generateMilitary(ctx));
  }

  // Opposition leader is always present
  messages.push(generateOpposition(ctx));

  return messages;
}

function generateEpidemiologist(ctx: AdvisorContext): AdvisorMessage {
  const name = 'MUDr. Nováková';
  const reff = ctx.estimatedReff;
  const hospFrac = ctx.hospitalOccupancyFraction;
  const icuFrac = ctx.icuOccupancyFraction;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message: string;
  let suggestion: string | undefined;

  if (icuFrac > 0.9) {
    urgency = 'critical';
    message = `*hlas se třese* Kapacita JIP je na ${Math.round(icuFrac * 100)}%. Dnes ráno jsem musela rozhodnout, který ze dvou pacientů dostane poslední ventilátor. ` +
      `Tomu druhému je 52 let, má dvě děti. Tohle... tohle nemůžeme dělat dál. ` +
      `Mortalita neventilovaných pacientů je podle zahraničních dat 80–90%. Každý den bez zásahu je rozsudek smrti pro desítky lidí.`;
    suggestion = 'Prosím vás — okamžitý lockdown a polní nemocnice. A zvažte třídění pacientů... i když to slovo nesnáším.';
  } else if (hospFrac > 0.8) {
    urgency = 'high';
    message = `Nemocnice hlásí ${Math.round(hospFrac * 100)}% obsazenost. Včera jsem mluvila s primářem z Motola — říká, že sestry pláčou v šatnách. Dvanáctá hodina přesčas. ` +
      `Pacienti čekají na lůžko na chodbách. Vidíme nárůst sekundárních komplikací — bakteriální superinfekce, renální selhání. ` +
      `Pokud trend pokračuje, za ${Math.max(3, Math.round((1 - hospFrac) / 0.015))} dní začneme odkládat onkologické operace. Ty lidi taky zabijeme, jen pomaleji.`;
    suggestion = 'Zpřísnění opatření — teď, ne až bude pozdě. Přesun lehčích pacientů do domácí péče.';
  } else if (reff > 1.5) {
    urgency = 'high';
    message = `R je ${reff.toFixed(1)} — to je exponenciála, která nás předběhne. ${ctx.trendInfections === 'rising' ? 'Počty akcelerují a já mám z toho husí kůži.' : ''} ` +
      `Začínají se objevovat těžší průběhy i u mladších ročníků. Jedna kolegyně, 38 let, úplně zdravá — teď leží na JIP. ` +
      `Při tomhle R se počet případů zdvojnásobí za ${Math.round(14 / Math.log2(reff))} dní. Potřebujeme jednat HNED, ne za dva týdny.`;
    suggestion = 'Kombinace opatření — samotné roušky nestačí, potřebujeme omezit kontakty. Prosím.';
  } else if (reff > 1.0) {
    urgency = 'medium';
    message = `R kolem ${reff.toFixed(1)}, epidemie pomalu roste. Vím, že to nezní dramaticky, ale... ` +
      `každý den přibývají pacienti s postinfekčním syndromem — únava, dušnost, kognitivní potíže. Ti lidé budou mít problémy měsíce, možná roky. ` +
      `${ctx.detectionRate < 0.4 ? 'A hlavně — testujeme tragicky málo. Pracujeme naslepo. Skutečnost je pravděpodobně mnohonásobně horší.' : 'Testovací kapacita je aspoň přiměřená.'}`;
    suggestion = ctx.activeMeasureCount > 3
      ? 'Současná opatření brzdí růst, ale k poklesu nestačí. Trasování by pomohlo.'
      : 'Přidejte aspoň jedno omezení kontaktů — projeví se za 1-2 týdny, vím, je to frustrující čekat.';
  } else if (reff > 0.8) {
    urgency = 'low';
    message = `R je ${reff.toFixed(1)}, epidemie ustupuje. *úlevný výdech* ` +
      `${ctx.newDeaths > 10 ? `Stále ale přicházejí úmrtí — většinou starší pacienti, u kterých i mírný průběh spustí kaskádu komplikací. Každé to číslo je někdo, koho někdo miloval.` : 'Nemocnice se stabilizují, můžeme obnovit odkládanou péči.'} ` +
      `${ctx.cumulativeDeaths > 500 ? `Celkem ${Math.round(ctx.cumulativeDeaths)} obětí... to je jako kdyby zmizela celá vesnice.` : ''}`;
    suggestion = ctx.activeMeasureCount > 4 ? 'Můžeme opatrně uvolňovat — ale prosím postupně. Nechci zažít další vlnu.' : undefined;
  } else {
    urgency = 'low';
    message = `Epidemie je pod kontrolou (R = ${reff.toFixed(1)}). Konečně si mohu dát kafe bez výčitek svědomí. ` +
      `${ctx.vaccinationActive ? 'Vakcinace funguje — ale musíme udržet proočkovanost u rizikových skupin, jinak se to vrátí.' : 'Bez vakcíny se imunita buduje pomalu a draze — na životech.'} ` +
      `Sledujme kanalizační surveillance pro včasné zachycení další vlny.`;
    suggestion = 'Udržet surveillance a připravenost. A nezapomínejme na postinfekční pacienty.';
  }

  if (ctx.detectionRate < 0.25) {
    message += ' Testovací kapacita je KRITICKY nízká — jsme slepí. Tohle mě děsí víc než cokoli jiného.';
  }

  if (ctx.cumulativeDeaths > 5000 && ctx.turnNumber > 3) {
    message += ` *tiše* ${Math.round(ctx.cumulativeDeaths).toLocaleString()} mrtvých... Snažím se nemyslet na to, kolik z nich jsme mohli zachránit.`;
  }

  return { role: 'epidemiologist', name, message, suggestion, urgency };
}

function generateEconomist(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Ing. Dvořák';
  const gdp = ctx.economicState.gdpImpact;
  const unemp = ctx.economicState.unemploymentDelta;
  const fiscal = ctx.economicState.fiscalCost;
  const conf = ctx.economicState.businessConfidence;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message: string;
  let suggestion: string | undefined;

  if (gdp < -8) {
    urgency = 'critical';
    message = `*sundává brýle a třikrát si mne oči* GDP -${Math.abs(gdp).toFixed(1)}%, nezaměstnanost +${unemp.toFixed(1)} p.b. ` +
      `Abych to řekl bez eufemismů: ekonomika je v troskách. Firmy padají jako domečky z karet. ` +
      `Fiskální deficit dosahuje ${fiscal.toFixed(1)} miliard — to bude splácet generace, která se ještě nenarodila. ` +
      `${conf < 30 ? 'Podnikatelská důvěra je na nule. Investoři utíkají ze země.' : ''} ` +
      `Můj oblíbený restauratér se minulý týden zavřel. To není statistika, to je člověk.`;
    suggestion = 'Buď uvolníme opatření, nebo masivní kompenzace. Jinak nás čeká sociální kolaps.';
  } else if (gdp < -4) {
    urgency = 'high';
    message = `GDP -${Math.abs(gdp).toFixed(1)}%, nezaměstnanost +${unemp.toFixed(1)} p.b. Ekonomika krvácí, ale ještě žije. ` +
      `${conf < 40 ? 'Podnikatelé mi volají v osm večer — nemají na nájmy.' : 'Firmy to zatím přežívají, ale tenkou nití.'} ` +
      `${fiscal > 5 ? `Fiskální náklady ${fiscal.toFixed(1)} mld — to je víc než rozpočet ministerstva zdravotnictví.` : ''} ` +
      `A to ještě nepočítám dlouhodobé škody — odloženou zdravotní péči, psychické problémy, rozpadlé rodiny.`;
    suggestion = 'Kurzarbeit a kompenzace — stojí peníze, ale levnější než masová nezaměstnanost.';
  } else if (gdp < -1) {
    urgency = 'medium';
    message = `Ekonomický dopad je zatím stravitelný (GDP ${gdp.toFixed(1)}%). ` +
      `${fiscal > 2 ? `Fiskální náklady ${fiscal.toFixed(1)} mld, ale to je cena za civilizovanou odpověď na krizi.` : 'Rozpočet to unese.'} ` +
      `Každé další opatření ale stojí peníze — a to říkám jako ekonom, ne jako cynik. Někdy je dražší nejednat.`;
    suggestion = ctx.activeMeasureCount > 5 ? 'Každé další opatření zdražuje rozpočet. Zvažte, které opravdu fungují.' : undefined;
  } else {
    urgency = 'low';
    message = `Ekonomika je stabilní — a to mě v téhle situaci příjemně překvapuje. ` +
      `${unemp > 1 ? `Nezaměstnanost sice o ${unemp.toFixed(1)} p.b. výš, ale to se vrátí.` : 'Trh práce funguje normálně.'} ` +
      `Buďme za to vděční a doufejme, že to vydrží.`;
  }

  return { role: 'economist', name, message, suggestion, urgency };
}

function generatePolitician(ctx: AdvisorContext): AdvisorMessage {
  const name = 'JUDr. Svoboda';
  const capital = ctx.socialCapital;
  const remaining = ctx.totalTurns - ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message: string;
  let suggestion: string | undefined;

  if (capital < 15) {
    urgency = 'critical';
    message = `Sociální kapitál ${Math.round(capital)}%. *nervózně ťuká propiskou* Tohle je konec, pokud nezareagujeme. ` +
      `V ulicích demonstrace, na sociálních sítích šílený hněv. Lidé pálí roušky na náměstích. ` +
      `Jakékoli nové opatření bude ignorováno — nemáme žádnou autoritu.`;
    suggestion = 'Uvolněte opatření IHNED. Přidejte kompenzace. Jinak padneme.';
  } else if (capital < 30) {
    urgency = 'high';
    message = `Důvěra na ${Math.round(capital)}%. Média nás trhají na kusy. ` +
      `Opozice sbírá body, petice za odvolání vlády má 200 tisíc podpisů. ` +
      `${ctx.cumulativeDeaths > 1000 ? 'A upřímně — s tolika oběťmi je těžké tu kritiku odmítat.' : 'Přitom ta situace ještě není tak zlá — ale lidé jsou unavení.'} ` +
      `Compliance klesá — co nařídíme, polovina lidí ignoruje.`;
    suggestion = 'Informační kampaň a transparentnost. A hlavně — kompenzace.';
  } else if (capital < 50) {
    urgency = 'medium';
    message = `Veřejnost je unavená (kapitál ${Math.round(capital)}%). Zatím poslouchají, ale cítím, jak to vře pod povrchem. ` +
      `${ctx.cumulativeDeaths > 500 ? 'Paradoxně — vysoký počet obětí lidi drží v napětí a respektují opatření.' : ''} ` +
      `*povzdech* Tahle práce...`;
    suggestion = ctx.activeMeasureCount > 4 ? 'Zvažte, zda jsou VŠECHNA opatření nezbytná.' : undefined;
  } else if (capital > 80) {
    urgency = 'low';
    message = `Kapitál ${Math.round(capital)}% — veřejnost spolupracuje. ${ctx.cumulativeDeaths < 100 ? 'Lidé oceňují rychlou reakci. Užijte si to, dlouho to nevydrží.' : 'Vážnost situace drží disciplínu.'} ` +
      `${remaining <= 4 ? 'Blíží se konec funkčního období — teď je čas ukázat, že to mělo smysl.' : ''}`;
  } else {
    urgency = 'low';
    message = `Politická situace je stabilní (kapitál ${Math.round(capital)}%). Máte prostor pro rozhodování — to je v krizi luxus.`;
  }

  return { role: 'politician', name, message, suggestion, urgency };
}

/**
 * General Vlk — military advisor, appears only when army measures are active.
 * Stoic, professional, projects 2 weeks ahead.
 */
function generateMilitary(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Gen. Vlk';
  const reff = ctx.estimatedReff;
  const hospFrac = ctx.hospitalOccupancyFraction;
  const currentHosp = ctx.currentHospitalized ?? Math.round(hospFrac * (ctx.hospitalCapacity ?? 5000));
  const hospCap = ctx.hospitalCapacity ?? 5000;
  const icuCap = ctx.icuCapacity ?? 500;
  const currentICU = ctx.currentICU ?? Math.round(ctx.icuOccupancyFraction * icuCap);

  const growthFactor = reff > 1 ? Math.pow(reff, 1) : reff;
  const projectedHosp = Math.round(currentHosp * growthFactor);
  const projectedICU = Math.round(currentICU * growthFactor);
  const projectedHospFrac = projectedHosp / Math.max(1, hospCap);
  const projectedICUFrac = projectedICU / Math.max(1, icuCap);
  const projHospLow = Math.round(projectedHosp * 0.8);
  const projHospHigh = Math.round(projectedHosp * 1.2);
  const projICULow = Math.round(projectedICU * 0.8);
  const projICUHigh = Math.round(projectedICU * 1.2);

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message: string;
  let suggestion: string | undefined;

  if (projectedHospFrac > 1.0 || projectedICUFrac > 1.0) {
    urgency = 'critical';
    message = `*stručně, věcně* Projekce 14 dní: hospitalizace ${projHospLow}–${projHospHigh} (kapacita ${hospCap}), JIP ${projICULow}–${projICUHigh} (kapacita ${icuCap}). ` +
      `Překročíme kapacitu. Aktivuji zálohy, připravuji evakuační plány. Tohle jsem zažil v Afghánistánu — tam ale stříleli nepřátelé, ne naše vlastní nerozhodnost.`;
    suggestion = 'Polní nemocnice a EADRCC. Rozkaz je rozkaz — ale musí přijít.';
  } else if (projectedHospFrac > 0.7) {
    urgency = 'high';
    message = `Projekce 14 dní: H ${projHospLow}–${projHospHigh}/${hospCap}, JIP ${projICULow}–${projICUHigh}/${icuCap}. ` +
      `Napjaté. Zásoby kyslíku na 10 dní. Moji lidé jsou připraveni, ale potřebujeme jasné rozhodnutí — ne možná, ne uvidíme, ale ano nebo ne.`;
    suggestion = 'Preventivní příprava polních nemocnic. Logistika armády na zásobování.';
  } else if (ctx.trendInfections === 'rising') {
    urgency = 'medium';
    message = `Projekce 14 dní: H ${projHospLow}–${projHospHigh}, JIP ${projICULow}–${projICUHigh}. ` +
      `Trend rostoucí, ale kapacity drží. Sledujeme, připravujeme zálohy. Voják se neptá jestli přijde boj — připravuje se na něj.`;
    suggestion = 'Udržet logistiku a testovací kapacitu.';
  } else {
    urgency = 'low';
    message = `Projekce 14 dní: H ${projHospLow}–${projHospHigh}, JIP ${projICULow}–${projICUHigh}. ` +
      `Stabilní nebo klesající. Logistika bez problémů. Armáda je připravena — jako vždy.`;
  }

  return { role: 'military', name, message, suggestion, urgency };
}

/**
 * Mgr. Čermák — opposition leader.
 * Extremely sarcastic when not briefed, much more cooperative when briefed regularly.
 */
function generateOpposition(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Mgr. Čermák (opozice)';
  const briefings = ctx.oppositionBriefings ?? 0;
  const deaths = ctx.cumulativeDeaths;
  const capital = ctx.socialCapital;
  const gdp = ctx.economicState.gdpImpact;
  const hospFrac = ctx.hospitalOccupancyFraction;
  const measures = ctx.activeMeasureCount;

  let urgency: AdvisorMessage['urgency'] = 'medium';
  let message: string;
  let suggestion: string | undefined;

  // Cooperative mode (briefed regularly)
  if (briefings >= 3) {
    urgency = 'low';
    if (deaths > 5000) {
      message = `*vážně* Děkuji za pravidelné informování. Vím, že ta situace je... neuvěřitelně těžká. ${Math.round(deaths).toLocaleString()} obětí — to není číslo, to jsou rodiny. ` +
        `Nechci teď kritizovat, chci pomoct. Co potřebujete? Máme kontakty v regionech, můžeme pomoct s komunikací směrem k veřejnosti.`;
      suggestion = 'Nabízím spolupráci — společná tisková konference by ukázala národní jednotu.';
    } else if (hospFrac > 0.7) {
      message = `Vím o situaci v nemocnicích — a proto nekritizuji. Tohle není čas na politiku, tohle je čas na spolupráci. ` +
        `Nicméně mám povinnost říct: ${measures > 6 ? 'ta opatření jsou velmi tvrdá a naši voliči trpí' : 'mohli bychom udělat víc'}. ` +
        `Ale říkám to konstruktivně, ne destruktivně.`;
      suggestion = 'Pojďme společně komunikovat nutnost opatření — bude to uvěřitelnější.';
    } else if (gdp < -5) {
      message = `Díky za transparentnost. Ekonomická situace je vážná a naši voliči to cítí na vlastní kůži. ` +
        `Ale chápu, že nemáte na výběr. Jen... prosím, nezapomínejte na kompenzace. Lidi potřebují vědět, že na ně stát myslí.`;
    } else {
      message = `Oceňuji pravidelný briefing. Situace vypadá zvládnutelně — a to je vaše zásluha, uznat to musím. ` +
        `Samozřejmě, jako opozice mám výhrady k detailům, ale celkový směr je rozumný. ` +
        `*s úsměvem* Nelibujte si v tom, tenhle kompliment platí jen do příštích voleb.`;
    }
    return { role: 'opposition', name, message, suggestion, urgency };
  }

  // Partially briefed (1-2 briefings)
  if (briefings >= 1) {
    urgency = 'medium';
    if (deaths > 5000) {
      message = `${Math.round(deaths).toLocaleString()} obětí. Vím, že jste nás jednou informovali, a to oceňuji. Ale jednou nestačí. ` +
        `Potřebujeme průběžné informace, abychom mohli podpořit opatření před našimi voliči. ` +
        `Jinak nemám jinou možnost než kritizovat — a v tomhle případě bych opravdu raději pomáhal.`;
    } else if (hospFrac > 0.7) {
      message = `Nemocnice praskají ve švech a my se o tom dozvídáme z novin? Jeden briefing je málo. ` +
        `Chci pomoct — ale musím vědět, co se děje. Neberte to jako vyhrožování, berte to jako žádost.`;
    } else {
      message = `Díky za ten jeden briefing — aspoň něco. Ale politická spolupráce vyžaduje průběžnou komunikaci, ne jednorázové PR gesto. ` +
        `${measures > 5 ? 'Ta opatření jsou tvrdá a naši voliči se ptají proč.' : 'Zatím situace vypadá zvládnutelně — ale budeme sledovat.'}`;
    }
    return { role: 'opposition', name, message, suggestion, urgency };
  }

  // NOT briefed — full sarcasm mode
  urgency = deaths > 5000 ? 'critical' : hospFrac > 0.7 ? 'high' : 'medium';

  if (deaths > 10000) {
    message = `*do mikrofonu před kamerami* ${Math.round(deaths).toLocaleString()} mrtvých. Řeknu to znovu — ${Math.round(deaths).toLocaleString()} MRTVÝCH. ` +
      `A premiér si nenašel čas, aby opozici řekl, co se děje? Žádný briefing, žádná konzultace, žádný telefonát? ` +
      `Tohle není řízení krize, tohle je arogance moci v přímém přenosu. Občané mají právo vědět, proč jejich blízcí umírají.`;
  } else if (deaths > 5000) {
    message = `*tiskový briefing* ${Math.round(deaths).toLocaleString()} obětí a vláda s opozicí nemluví. Fascinující přístup ke krizovému řízení. ` +
      `V každé civilizované zemi by opozice dostávala pravidelné briefy. My se dozvídáme čísla z Twitteru. ` +
      `Požadujeme okamžitou schůzku.`;
  } else if (deaths > 1000) {
    message = `*sarkasticky* Přes tisíc mrtvých a vláda považuje za zbytečné informovat opozici. ` +
      `Rozumím — proč obtěžovat zvoleného zástupce milionu voličů s takovou maličkostí jako je národní tragédie? ` +
      `Navrhuji, ať se premiér podívá na slovo "transparentnost" ve slovníku.`;
  } else if (hospFrac > 0.8) {
    message = `Nemocnice jsou na ${Math.round(hospFrac * 100)}% kapacity a opozice to ví z novin. Z NOVIN. ` +
      `Gratulujeme ke skvělé mezistranické spolupráci v době krize. ` +
      `Až příště řeknete "národní jednota", zkuste to nejdřív praktikovat.`;
  } else if (gdp < -5) {
    message = `GDP -${Math.abs(gdp).toFixed(1)}%. Firmy bankrotují. A vláda si myslí, že opozice nepotřebuje vědět proč? ` +
      `Naši voliči — a vaši taky, mimochodem — přicházejí o práci. ` +
      `*ironicky* Ale jistě, nemáte čas na briefing. Přeorganizujte si diář.`;
  } else if (measures > 6) {
    message = `${measures} opatření najednou! To je impozantní sbírka zákazů. Škoda, že si vláda nenašla čas vysvětlit opozici, proč jsou potřeba. ` +
      `Lidé na nás křičí na ulici — a my nemůžeme říct "vláda má data," protože NÁM JE NIKDO NEUKÁZAL.`;
  } else if (measures < 2 && ctx.trendInfections === 'rising') {
    message = `*s předstíraným údivem* Počty rostou a vláda... čeká? Na co přesně — na zázrak? Na kolektivní imunitu? Na příští volby? ` +
      `Nechci být ten, kdo říká "já to říkal," ale pokud nezačnete jednat, budu přesně ten, kdo to řekne.`;
  } else if (capital < 30) {
    message = `Důvěra veřejnosti je na ${Math.round(capital)}%. *teatrálně* To překvapení! Kdo by čekal, že ignorování opozice ` +
      `a netransparentní rozhodování povedou ke ztrátě důvěry? Já ne — říkám to jen posledních ${ctx.turnNumber} kol.`;
  } else {
    message = `*suše* Opozice stále čeká na jakýkoli briefing o epidemické situaci. Jsem si jist, že máte důležitější věci na práci — ` +
      `jako třeba ignorovat demokratické konvence krizového řízení. Budeme sledovat. A komentovat. Veřejně.`;
  }

  return { role: 'opposition', name, message, suggestion, urgency };
}
