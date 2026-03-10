/**
 * Advisory System — Rule-based advisor message generator.
 *
 * Four advisors may attend each crisis staff meeting:
 * 1. MUDr. Nováková (epidemiologist) — clinical impact, population health, R, capacity
 * 2. Ing. Dvořák (economist) — GDP, unemployment, fiscal cost
 * 3. JUDr. Svoboda (politician) — social capital, public mood, political feasibility
 * 4. Gen. Vlk (military) — appears only when army measures are active; projects
 *    hospitalization and bed occupancy 2 weeks ahead based on current trends
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
    message = `Kapacita JIP je na ${Math.round(icuFrac * 100)}%. Vidíme pacienty s těžkým průběhem, kteří vyžadují ventilační podporu, ale nemáme kam je umístit. ` +
      `Mortalita pacientů odmítnutých z JIP je podle zahraničních dat řádově vyšší. Každý den bez zásahu znamená desítky životů navíc.`;
    suggestion = 'Okamžitý lockdown a aktivace polních nemocnic. Zároveň zvážit třídění pacientů podle pravděpodobnosti přežití.';
  } else if (hospFrac > 0.8) {
    urgency = 'high';
    message = `Nemocnice hlásí ${Math.round(hospFrac * 100)}% obsazenost. Pacienti s těžším průběhem — zejména starší ročníky a chronicky nemocní — začínají čekat na lůžko. ` +
      `Vidíme nárůst sekundárních komplikací u hospitalizovaných: bakteriální superinfekce, renální selhání. ` +
      `Pokud trend pokračuje, za zhruba ${Math.max(3, Math.round((1 - hospFrac) / 0.015))} dní budeme muset začít odkládat plánované operace.`;
    suggestion = 'Zpřísnění opatření k zastavení růstu hospitalizací. Zvážit přesun lehčích pacientů do domácí péče.';
  } else if (reff > 1.5) {
    urgency = 'high';
    message = `R je kolem ${reff.toFixed(1)} — to znamená exponenciální růst. ${ctx.trendInfections === 'rising' ? 'Počty případů akcelerují.' : ''} ` +
      `Klinicky vidíme, že se mění profil pacientů — začínají se objevovat těžší průběhy i u mladších ročníků, což může souviset s vyšší virovou náloží při intenzivním šíření. ` +
      `Reprodukční číslo tohoto řádu zdvojí počet případů zhruba za ${Math.round(14 / Math.log2(reff))} dní.`;
    suggestion = 'Doporučuji kombinaci opatření — samotné roušky nestačí, potřebujeme omezit kontakty.';
  } else if (reff > 1.0) {
    urgency = 'medium';
    message = `R je kolem ${reff.toFixed(1)}, epidemie stále pomalu roste. ` +
      `V populaci pozorujeme postupnou imunizaci proděláním nemoci, ale tempo je pomalé a s každou vlnou přibývají pacienti s postinfekčním syndromem — únava, dušnost, kognitivní potíže. ` +
      `${ctx.detectionRate < 0.4 ? 'Navíc testujeme málo — skutečný počet nakažených může být několikanásobně vyšší než hlášená čísla.' : 'Testovací kapacita je přiměřená aktuální situaci.'}`;
    suggestion = ctx.activeMeasureCount > 3
      ? 'Současná opatření brzdí růst, ale k poklesu nestačí. Zvažte doplnění o testování a trasování.'
      : 'Přidejte alespoň jedno omezení kontaktů — každý snížený kontakt se projeví za 1-2 týdny.';
  } else if (reff > 0.8) {
    urgency = 'low';
    message = `R je ${reff.toFixed(1)}, epidemie ustupuje. ` +
      `${ctx.newDeaths > 10 ? 'Stále ale registrujeme úmrtí — většinou jde o starší pacienty s komorbiditami, u kterých i mírný průběh spouští kaskádu komplikací.' : 'Nemocnice se stabilizují, odkládaná péče se obnovuje.'} ` +
      `${ctx.cumulativeDeaths > 500 ? `Celkový počet ${Math.round(ctx.cumulativeDeaths)} obětí odpovídá zhruba ${(ctx.cumulativeDeaths / 100000 * 100).toFixed(1)} na 100 tisíc obyvatel.` : ''}`;
    suggestion = ctx.activeMeasureCount > 4 ? 'Můžeme zvažovat postupné uvolňování — ale pozor, příliš rychlé rozvolnění může vést k další vlně.' : undefined;
  } else {
    urgency = 'low';
    message = `Epidemie je pod kontrolou (R = ${reff.toFixed(1)}). ` +
      `${ctx.vaccinationActive ? 'Vakcinace posiluje populační imunitu — důležité je udržet proočkovanost zejména u rizikových skupin.' : 'Populační imunita se buduje přirozeně proděláním, což je pomalejší a nákladnější na životy.'} ` +
      `Doporučuji sledovat kanalizační surveillance a sentinelové stanice pro včasné zachycení případné další vlny.`;
    suggestion = 'Udržet základní surveillance a připravenost. Nezapomínat na postinfekční pacienty v ambulantní péči.';
  }

  if (ctx.detectionRate < 0.25) {
    message += ' ⚠ Testovací kapacita je kriticky nízká — pracujeme prakticky naslepo. Skutečný stav je pravděpodobně mnohonásobně horší.';
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
    message = `Ekonomika je v hluboké recesi. GDP kleslo o ${Math.abs(gdp).toFixed(1)}%, nezaměstnanost stoupla o ${unemp.toFixed(1)} p.b. Firmy bankrotují, rozpočtový deficit narůstá.`;
    suggestion = 'Nutné uvolnit opatření nebo masivně kompenzovat firmám.';
  } else if (gdp < -4) {
    urgency = 'high';
    message = `Ekonomika trpí — GDP -${Math.abs(gdp).toFixed(1)}%, nezaměstnanost +${unemp.toFixed(1)} p.b. ${conf < 40 ? 'Důvěra podnikatelů je kriticky nízká.' : ''}`;
    suggestion = 'Zvažte program Kurzarbeit nebo kompenzace.';
  } else if (gdp < -1) {
    urgency = 'medium';
    message = `Ekonomický dopad je zatím zvládnutelný (GDP ${gdp.toFixed(1)}%). ${fiscal > 2 ? `Fiskální náklady dosáhly ${fiscal.toFixed(1)} mld.` : ''}`;
    suggestion = ctx.activeMeasureCount > 5 ? 'Každé další opatření zdražuje rozpočet.' : undefined;
  } else {
    urgency = 'low';
    message = `Ekonomika je stabilní. ${unemp > 1 ? `Nezaměstnanost stále o ${unemp.toFixed(1)} p.b. výš než obvykle.` : 'Trh práce funguje normálně.'}`;
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
    message = `Sociální kapitál je na ${Math.round(capital)}%. Veřejnost ignoruje opatření, demonstrace v ulicích. Další omezení jsou fakticky nevymahatelná.`;
    suggestion = 'Uvolněte opatření, jinak riskujete úplnou ztrátu důvěry.';
  } else if (capital < 30) {
    urgency = 'high';
    message = `Důvěra veřejnosti klesá (${Math.round(capital)}%). Média kritizují vládu, opozice žádá uvolnění. Compliance s opatřeními klesá.`;
    suggestion = 'Informační kampaň a kompenzace by mohly pomoci.';
  } else if (capital < 50) {
    urgency = 'medium';
    message = `Veřejnost je unavená (kapitál ${Math.round(capital)}%). Zatím dodržují pravidla, ale trpělivost má limity. ${ctx.cumulativeDeaths > 500 ? 'Vysoký počet obětí ale udržuje opatrnost.' : ''}`;
    suggestion = ctx.activeMeasureCount > 4 ? 'Zvažte, zda jsou všechna opatření nezbytná.' : undefined;
  } else if (capital > 80) {
    urgency = 'low';
    message = `Veřejnost spolupracuje (kapitál ${Math.round(capital)}%). ${ctx.cumulativeDeaths < 100 ? 'Lidé oceňují rychlou reakci.' : 'Vážnost situace udržuje disciplínu.'}`;
    if (remaining <= 4) {
      message += ' Blíží se konec funkčního období — udržte stabilitu.';
    }
  } else {
    urgency = 'low';
    message = `Politická situace je stabilní (kapitál ${Math.round(capital)}%). Máte prostor pro rozhodování.`;
  }

  if (ctx.cumulativeDeaths > 1000 && capital > 40) {
    message += ` Opoziční media ale poukazují na ${ctx.cumulativeDeaths} obětí.`;
  }

  return { role: 'politician', name, message, suggestion, urgency };
}

/**
 * General Vlk — military advisor, appears only when army measures are active.
 * Provides 2-week forward projections of hospitalizations and bed occupancy.
 */
