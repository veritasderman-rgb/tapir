export interface Location {
  id: string;
  name: string;
  description: string;
  isSuperspreaderSite: boolean;
  relatedContactIds: string[];
}

export const locations: Location[] = [
  {
    id: 'sks_packages',
    name: 'SKS Kurýrní služba (zásilky)',
    description:
      'Primární zdroj nákazy. Kontaminované zásilky od SKS kurýrní služby infikovaly nezávisle na sobě ' +
      'několik obyvatel Springfieldu: Seymour Skinner (vyzvedl balík středa 1.11), Homer Simpson ' +
      '(doručeno domů středa 1.11), Joe Quimby (vyzvedl čtvrtek 2.11), Selma a Patty Bouvier ' +
      '(doručeno pátek 3.11) a Cletus Spuckler (vyzvedl pátek 3.11). ' +
      'SKS zásilky jsou společným jmenovatelem všech primárních případů.',
    isSuperspreaderSite: true,
    relatedContactIds: ['skinner', 'homer', 'quimby', 'selma', 'patty', 'cletus'],
  },
  {
    id: 'nuclear_plant',
    name: 'Springfieldská jaderná elektrárna',
    description:
      'Ohnisko nákazy. Homer Simpson a Lenny Leonard pracují v sektoru 7-G. ' +
      'Homer dostal SKS zásilku domů 1.11 a chodil do práce. Lenny se nakazil v Moe\'s hospodě v sobotu. ' +
      'Carl Carlson je očkovaný a zdravý. Bezpečnostní předpisy nejsou dodržovány — ' +
      'zaměstnanci nenosí roušky ani helmy, Homer snídá nad jaderným ovladačem.',
    isSuperspreaderSite: true,
    relatedContactIds: ['homer', 'lenny', 'carl', 'burns', 'smithers', 'nuclear_plant'],
  },
  {
    id: 'bimonscificon',
    name: 'Bi-Mon-Sci-Fi-Con',
    description:
      'Sobotní sci-fi festival 4.11. Starosta Quimby (presymptomatický, příznaky v neděli) ' +
      'doprovázel Miss Springfield. Byli tam i Carl (očkovaný) a Lenny. ' +
      'Miss Springfield se nakazila od Quimbyho a následně šířila nákazu dál ' +
      '(Kent Brockman a Dave Shutton na pondělní gala akci v komunitním centru).',
    isSuperspreaderSite: true,
    relatedContactIds: ['quimby', 'miss_springfield', 'carl', 'lenny', 'bimonscificon'],
  },
  {
    id: 'moes_tavern',
    name: 'U Vočka (Moe\'s Tavern)',
    description:
      'Homer přišel v sobotu 4.11 presymptomatický (příznaky v neděli). Barney tam byl od pátku. ' +
      'Lenny a Carl přišli také v sobotu. Homer nakazil Vočka (příznaky úterý), ' +
      'Barneyho (příznaky středa) a Lennyho (příznaky středa). ' +
      'Carl je očkovaný a zůstal zdravý. Hospoda musela zavřít.',
    isSuperspreaderSite: false,
    relatedContactIds: ['vocko', 'homer', 'lenny', 'carl', 'barney'],
  },
  {
    id: 'marge_house',
    name: 'Dům Simpsonových',
    description:
      'Homer přinesl nákazu domů přes SKS zásilku 1.11. Postupně nakazil Barta (neděle), ' +
      'Marge (úterý). Lisa je očkovaná. V neděli hostí Marge Dámský knižní klub ' +
      '(Agnes Skinner, Helena Lovejoy, Edna Krabappel). V pondělí Klub maminek ' +
      '(Selma, Manjula, paní Samsonová). Oba kluby se staly šiřiteli nákazy.',
    isSuperspreaderSite: false,
    relatedContactIds: ['homer', 'marge', 'bart', 'lisa', 'agnes', 'helena', 'edna', 'selma', 'manjula', 'samsonova'],
  },
  {
    id: 'elementary_school',
    name: 'Springfieldská základní škola',
    description:
      'Ředitel Skinner onemocněl jako první (ze SKS zásilky 1.11). Na páteční schůzce 3.11 ' +
      'nakazil Ednu Krabappelovou. Edna pak v neděli šířila nákazu přes knižní klub a kávičku ' +
      's Hooverovou. Ned Flanders se nakazil při návštěvě nemocné Edny v úterý. ' +
      'Škola jako instituce problém nereportuje.',
    isSuperspreaderSite: false,
    relatedContactIds: ['skinner', 'edna', 'hoover', 'willie', 'elementary'],
  },
  {
    id: 'spuckler_farm',
    name: 'Spucklerova farma',
    description:
      'Cletus Spuckler vyzvedl SKS zásilku v pátek 3.11 a onemocněl. Stará se o prasata ' +
      'a slepice i když je nakažený — riziko zoonózy! Lidské nemoci se mohou přenášet ' +
      'na zvířata (zejména prasata) a je to jeden ze způsobů, jak vznikají nové patogeny.',
    isSuperspreaderSite: false,
    relatedContactIds: ['cletus'],
  },
];
