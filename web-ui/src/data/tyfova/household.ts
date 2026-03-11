import type { HouseholdMember } from '../../types/didaktikon';

export const household: HouseholdMember[] = [
  {
    name: 'Charles Warren',
    role: 'Pán domu, bankéř',
    infected: true,
    testimony:
      'Jedli jsme vždy společně u jednoho stolu. Kuchařka Mary vařila všechna jídla. Pamatuji se na její vynikající broskvovou zmrzlinu — jedl jsem ji dvě porce. Vodu jsme brali z místního vodovodu.',
    foodConsumed: [
      'broskvová zmrzlina',
      'mušle',
      'maso',
      'zelenina',
      'ovoce',
      'voda z kohoutku',
    ],
    clues: [
      'Jedl broskvovou zmrzlinu (dvě porce)',
      'Onemocněl 2. září',
      'Jedl všechna jídla připravená kuchařkou Mary',
    ],
  },
  {
    name: 'Paní Warren',
    role: 'Manželka, paní domu',
    infected: true,
    testimony:
      'Kuchařka Mary přišla začátkem srpna. Ten den, co dělala broskvovou zmrzlinu, jsme ji jedli snad všichni. Mary ji dělala zcela vlastnoručně. Helen ten den nebyla doma.',
    foodConsumed: [
      'broskvová zmrzlina',
      'mušle',
      'maso',
      'zelenina',
      'ovoce',
      'voda z kohoutku',
    ],
    clues: [
      'Jedla broskvovou zmrzlinu',
      'Onemocněla 29. srpna',
      'Potvrzuje, že Mary připravila zmrzlinu vlastnoručně',
      'Helen v den zmrzliny nebyla doma',
    ],
  },
  {
    name: 'Margaret Warren',
    role: 'Dcera',
    infected: true,
    testimony:
      'Milovala jsem Maryino vaření. Tu broskvovou zmrzlinu jsem jedla jako první — Mary mi dala ochutnat ještě předtím, než se podávala. Bylo mi špatně asi za týden poté.',
    foodConsumed: [
      'broskvová zmrzlina',
      'mušle',
      'maso',
      'zelenina',
      'ovoce',
      'voda z kohoutku',
    ],
    clues: [
      'Jedla broskvovou zmrzlinu jako první (ochutnávka od Mary)',
      'Onemocněla 27. srpna — PRVNÍ případ',
      'Inkubační doba odpovídá: zmrzlina ~20. srpna → příznaky 27. srpna = 7 dní',
    ],
  },
  {
    name: 'Helen Warren',
    role: 'Dcera',
    infected: false,
    testimony:
      'Ten den jsem nebyla doma vůbec. Jela jsem za přítelkyní a vrátila se až druhý den. Zmrzlinu jsem nejedla. Jinak jsem ale jedla všechno ostatní — maso, zeleninu, pila vodu ze stejného kohoutku.',
    foodConsumed: [
      'mušle',
      'maso',
      'zelenina',
      'ovoce',
      'voda z kohoutku',
    ],
    clues: [
      'NEJEDLA broskvovou zmrzlinu — nebyla doma',
      'Jedla všechno ostatní a NEONEMOCNĚLA',
      'Klíčový důkaz: jedla stejné jídlo i vodu jako ostatní, ale ne zmrzlinu',
    ],
  },
  {
    name: 'Robert Warren',
    role: 'Syn',
    infected: true,
    testimony:
      'Jedl jsem všechno co ostatní. Zmrzlinu, mušle, maso, ovoce. Vodu z kohoutku. Byl jsem poslední, kdo onemocněl.',
    foodConsumed: [
      'broskvová zmrzlina',
      'mušle',
      'maso',
      'zelenina',
      'ovoce',
      'voda z kohoutku',
    ],
    clues: [
      'Jedl broskvovou zmrzlinu',
      'Onemocněl 3. září — poslední případ',
    ],
  },
  {
    name: 'Matka paní Warrenové',
    role: 'Tchyně, starší paní',
    infected: true,
    testimony:
      'Jsem starší paní a broskvová zmrzlina byla jedna z mála věcí, co jsem mohla jíst s chutí. Onemocněla jsem krátce po vnučce Margaret.',
    foodConsumed: [
      'broskvová zmrzlina',
      'lehká strava',
      'voda z kohoutku',
    ],
    clues: [
      'Jedla broskvovou zmrzlinu',
      'Onemocněla 31. srpna',
      'Jedla omezenou stravu — zmrzlina je společný jmenovatel',
    ],
  },
  {
    name: 'Anna',
    role: 'Pokojská',
    infected: true,
    testimony:
      'My služebné jsme jedly odděleně v kuchyni, ale ze stejného jídla co rodina. Tu zmrzlinu jsem jedla taky — Mary nám ji dala ochutnat. Bessie ten den ale nejedla, protože měla volno.',
    foodConsumed: [
      'broskvová zmrzlina',
      'jídlo z kuchyně',
      'voda z kohoutku',
    ],
    clues: [
      'Jedla broskvovou zmrzlinu',
      'Onemocněla 1. září',
      'Jedla odděleně od rodiny, ale sdílela stejné jídlo',
      'Potvrzuje, že Bessie zmrzlinu nejedla',
    ],
  },
  {
    name: 'Bessie',
    role: 'Pokojská',
    infected: false,
    testimony:
      'V ten den co se dělala zmrzlina jsem měla volný den. Šla jsem do města na nákupy. Vrátila jsem se až večer a zmrzlina už žádná nebyla. Jedla jsem normálně všechno ostatní.',
    foodConsumed: [
      'jídlo z kuchyně',
      'maso',
      'ryby',
      'zelenina',
      'voda z kohoutku',
    ],
    clues: [
      'NEJEDLA broskvovou zmrzlinu — měla volno',
      'Jedla všechno ostatní a NEONEMOCNĚLA',
      'Další důkaz: stejná strava jako ostatní, bez zmrzliny = zdravá',
    ],
  },
  {
    name: 'Patrick',
    role: 'Zahradník',
    infected: false,
    testimony:
      'Já jím ve svém domku na zahradě. Mám vlastní kuchyňku. Občas si vezmu něco z velké kuchyně, ale většinou si vařím sám. Tu slavnou zmrzlinu jsem nejedl. Vodu beru ze stejného pramene jako dům.',
    foodConsumed: [
      'vlastní strava',
      'občas jídlo z kuchyně',
      'voda z kohoutku',
    ],
    clues: [
      'NEJEDL broskvovou zmrzlinu',
      'Jí většinou odděleně, vlastní strava',
      'Pije stejnou vodu — voda tedy není zdrojem',
    ],
  },
  {
    name: 'Mary Mallon',
    role: 'Kuchařka',
    infected: false,
    testimony:
      'Já jsem úplně zdravá, nikdy jsem tyfus neměla. Vařím pro lidi léta a nikdy nebyl žádný problém. Tu zmrzlinu jsem dělala z čerstvých broskví. Já sama zmrzlinu moc nerada, takže jsem ji nejedla. Neumývám si ruce nějak speciálně — proč bych měla, nejsem přece nemocná!',
    foodConsumed: [
      'vlastní strava',
      'voda z kohoutku',
    ],
    clues: [
      'PŘIPRAVILA broskvovou zmrzlinu vlastnoručně',
      'Sama zmrzlinu NEJEDLA',
      'Je zcela ZDRAVÁ — nikdy neměla příznaky tyfu',
      'Přišla do domácnosti začátkem srpna — tyfus propukl koncem srpna',
      'Neumývá si ruce — bakterie z jejích rukou kontaminovaly jídlo',
      'ASYMPTOMATICKÁ PŘENAŠEČKA — klíč k záhadě',
    ],
  },
  {
    name: 'Katherine',
    role: 'Pradlena',
    infected: false,
    testimony:
      'Já peru a žehlím, v kuchyni se nezdržuji. Jím většinou u sebe v prádelně, nosím si něco z kuchyně. Tu zmrzlinu jsem nejedla. Piju čaj, který si sama vařím.',
    foodConsumed: [
      'občas jídlo z kuchyně',
      'čaj (vlastní)',
    ],
    clues: [
      'NEJEDLA broskvovou zmrzlinu',
      'Minimální kontakt s kuchyní',
      'Zdravá — potvrzuje vzorec',
    ],
  },
  {
    name: 'James',
    role: 'Kočí',
    infected: false,
    testimony:
      'Většinu dne jsem u koní nebo na cestách. Jím odděleně ve stáji nebo v hospodě ve městě. Z kuchyně velkého domu jím málokdy. Zmrzlinu jsem neměl.',
    foodConsumed: [
      'strava z hospody',
      'občas jídlo z kuchyně',
    ],
    clues: [
      'NEJEDL broskvovou zmrzlinu',
      'Jí většinou mimo domácnost',
      'Zdravý — potvrzuje vzorec',
    ],
  },
];
