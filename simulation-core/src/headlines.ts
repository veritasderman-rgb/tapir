/**
 * Headline Generator — Creates newspaper-style headlines for each turn.
 * Purely flavor text to enhance immersion.
 */

import { type EconomicState, type HiddenEvent } from './types';

interface HeadlineContext {
  turnNumber: number;
  observedInfections: number;
  prevObservedInfections: number;
  newDeaths: number;
  cumulativeDeaths: number;
  socialCapital: number;
  hospitalOccupancyFraction: number;
  economicState: EconomicState;
  activatedEvents: HiddenEvent[];
  vaccinationActive: boolean;
  activeMeasureCount: number;
  estimatedReff: number;
}

export function generateHeadlines(ctx: HeadlineContext): string[] {
  const headlines: string[] = [];
  const infChange = ctx.prevObservedInfections > 0
    ? ((ctx.observedInfections - ctx.prevObservedInfections) / ctx.prevObservedInfections) * 100
    : 0;

  // Event headlines (highest priority)
  for (const event of ctx.activatedEvents) {
    switch (event.type) {
      case 'variant_shock':
        headlines.push(`⚡ Nová varianta viru detekována! Odborníci varují před vyšší přenosností.`);
        break;
      case 'vaccine_unlock':
        headlines.push(`💉 Vakcína schválena! Očkovací kampaň může začít.`);
        break;
      case 'supply_disruption':
        headlines.push(`🏥 Krize zásobování: nemocnice hlásí nedostatek materiálu.`);
        break;
      case 'public_unrest':
        headlines.push(`📢 Tisíce lidí v ulicích: demonstrace proti opatřením po celé zemi.`);
        break;
      case 'who_intel':
        headlines.push(`🌍 WHO: nové poznatky o viru mohou změnit strategii boje.`);
        break;
    }
  }

  // Infection trend
  if (infChange > 50) {
    headlines.push(`📈 Prudký nárůst: za 14 dní hlášeno ${ctx.observedInfections.toLocaleString('cs-CZ')} nových případů (+${Math.round(infChange)}%).`);
  } else if (infChange > 15) {
    headlines.push(`Případy rostou: ${ctx.observedInfections.toLocaleString('cs-CZ')} nových za dva týdny.`);
  } else if (infChange < -30) {
    headlines.push(`📉 Výrazný pokles: případy klesly o ${Math.round(Math.abs(infChange))}%.`);
  } else if (infChange < -10) {
    headlines.push(`Mírné zlepšení: hlášených případů ubývá.`);
  }

  // Death milestones
  if (ctx.cumulativeDeaths > 0 && ctx.cumulativeDeaths <= 10 && ctx.newDeaths > 0) {
    headlines.push(`Země registruje první oběti epidemie.`);
  } else if (ctx.cumulativeDeaths > 100 && ctx.cumulativeDeaths - ctx.newDeaths < 100) {
    headlines.push(`Počet obětí překročil stovku. Premiér vyjádřil soustrast rodinám.`);
  } else if (ctx.cumulativeDeaths > 1000 && ctx.cumulativeDeaths - ctx.newDeaths < 1000) {
    headlines.push(`Černý milník: tisíc obětí epidemie.`);
  } else if (ctx.cumulativeDeaths > 5000 && ctx.cumulativeDeaths - ctx.newDeaths < 5000) {
    headlines.push(`Pět tisíc obětí. Opozice žádá vyšetřovací komisi.`);
  }

  // Hospital capacity
  if (ctx.hospitalOccupancyFraction > 0.95) {
    headlines.push(`🔴 KAPACITA VYČERPÁNA: nemocnice odmítají pacienty.`);
  } else if (ctx.hospitalOccupancyFraction > 0.8) {
    headlines.push(`Nemocnice hlásí ${Math.round(ctx.hospitalOccupancyFraction * 100)}% obsazenost lůžek.`);
  }

  // Social capital
  if (ctx.socialCapital < 15) {
    headlines.push(`Průzkum: 70% občanů nedůvěřuje vládním opatřením.`);
  } else if (ctx.socialCapital < 30) {
    headlines.push(`Rostoucí nespokojenost: podpora vlády na historickém minimu.`);
  }

  // Economic
  if (ctx.economicState.gdpImpact < -5) {
    headlines.push(`Ekonomové: recese je nevyhnutelná. GDP -${Math.abs(ctx.economicState.gdpImpact).toFixed(1)}%.`);
  } else if (ctx.economicState.unemploymentDelta > 3) {
    headlines.push(`Nezaměstnanost roste: +${ctx.economicState.unemploymentDelta.toFixed(1)} procentních bodů.`);
  }

  // Vaccination
  if (ctx.vaccinationActive) {
    headlines.push(`Očkovací kampaň pokračuje. Zájem veřejnosti ${ctx.socialCapital > 50 ? 'je vysoký' : 'klesá'}.`);
  }

  // Ensure at least 1 headline
  if (headlines.length === 0) {
    if (ctx.estimatedReff < 1) {
      headlines.push(`Epidemie ustupuje. Odborníci nabádají k opatrnosti.`);
    } else {
      headlines.push(`Situace stabilní. Krizový štáb pokračuje v zasedání.`);
    }
  }

  // Limit to 3 headlines
  return headlines.slice(0, 3);
}