function generateMilitary(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Gen. Vlk';
  const reff = ctx.estimatedReff;
  const hospFrac = ctx.hospitalOccupancyFraction;
  const currentHosp = ctx.currentHospitalized ?? Math.round(hospFrac * (ctx.hospitalCapacity ?? 5000));
  const hospCap = ctx.hospitalCapacity ?? 5000;
  const icuCap = ctx.icuCapacity ?? 500;
  const currentICU = ctx.currentICU ?? Math.round(ctx.icuOccupancyFraction * icuCap);

  // Project 14 days ahead based on current R and trend
  const growthFactor = reff > 1 ? Math.pow(reff, 1) : reff; // simplified 2-week projection
  const projectedHosp = Math.round(currentHosp * growthFactor);
  const projectedICU = Math.round(currentICU * growthFactor);
  const projectedHospFrac = projectedHosp / Math.max(1, hospCap);
  const projectedICUFrac = projectedICU / Math.max(1, icuCap);

  // Add uncertainty range (±20%)
  const projHospLow = Math.round(projectedHosp * 0.8);
  const projHospHigh = Math.round(projectedHosp * 1.2);
  const projICULow = Math.round(projectedICU * 0.8);
  const projICUHigh = Math.round(projectedICU * 1.2);

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message: string;
  let suggestion: string | undefined;

  if (projectedHospFrac > 1.0 || projectedICUFrac > 1.0) {
    urgency = 'critical';
    message = `Projekce na 2 týdny: hospitalizace ${projHospLow}–${projHospHigh} (kapacita ${hospCap}), JIP ${projICULow}–${projICUHigh} (kapacita ${icuCap}). ` +
      `Při současném tempu překročíme kapacitu. Aktivuji zálohy a připravuji evakuační plány.`;
    suggestion = 'Doporučuji okamžité nasazení polních nemocnic a aktivaci NATO mechanismu EADRCC.';
  } else if (projectedHospFrac > 0.7) {
    urgency = 'high';
    message = `Projekce na 2 týdny: hospitalizace ${projHospLow}–${projHospHigh} z ${hospCap} lůžek, JIP ${projICULow}–${projICUHigh} z ${icuCap}. ` +
      `Situace je napjatá. Logistické řetězce pod tlakem — zásoby kyslíku a léků na 10 dní.`;
    suggestion = 'Zvážit preventivní přípravu polních nemocnic. Logistická podpora armády může pomoci se zásobováním.';
  } else if (ctx.trendInfections === 'rising') {
    urgency = 'medium';
    message = `Projekce na 2 týdny: hospitalizace ${projHospLow}–${projHospHigh}, JIP ${projICULow}–${projICUHigh}. ` +
      `Trend je rostoucí, ale kapacity zatím dostačují. Sledujeme situaci a připravujeme zálohy.`;
    suggestion = 'Doporučuji udržet logistickou podporu a testovací kapacitu.';
  } else {
    urgency = 'low';
    message = `Projekce na 2 týdny: hospitalizace ${projHospLow}–${projHospHigh}, JIP ${projICULow}–${projICUHigh}. ` +
      `Situace je stabilní nebo se zlepšuje. Logistika funguje bez problémů.`;
  }

  return { role: 'military', name, message, suggestion, urgency };
}
