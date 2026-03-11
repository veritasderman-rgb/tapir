import React, { useEffect } from 'react';
import { useTyfovaStore } from '../../store/tyfovaStore';
import { HouseholdTable } from './HouseholdTable';
import { FoodMatrix } from './FoodMatrix';

const DOCUMENT_CONTENTS: Record<string, { title: string; content: string; hasTable?: boolean; hasMatrix?: boolean }> = {
  'typhoid-info': {
    title: 'Břišní tyfus — základní informace',
    content: `<h3 class="text-lg font-semibold mb-3">Co je břišní tyfus?</h3>
<p class="mb-3">Břišní tyfus (typhoid fever) je závažné infekční onemocnění způsobené bakterií <strong>Salmonella enterica</strong> sérotyp <strong>Typhi</strong>.</p>

<h4 class="font-semibold mt-4 mb-2">Přenos</h4>
<p class="mb-3">Nemoc se přenáší <strong>fekálně-orální cestou</strong> — tedy kontaminovanou vodou nebo potravinami. Bakterie se dostávají do prostředí z výkalů nebo moči infikované osoby.</p>

<h4 class="font-semibold mt-4 mb-2">Příznaky</h4>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Vysoká horečka (až 40 °C)</li>
  <li>Bolesti hlavy a těla</li>
  <li>Průjem nebo zácpa</li>
  <li>Růžové skvrny na trupu</li>
  <li>Zvětšení sleziny a jater</li>
</ul>

<h4 class="font-semibold mt-4 mb-2">Klíčový koncept: Asymptomatický nosič</h4>
<p class="mb-3">Přibližně <strong>2–5 % lidí</strong>, kteří se z břišního tyfu uzdraví, se stávají chronickými nosiči. Nemají žádné příznaky, ale bakterie se množí v jejich žlučníku a jsou pravidelně vylučovány stolicí. Tito lidé mohou nevědomky šířit nemoc roky.</p>

<h4 class="font-semibold mt-4 mb-2">Epidemiologie v roce 1906</h4>
<p>V New Yorku začátkem 20. století byl břišní tyfus stále vážným problémem veřejného zdraví. Ročně bylo hlášeno tisíce případů. Hlavními zdroji nákazy byly kontaminovaná voda a potraviny.</p>`,
  },
  'warren-case': {
    title: 'Případ rodiny Warrenových — léto 1906',
    content: `<h3 class="text-lg font-semibold mb-3">Zpráva o vyšetřování</h3>
<p class="mb-3">V létě roku 1906 si bohatý bankéř <strong>Charles Elliot Warren</strong> pronajal letní dům v Oyster Bay na Long Islandu pro svou rodinu a služebnictvo — celkem <strong>11 osob</strong>.</p>

<p class="mb-3">Přibližně <strong>dva týdny po příjezdu</strong> začali členové domácnosti onemocňovat břišním tyfem. Celkem onemocnělo <strong>6 z 11 osob</strong>.</p>

<h4 class="font-semibold mt-4 mb-2">Majitel domu jedná</h4>
<p class="mb-3">Majitel domu <strong>George Thompson</strong> se obával, že nebude moci dům dále pronajímat. Najal proto sanitárního inženýra <strong>George Sopera</strong>, aby zjistil příčinu nákazy.</p>

<h4 class="font-semibold mt-4 mb-2">První zjištění</h4>
<ul class="list-disc list-inside mb-3 space-y-1">
  <li>Oblast Oyster Bay měla čistou pověst — břišní tyfus zde nebyl obvyklý</li>
  <li>Nákaza postihla pouze jednu domácnost</li>
  <li>Nemocní nebyli v kontaktu s žádným známým zdrojem tyfusu</li>
  <li>Kuchařka rodiny odešla asi 3 týdny po propuknutí nemoci</li>
</ul>

<h4 class="font-semibold mt-4 mb-2">Soperův přístup</h4>
<p>Soper se rozhodl systematicky prověřit všechny možné zdroje nákazy: vodu, mléko, potraviny, a nakonec i jednotlivé osoby v domácnosti.</p>`,
  },
  'testimonies': {
    title: 'Výpovědi členů domácnosti',
    hasTable: true,
    hasMatrix: true,
    content: `<h3 class="text-lg font-semibold mb-3">Výpovědi a stravovací návyky</h3>
<p class="mb-3">George Soper provedl podrobné rozhovory se všemi členy domácnosti Warrenových. Zaměřil se na to, <strong>co kdo jedl</strong> v období před propuknutím nemoci.</p>

<p class="mb-4">Přečtěte si pozorně výpovědi jednotlivých členů domácnosti. Hledejte <strong>společný jmenovatel</strong> — co mají všichni nemocní společného a co je odlišuje od zdravých? Zaměřte se na <strong>konkrétní potraviny</strong> a na to, <strong>kdo je připravoval</strong>.</p>`,
  },
  'water-report': {
    title: 'Zpráva o kvalitě vody',
    content: `<h3 class="text-lg font-semibold mb-3">Laboratorní rozbor vodních zdrojů</h3>

<div class="bg-gray-100 rounded p-4 mb-4 border border-gray-300">
  <p class="font-mono text-sm"><strong>Místo:</strong> Letní dům, Oyster Bay, Long Island</p>
  <p class="font-mono text-sm"><strong>Datum odběru:</strong> Září 1906</p>
  <p class="font-mono text-sm"><strong>Laboratoř:</strong> NYC Department of Health</p>
</div>

<h4 class="font-semibold mt-4 mb-2">Výsledky</h4>
<table class="w-full text-sm border-collapse mb-4">
  <thead>
    <tr class="bg-gray-100">
      <th class="border p-2 text-left">Zdroj</th>
      <th class="border p-2 text-left">Stav</th>
      <th class="border p-2 text-left">Salmonella typhi</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="border p-2">Studna</td><td class="border p-2">Čistá</td><td class="border p-2 text-green-600 font-semibold">Negativní</td></tr>
    <tr><td class="border p-2">Vodovodní přípojka</td><td class="border p-2">V pořádku</td><td class="border p-2 text-green-600 font-semibold">Negativní</td></tr>
    <tr><td class="border p-2">Odpadní systém</td><td class="border p-2">Funkční</td><td class="border p-2 text-green-600 font-semibold">Negativní</td></tr>
    <tr><td class="border p-2">Mléko (dodavatel)</td><td class="border p-2">Prověřen</td><td class="border p-2 text-green-600 font-semibold">Negativní</td></tr>
  </tbody>
</table>

<h4 class="font-semibold mt-4 mb-2">Závěr</h4>
<p class="mb-3"><strong>Voda ani mléko nejsou zdrojem nákazy.</strong> Všechny vzorky jsou negativní na přítomnost Salmonella typhi. Odpadní systém je funkční a nemá kontakt s pitnou vodou.</p>

<p class="bg-yellow-50 border border-yellow-300 rounded p-3 text-sm"><strong>Pozn. vyšetřovatele:</strong> Pokud není zdrojem voda ani mléko, musím hledat jinde. Zaměřím se na osoby v domácnosti — zejména na ty, kdo manipulovali s jídlem.</p>`,
  },
  'historical-cases': {
    title: 'Historické případy — podezřelý vzorec',
    content: `<h3 class="text-lg font-semibold mb-3">Soperovo pátrání v archivech</h3>
<p class="mb-3">George Soper se rozhodl prověřit, zda se podobné záhadné případy břišního tyfu nevyskytly i jinde. Prohledal zdravotní záznamy z celého státu New York. Výsledky byly překvapivé:</p>

<table class="w-full text-sm border-collapse mb-4">
  <thead>
    <tr class="bg-gray-100">
      <th class="border p-2 text-left">Rok</th>
      <th class="border p-2 text-left">Rodina / místo</th>
      <th class="border p-2 text-left">Případy tyfu</th>
      <th class="border p-2 text-left">Poznámka</th>
    </tr>
  </thead>
  <tbody>
    <tr><td class="border p-2">1900–01</td><td class="border p-2">Rodina Drayton, Mamaroneck</td><td class="border p-2">1 případ</td><td class="border p-2">Nová kuchařka odešla po propuknutí</td></tr>
    <tr><td class="border p-2">1901–02</td><td class="border p-2">Rodina v New Yorku</td><td class="border p-2">Prádelna onemocněla</td><td class="border p-2">Kuchařka odešla</td></tr>
    <tr><td class="border p-2">1902–03</td><td class="border p-2">Advokát Coleman Drayton, Dark Harbor</td><td class="border p-2">7 případů z 9 osob</td><td class="border p-2">Kuchařka pomáhala s ošetřováním nemocných</td></tr>
    <tr><td class="border p-2">1904</td><td class="border p-2">Rodina Gilsey, Sands Point</td><td class="border p-2">4 případy</td><td class="border p-2">Služebnictvo i rodina; kuchařka jménem „Mary"</td></tr>
    <tr><td class="border p-2">1906</td><td class="border p-2">Rodina Warrenových, Oyster Bay</td><td class="border p-2">6 z 11 osob</td><td class="border p-2">Současný vyšetřovaný případ</td></tr>
  </tbody>
</table>

<h4 class="font-semibold mt-4 mb-2">Vzorec</h4>
<p class="mb-3 bg-red-50 border border-red-200 rounded p-3"><strong>Ve všech případech se tyfus objevil krátce po příchodu nové kuchařky.</strong> Kuchařka nikdy sama neonemocněla a vždy odešla před nebo během vyšetřování. Popis kuchařky v záznamech z roku 1904 odpovídá osobě z domácnosti Warrenových.</p>

<h4 class="font-semibold mt-4 mb-2">Soperův závěr</h4>
<p>Je třeba zjistit, zda kuchařka z domácnosti Warrenových pracovala i u těchto dalších rodin. Pokud ano, jedná se s vysokou pravděpodobností o asymptomatického nosiče břišního tyfu.</p>`,
  },
  'newspapers': {
    title: 'Novinové články — „Typhoid Mary"',
    content: `<h3 class="text-lg font-semibold mb-3">Média a veřejná reakce</h3>

<div class="bg-amber-50 border-2 border-amber-800 rounded p-4 mb-4 font-serif">
  <p class="text-center text-xl font-bold mb-2">NEW YORK AMERICAN</p>
  <p class="text-center text-sm mb-3">18. června 1909</p>
  <h4 class="text-center text-2xl font-bold mb-3">"TYPHOID MARY" — NEJNEBEZPEČNĚJŠÍ ŽENA V AMERICE</h4>
  <p class="mb-2">Zdravotní úřady města New York potvrdily, že žena jménem Mary Mallon, irská kuchařka, je chronickým nosičem břišního tyfu. Ačkoli sama nikdy nejevila příznaky nemoci, infikovala desítky lidí ve svém okolí.</p>
  <p>Mallon byla umístěna do karantény na North Brother Island, kde odmítá spolupracovat s lékaři a tvrdí, že je naprosto zdravá.</p>
</div>

<div class="bg-gray-50 border border-gray-300 rounded p-4 mb-4">
  <h4 class="font-semibold mb-2">Mary Mallon o sobě:</h4>
  <blockquote class="italic border-l-4 border-gray-400 pl-3 text-gray-700">
    „Nikdy jsem neměla tyfus. Jsem zdravá žena a nemám žádnou nemoc. Jsem nevinná a jsem nespravedlivě vězněna."
  </blockquote>
</div>

<h4 class="font-semibold mt-4 mb-2">Etická debata</h4>
<p class="mb-3">Případ vyvolal ostrou veřejnou debatu:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Zastánci karantény:</strong> Mary je hrozbou pro veřejné zdraví, nelze ji nechat volně pracovat s jídlem</li>
  <li><strong>Odpůrci:</strong> Mary nebyla nikdy odsouzena za žádný zločin. Karanténa bez soudu je porušením jejích občanských práv</li>
  <li><strong>Mary sama:</strong> Odmítala věřit diagnóze. Koncept asymptomatického nosiče byl tehdy nový a nepochopitelný</li>
</ul>

<p class="text-sm text-gray-500">Poznámka: Přezdívka „Typhoid Mary" se později stala obecným výrazem pro osobu, která nevědomky šíří nemoc nebo problémy.</p>`,
  },
  'control-measures': {
    title: 'Kontrolní opatření a osud Mary Mallon',
    content: `<h3 class="text-lg font-semibold mb-3">Co se stalo s Mary Mallon?</h3>

<h4 class="font-semibold mt-4 mb-2">Chronologie</h4>
<ul class="space-y-3 mb-4">
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1907</span><span>Soper konfrontuje Mary s důkazy. Mary ho vyhodí s vidlicí na maso. Zdravotní úřady ji násilím odvezou na North Brother Island.</span></li>
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1907-10</span><span>Mary je v karanténě. Bakteriologické testy potvrzují, že je nosičkou. Odmítá operaci žlučníku.</span></li>
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1910</span><span>Nový zdravotní komisař ji propouští pod podmínkou, že nebude pracovat s jídlem.</span></li>
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1915</span><span><strong>Mary se vrací k vaření pod jménem Mary Brown.</strong> V porodnici Sloane Hospital propukne epidemie — 25 nakažených, 2 mrtvé.</span></li>
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1915-38</span><span>Mary je znovu umístěna do karantény na North Brother Island. Tentokrát doživotně.</span></li>
  <li class="flex gap-2"><span class="font-mono font-semibold text-sm w-16 flex-shrink-0">1938</span><span>Mary Mallon umírá ve věku 69 let. Pitva potvrzuje živé kultury Salmonella typhi v jejím žlučníku.</span></li>
</ul>

<h4 class="font-semibold mt-4 mb-2">Moderní přístupy</h4>
<p class="mb-3">Dnes bychom případ Mary Mallon řešili jinak:</p>
<ul class="list-disc list-inside space-y-1 mb-3">
  <li><strong>Antibiotika:</strong> Chronické nosičství lze často vyléčit antibiotiky (ciprofloxacin)</li>
  <li><strong>Chirurgie:</strong> Cholecystektomie (odstranění žlučníku) může eliminovat nosičství</li>
  <li><strong>Surveillance:</strong> Systémy sledování infekčních nemocí dokáží rychleji identifikovat zdroje</li>
  <li><strong>Vzdělávání:</strong> Hygiena rukou a bezpečné zacházení s potravinami</li>
  <li><strong>Právní rámec:</strong> Jasná legislativa pro řešení nosičů s respektem k lidským právům</li>
</ul>

<div class="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
  <strong>Poučení:</strong> Případ Mary Mallon ukazuje, jak důležité je vyvažovat ochranu veřejného zdraví s respektem k právům jednotlivce. Doživotní karanténa zdravé osoby je dnes považována za nepřijatelnou — existují lepší alternativy.
</div>`,
  },
};

export const DocumentViewer: React.FC = () => {
  const selectedDocument = useTyfovaStore((s) => s.selectedDocument);
  const markRead = useTyfovaStore((s) => s.markRead);

  useEffect(() => {
    if (selectedDocument) {
      markRead(selectedDocument);
    }
  }, [selectedDocument, markRead]);

  if (!selectedDocument) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">{'\u{1F4C2}'}</p>
          <p className="text-lg">Vyberte dokument ze seznamu vlevo</p>
        </div>
      </div>
    );
  }

  const doc = DOCUMENT_CONTENTS[selectedDocument];
  if (!doc) {
    return (
      <div className="p-6 text-gray-500">Dokument nenalezen.</div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        {doc.title}
      </h2>
      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: doc.content }}
      />
      {doc.hasTable && (
        <div className="mt-6">
          <HouseholdTable />
        </div>
      )}
      {doc.hasMatrix && (
        <div className="mt-6">
          <FoodMatrix />
        </div>
      )}
    </div>
  );
};
