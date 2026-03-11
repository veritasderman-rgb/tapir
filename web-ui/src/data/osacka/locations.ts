export interface Location {
  id: string;
  name: string;
  description: string;
  isSuperspreaderSite: boolean;
  relatedContactIds: string[];
}

export const locations: Location[] = [
  {
    id: 'nuclear_plant',
    name: 'Springfieldská jaderná elektrárna',
    description:
      'Primární ohnisko nákazy. Zásilka od SKS kurýrní služby z Ósaky dorazila 1. listopadu. ' +
      'Homer Simpson balík rozbaloval a nakazil se. Následně infikoval kolegy v kantýně — ' +
      'Lennyho Leonarda a Carla Carlsona. Pan Burns se nakazil při kontaktu s Homerem v kanceláři. ' +
      'Elektrárna je hlavním zdrojem šíření do komunity.',
    isSuperspreaderSite: true,
    relatedContactIds: ['homer', 'lenny', 'carl', 'burns', 'smithers', 'nuclear_plant'],
  },
  {
    id: 'elementary_school',
    name: 'Springfieldská základní škola',
    description:
      'Sekundární ohnisko nákazy. Bart Simpson přišel do školy 4. listopadu již infekční ' +
      'a nakazil spolužáky Milhouse Van Houtena, Nelsona Muntze a Ralpha Wigguma. ' +
      'Ředitel Skinner se nakazil při kontaktu s Bartem a následně infikoval paní Krabappelovou. ' +
      'Ta dále šířila nákazu mezi učitele (Largo, Hooverová).',
    isSuperspreaderSite: true,
    relatedContactIds: [
      'bart', 'milhouse', 'nelson', 'ralph', 'skinner', 'edna',
      'dewey_largo', 'hoover', 'otto', 'groundskeeper_willie',
      'lunchlady_doris', 'martin', 'springfield_elementary',
    ],
  },
  {
    id: 'bimonscificon',
    name: 'Bi-Mon-Sci-Fi-Con',
    description:
      'Superspreader událost. Konvence sci-fi a komiksových fanoušků konaná 6. listopadu. ' +
      'Organizátor Jeff Albertson (Comic Book Guy). Milhouse Van Houten, již infekční, ' +
      'přišel na konvenci a nakazil minimálně 5 dalších lidí: Comic Book Guy, profesora Frinka, ' +
      'Database, Kirka Van Houtena a Snakea Jailbirda. Uzavřený prostor s nedostatečnou ventilací.',
    isSuperspreaderSite: true,
    relatedContactIds: [
      'comic_book_guy', 'milhouse', 'frink', 'database', 'kirk', 'snake',
    ],
  },
  {
    id: 'spuckler_farm',
    name: 'Spucklerova farma',
    description:
      'Červený sleď (red herring). Cletus Spuckler hlásí nemocná zvířata od 7. listopadu — ' +
      'kozy a prasata s kašlem a horečkou. Zvěrolékař potvrdil zvířecí chřipku, ' +
      'nesouvisející s ósackou horečkou. Cletus se nakazil od Homera Simpsona ' +
      'při jeho návštěvě farmy, ne od zvířat. Zoonóza je vyloučena.',
    isSuperspreaderSite: false,
    relatedContactIds: ['cletus', 'brandine'],
  },
  {
    id: 'kwik_e_mart',
    name: 'Rychlý Apu (Kwik-E-Mart)',
    description:
      'Obchod s potravinami otevřený 24/7. Vlastník Apu Nahasapeemapetilon. ' +
      'Několik nakažených osob navštívilo obchod (Homer 4. listopadu, Marge 4. listopadu, ' +
      'Snake, Jimbo, Nelson), ale Apu zůstává zdravý díky ochranným rukavicím. ' +
      'Obchod není významným ohniskem nákazy.',
    isSuperspreaderSite: false,
    relatedContactIds: ['apu', 'homer', 'marge', 'snake', 'jimbo', 'nelson'],
  },
  {
    id: 'moes_tavern',
    name: 'U Vočka (Moe\'s Tavern)',
    description:
      'Hospoda Moe Szyslaka. Homer, Lenny a Carl přišli 5. listopadu — všichni tři ' +
      'již infekční. Moe se nakazil a začal mít příznaky 7. listopadu. ' +
      'Barney Gumble byl přítomen, ale zůstal zdravý (anomálie). ' +
      'Hospoda musela být uzavřena kvůli nemoci majitele.',
    isSuperspreaderSite: false,
    relatedContactIds: ['moe', 'homer', 'lenny', 'carl', 'barney'],
  },
  {
    id: 'springfield_hospital',
    name: 'Springfieldská nemocnice (Springfield General Hospital)',
    description:
      'Hlavní nemocnice ve Springfieldu. Doktor Julius Hibbert léčí pacienty s ósackou horečkou. ' +
      'První hlášený případ: Homer Simpson (5. listopadu). K 7. listopadu evidováno 18 potvrzených případů. ' +
      'Nemocnice poskytuje klíčové souhrnné informace o průběhu epidemie. ' +
      'Doktor Hibbert je naočkovaný a zdravý.',
    isSuperspreaderSite: false,
    relatedContactIds: ['hibbert', 'springfield_hospital'],
  },
];
