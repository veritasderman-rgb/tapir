/**
 * Advisory System — Rule-based advisor message generator.
 *
 * Three advisors attend each crisis staff meeting:
 * 1. Epidemiologist — focuses on Reff, trends, healthcare capacity
 * 2. Economist — focuses on GDP, unemployment, fiscal cost
 * 3. Politician — focuses on social capital, public mood, political feasibility
 *
 * Each advisor generates contextual advice based on the current game state.
 * Advice includes some noise/uncertainty to simulate real-world ambiguity.
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
}

export function generateAdvisorMessages(ctx: AdvisorContext): AdvisorMessage[] {
  return [
    generateEpidemiologist(ctx),
    generateEconomist(ctx),
    generatePolitician(ctx),
  ];
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
    message = `Kapacita JIP je na ${Math.round(icuFrac * 100)}%! Pokud nezasáhneme okamžitě, budeme muset třídítovat pacienty. Každý den zpoždění stojí životy.`;
    suggestion = 'Okamžitý lockdown a aktivace polních nemocnic.';
  } else if (hospFrac > 0.8) {
    urgency = 'high';
    message = `Nemocnice jsou na ${Math.round(hospFrac * 100)}% kapacity. Pokud trend pokračuje, za ${Math.round((1 - hospFrac) / 0.02)} dní dojdou lůžka.`;
    suggestion = 'Zpřísnění opatření k zastavení růstu hospitalizací.';
  } else if (reff > 1.5) {
    urgency = 'high';
    message = `Odhadované R je ${reff.toFixed(1)}. Epidemie akceleruje. ${ctx.trendInfections === 'rising' ? 'Počty případů rychle rostou.' : ''}`;
    suggestion = 'Doporučuji kombinaci roušek a omezení kontaktů.';
  } else if (reff > 1.0) {
    urgency = 'medium';
    message = `R je kolem ${reff.toFixed(1)}, epidemie stále roste, ale pomaleji. ${ctx.detectionRate < 0.4 ? 'Pozor — naše testovací kapacita je omezená, skutečných případů může být víc.' : ''}`;
    suggestion = ctx.activeMeasureCount > 3 ? 'Současná opatření brzdí, ale nestačí.' : 'Zvažte přidání dalších opatření.';
  } else if (reff > 0.8) {
    urgency = 'low';
    message = `R je ${reff.toFixed(1)}, epidemie ustupuje. ${ctx.newDeaths > 10 ? 'Ale stále registrujeme úmrtí — opatrnost je na místě.' : 'Situace se stabilizuje.'}`;
    suggestion = ctx.activeMeasureCount > 4 ? 'Můžeme zvažovat postupné uvolňování.' : undefined;
  } else {
    urgency = 'low';
    message = `Epidemie je pod kontrolou (R = ${reff.toFixed(1)}). ${ctx.vaccinationActive ? 'Vakcinace dále posiluje kolektivní imunitu.' : ''}`;
    suggestion = 'Udržet základní opatření jako prevenci před další vlnou.';
  }

  if (ctx.detectionRate < 0.25) {
    message += ' ⚠ Testujeme málo — skutečný stav může být výrazně horší než hlášená čísla.';
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
