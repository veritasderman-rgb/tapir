import type { TyfovaDocument } from '../../types/didaktikon';

export const documents: TyfovaDocument[] = [
  {
    id: 'doc-typhoid-basics',
    title: 'Tyfus - základní informace',
    order: 0,
    unlockedByStep: 0,
    content: `
<h2>Břišní tyfus (Typhoid fever)</h2>

<h3>Původce</h3>
<p>Břišní tyfus je závažné infekční onemocnění způsobené bakterií <strong>Salmonella enterica</strong>, sérotyp <strong>Typhi</strong> (běžně označovaná jako <em>Salmonella typhi</em>). Jedná se o gramnegativní tyčinkovitou bakterii, která napadá výhradně člověka — nemá žádného zvířecího hostitele.</p>

<h3>Přenos</h3>
<p>Nákaza se šíří <strong>fekálně-orální cestou</strong>:</p>
<ul>
  <li><strong>Kontaminovaná voda</strong> — nejčastější zdroj velkých epidemií, zejména v oblastech se špatnou kanalizací</li>
  <li><strong>Kontaminované potraviny</strong> — připravené osobou, která vylučuje bakterie (i bez příznaků!)</li>
  <li><strong>Přímý kontakt</strong> — s nakaženou osobou nebo jejími výkaly</li>
  <li><strong>Mušle a měkkýši</strong> — z kontaminovaných vod</li>
</ul>
<p>Bakterie se množí v trávicím traktu a proniká do krevního oběhu.</p>

<h3>Inkubační doba</h3>
<p>Obvykle <strong>7–14 dní</strong> (rozmezí 3–60 dní v závislosti na infekční dávce). Čím větší množství bakterií člověk pozře, tím kratší je inkubační doba.</p>

<h3>Příznaky</h3>
<p>Onemocnění se vyvíjí postupně v několika fázích:</p>
<ol>
  <li><strong>1. týden:</strong> Postupně narůstající horečka (až 40 °C), bolesti hlavy, únava, ztráta chuti k jídlu</li>
  <li><strong>2. týden:</strong> Vysoká trvalá horečka, <em>růžové skvrny</em> (roseoly) na trupu, zvětšení sleziny, zácpa nebo průjem</li>
  <li><strong>3. týden:</strong> Nebezpečí střevních komplikací — perforace střeva, vnitřní krvácení, delirium</li>
  <li><strong>4. týden:</strong> Postupné zlepšování, nebo smrt bez léčby</li>
</ol>

<h3>Úmrtnost</h3>
<p>Bez léčby antibiotiky umírá <strong>10–30 %</strong> nakažených. S moderní léčbou klesá úmrtnost pod 1 %. Na počátku 20. století však antibiotika neexistovala.</p>

<h3>Asymptomatický přenašeč</h3>
<p>Klíčový koncept: přibližně <strong>1–6 % osob</strong>, které prodělají tyfus (nebo se nakazí), se stane <strong>chronickými přenašeči</strong>. Tito lidé:</p>
<ul>
  <li>Nemají <strong>žádné příznaky</strong> nemoci</li>
  <li>Cítí se zcela zdraví</li>
  <li>Ale <strong>trvale vylučují bakterie</strong> (zejména ve stolici a moči)</li>
  <li>Bakterie přežívají v jejich žlučníku</li>
  <li>Mohou nevědomky šířit nákazu <strong>po celá léta</strong></li>
</ul>
<p>Asymptomatický přenašeč představuje obrovské riziko zejména pokud pracuje v potravinářství — může nakazit desítky či stovky lidí, aniž by kdokoli tušil zdroj nákazy.</p>

<h3>Diagnostika (1906)</h3>
<p>Na počátku 20. století se diagnóza stanovovala pomocí:</p>
<ul>
  <li><strong>Widalovy reakce</strong> — sérologický test na protilátky</li>
  <li><strong>Kultivace ze stolice</strong> — průkaz bakterie v kultivačních médiích</li>
  <li><strong>Kultivace z krve</strong> — spolehlivější, ale obtížnější</li>
</ul>
`,
  },
  {
    id: 'doc-warren-case',
    title: 'Případ rodiny Warrenových',
    order: 1,
    unlockedByStep: 1,
    content: `
<h2>Případ rodiny Warrenových — Oyster Bay, Long Island, 1906</h2>

<h3>Situace</h3>
<p>V létě roku <strong>1906</strong> si bohatý newyorský bankéř <strong>Charles Henry Warren</strong> pronajal letní sídlo v Oyster Bay na Long Islandu. Dům patřil panu Georgi Thompsonu, který ho pravidelně pronajímal zámožným rodinám na letní sezónu.</p>

<p>V domácnosti žilo celkem <strong>11 osob</strong>:</p>
<ul>
  <li>Rodina Warrenových: pan Warren, paní Warren, dcera Margaret, dcera Helen, syn Robert a matka paní Warrenové</li>
  <li>Služebnictvo: dvě pokojské (Anna a Bessie), zahradník (Patrick), kuchařka (Mary Mallon), pradlena (Katherine) a kočí (James)</li>
</ul>

<h3>Vypuknutí epidemie</h3>
<p>Mezi <strong>27. srpnem a 3. zářím 1906</strong> postupně onemocnělo <strong>6 z 11 členů domácnosti</strong> břišním tyfem. Jednalo se o:</p>
<ol>
  <li>Dceru Margaret (první příznaky 27. srpna)</li>
  <li>Paní Warrenovou (29. srpna)</li>
  <li>Matku paní Warrenové (31. srpna)</li>
  <li>Pokojskou Annu (1. září)</li>
  <li>Pana Warrena (2. září)</li>
  <li>Syna Roberta (3. září)</li>
</ol>

<h3>Vyšetřování</h3>
<p>Majitel domu George Thompson se obával, že pokud se rozšíří, že se v jeho domě vyskytl tyfus, nebude schopen dům dále pronajímat. Proto najal <strong>George Alberta Sopera</strong>, uznávaného inženýra hygieny a epidemiologa, aby příčinu epidemie vyšetřil.</p>

<p>Soper přijel do Oyster Bay v <strong>prosinci 1906</strong> a systematicky začal prověřovat všechny možné zdroje nákazy:</p>
<ul>
  <li>Kvalitu vody a kanalizace</li>
  <li>Mléko a mléčné výrobky</li>
  <li>Mušle a plody moře</li>
  <li>Stravování členů domácnosti</li>
  <li>Personální změny v domácnosti</li>
</ul>

<p><strong>Vaším úkolem</strong> je sledovat Soperovo vyšetřování a pokusit se identifikovat zdroj nákazy dříve než on.</p>
`,
  },
  {
    id: 'doc-testimonies',
    title: 'Výpovědi členů domácnosti',
    order: 2,
    unlockedByStep: 2,
    content: `
<h2>Výpovědi členů domácnosti Warrenových</h2>

<h3>Charles Warren (pán domu)</h3>
<blockquote>
„Jedli jsme vždy společně u jednoho stolu — celá rodina i s matkou mé ženy. Služebnictvo jedlo v kuchyni odděleně, až na ty, které servírovaly. Kuchařka Mary vařila všechna jídla. Vodu jsme brali z místního vodovodu, stejně jako všichni sousedé. Pamatuji se, že jsem jedl mušle, které Mary připravila, a také její vynikající broskvovou zmrzlinu — tu jsme měli tuším 20. srpna, tedy asi týden před tím, než Margo onemocněla. Jedl jsem ji dvě porce."
</blockquote>

<h3>Paní Warren</h3>
<blockquote>
„Naše kuchařka Mary přišla začátkem srpna, nahradila předchozí kuchařku, která odešla. Mary vařila výborně. Ten den, co dělala broskvovou zmrzlinu, jsme ji jedli snad všichni — byla výtečná, Mary ji dělala zcela vlastnoručně, sama nakrájela broskve a všechno smíchala. Helen ten den nebyla doma, jela na návštěvu ke kamarádce. Myslím, že Bessie ten den taky nejedla zmrzlinu — měla volno."
</blockquote>

<h3>Helen Warren (dcera)</h3>
<blockquote>
„Já jsem ten den nebyla doma vůbec. Jela jsem za přítelkyní do sousedního města a vrátila jsem se až druhý den večer. Zmrzlinu jsem tedy nejedla. Jinak jsem ale jedla všechno ostatní — maso, zeleninu, pila jsem vodu ze stejného kohoutku. Nedovedu si vysvětlit, proč jsem jediná z rodiny neonemocněla."
</blockquote>

<h3>Margaret Warren (dcera)</h3>
<blockquote>
„Milovala jsem Maryino vaření. Tu broskvovou zmrzlinu jsem jedla jako první — Mary mi dala ochutnat ještě předtím, než se podávala u stolu. Bylo mi špatně asi za týden poté. Hrozná horečka, bolesti břicha. Doktor řekl, že je to tyfus."
</blockquote>

<h3>Robert Warren (syn)</h3>
<blockquote>
„Jedl jsem všechno co ostatní. Zmrzlinu, mušle, maso, ovoce. Vodu z kohoutku. Byl jsem poslední, kdo onemocněl — horečku jsem dostal 3. září."
</blockquote>

<h3>Matka paní Warrenové</h3>
<blockquote>
„Jsem starší paní a broskvová zmrzlina byla jedna z mála věcí, co jsem mohla jíst s chutí. Onemocněla jsem krátce po vnučce Margaret."
</blockquote>

<h3>Anna (pokojská)</h3>
<blockquote>
„My služebné jsme jedly odděleně v kuchyni, ale ze stejného jídla co rodina. Tu zmrzlinu jsem jedla taky — Mary nám ji dala ochutnat. Bylo jí dost. Bessie ten den ale nejedla, protože měla volno a šla do města."
</blockquote>

<h3>Bessie (pokojská)</h3>
<blockquote>
„V ten den co se dělala ta zmrzlina jsem měla volný den. Šla jsem do města na nákupy. Vrátila jsem se až večer a zmrzlina už žádná nebyla. Jedla jsem normálně všechno ostatní — maso, ryby, zeleninu, pila jsem vodu. Ale neonemocněla jsem."
</blockquote>

<h3>Patrick (zahradník)</h3>
<blockquote>
„Já jím ve svém domku na zahradě. Mám vlastní kuchyňku. Občas si vezmu něco z velké kuchyně, ale většinou si vařím sám. Tu slavnou zmrzlinu jsem nejedl. Vodu beru ze stejného pramene jako dům."
</blockquote>

<h3>Mary Mallon (kuchařka)</h3>
<blockquote>
„Nevím, proč se mě na to ptáte. Já jsem úplně zdravá, nikdy jsem tyfus neměla. Vařím pro lidi léta a nikdy nebyl žádný problém. Tu zmrzlinu jsem dělala z čerstvých broskví — kupovala jsem je na trhu. Já sama zmrzlinu moc nerada, takže jsem ji nejedla. Vodu používám z kohoutku jako všichni. Neumývám si ruce nějak speciálně — proč bych měla, nejsem přece nemocná! To je urážka, že mě z něčeho obviňujete."
</blockquote>

<h3>Katherine (pradlena)</h3>
<blockquote>
„Já peru a žehlím, v kuchyni se nezdržuji. Jím většinou u sebe v prádelně, nosím si něco z kuchyně. Tu zmrzlinu jsem nejedla. Piju čaj, který si sama vařím."
</blockquote>

<h3>James (kočí)</h3>
<blockquote>
„Většinu dne jsem u koní nebo na cestách. Jím odděleně ve stáji nebo v hospodě ve městě. Z kuchyně velkého domu jím málokdy. Zmrzlinu jsem neměl."
</blockquote>
`,
  },
  {
    id: 'doc-water-report',
    title: 'Zpráva o kvalitě vody',
    order: 3,
    unlockedByStep: 3,
    content: `
<h2>Zpráva o kvalitě vody — Oyster Bay, Long Island</h2>
<p><em>Vypracoval: George A. Soper, C.E., prosinec 1906</em></p>

<h3>Metodika</h3>
<p>Byly odebrány vzorky ze všech vodních zdrojů sloužících domácnosti Warrenových:</p>
<ul>
  <li>Hlavní vodovodní přípojka z městského vodovodu Oyster Bay</li>
  <li>Studna na zahradě (záložní zdroj)</li>
  <li>Cisterna na dešťovou vodu</li>
</ul>
<p>Vzorky byly analyzovány v bakteriologické laboratoři Newyorského zdravotního úřadu.</p>

<h3>Výsledky</h3>
<table>
  <tr><th>Zdroj</th><th>Koliformní bakterie</th><th>Salmonella typhi</th><th>Hodnocení</th></tr>
  <tr><td>Městský vodovod</td><td>Negativní</td><td>Negativní</td><td>Vyhovující</td></tr>
  <tr><td>Zahradní studna</td><td>Negativní</td><td>Negativní</td><td>Vyhovující</td></tr>
  <tr><td>Cisterna</td><td>Stopové množství</td><td>Negativní</td><td>Přijatelné</td></tr>
</table>

<h3>Kanalizace</h3>
<p>Kanalizační systém domu byl prověřen. Septik je v dobrém stavu, dostatečně vzdálen od vodních zdrojů. Nebyla zjištěna žádná netěsnost ani zpětný průsak.</p>

<h3>Sousední domy</h3>
<p>V okolí domu Warrenových nebyly hlášeny <strong>žádné další případy</strong> břišního tyfu. Sousedé používají stejný městský vodovod. Žádný z nich neonemocněl.</p>

<h3>Mléko</h3>
<p>Mléko dodával místní farmář pan Jenkins. Stejné mléko odebíralo dalších <strong>12 domácností</strong> v okolí — v žádné z nich se tyfus nevyskytl. Mléko jako zdroj nákazy je tedy <strong>vyloučeno</strong>.</p>

<h3>Mušle</h3>
<p>Rodina konzumovala měkkýše (clams) z místního trhu. Avšak čerstvé mušle byly v té době běžnou součástí stravy v celém Oyster Bay a žádná další domácnost neonemocněla. Mušle byly navíc konzumovány vařené. Mušle jako primární zdroj jsou <strong>nepravděpodobné</strong>.</p>

<h3>Závěr</h3>
<p>Voda, mléko ani mušle <strong>nemohou být zdrojem</strong> epidemie v domácnosti Warrenových. Nákaza musí pocházet z <strong>jiného zdroje</strong> — pravděpodobně z kontaminovaného jídla připraveného přímo v domácnosti. Vyšetřování se musí zaměřit na <strong>potraviny a osoby</strong>, které s nimi přicházely do styku.</p>
`,
  },
  {
    id: 'doc-historical-cases',
    title: 'Historické případy — podezřelý vzorec',
    order: 4,
    unlockedByStep: 4,
    content: `
<h2>Historické případy — podezřelý vzorec</h2>
<p><em>Sestavil: George A. Soper na základě rešerše zdravotních záznamů, leden 1907</em></p>

<p>Po vyloučení vody a dalších běžných zdrojů se Soper rozhodl pátrat v historii. Začal sledovat, zda se podobné případy nevyskytly jinde — a zda nemají něco společného. Výsledky jeho rešerše byly překvapivé:</p>

<h3>Případ 1: Mamaroneck, New York — 1900</h3>
<p>Zámožná rodina najala novou kuchařku. <strong>Tři týdny</strong> po jejím nástupu onemocnělo <strong>7 členů domácnosti</strong> břišním tyfem. Kuchařka sama zůstala zdravá. Krátce po vypuknutí epidemie z domu <strong>odešla</strong>, ještě před zahájením vyšetřování. Zdroj nákazy nebyl nikdy objasněn.</p>

<h3>Případ 2: New York City — 1901</h3>
<p>V domácnosti na Manhattanu se po příchodu nové kuchařky objevil tyfus u <strong>11 osob</strong> — členů rodiny i personálu. Pradlena, která prala kontaminované prádlo, onemocněla a <strong>zemřela</strong>. Kuchařka nepociťovala žádné příznaky. Po epidemii dala výpověď a odešla.</p>

<h3>Případ 3: Dark Harbor, Maine — 1902</h3>
<p>Letní sídlo na ostrově u pobřeží Maine. Rodina si najala novou kuchařku na sezónu. Během <strong>dvou týdnů</strong> po jejím nástupu onemocnělo <strong>9 osob</strong>. Místní úřady podezřívaly kontaminovanou vodu, ale šetření bylo neprůkazné. Kuchařka odešla na konci sezóny — byla zdravá po celou dobu.</p>

<h3>Případ 4: Sands Point, Long Island — 1904</h3>
<p>Další letní sídlo na Long Islandu. Čtyři členové domácnosti onemocněli tyfem. V záznamech se zachovalo jméno kuchařky: <strong>„Mary"</strong>. I tentokrát byla kuchařka zcela zdravá. Po propuknutí nemoci v domě odešla a nastoupila jinam.</p>

<hr>

<h3>Soperův postřeh</h3>
<p>George Soper si všiml nápadného vzorce:</p>
<ul>
  <li>Ve všech čtyřech případech (plus případ Warrenových) se tyfus objevil <strong>krátce po příchodu nové kuchařky</strong></li>
  <li>Kuchařka <strong>nikdy neonemocněla</strong></li>
  <li>Kuchařka vždy <strong>odešla</strong> před nebo během vyšetřování</li>
  <li>Zdroj nákazy nebyl nikdy oficiálně objasněn</li>
  <li>Časový vzorec odpovídá <strong>inkubační době</strong> břišního tyfu (7–14 dní po nástupu kuchařky)</li>
</ul>
<p><strong>Otázka:</strong> Je možné, že za všemi těmito případy stojí <strong>jedna a táž osoba</strong>?</p>
`,
  },
  {
    id: 'doc-newspapers',
    title: 'Novinové články',
    order: 5,
    unlockedByStep: 5,
    content: `
<h2>Novinové články z roku 1907–1909</h2>

<h3>Článek 1: „Nevinná žena uvězněna bez soudu"</h3>
<p><em>New York American, červen 1909</em></p>
<blockquote>
<p><strong>TYFOVÁ MARY — OBĚŤ ÚŘEDNÍ ZVŮLE?</strong></p>
<p>Již přes dva roky je Mary Mallon, irská kuchařka, držena v izolaci na ostrově North Brother Island bez jakéhokoli soudního řízení. Úřady tvrdí, že je „chronickou přenašečkou" břišního tyfu, přestože žena nikdy nejevila žádné příznaky nemoci a cítí se zcela zdráva.</p>
<p>„Nikdy jsem neměla tyfus. Nikdy jsem nebyla nemocná," říká Mary Mallon ve svém dopise z karantény. „Zavřeli mě jako zločince, přestože jsem nikomu neublížila. Jsem zdravá žena a chci jen pracovat."</p>
<p>Případ Mary Mallon vyvolává znepokojivé otázky: <strong>Může být člověk uvězněn na neurčito, aniž by byl nemocný, aniž by byl odsouzen soudem?</strong> Kde končí pravomoc zdravotních úřadů a začínají práva jednotlivce?</p>
<p>Lékaři provedli stovky testů jejích vzorků — výsledky jsou rozporuplné. V některých vzorcích se bakterie tyfu našly, v jiných nikoli. Sama Mary je přesvědčena, že testy jsou chybné.</p>
<p>Právník Mary Mallon podal žalobu na město New York a požaduje její propuštění. „Moje klientka je de facto politickou vězeňkyní hygienické policie," prohlásil.</p>
</blockquote>

<h3>Článek 2: „Ochrana veřejného zdraví musí mít přednost"</h3>
<p><em>New York Times, březen 1907</em></p>
<blockquote>
<p><strong>ZDRAVOTNÍ ÚŘADY JEDNAJÍ ROZHODNĚ PROTI ŠÍŘENÍ TYFU</strong></p>
<p>Newyorský zdravotní úřad potvrdil, že kuchařka Mary Mallon byla identifikována jako <strong>asymptomatická přenašečka</strong> břišního tyfu. Bakteriologické vyšetření potvrdilo přítomnost Salmonella typhi v jejích vzorcích stolice.</p>
<p>Podle vyšetřování sanitárního inženýra George Sopera je Mary Mallon přímo spojována s nejméně <strong>sedmi ohnisky</strong> břišního tyfu v oblasti New Yorku mezi lety 1900 a 1906, při nichž onemocnělo přes <strong>50 osob</strong> a nejméně <strong>3 zemřely</strong>.</p>
<p>Dr. S. Josephine Baker z městského zdravotního úřadu osobně zajistila zadržení Mary Mallon po jejím opakovaném odmítnutí spolupracovat. „Tato žena je chodící epidemie," uvedla Dr. Baker. „Jedná se o bezprecedentní situaci — zdravý člověk, který nevědomky šíří smrtelnou nemoc."</p>
<p>Zdravotní komisař Dr. Hermann Biggs prohlásil: „Ochrana veřejného zdraví vyžaduje někdy obtížná rozhodnutí. Nemůžeme dovolit, aby jedna osoba, byť nevinně, ohrožovala životy desítek dalších lidí."</p>
<p><strong>Odborníci se shodují</strong>, že případ Mary Mallon je průlomový — poprvé v historii byl identifikován chronický asymptomatický přenašeč závažného infekčního onemocnění. Tento objev má zásadní důsledky pro pochopení šíření infekčních nemocí.</p>
</blockquote>
`,
  },
  {
    id: 'doc-control-measures',
    title: 'Kontrolní opatření',
    order: 6,
    unlockedByStep: 6,
    content: `
<h2>Kontrolní opatření — co dělat s asymptomatickým přenašečem?</h2>
<p><em>Na základě diskusí newyorského zdravotního úřadu, 1907–1910</em></p>

<p>Identifikace Mary Mallon jako asymptomatické přenašečky břišního tyfu vyvolala bezprecedentní otázku: <strong>Jak chránit veřejné zdraví a zároveň respektovat práva jednotlivce?</strong></p>

<p>Zdravotní úřady zvažovaly několik možných opatření:</p>

<h3>1. Trvalá izolace na ostrově</h3>
<p><strong>Popis:</strong> Mary bude umístěna do karanténního zařízení na North Brother Island na neurčitou dobu.</p>
<p><strong>Pro:</strong> Nejúčinnější ochrana veřejnosti. Nulové riziko dalšího šíření.</p>
<p><strong>Proti:</strong> De facto doživotní vězení bez soudního řízení. Porušení osobní svobody. Žádný zákon výslovně neumožňuje takové opatření.</p>

<h3>2. Chirurgické odstranění žlučníku</h3>
<p><strong>Popis:</strong> Operace, při které by byl odstraněn žlučník — místo, kde se bakterie trvale množí.</p>
<p><strong>Pro:</strong> Mohlo by vyřešit problém přenášení. Mary by mohla žít normálním životem.</p>
<p><strong>Proti:</strong> V roce 1907 je cholecystektomie riziková operace s vysokou úmrtností. Mary odmítá. Nelze ji nutit k operaci. Navíc není jisté, zda by operace přenášení zastavila.</p>

<h3>3. Zákaz práce v potravinářství</h3>
<p><strong>Popis:</strong> Mary bude propuštěna z izolace pod podmínkou, že nebude pracovat jako kuchařka ani v jiném zaměstnání spojeném s přípravou jídla.</p>
<p><strong>Pro:</strong> Zachovává osobní svobodu. Eliminuje hlavní riziko přenosu.</p>
<p><strong>Proti:</strong> Mary je kuchařka — je to její profese a hlavní zdroj obživy. Těžko vymahatelné. Mary může porušit dohodu (což se skutečně stalo v roce 1915).</p>

<h3>4. Pravidelné zdravotní kontroly</h3>
<p><strong>Popis:</strong> Mary bude propuštěna, ale musí se pravidelně (měsíčně) hlásit na zdravotním úřadě k odběru vzorků.</p>
<p><strong>Pro:</strong> Zachovává svobodu. Umožňuje monitoring.</p>
<p><strong>Proti:</strong> Nebrání šíření mezi kontrolami. Mary může přestat chodit na kontroly. Nezabraňuje kontaminaci potravin.</p>

<h3>5. Edukace a hygiena</h3>
<p><strong>Popis:</strong> Mary bude poučena o přísné hygieně rukou, zejména důkladném mytí po použití toalety a před přípravou jídla.</p>
<p><strong>Pro:</strong> Respektuje autonomii. Podporuje pochopení problému.</p>
<p><strong>Proti:</strong> V roce 1907 Mary odmítá věřit, že je přenašečka. Bez pochopení problému nebude dodržovat hygienu. Samotná hygiena nemusí stačit k eliminaci rizika.</p>

<h3>6. Kombinace opatření</h3>
<p><strong>Popis:</strong> Propuštění z izolace + zákaz práce v potravinářství + pravidelné kontroly + pomoc s nalezením jiného zaměstnání.</p>
<p><strong>Pro:</strong> Vyvážený přístup. Kombinuje ochranu veřejnosti s respektem k právům.</p>
<p><strong>Proti:</strong> Závisí na spolupráci Mary. Vyžaduje trvalý dohled úřadů. Finanční náklady.</p>

<hr>

<h3>Co se skutečně stalo?</h3>
<p>Mary Mallon byla propuštěna v roce <strong>1910</strong> pod podmínkou, že nebude pracovat jako kuchařka. Město jí pomohlo najít práci jako pradlena. Avšak v roce <strong>1915</strong> byla znovu odhalena — pracovala opět jako kuchařka (pod falešným jménem „Mary Brown") v porodnici Sloane Hospital, kde způsobila další ohnisko tyfu s <strong>25 nakaženými a 2 mrtvými</strong>.</p>
<p>Po tomto incidentu byla Mary Mallon znovu izolována na North Brother Island, kde žila až do své smrti v roce <strong>1938</strong> — celkem strávila v izolaci <strong>26 let</strong>.</p>
`,
  },
];
