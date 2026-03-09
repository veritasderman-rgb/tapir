# Doporučení pro maximální použitelnost Tapíra ve výuce na Lékařské fakultě

Tento dokument shrnuje, co bych implementoval jako další kroky po průchodu repozitáře.

## 1) Didaktické workflow pro seminář (nejvyšší priorita)

### Co přidat
- **Scénářové „lekce“ s jasným cílem** (např. „snížit peak ICU pod kapacitu“), které studenty provedou krok za krokem.
- **Automatické hodnocení řešení** proti rubrici (zda student splnil limit ICU, počet úmrtí, ekonomický dopad).
- **Instructor orchestrace**: spuštění stejného zadání celé skupině + sběr anonymizovaných výsledků.

### Proč
Aplikace už obsahuje bohaté modelování, ale ve výuce je klíčové i to, jak rychle lze z modelu udělat strukturovanou aktivitu se zpětnou vazbou.

## 2) Režim „klinická data vs. model“

### Co přidat
- **Import anonymizovaných časových řad** (CSV) a overlay na simulované křivky.
- **Jednoduchou kalibraci parametrů z dat** (fit na incidence/hospitalizace).
- **„Data quality“ panel**: vysvětlení zpoždění reportingu, under-reportingu, změn testovací strategie.

### Proč
Student medicíny potřebuje porozumět rozdílu mezi latentní epidemiologickou realitou a observovanými daty v nemocniční praxi.

## 3) Assignment mode + LMS integrace

### Co přidat
- **Export výsledku jako „submission bundle“** (JSON + graf + parametry + seed).
- **LTI/CSV integraci** pro Moodle/IS (alespoň import/export známek v první fázi).
- **Plagiát/duplikace kontrolu přes hash scénáře + seed + časovou stopu.**

### Proč
Bez hladkého napojení na výuku je i skvělý simulátor často používaný jen ad hoc.

## 4) Silnější klinické endpointy

### Co přidat
- **Triážové metriky**: dny nad ICU kapacitou, personální deficit, odložená péče.
- **Věkově-rizikové outcome dashboardy**: absolutní i relativní riziko pro subpopulace.
- **Comparative effectiveness card**: NPI/vakcinace „cena“ vs. klinický přínos.

### Proč
Pro LF je zásadní napojení na rozhodování „co to znamená pro oddělení, lůžka, úmrtí a etiku triáže“.

## 5) Lepší pedagogická interpretace nejistoty

### Co přidat
- **Scaffolded interpretace**: po doběhu MC simulace automatické textové shrnutí „co znamená p5/p95“.
- **Interaktivní kvízy přímo nad grafem** (např. „Ve kterém období je největší epistemická nejistota?“).
- **Reproducibility mode**: jedním klikem „zopakuj experiment“ (seed lock + snapshot parametrů).

### Proč
Nejčastější slabina studentů není spuštění modelu, ale interpretace nejistoty a limitů inference.

## 6) Přístupnost a ergonomie pro učebnu

### Co přidat
- **WCAG 2.2 AA audit** (kontrast, klávesnice, screen reader labels).
- **„Classroom mode“**: větší písmo, vysoký kontrast, zjednodušené ovládání na projektor.
- **Lokalizace CZ/EN** pro výuku zahraničních studentů.

### Proč
Ve třídě je důležitá rychlost orientace a čitelnost; UX rozhoduje o tom, jestli nástroj skutečně učí.

## 7) Governance, bezpečnost a právní stopa

### Co přidat
- **Audit log pro instructor akce** (kdo vytvořil scénář, co změnil, kdy).
- **Data retention policy** (jak dlouho držíme studentské výsledky).
- **„Not for clinical use“ enforcement** i v exportech + tiskových výstupech.

### Proč
Na LF je důležitá nejen funkcionalita, ale i transparentní governance a právní jistota.

## 8) Technické priority (rychlé wins)

1. **Preset knihovna „LF kurikulum“**
   - 10–15 hotových scénářů mapovaných na témata (R0, NPIs, vakcinace, varianty, kapacity).
2. **Rubric engine**
   - jednoduchý JSON DSL pro hodnocení cílů scénáře.
3. **Report generator**
   - 1-click PDF/PNG report pro seminární odevzdání.
4. **Katalog experimentů**
   - ukládání experimentů v rámci jednoho kurzu, porovnání „student vs. baseline“.

## Návrh pořadí implementace (12 týdnů)

- **Týdny 1–3**: Lesson/Assignment mode + rubric + LF presets.
- **Týdny 4–6**: Data import + overlay + základní fit parametrů.
- **Týdny 7–9**: LMS integrace + submission bundle + report generator.
- **Týdny 10–12**: Accessibility pass + instructor analytics + governance hardening.

## Metriky úspěchu

- Time-to-first-lesson (učitel): **< 15 min**.
- Completion rate seminární úlohy studenty: **> 90 %**.
- Inter-rater reliability hodnocení mezi učiteli (rubric consistency): **> 0.8**.
- Podíl studentů, kteří správně interpretují intervaly nejistoty: **> 80 %**.
