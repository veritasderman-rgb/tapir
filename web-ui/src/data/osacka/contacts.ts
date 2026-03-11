import { PhoneContact } from '../../types/didaktikon';

export const contacts: PhoneContact[] = [
  // ============================================================
  // INFECTED PEOPLE (22)
  // ============================================================

  // --- PATIENT ZERO CLUSTER: Nuclear Plant (Nov 1-4) ---
  {
    id: 'homer',
    name: 'Homer Simpson',
    type: 'person',
    interviewDate: '2024-11-06',
    testimony: `"Haló? Jo, tady Homer. Hele, já nevím, co se děje, ale cítím se hrozně. Začalo to tak... no, v pátek prvního listopadu jsem v práci rozbaloval takovou zásilku — přišla od nějaký firmy SKS, kurýrní služba. Byly v tom nějaký díly do reaktoru, myslím. No a pak jsem šel na oběd do kantýny, seděl jsem s Lennym a Carlem jako vždycky. V sobotu jsem se cítil divně, takovej unavenej. V neděli třetího už jsem měl horečku a bolely mě svaly. Marge říkala, ať zůstanu doma, ale já jsem ještě v neděli griloval na dvorku s rodinou. Bart a Lisa tam taky byli, jasně. Co? Jestli jsem byl někde jinde? No, v pondělí čtvrtého jsem šel do Apuova obchodu pro pivo, ale to jsem tam byl jen chvilku. A taky jsem byl v úterý U Vočka, ale to je normální, tam chodím pořád. Mmm... koblihy..."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 1,  // Nov 1
    infectiousDay: 2, // Nov 2
    symptomsDay: 3,   // Nov 3
    infectionSource: 'sks_package',
    notes: 'Pacient nula. Rozbaloval zásilku SKS v jaderné elektrárně.',
  },
  {
    id: 'marge',
    name: 'Marge Simpson',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"Dobrý den, tady Marge Simpsonová. Ano, mohu mluvit. Homer začal být nemocný asi třetího listopadu, měl horečku a strašně kašlal. Já jsem se o něj starala celou neděli. Bohužel jsem se asi nakazila od něj, protože ve středu pátého jsem začala mít teplotu a bolest hlavy. Lisa taky začala kýchat někdy ve čtvrtek, to bylo čtvrtého. A Bart? Ten jako by nic, běhal venku s Milhousem, ale pak taky dostal rýmu třetího, vlastně ještě předtím než já. Asi to chytil od Homera taky. Byla jsem v úterý čtvrtého nakupovat v Rychlém Apu a ještě jsem zašla do školy na třídní schůzku. Tam jsem mluvila s ředitelem Skinnerem a paní Krabappelovou."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 3,  // Nov 3
    infectiousDay: 4, // Nov 4
    symptomsDay: 5,   // Nov 5
    infectionSource: 'homer',
  },
  {
    id: 'bart',
    name: 'Bart Simpson',
    type: 'person',
    interviewDate: '2024-11-06',
    testimony: `"Yo, tady Bart Simpson! Jo, byl jsem nemocnej, ale teď je to cool, nemusím do školy, hehe. Kdy to začalo? Hmm, táta vypadal blbě v neděli třetího, kašlal a ležel na gauči. Já jsem měl v pondělí třetího — ne, počkej, v neděli třetího — jo, v neděli jsem začal kýchat. V pondělí čtvrtého jsem ještě šel do školy, protože máma nepoznala, že jsem nemocnej. Seděl jsem vedle Milhouse a házel po Nelsonovi papírky. Ralph Wiggum seděl za mnou a olizoval si prsty, jak to dělá vždycky. Jo, a ředitel Skinner nás chytil, jak jsme lezli po střeše. Ten vypadal taky nějaký nahřátý. Eat my shorts!"`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 3,  // Nov 3
    infectiousDay: 4, // Nov 4
    symptomsDay: 4,   // Nov 4
    infectionSource: 'homer',
  },
  {
    id: 'lisa',
    name: 'Lisa Simpson',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"Dobrý den, tady Lisa Simpson. Ano, mohu poskytnout detailní výpověď. Otec Homer začal vykazovat symptomy třetího listopadu — horečka, myalgie, kašel. Typický klinický obraz. Já jsem první příznaky pocítila čtvrtého, tedy o den později než Bart. Měla jsem subfebrilie a rýmu. Bart byl nemocný už třetího, ale stejně šel do školy čtvrtého — to je typický Bart. Zajímavé je, že můj kamarád Ralph Wiggum taky onemocněl, ale až pátého. Ve škole jsem byla naposledy čtvrtého. Měli jsme zkoušku z matematiky a pak jsem šla na kroužek saxofonu. Víte, epidemiologicky by bylo zajímavé zmapovat, jak se to šířilo v naší škole. Ředitel Skinner vypadal nemocný už čtvrtého..."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 4,  // Nov 4
    infectiousDay: 5, // Nov 5
    symptomsDay: 5,   // Nov 5
    infectionSource: 'homer',
  },

  // --- SCHOOL CLUSTER (Nov 4-6) ---
  {
    id: 'milhouse',
    name: 'Milhouse Van Houten',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"H-haló? Tady Milhouse. Moje máma říkala, že mám mluvit s váma. Jo, Bart byl v pondělí čtvrtého ve škole a pořád kašlal a kýchal. Seděli jsme vedle sebe jak vždycky. Já jsem se začal cítit špatně v úterý pátého — bolela mě hlava a měl jsem rýmu. Táta říkal, že jsem simulant, ale máma mi změřila teplotu a měl jsem 38,2! Byl jsem v pondělí čtvrtého taky na obědě ve školní jídelně, seděl jsem s Bartem, Nelsonem a Ralphem. Nelson mi ukradl pudink. Jo, a ve středu šestého jsem šel na Bi-Mon-Sci-Fi-Con, protože tam měli limitovanou edici Radioactive Mana. Ale už jsem se cítil dost blbě..."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 4,  // Nov 4
    infectiousDay: 5, // Nov 5
    symptomsDay: 5,   // Nov 5
    infectionSource: 'bart',
  },
  {
    id: 'nelson',
    name: 'Nelson Muntz',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Ha ha! Jo, byl jsem nemocnej, a co? Bart Simpson kýchal v pondělí ve třídě jak blázen. Já jsem začal kašlat v úterý pátého. Máma nebyla doma, tak jsem si udělal polívku sám. Ve středu jsem ještě šel ven, potkal jsem Jimba a Dolphe u Rychlého Apu. Jo, a ten šmejd Milhouse taky vypadal nemocně. Škola? Nah, od úterka jsem tam nebyl, proč bych chodil, když jsem nemocnej? Ha ha! Kdo jinej byl nemocnej? Nevím, nezajímá mě to. Ralph Wiggum? Ten vypadá nemocně pořád. Ale jo, slyšel jsem, že paní Krabappelová taky chytla něco."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 5,  // Nov 5
    infectiousDay: 6, // Nov 6
    symptomsDay: 6,   // Nov 6
    infectionSource: 'bart',
  },
  {
    id: 'ralph',
    name: 'Ralph Wiggum',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Haló? Tady Ralph. Mně je špatně. Táta říká, že mám ósackej horecku. To zní jako japonskej film! Hehe. Kdy mi bylo špatně? Hmm... v úterý? Nebo ve středu? Já nevím. Bart kýchal v pondělí a olízl jsem si prsty potom, co jsem se dotknul jeho lavice. Líbilo se mi, jak na mě kýchnul, bylo to jako déšť! Táta říká, že mám zůstat v posteli. Viděl jsem kočku. Paní Krabappelová říkala, ať se nemáme, ale vypadala taky nemocně. Já mám rád školu. Bolí mě bříško."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 5,  // Nov 5
    infectiousDay: 6, // Nov 6
    symptomsDay: 6,   // Nov 6
    infectionSource: 'bart',
  },
  {
    id: 'skinner',
    name: 'Seymour Skinner',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"Ano, tady ředitel Skinner. Situace ve škole je vážná, musím říct. Bart Simpson přišel v pondělí čtvrtého zjevně nemocný — kašlal, kýchal, měl zarudlé oči. Snažil jsem se ho poslat domů, ale než jsem ho chytil, proběhl půl školou. Já sám jsem začal pociťovat příznaky v pondělí večer čtvrtého — škrábání v krku, únava. V úterý pátého jsem už měl teplotu 37,8, ale přišel jsem do školy, protože matka říkala, že Skinnerovi nestonají. Ve středu jsem se bohužel potkal s Ednou — paní Krabappelovou — v kabinetu, probírali jsme situaci s nemocnými dětmi. Ona vypadala ještě zdravě, ale... no, to víte, jak to je. Musím jít, matka volá."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 4,  // Nov 4
    infectiousDay: 5, // Nov 5
    symptomsDay: 5,   // Nov 5
    infectionSource: 'bart',
    notes: 'Ředitel školy. Klíčový bod šíření ve škole.',
  },
  {
    id: 'edna',
    name: 'Edna Krabappelová',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Ha! Tak už volají i mně. Tady Krabappelová. Ano, jsem nemocná, díky za optání. Začalo to ve středu šestého — bolest hlavy, kašel, teplota. Předtím jsem byla v úterý v kontaktu se Skinnerem — ten už vypadal hrozně, ale tvrdil, že je v pořádku. Typický Seymour. V pondělí čtvrtého byl Bart Simpson ve třídě a kašlal na všechny. Já jsem si myslela, že jsem se vyhnula, ale asi ne. V úterý pátého jsem měla třídní schůzku — přišla Marge Simpsonová, Kirk Van Houten, a ještě pár rodičů. A taky jsem šla ve středu odpoledne do učitelského pokoje, kde byli Dewey Largo a paní Hooverová. Obě dvě vypadaly v pořádku, ale kdo ví. *kašel* Ha!"`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 5,  // Nov 5
    infectiousDay: 6, // Nov 6
    symptomsDay: 6,   // Nov 6
    infectionSource: 'skinner',
    notes: 'Klíčová postava v kaskádě šíření na škole.',
  },
  {
    id: 'dewey_largo',
    name: 'Dewey Largo',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"Ano, tady Largo. Učitel hudební výchovy na Springfieldské základní škole. Byl jsem ve středu šestého v učitelském pokoji s paní Krabappelovou, která vypadala nemocně a kašlala. Já jsem začal mít příznaky v pátek osmého — rýma, kašel, lehká teplota. Mrzí mě to, protože jsem musel zrušit zkoušku školního orchestru. Lisa Simpson je moje nejlepší žačka, ale ta byla nemocná už dříve. V učitelském pokoji jsme byli ve středu ještě s paní Hooverovou. Jinak jsem nikam zvlášť nechodil — domov, škola, domov."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 7,  // Nov 7
    infectiousDay: 8, // Nov 8
    symptomsDay: 8,   // Nov 8
    infectionSource: 'edna',
  },
  {
    id: 'hoover',
    name: 'Elizabeth Hooverová',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"*kašel* Promiňte... tady Hooverová. Jo, jsem nemocná. Paní Krabappelová kašlala ve středu v učitelském pokoji, bylo to hrozné. Já se začala cítit špatně v sobotu devátého. Hlavně kašel a únava. Předtím jsem se cítila normálně. Ve škole je teď spousta nemocných dětí, je to katastrofa. Měla jsem ve čtvrtek sedmého ještě normálně výuku — Ralph Wiggum byl nemocný, ale to je u něj těžko poznat, ten vypadá zmateně pořád. Jinak jsem nikam nechodila, jsem introvert."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 7,  // Nov 7
    infectiousDay: 8, // Nov 8
    symptomsDay: 9,   // Nov 9
    infectionSource: 'edna',
  },

  // --- NUCLEAR PLANT CLUSTER (Nov 3-5) ---
  {
    id: 'lenny',
    name: 'Lenny Leonard',
    type: 'person',
    interviewDate: '2024-11-06',
    testimony: `"Ahoj, tady Lenny. Jo, mám se špatně. Homer a já jsme v pátek prvního obědvali spolu v kantýně jako vždycky. Carl tam taky byl. Homer rozbaloval nějakou zásilku ráno, pak si šel umýt ruce — ale znáte Homera, asi ne moc důkladně. Já jsem začal kýchat v neděli třetího a v pondělí čtvrtého už jsem měl teplotu. Carl na tom byl podobně. Byli jsme v úterý pátého U Vočka — Homer, já, Carl a Moe. Homer už vypadal líp, ale Carl a já jsme na tom byli blbě. Moe nám nalíval horký grog. Dobrý chlap, ten Moe."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 3,  // Nov 3
    infectiousDay: 4, // Nov 4
    symptomsDay: 4,   // Nov 4
    infectionSource: 'homer',
  },
  {
    id: 'carl',
    name: 'Carl Carlson',
    type: 'person',
    interviewDate: '2024-11-06',
    testimony: `"Tady Carl. Ano, jsem nemocný. Obědval jsem s Homerem a Lennym v pátek v kantýně elektrárny. Homer ten den rozbaloval nějaký balík a pak nám podával sendviče neumytýma rukama, to je tak typický Homer. Příznaky jsem dostal v neděli třetího — kašel, rýma. V pondělí jsem ještě šel do práce, ale pan Burns mě poslal domů, říkal, že nechce, aby mu zavirovali kancelář. V úterý jsem šel s Lennym a Homerem k Moemu, chtěli jsme se rozveselit. Moe tvrdil, že jeho grog vyléčí cokoli. Nevyléčil."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 3,  // Nov 3
    infectiousDay: 4, // Nov 4
    symptomsDay: 4,   // Nov 4
    infectionSource: 'homer',
  },
  {
    id: 'burns',
    name: 'Charles Montgomery Burns',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: `"Smithers, kdo to volá? Epidemiolog? Výborně. Ano, jsem poněkud... indisponován. Ten Simpson, ten tlusťoch ze sektoru 7G, přišel v pátek do mé kanceláře s nějakým formulářem o zásilce. Kýchal a smrkal jako nějaký... plebejec. Já jsem začal mít teplotu v pondělí čtvrtého. Ve svém věku — nebudu upřesňovat kolik mi je — je to poněkud... nepříjemné. Smithers mi nosí polévku. Nebyl jsem od pondělí v elektrárně, řídím ji z postele. Co? Smithers? Ten se cítí dobře, ale ten je očkovaný, já mu to nařídil, aby mohl pracovat. Nechte mě být, mám ještě jadernou elektrárnu na řízení."`,
    cost: 3,
    available: true,
    infected: true,
    infectionDay: 4,  // Nov 4
    infectiousDay: 5, // Nov 5
    symptomsDay: 4,   // Nov 4 - rychlý nástup kvůli věku
    infectionSource: 'homer',
    notes: 'Rychlý nástup příznaků kvůli vysokému věku.',
  },

  // --- BI-MON-SCI-FI-CON SUPERSPREADER (Nov 6) ---
  {
    id: 'comic_book_guy',
    name: 'Jeff Albertson (Comic Book Guy)',
    type: 'business',
    interviewDate: '2024-11-09',
    testimony: `"Nejhorší. Nemoc. Vůbec. Ano, já jsem organizátor Bi-Mon-Sci-Fi-Conu, který se konal ve středu šestého listopadu. Přišlo asi sto lidí. Milhouse Van Houten tam byl a vypadal hrozně — kašlal na limitované edice, barbar! Já jsem začal mít příznaky v pátek osmého. Bolí mě hlava, kašlu, mám teplotu. Na konvenci byli mimo jiné: ten Milhouse, pak profesor Frink, Database, a myslím že i ten Kirk Van Houten, otec Milhouse. Všichni stáli frontu na podpis u stánku s komiksem. Malý prostor, hodně lidí, recirkulovaný vzduch. Nejhorší konvence od té doby, co někdo přinesl plané neštovice v roce 2019."`,
    cost: 3,
    available: true,
    infected: true,
    infectionDay: 6,  // Nov 6
    infectiousDay: 7, // Nov 7
    symptomsDay: 8,   // Nov 8
    infectionSource: 'milhouse',
    isSuperspreaderEvent: true,
    superspreaderName: 'Bi-Mon-Sci-Fi-Con',
    notes: 'Organizátor superspreader události.',
  },
  {
    id: 'frink',
    name: 'Profesor John Frink',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Hlavin-glávin! Ano, tady profesor Frink. Účastnil jsem se Bi-Mon-Sci-Fi-Conu ve středu šestého, prezentoval jsem svůj nový vynález — automatický dezinfikátor, ironicky. Bohužel se zdá, že jsem se tam nakazil — příznaky se objevily v sobotu devátého. Horečka 38,7, kašel, rhinitida. Z epidemiologického hlediska — hoyvin-gloyvin — ten kongres byl ideální prostředí pro přenos: uzavřený prostor, vysoká hustota osob, nedostatečná ventilace. Viděl jsem tam Milhouse Van Houtena, který vykazoval zjevné symptomy respiračního onemocnění. Neměli ho tam pustit!"`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 6,  // Nov 6
    infectiousDay: 7, // Nov 7
    symptomsDay: 9,   // Nov 9
    infectionSource: 'milhouse',
    isSuperspreaderEvent: true,
    superspreaderName: 'Bi-Mon-Sci-Fi-Con',
  },
  {
    id: 'database',
    name: 'Database (Benjamin)',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Ehm, ano, tady Database. Skutečné jméno Benjamin, ale všichni mi říkají Database. Byl jsem na Bi-Mon-Sci-Fi-Conu šestého, stál jsem ve frontě na podpis vedle Milhouse. Ten kašlal pořád, bylo to nepříjemné. Začal jsem se cítit špatně v sobotu devátého — kašel, rýma, teplota 37,9. Doma jsem od té doby hrál World of Warcraft a čekal, až to přejde. Nikam jinam jsem nechodil, nejsem zrovna společenský typ."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 6,  // Nov 6
    infectiousDay: 8, // Nov 8
    symptomsDay: 9,   // Nov 9
    infectionSource: 'milhouse',
    isSuperspreaderEvent: true,
    superspreaderName: 'Bi-Mon-Sci-Fi-Con',
  },
  {
    id: 'kirk',
    name: 'Kirk Van Houten',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"Haló? Tady Kirk Van Houten. Otec Milhouse. Jo, syn mě vzal na ten sci-fi con ve středu šestého, chtěl, abych mu koupil nějakej komiks za dvě stě dolarů. Milhouse vypadal nemocně, ale tvrdil, že je v pohodě. Já jsem začal kašlat v pátek osmého. Předtím jsem byl v úterý pátého na třídní schůzce v Bartově škole — paní Krabappelová tam taky byla, ale tehdy vypadala zdravě. Jinak nemám moc kam chodit, jsem nezaměstnanej. Bydlím sám v tom malém bytě. Luann mi ani nezavolala, jestli jsem v pořádku."`,
    cost: 2,
    available: true,
    infected: true,
    infectionDay: 6,  // Nov 6
    infectiousDay: 7, // Nov 7
    symptomsDay: 8,   // Nov 8
    infectionSource: 'milhouse',
    isSuperspreaderEvent: true,
    superspreaderName: 'Bi-Mon-Sci-Fi-Con',
  },
  {
    id: 'snake',
    name: 'Snake Jailbird',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Yo, tady Snake! Jo, byl jsem na tom nerdovským srazu šestého, chtěl jsem... ehm... koupit komiksy. Legálně! Ten malej kluk tam kašlal jak blázen. Já jsem se rozjel v sobotu devátého — teplota, kašel, celý jsem na huntě. Nemůžu ani... ehm... pracovat. Dude, je mi fakt blbě. Předtím jsem byl v pondělí čtvrtýho u Apu v Rychlým Apu, koupil jsem si Squishee. Ale to jsem byl ještě zdravej. Teď ležím v bytě a koukám na telku."`,
    cost: 4,
    available: true,
    infected: true,
    infectionDay: 6,  // Nov 6
    infectiousDay: 8, // Nov 8
    symptomsDay: 9,   // Nov 9
    infectionSource: 'milhouse',
    isSuperspreaderEvent: true,
    superspreaderName: 'Bi-Mon-Sci-Fi-Con',
  },

  // --- MOE'S TAVERN CLUSTER (Nov 5-7) ---
  {
    id: 'moe',
    name: 'Moe Szyslak',
    type: 'business',
    interviewDate: '2024-11-08',
    testimony: `"Jo, tady Moe. U Vočka. Hele, Homer, Lenny a Carl přišli v úterý pátého a všichni tři vypadali jak smrt. Kašlali, smrkali, bylo to hnusný. Já jsem jim nalíval grog a čistil sklenice — no dobře, ne vždycky je čistím. Začal jsem se cítit blbě ve čtvrtek sedmého. Kašel, rýma, bolí mě všechno. Asi jsem to chytil od těch tří blbců. Hospodu jsem musel zavřít v pátek, nemůžu stát za barem. Barney tu byl taky v úterý, ale ten vypadá nemocně vždycky, tak nevím. Nikdo jinej nepřišel, je to tu mrtvý i normálně."`,
    cost: 3,
    available: true,
    infected: true,
    infectionDay: 5,  // Nov 5
    infectiousDay: 6, // Nov 6
    symptomsDay: 7,   // Nov 7
    infectionSource: 'homer',
    notes: 'Nakazil se od Homera/Lennyho/Carla v hospodě.',
  },

  // --- SPUCKLER FARM RED HERRING (Nov 7) ---
  {
    id: 'cletus',
    name: 'Cletus Spuckler',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Haló? Jo, tady Cletus. Hele, moje kozy a prasata jsou nemocný! Kašlou a maj horečku, myslím. Jsou nemocný od... no, od čtvrtka sedmýho. A já jsem taky nemocnej od soboty devátého. Brandine taky. Přišli k nám v pondělí čtvrtého nějací lidi z města — Homer Simpson kupoval vajíčka a Marge chtěla med. Ale to bylo předtím, než zvířata onemocněla. Zvířata jsou nemocná od sedmýho, takže to asi není od těch městskejch. Nebo je to? Já nevím. Zvěrolékař říkal, že je to nějaká zvířecí chřipka, ne ta ósacká věc. Ale já mám stejný příznaky jako ta ósacká horečka, ne? Hmm."`,
    cost: 4,
    available: true,
    infected: true,
    infectionDay: 7,  // Nov 7
    infectiousDay: 8, // Nov 8
    symptomsDay: 9,   // Nov 9
    infectionSource: 'homer',
    notes: 'Nakažen od Homera při návštěvě farmy. Nemocná zvířata = red herring (zvířecí chřipka, ne ósacká horečka).',
  },

  // ============================================================
  // HEALTHY / EXPOSED BUT NOT INFECTED (~20)
  // ============================================================

  {
    id: 'smithers',
    name: 'Waylon Smithers',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"Tady Smithers. Ano, panu Burnsovi není dobře, starám se o něj. Já sám se cítím v pořádku — byl jsem naočkován v říjnu, pan Burns to nařídil pro všechny v managementu. Jsem v kontaktu s panem Burnsem denně, nosím mu polévku a dokumenty, ale žádné příznaky nemám. Možná ta vakcína zabírá. Homer Simpson? Ano, ten přišel s tou zásilkou první den, vypadal normálně, ale následující dny... no. V elektrárně je teď poloprázdno, hodně lidí je nemocných."`,
    cost: 2,
    available: true,
    infected: false,
    vaccinated: true,
    infectionSource: 'burns',
    notes: 'Očkovaný. V kontaktu s Burnsem, ale neinfekční.',
  },
  {
    id: 'patty',
    name: 'Patty Bouvier',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"*kašel* Tady Patty. Ano, jsem STRAŠNĚ nemocná. Mám horečku, kašel, rýmu, bolí mě všechno. Začalo to... ehm... asi pátého? Ne, šestého. Nebo sedmého? Prostě jsem nemocná! Marge mi volala třetího, že Homer je nemocný, tak jsem si hned koupila vitamíny a roušku. Ale stejně jsem to chytila! Určitě! Selma říká, že si vymýšlím, ale JÁ jsem nemocná, JÁ! *přehnaný kašel* Byla jsem u doktora Hibbert a ten říkal, že nemám teplotu, ale co on ví? Já se cítím hrozně!"`,
    cost: 2,
    available: true,
    infected: false,
    simulating: true,
    notes: 'Hypochondr. Simuluje nemoc. Dr. Hibbert potvrdil, že je zdravá.',
  },
  {
    id: 'selma',
    name: 'Selma Bouvier',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Tady Selma. Ne, nejsem nemocná. Na rozdíl od Patty, která předstírá, že umírá. *zapaluje cigaretu* Byla jsem u Marge v neděli třetího, Homer ležel na gauči a vypadal hrozně. Ale já jsem nic nechytila. Možná je to těma cigaretama — říkají, že kuřáci maj silnější imunitu. To jsem si přečetla na internetu. Patty? Ta je zdravá jako řípa, jen si vymýšlí. Doktor Hibbert jí řekl, že nemá nic, ale ona trvá na tom, že je nemocná. Já jsem v pohodě, chodím normálně do práce na úřad."`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaná (návštěva u Simpsonů), ale zdravá.',
  },
  {
    id: 'apu',
    name: 'Apu Nahasapeemapetilon',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: `"Dobrý den, tady Apu z Rychlého Apu. Děkuji, že se ptáte. Ano, v mém obchodě bylo několik nemocných zákazníků — Homer Simpson přišel v pondělí čtvrtého a vypadal nemocně. Marge přišla v úterý. Ale já jsem v pořádku, naprosto zdravý! Pracuji dvacet hodin denně, nemám čas být nemocný. Mám osm dětí, takže jsem zvyklý na bacily. Nosím rukavice za pokladnou od doby, co začala ta epidemie. Žádné příznaky, nic. Obchod je otevřen 24/7 jako vždy. Děkuji, přijďte nakoupit!"`,
    cost: 3,
    available: true,
    infected: false,
    notes: 'Exponovaný, ale zdravý. Nosí rukavice.',
  },
  {
    id: 'wiggum',
    name: 'Clancy Wiggum',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Tady šéf Wiggum. Ralph je nemocnej, jo. Manželka Sarah se o něj stará. Já jsem v pohodě, nikdo mi nic neudělá, jsem polda! Byl jsem u Ralpha v pokoji, ale nosím tu svoji policejní... no, vlastně nenosím nic, ale jsem prostě zdravej. Možná to je tím, že jím hodně koblih — ty určitě pomáhaj proti nemocím. Vyšetřuju ten případ? Ne, to není kriminální případ. Nebo je? Mám někoho zatknout? No, Sarah mi říkala, že Ralph se cítí špatně od úterý pátého."`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaný (kontakt s Ralphem), ale zdravý.',
  },
  {
    id: 'barney',
    name: 'Barney Gumble',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"*říhnutí* Haló? Tady... Barney. Jo, byl jsem U Vočka v úterý pátýho s Homerem a klukama. Všichni kašlali. Já? Já se cítím... *říhnutí* ...normálně? Myslím? Těžko říct, jak se mám cítit normálně. Moe říká, že jsem měl být nemocnej, ale já nic nemám. Možná ten alkohol zabíjí bacily! *smích* Nebo možná jsem byl naočkovanej a nevím o tom? Ne, to ne. Prostě jsem zdravej. Kupodivu."`,
    cost: 2,
    available: true,
    infected: false,
    vaccinated: false,
    notes: 'Exponovaný (U Vočka), ale zdravý. Anomálie — nikdo neví proč.',
  },
  {
    id: 'hibbert',
    name: 'Dr. Julius Hibbert',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: `"Heh heh heh. Tady doktor Hibbert. Ano, léčím několik pacientů s ósackou horečkou. Homer Simpson přišel pátého, Bart čtvrtého — vlastně ho přivezla Marge. Pan Burns mi volal přes Smitherse. Já sám jsem naočkovaný, samozřejmě — jsem lékař, to je povinnost. Zajímavé je, že Patty Bouvier trvá na tom, že je nemocná, ale její testy jsou negativní. Žádná teplota, žádné markery zánětu. Řekl bych, že je to hypochondrie. Heh heh. Jinak vidím jasný vzorec — začalo to v jaderné elektrárně, pak se to rozšířilo do školy. Doporučuji se zaměřit na Springfieldskou základní školu a elektrárnu."`,
    cost: 3,
    available: true,
    infected: false,
    vaccinated: true,
    notes: 'Lékař. Očkovaný. Poskytuje důležité diagnostické informace.',
  },
  {
    id: 'krusty',
    name: 'Krusty the Clown (Herschel Krustofsky)',
    type: 'business',
    interviewDate: '2024-11-08',
    testimony: `"Hej hej! Tady Krusty! Ne, nejsem nemocnej. Proč by měl být? Jo, Bart Simpson je můj největší fanoušek a viděl jsem ho na natáčení v úterý... ne, to bylo minulej měsíc. Tento měsíc jsem ho neviděl. Mám svůj vlastní make-up room, kam nikdo jiný nechodí. Jsem čistej! No... relativně. Nechte mě být, mám za hodinu show."`,
    cost: 3,
    available: true,
    infected: false,
    notes: 'Žádná relevantní expozice.',
  },
  {
    id: 'otto',
    name: 'Otto Mann',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Duuude, tady Otto! Jo, řídím školní autobus. V pondělí čtvrtýho tam byli Bart, Milhouse, Nelson, Ralph — všichni ti kluci. Bart kašlal, jasně. Ale já jsem v pohodě, dude! Mám otevřený okýnko, protože... no, prostě rád čerstvej vzduch. Nikdo mi nic nenakazil. Jsem cool. Peace!"`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaný (řidič autobusu), ale zdravý díky ventilaci.',
  },
  {
    id: 'luann',
    name: 'Luann Van Houtenová',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"Tady Luann Van Houtenová. Milhouse je u mě, je nemocný, starám se o něj. Začal být nemocný v úterý pátého. Já jsem v pořádku — byla jsem naočkovaná v říjnu, doktor Hibbert mi to doporučil. Kirk ho vzal na tu konvenci ve středu, i když byl Milhouse viditelně nemocný! Typický Kirk! Já bych to nikdy nedovolila. Kirk je teď taky nemocný, ale to je jeho problém. Milhouse se zlepšuje, dávám mu čaj a polévku."`,
    cost: 2,
    available: true,
    infected: false,
    vaccinated: true,
    notes: 'Očkovaná. Stará se o nemocného Milhouse.',
  },
  {
    id: 'ned',
    name: 'Ned Flanders',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: `"Haló-dilly-ho, tady Ned Flanders! Homerčík je nemocný, viděl jsem ho v neděli třetího na dvorku, jak griloval a vypadal hrozně. Přinesl jsem mu polévku přes plot. Děkuji Pánu Bohu, já jsem zdravý! Rod a Todd taky. Modlíme se za Simpsonovy. Nebyl jsem s Homerem v přímém kontaktu, jen jsem mu podal tu polévku přes plot. A nosil jsem rukavice, protože jsem pekl koláč a měl jsem je na rukou. Bůh má plán pro všechno, včetně epidemií. Okilly-dokilly!"`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaný (soused), ale minimální kontakt.',
  },
  {
    id: 'brandine',
    name: 'Brandine Spucklerová',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Haló? Tady Brandine. Jo, Cletus je nemocnej a zvířata taky. Já? No, já mám taky kašel, ale to mám vždycky v zimě. Doktor říkal, že to je jen nachlazení, ne ta ósacká věc. Takže já nemocná asi nejsem? Cletus říká, že to přišlo od těch městskejch, co tu byli v pondělí, ale zvířata jsou nemocný jinačí nemocí, říkal zvěrolékař. Já jsem zdravá, jen kašlu. Normální kašel."`,
    cost: 4,
    available: true,
    infected: false,
    notes: 'Kašel z jiných příčin. Ósackou horečkou neinfikována.',
  },

  // --- UNAVAILABLE CONTACTS ---
  {
    id: 'sideshow_bob',
    name: 'Robert "Sideshow Bob" Terwilliger',
    type: 'person',
    interviewDate: '2024-11-07',
    testimony: 'Telefon je nedostupný. Volající se nachází mimo dosah sítě.',
    cost: 4,
    available: false,
    infected: false,
    notes: 'Ve vězení. Nedostupný.',
  },
  {
    id: 'fat_tony',
    name: 'Fat Tony (Marion Anthony D\'Amico)',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: 'Číslo neexistuje. Zkuste jiné číslo.',
    cost: 4,
    available: false,
    infected: false,
    notes: 'Mafiánský boss. Číslo neplatné.',
  },
  {
    id: 'itchy',
    name: 'Itchy & Scratchy Studios',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: 'Automatická odpovídačka: "Děkujeme za váš zájem o Itchy & Scratchy. Momentálně nikdo nemůže přijmout váš hovor. Zanechte vzkaz po pípnutí."',
    cost: 3,
    available: false,
    infected: false,
    notes: 'Animační studio. Nerelevantní.',
  },

  // --- MORE HEALTHY CONTACTS ---
  {
    id: 'jimbo',
    name: 'Jimbo Jones',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"Co chceš? Tady Jimbo. Jo, viděl jsem Nelsona ve středu u Rychlého Apu, vypadal blbě, kašlal. Já nic nemám. Jsem tvrdej. Žádná hloupá horečka mě neskolí. Nic jinýho ti neřeknu, padej."`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Krátký kontakt s Nelsonem, ale zdravý.',
  },
  {
    id: 'springfield_hospital',
    name: 'Springfieldská nemocnice',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: `"Springfieldská nemocnice, oddělení infekčních chorob. Ano, zaznamenali jsme nárůst případů ósacké horečky od čtvrtého listopadu. Prvním hlášeným případem byl Homer Simpson, přijatý pátého listopadu. Následně přibývali pacienti — děti ze Springfieldské základní školy, pracovníci jaderné elektrárny. K dnešnímu dni evidujeme osmnáct potvrzených případů. Doporučujeme zaměřit se na jadernou elektrárnu jako primární ohnisko a základní školu jako sekundární. Bi-Mon-Sci-Fi-Con šestého listopadu mohl být dalším ohniskem — několik účastníků se ozvalo s příznaky."`,
    cost: 3,
    available: true,
    infected: false,
    notes: 'Nemocnice. Poskytuje souhrnné informace o epidemii.',
  },
  {
    id: 'sks_courier',
    name: 'SKS Kurýrní služba',
    type: 'business',
    interviewDate: '2024-11-08',
    testimony: `"SKS Kurýrní služba, dobrý den. Ano, doručovali jsme zásilku do Springfieldské jaderné elektrárny prvního listopadu. Balík přišel z Ósaky, Japonsko — šlo o náhradní díly pro jaderný reaktor. Zásilka prošla standardní celní kontrolou. Náš kurýr, který balík doručil, je v pořádku — nosí rukavice a roušku podle firemního protokolu. Balík převzal pracovník elektrárny, myslím, že se jmenoval Homer Simpson. Nevíme o žádném problému se zásilkou — ale máme informace, že v ósacké zásilkové centrále bylo v říjnu několik případů horečky mezi zaměstnanci."`,
    cost: 3,
    available: true,
    infected: false,
    notes: 'Kurýrní služba. Klíčová stopa k pacientu nula — zásilka z Ósaky.',
  },
  {
    id: 'nuclear_plant',
    name: 'Springfieldská jaderná elektrárna (recepce)',
    type: 'business',
    interviewDate: '2024-11-06',
    testimony: `"Springfieldská jaderná elektrárna, recepce. Ano, máme tu problémy s nemocností. Od pondělí čtvrtého je na nemocenské pan Simpson ze sektoru 7G, pan Leonard a pan Carlson. Pan Burns je indisponován od pondělí, řídí provoz z domova přes pana Smitherse. Pan Smithers je v pořádku, je naočkovaný. Zásilka od SKS? Ano, přišla v pátek prvního, pan Simpson ji převzal a rozbaloval v oddělení 7G. Standardní zásilka náhradních dílů z Japonska. Žádné další informace nemáme."`,
    cost: 3,
    available: true,
    infected: false,
    isSuperspreaderEvent: true,
    superspreaderName: 'Springfieldská jaderná elektrárna',
    notes: 'Primární ohnisko nákazy. Recepce poskytuje klíčové informace.',
  },
  {
    id: 'groundskeeper_willie',
    name: 'Groundskeeper Willie',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Ach, tady Willie! Ten skotskej školník! Jo, ve škole je to hrůza — děti kašlou, učitelé jsou nemocní. Ředitel Skinner vypadal v úterý jako mrtvola, ale pořád pochodoval po chodbách. Já? Já jsem zdravej jak skotskej býk! Žádná japonská horečka mě nedostane! Uklízím tu školu každej den, dezinfikuju kliky, vytírám podlahy. Možná proto jsem zdravej — všude kolem sebe čistím. Nebo je to skotská krev. Willie se nebojí žádných bacilů!"`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaný (škola), ale zdravý. Dezinfikuje povrchy.',
  },
  {
    id: 'lunchlady_doris',
    name: 'Doris Freedmanová (Lunchlady Doris)',
    type: 'person',
    interviewDate: '2024-11-08',
    testimony: `"Tady Doris ze školní jídelny. Jo, v pondělí čtvrtého byly ve škole nemocné děti — Bart Simpson, ten Milhouse. Seděli u oběda a kašlali do jídla. Já jsem za pultem, mám na sobě rukavice a zástěru. Zatím jsem v pořádku. Doktor říkal, že mám silnou imunitu. Nebo je to tím, že to jídlo, co vařím, zabije všechno — i bacily. *suché zasmání*"`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Exponovaná (školní jídelna), ale zdravá.',
  },
  {
    id: 'martin',
    name: 'Martin Prince',
    type: 'person',
    interviewDate: '2024-11-09',
    testimony: `"Dobrý den, tady Martin Prince. Ano, jsem žákem Springfieldské základní školy. V pondělí čtvrtého byl Bart Simpson ve třídě a choval se jako obvykle necivilizovaně — kašlal a kýchal bez zakrytí úst. Já jsem ovšem seděl v první lavici, daleko od něj, a navíc jsem byl naočkovaný — maminka na to dbá. Nemám žádné příznaky. Jsem zcela zdráv a využívám volný čas k přípravě na olympiádu z matematiky."`,
    cost: 2,
    available: true,
    infected: false,
    vaccinated: true,
    notes: 'Očkovaný. Exponovaný (škola), ale zdravý.',
  },
  {
    id: 'springfield_elementary',
    name: 'Springfieldská základní škola (kancelář)',
    type: 'business',
    interviewDate: '2024-11-07',
    testimony: `"Kancelář Springfieldské základní školy. Ředitel Skinner je bohužel nemocný od úterý pátého. Paní Krabappelová taky od středy šestého. Pan Largo a paní Hooverová hlásí nemoc od konce týdne. Z dětí jsou nemocní: Bart Simpson, Milhouse Van Houten, Nelson Muntz, Ralph Wiggum a další. Škola zůstává otevřená, ale doporučujeme rodičům, aby nemocné děti nechali doma. Máme dezinfekci na chodbách."`,
    cost: 3,
    available: true,
    infected: false,
    isSuperspreaderEvent: true,
    superspreaderName: 'Springfieldská základní škola',
    notes: 'Sekundární ohnisko nákazy.',
  },
  {
    id: 'hans_moleman',
    name: 'Hans Moleman',
    type: 'person',
    interviewDate: '2024-11-10',
    testimony: `"Haló? Tady Hans Moleman. Cítím se špatně, ale to je normální, cítím se špatně vždycky. Nemám teplotu, nemám kašel. Jen mě bolí záda a špatně vidím. To ale nemá nic společného s tou horečkou, to mám pořád. Nebyl jsem nikde, jen doma. Jsem sám. Vždycky jsem sám."`,
    cost: 2,
    available: true,
    infected: false,
    notes: 'Žádná expozice. Chronické potíže, ne ósacká horečka.',
  },
];
