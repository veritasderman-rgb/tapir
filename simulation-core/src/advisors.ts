/**
 * Advisory System — Rule-based advisor message generator.
 *
 * All messages in Czech. 70+ unique messages.
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
  activeMeasureIds?: string[];
  currentHospitalized?: number;
  hospitalCapacity?: number;
  currentICU?: number;
  icuCapacity?: number;
  observedInfections?: number;
  whoConsultationActive?: boolean;
  oppositionBriefings?: number;
}

export function generateAdvisorMessages(ctx: AdvisorContext): AdvisorMessage[] {
  const messages: AdvisorMessage[] = [
    generateEpidemiologist(ctx),
    generateEconomist(ctx),
    generatePolitician(ctx),
  ];

  if (ctx.activeMeasureIds?.some(id => id.startsWith('army_') || id.startsWith('military_'))) {
    messages.push(generateMilitary(ctx));
  }

  messages.push(generateOpposition(ctx));

  return messages;
}

function generateEpidemiologist(ctx: AdvisorContext): AdvisorMessage {
  const name = 'MUDr. Nováková (epidemioložka)';
  const reff = ctx.estimatedReff;
  const hosp = ctx.hospitalOccupancyFraction;
  const icu = ctx.icuOccupancyFraction;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  if (icu > 1.0) {
    urgency = 'critical';
    const options = [
      "Dnes jsem musela rozhodovat, kdo dostane poslední ventilátor. Tohle je medicína katastrof, pane premiére.",
      "Márnice nestíhají. Jestli hned teď nezastavíme šíření, budeme ty mrtvé počítat na tisíce týdně.",
      "Personál v nemocnicích se hroutí. Máme sestry, které nebyly doma tři dny. Systém definitivně zkolaboval.",
      "Triage pacientů je realitou. Vybíráme, kdo má šanci přežít a kdo ne. Je to vaše zodpovědnost.",
      "Tohle už není epidemie, to je národní tragédie. Prosím, zastavte to jakýmkoli způsobem!"
    ];
    message = options[turn % options.length];
    suggestion = "Okamžitý, nejtvrdší možný lockdown. Každá hodina váhání stojí životy.";
  } else if (hosp > 0.9 || icu > 0.8) {
    urgency = 'high';
    const options = [
      "Nemocnice jsou na pokraji kolapsu. Kapacity lůžek jsou vyčerpány na 90 %. Jsme krok od propasti.",
      "Situace je kritická, každé další zpoždění znamená zbytečná úmrtí. Musíme jednat hned.",
      "Pacienti leží na chodbách. Převážíme lidi přes celou republiku, ale volná místa docházejí všude.",
      "Odkládáme veškerou péči, i onkologické operace. Ten virus požírá celé naše zdravotnictví.",
      "Lékaři jsou na dně svých sil. Pokud neuvidí rozhodnou akci vlády, přestanou věřit, že to má smysl."
    ];
    message = options[turn % options.length];
    suggestion = "Zpřísněte opatření, musíme srazit reprodukční číslo pod 1 stůj co stůj.";
  } else if (reff > 1.2) {
    urgency = 'medium';
    const options = [
      `Epidemie nabírá na síle. Reprodukční číslo ${reff.toFixed(2)} znamená, že se nám to vymyká z rukou.`,
      "Záchyt pozitivních roste geometrickou řadou. Pokud nezasáhneme teď, za dva týdny budeme mít v nemocnicích dvojnásobek lidí.",
      "Vidíme exponenciální růst v rizikových skupinách. Tohle je ticho před bouří.",
      "Trasování už nestíhá. Virus je v komunitě a šíří se nekontrolovaně.",
      "Nové mutace jsou agresivnější. Naše současná opatření na ně evidentně nestačí."
    ];
    message = options[turn % options.length];
    suggestion = "Zaveďte plošné nošení respirátorů a omezte kontakty na pracovištích.";
  } else if (ctx.trendInfections === 'falling') {
    urgency = 'low';
    const options = [
      "Křivka konečně klesá. Opatření fungují, ale nesmíme polevit příliš brzy, aby nepřišla další vlna.",
      "Vidíme první známky stabilizace. Je to křehké vítězství, nezahoďme ho předčasným uvolněním.",
      "Tlak na nemocnice se mírně uvolňuje. Teď je čas posílit testovací kapacity.",
      "Lidé začínají být optimističtí, ale virus je stále mezi námi. Buďme velmi opatrní.",
      "Dobrá zpráva: počet hospitalizovaných poprvé po týdnech klesl. Pokračujme v nastavené cestě."
    ];
    message = options[turn % options.length];
    suggestion = "Zůstaňme obezřetní, uvolňujme jen velmi pomalu a po etapách.";
  } else {
    urgency = 'low';
    const options = [
      "Situace je stabilní. Máme čas na přípravu dalších kroků a posílení trasování.",
      "Aktuální data nevykazují dramatický růst. Je to ideální moment pro doladění strategie.",
      "Epidemie je pod kontrolou, ale virus nezmizel. Sledujme pečlivě lokální ohniska.",
      "Kapacita nemocnic je dostatečná pro současný počet pacientů.",
      "Můžeme začít uvažovat o mírném uvolnění nejméně efektivních opatření."
    ];
    message = options[turn % options.length];
  }

  return { role: 'epidemiologist', name, message, suggestion, urgency };
}

function generateEconomist(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Ing. Dvořák (ekonom)';
  const gdp = ctx.economicState.gdpImpact;
  const unemployment = ctx.economicState.unemploymentDelta;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  if (gdp < -10) {
    urgency = 'critical';
    const options = [
      `Ekonomika je v troskách. Propad HDP o ${Math.abs(gdp).toFixed(1)} % je nejhorší v historii země.`,
      "Státní pokladna je prázdná. Půjčujeme si za úroky, které nás zničí. Lockdown musí skončit.",
      "Průmysl stojí. Dodavatelské řetězce jsou přetrhané. Tohle nebude recese, to bude deprese.",
      "Firmy krachují po tisících. Jestli neotevřeme obchody, nebude co zachraňovat.",
      "Investoři utíkají ze země. Naše ratingy padají. Musíme vyslat signál, že ekonomika je prioritou."
    ];
    message = options[turn % options.length];
    suggestion = "Musíme začít uvolňovat ekonomiku, i za cenu jistého epidemiologického rizika.";
  } else if (unemployment > 5) {
    urgency = 'high';
    const options = [
      "Nezaměstnanost roste alarmujícím tempem. Lidé přicházejí o práci a spotřeba domácností zamrzla.",
      "Fronty na úřadech práce jsou nekonečné. Sociální systém je pod obrovským tlakem.",
      "Ztráta práce vede k sociálním nepokojům. Lidé nemají na nájmy, musíme jednat.",
      "Služby jsou zdecimované. Gastronomie a turismus prakticky přestaly existovat.",
      "Potřebujeme masivní injekci do soukromého sektoru, jinak se trh práce zhroutí úplně."
    ];
    message = options[turn % options.length];
    suggestion = "Okamžitě aktivujte program Kurzarbeit a přímé kompenzace pro zasažené obory.";
  } else if (ctx.activeMeasureCount > 8) {
    urgency = 'medium';
    const options = [
      "Máte aktivní příliš mnoho drahých opatření. Každý týden této uzávěry nás stojí miliardy.",
      "Kombinace všech těchto zákazů je pro rozpočet neúnosná. Musíme vybrat jen ta nejúčinnější.",
      "Náklady na plošné testování a kompenzace rostou rychleji než příjmy státu.",
      "Ekonomika krvácí. Nemůžeme si dovolit udržovat všechna tato omezení naráz.",
      "Efektivita některých opatření neodpovídá jejich ekonomické ceně. Udělejte revizi."
    ];
    message = options[turn % options.length];
    suggestion = "Zvažte, zda jsou všechna plošná omezení nezbytná. Méně je někdy více.";
  } else {
    urgency = 'low';
    const options = [
      "Ekonomika zatím drží, ale rozpočtový deficit začíná být problémem.",
      "Podnikatelská sféra je nervózní, ale zatím spolupracuje. Potřebují však jasný výhled.",
      "Aktuální propad HDP je v rámci očekávání. Máme prostor pro další stabilizační kroky.",
      "Průmyslová výroba se adaptovala na hygienická opatření. To je dobrá zpráva.",
      "Můžeme si dovolit mírné zvýšení výdajů na podporu očkování nebo testování."
    ];
    message = options[turn % options.length];
  }

  return { role: 'economist', name, message, suggestion, urgency };
}

function generatePolitician(ctx: AdvisorContext): AdvisorMessage {
  const name = 'JUDr. Svoboda (politik)';
  const capital = ctx.socialCapital;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";
  let suggestion: string | undefined;

  if (capital < 20) {
    urgency = 'critical';
    const options = [
      "Lidé už nás mají dost. V ulicích to vře a vymahatelnost opatření je téměř nulová.",
      "Policie hlásí masové ignorování vládních nařízení. Stát ztrácí svou autoritu.",
      "Jsme na hraně občanské neposlušnosti. Jediný chybný krok a situace v ulicích vybuchne.",
      "Důvěra ve státní instituce je na historickém minimu. Takhle se nedá vládnout.",
      "Lidé se přestali bát viru a začali se bát vládních opatření. To je konečná."
    ];
    message = options[turn % options.length];
    suggestion = "Potřebujeme velké gesto dobré vůle, nebo naopak tvrdé nasazení armády k vynucení pořádku.";
  } else if (capital < 40) {
    urgency = 'high';
    const options = [
      "Důvěra veřejnosti se hroutí. Každé nové omezení vyvolává vlnu odporu na sociálních sítích.",
      "Naše politické přežití je v sázce. Opozice cítí krev a veřejnost je na její straně.",
      "Společenská smlouva je vážně poškozena. Lidé nechápou smysl vašich kroků.",
      "Kritika v médiích je zdrcující. Potřebujeme změnit narativ a ukázat výsledky.",
      "Sociální kapitál je vyčerpán. Bez spolupráce občanů tu epidemii nikdy nezastavíme."
    ];
    message = options[turn % options.length];
    suggestion = "Zlepšete komunikaci, přestaňte jen zakazovat a začněte lidem naslouchat.";
  } else if (ctx.activeMeasureCount > 10) {
    urgency = 'medium';
    const options = [
      "Příliš mnoho zákazů lidi unavuje. Společenská soudržnost má své meze a my je právě testujeme.",
      "Lidé jsou zmatení z množství pravidel. Nikdo už neví, co vlastně platí.",
      "Snažíte se regulovat každý detail lidského života. To se nám politicky vymstí.",
      "Opatření jsou vnímána jako chaotická. Musíme systém zjednodušit.",
      "Sociální únava je realitou. I ti nejdisciplinovanější začínají pravidla obcházet."
    ];
    message = options[turn % options.length];
  } else {
    urgency = 'low';
    const options = [
      "Veřejnost je zatím klidná a většinou spolupracuje. Máme prostor pro nutné kroky.",
      "Politická situace je stabilní. Máme mandát k řešení krize, využijme ho rozumně.",
      "Důvěra ve vládní experty je vysoká. Lidé věří, že víme, co děláme.",
      "Společnost je jednotná v boji proti viru. Tohle je náš největší spojenec.",
      "Můžeme si dovolit i některá nepopulární opatření, pokud budou dobře vysvětlena."
    ];
    message = options[turn % options.length];
  }

  return { role: 'politician', name, message, suggestion, urgency };
}

function generateMilitary(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Gen. Vlk (armáda)';
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'low';
  let message = "";

  if (ctx.hospitalOccupancyFraction > 1.0) {
    urgency = 'critical';
    const options = [
      "Logistické řetězce jsou přetíženy. Převážíme pacienty mezi kraji, ale volná místa docházejí.",
      "Armáda začíná stavět polní nemocnice. Potřebujeme ale civilní personál, který nemáme.",
      "Stavíme stany pro triage před nemocnicemi. Situace připomíná válečnou zónu.",
      "Naše zásoby kyslíku a ventilátorů jsou na kritické úrovni. Distribuce je prioritou.",
      "Vojenská policie pomáhá s ostrahou nemocnic, dochází k incidentům se zoufalými příbuznými."
    ];
    message = options[turn % options.length];
  } else {
    urgency = 'low';
    const options = [
      "Armáda plní zadané úkoly. Logistika vakcín a testů funguje podle plánu.",
      "Jsme připraveni na jakýkoli rozkaz. Naše jednotky jsou v pohotovosti.",
      "Pomáháme s odběry v krajích, kde civilní kapacity selhávají.",
      "Zahraniční mise byly omezeny, veškeré zdroje soustředíme na domácí frontu.",
      "Logistika ochranných pomůcek je zajištěna. Centrální sklady jsou doplňovány."
    ];
    message = options[turn % options.length];
  }

  return { role: 'military', name, message, urgency };
}

function generateOpposition(ctx: AdvisorContext): AdvisorMessage {
  const name = 'Mgr. Čermák (opozice)';
  const briefings = ctx.oppositionBriefings ?? 0;
  const turn = ctx.turnNumber;

  let urgency: AdvisorMessage['urgency'] = 'medium';
  let message = "";

  if (briefings >= 3) {
    urgency = 'low';
    const options = [
      "Oceňuji pravidelné informace. V této chvíli nebudeme situaci hrotit. Společný nepřítel je virus.",
      "I když máme výhrady, oceňujeme vaši snahu o transparentnost. Budeme konstruktivní.",
      "Data, která jste nám poskytli, analyzujeme. Máme některé návrhy na vylepšení kompenzací.",
      "V krizových momentech musíme držet spolu. Děkuji za pravidelné konzultace.",
      "Opozice je připravena podpořit prodloužení nouzového stavu, pokud udržíte tento dialog."
    ];
    message = options[turn % options.length];
  } else if (briefings === 0) {
    urgency = 'high';
    const options = [
      "Vláda naprosto selhává v komunikaci! Opatření jsou chaotická a my se o nich dozvídáme z Twitteru.",
      "Vaše arogance je neuvěřitelná. Ignorujete opozici, jako bychom neexistovali. Budeme žádat o nedůvěru.",
      "Takhle se krize neřídí. Děláte si z toho vlastní PR show a na lidi kašlete.",
      "Zatajujete nám data! Proč se bojíte ukázat analýzy, na základě kterých ničíte lidem životy?",
      "Vaše vládnutí připomíná spíše absolutismus než parlamentní demokracii. To si nenecháme líbit."
    ];
    message = options[turn % options.length];
  } else {
    urgency = 'medium';
    const options = [
      "Díky za ten jeden briefing, ale je to málo. Potřebujeme průběžné informace.",
      "Informovali jste nás, až když bylo rozhodnuto. To není spolupráce, to je jen oznámení.",
      "Zaslané podklady jsou neúplné. Chceme vidět modely vývoje na příští měsíc.",
      "Vaše snaha o dialog je zatím jen polovičatá. Očekáváme více schůzek.",
      "Máme pocit, že nás informujete jen tehdy, když se vám to politicky hodí."
    ];
    message = options[turn % options.length];
  }

  return { role: 'opposition', name, message, urgency };
}
