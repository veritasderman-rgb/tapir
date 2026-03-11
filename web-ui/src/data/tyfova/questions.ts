import type { TyfovaQuestion } from '../../types/didaktikon';

export const questions: TyfovaQuestion[] = [
  // ===== STEP 1: Základní znalosti o tyfu (z dokumentu 1) =====
  {
    id: 'q1-1',
    step: 1,
    question: 'Jaký mikroorganismus způsobuje břišní tyfus?',
    type: 'multiple_choice',
    options: [
      'Escherichia coli',
      'Salmonella typhi',
      'Staphylococcus aureus',
      'Vibrio cholerae',
    ],
    correctAnswer: 'Salmonella typhi',
    explanation:
      'Břišní tyfus je způsoben bakterií Salmonella enterica, sérotyp Typhi (běžně Salmonella typhi). Jedná se o gramnegativní bakterii, která napadá výhradně člověka.',
  },
  {
    id: 'q1-2',
    step: 1,
    question: 'Jaká je typická inkubační doba břišního tyfu?',
    type: 'multiple_choice',
    options: [
      '1–3 dny',
      '7–14 dní',
      '30–60 dní',
      '2–4 hodiny',
    ],
    correctAnswer: '7–14 dní',
    explanation:
      'Inkubační doba břišního tyfu je obvykle 7–14 dní, i když může kolísat v rozmezí 3–60 dní v závislosti na infekční dávce. Tato informace je klíčová pro zpětné dohledání zdroje nákazy.',
  },

  // ===== STEP 2: Analýza domácnosti =====
  {
    id: 'q2-1',
    step: 2,
    question: 'Kteří členové domácnosti Warrenových onemocněli tyfem? Vyberte všechny nakažené.',
    type: 'checkbox',
    options: [
      'Charles Warren',
      'Paní Warren',
      'Margaret Warren',
      'Helen Warren',
      'Robert Warren',
      'Matka paní Warrenové',
      'Anna (pokojská)',
      'Bessie (pokojská)',
      'Patrick (zahradník)',
      'Mary Mallon',
      'Katherine',
      'James',
    ],
    correctAnswer: [
      'Charles Warren',
      'Paní Warren',
      'Margaret Warren',
      'Robert Warren',
      'Matka paní Warrenové',
      'Anna (pokojská)',
    ],
    explanation:
      'Onemocnělo 6 z 11 členů domácnosti: Charles Warren, paní Warren, Margaret, Robert, matka paní Warrenové a pokojská Anna. Všichni nakažení mají něco společného — zkuste najít, co je spojuje a co je odlišuje od zdravých.',
  },
  {
    id: 'q2-2',
    step: 2,
    question: 'Co mají všichni nakažení členové domácnosti společného, co zdraví členové nemají?',
    type: 'multiple_choice',
    options: [
      'Všichni pili vodu z kohoutku',
      'Všichni jedli broskvovou zmrzlinu',
      'Všichni jedli mušle',
      'Všichni spali ve stejné části domu',
    ],
    correctAnswer: 'Všichni jedli broskvovou zmrzlinu',
    explanation:
      'Klíčový společný jmenovatel: všichni nakažení jedli broskvovou zmrzlinu připravenou kuchařkou Mary. Naopak žádný ze zdravých členů domácnosti zmrzlinu nejedl (Helen nebyla doma, Bessie měla volno, zahradník, pradlena a kočí jedí odděleně). Vodu z kohoutku pili všichni — i ti zdraví.',
  },

  // ===== STEP 3: Vyloučení vody =====
  {
    id: 'q3-1',
    step: 3,
    question: 'Na základě zprávy o kvalitě vody — lze vodu vyloučit jako zdroj nákazy?',
    type: 'multiple_choice',
    options: [
      'Ano — testy jsou negativní a sousedé neonemocněli',
      'Ne — voda mohla být dočasně kontaminovaná',
      'Nelze rozhodnout — chybí dostatek dat',
    ],
    correctAnswer: 'Ano — testy jsou negativní a sousedé neonemocněli',
    explanation:
      'Vodu lze s vysokou pravděpodobností vyloučit. Testy jsou negativní, sousední domy používají stejný vodovod a nikdo další neonemocněl. Navíc ve Warrenově domácnosti pili vodu z kohoutku i ti, kteří neonemocněli (Helen, Bessie, Patrick). Kdyby byl zdrojem voda, onemocněl by pravděpodobně každý.',
  },
  {
    id: 'q3-2',
    step: 3,
    question: 'Po vyloučení vody a mléka — jaký jiný způsob přenosu je nejpravděpodobnější?',
    type: 'multiple_choice',
    options: [
      'Přenos vzduchem (kapénková infekce)',
      'Kontaminované jídlo připravené v domácnosti',
      'Hmyzí přenašeči (komáři)',
      'Kontakt s domácími zvířaty',
    ],
    correctAnswer: 'Kontaminované jídlo připravené v domácnosti',
    explanation:
      'Tyfus se šíří fekálně-orální cestou. Po vyloučení vody a mléka zbývá kontaminované jídlo jako nejpravděpodobnější zdroj. Všichni nakažení jedli stejné konkrétní jídlo (broskvovou zmrzlinu), které bylo připraveno přímo v domácnosti. Tyfus se nepřenáší vzduchem ani hmyzem.',
  },

  // ===== STEP 4: Historický vzorec =====
  {
    id: 'q4-1',
    step: 4,
    question: 'Jaký společný vzorec pozorujete ve čtyřech historických případech (1900–1904) a případu Warrenových?',
    type: 'text',
    correctAnswer: 'nová kuchařka',
    explanation:
      'Ve všech pěti případech se tyfus objevil krátce po příchodu nové kuchařky. Kuchařka nikdy sama neonemocněla a vždy odešla před nebo během vyšetřování. Časový vzorec odpovídá inkubační době tyfu (7–14 dní po jejím nástupu). V jednom případu (Sands Point, 1904) se v záznamech objevuje jméno „Mary".',
    hint: 'Zaměřte se na personální změny v domácnostech a na to, kdo nikdy neonemocněl.',
  },

  // ===== STEP 5: Identifikace zdroje =====
  {
    id: 'q5-1',
    step: 5,
    question: 'Kdo je nejpravděpodobnějším zdrojem nákazy v domácnosti Warrenových?',
    type: 'multiple_choice',
    options: [
      'Charles Warren',
      'Margaret Warren',
      'Mary Mallon',
      'Patrick',
    ],
    correctAnswer: 'Mary Mallon',
    explanation:
      'Mary Mallon je nejpravděpodobnější zdroj. Připravila broskvovou zmrzlinu, po jejíž konzumaci onemocněli všichni, kdo ji jedli. Sama je zcela zdravá — je asymptomatickou přenašečkou. Neomývá si ruce, a tak bakterie ze svého těla přenesla do jídla. Margaret onemocněla jako první, protože dostala ochutnávku zmrzliny přímo od Mary.',
  },
  {
    id: 'q5-2',
    step: 5,
    question: 'Co je „asymptomatický přenašeč"?',
    type: 'multiple_choice',
    options: [
      'Člověk, který má mírné příznaky, ale není infekční',
      'Člověk, který je nakažený, nemá žádné příznaky, ale šíří bakterie dál',
      'Člověk, který se uzdravil a již není infekční',
      'Zvíře, které přenáší nemoc na člověka',
    ],
    correctAnswer: 'Člověk, který je nakažený, nemá žádné příznaky, ale šíří bakterie dál',
    explanation:
      'Asymptomatický přenašeč je osoba, která je chronicky infikována, nemá žádné příznaky nemoci, cítí se zcela zdravá, ale trvale vylučuje bakterie (zejména ve stolici). U tyfu se takto chová přibližně 1–6 % lidí, kteří se nakazí. Bakterie přežívají v jejich žlučníku. Mary Mallon byla historicky první identifikovanou asymptomatickou přenašečkou tyfu.',
  },

  // ===== STEP 6: Kontrolní opatření a etika =====
  {
    id: 'q6-1',
    step: 6,
    question: 'Které kontrolní opatření nejlépe vyvažuje ochranu veřejného zdraví a práva jednotlivce?',
    type: 'multiple_choice',
    options: [
      'Trvalá izolace na ostrově',
      'Nucená operace žlučníku',
      'Kombinace: zákaz práce v potravinářství + pravidelné kontroly + pomoc s novým zaměstnáním',
      'Pouze edukace o hygieně',
    ],
    correctAnswer: 'Kombinace: zákaz práce v potravinářství + pravidelné kontroly + pomoc s novým zaměstnáním',
    explanation:
      'Kombinovaný přístup nejlépe vyvažuje obě hodnoty. Trvalá izolace je účinná, ale porušuje základní práva. Nucená operace je v roce 1907 příliš riziková a eticky nepřijatelná. Samotná edukace nestačí, protože Mary odmítá věřit, že je přenašečka. Kombinace zákazu práce v potravinářství, pravidelných kontrol a pomoci s alternativním zaměstnáním nabízí kompromis — i když, jak ukázala historie, závisí na spolupráci dotyčné osoby.',
  },
  {
    id: 'q6-2',
    step: 6,
    question:
      'Mary Mallon byla v roce 1910 propuštěna z izolace pod podmínkou, že nebude pracovat jako kuchařka. V roce 1915 byla znovu dopadena — opět pracovala jako kuchařka a způsobila další ohnisko (25 nakažených, 2 mrtví). Jak byste tuto situaci zhodnotili?',
    type: 'text',
    correctAnswer: 'etický konflikt',
    explanation:
      'Toto je otevřená otázka k diskusi. Případ Mary Mallon ilustruje základní dilema veřejného zdraví: právo jednotlivce na svobodu vs. ochrana společnosti. Mary neměla jinou kvalifikaci než vaření a odmítala přijmout, že je přenašečkou. Systém jí sice pomohl najít práci pradleny, ale tato práce byla hůře placená. Eticky lze argumentovat z obou stran — neexistuje jednoznačně „správná" odpověď. Důležité je umět zvažovat obě perspektivy.',
    hint: 'Zamyslete se nad tím, proč Mary porušila podmínky propuštění. Měla jinou možnost?',
  },
];

export const getQuestionsForStep = (step: number): TyfovaQuestion[] =>
  questions.filter((q) => q.step === step);

export const getTotalQuestionCount = (): number => questions.length;
