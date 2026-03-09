# Nedovařený tapír — Implementační plán

## Fáze 0: Scaffold projektu (základ)
**Cíl:** Funkční dev prostředí, prázdná appka se spustí.

1. Inicializovat monorepo strukturu (`package.json` s workspaces)
2. Vytvořit `simulation-core/` package — TypeScript strict, Vitest
3. Vytvořit `web-ui/` package — Vite + React 18 + Tailwind + Zustand + Recharts
4. Vytvořit `worker/` — Web Worker setup
5. Nastavit `tsconfig.json` (strict, paths)
6. Nastavit `vite.config.ts` a `vitest.config.ts`
7. Ověřit: `npm install`, `npm run dev`, `npm test` fungují

**Výstup:** Prázdná React appka na localhost, testy projdou (i když zatím žádné).

---

## Fáze 1: Typy a schéma (types.ts, scenario-schema.ts, validation.ts)
**Cíl:** Definovat datový model celé aplikace.

1. `types.ts` — definovat:
   - `AgeGroup` enum (0-18, 19-64, 65+)
   - `RiskGroup` enum (standard, risk)
   - `Stratum` = AgeGroup × RiskGroup (6 strát)
   - `CompartmentState` (S, E, I, R, V, H, ICU, D)
   - `SimulationState` — pole strát × kompartmenty pro jeden den
   - `ContactMatrix` (home/school/work/community sub-matice)
   - `NPIConfig`, `VaccinationConfig`, `VariantShockConfig`
   - `ScenarioConfig` — kompletní vstupní parametry
   - `SimulationResult` — výstupní časová řada
   - `SimulationMode` (deterministic/stochastic-single/stochastic-monte-carlo)
   - `AppMode` (student/instructor)
2. `scenario-schema.ts` — JSON schema verze + validační funkce
3. `validation.ts` — přísná validace:
   - věkové podíly sum = 100%
   - risk share per age sum = 100%
   - N v rozsahu, I0 <= N
   - IFR/hosp/ICU v [0,1]
   - dny simulace > 0
   - vrací pole chyb s cestou k chybnému poli
4. **Testy:** validace akceptuje korektní scénář, odmítne chybný

**Výstup:** Typově bezpečný základ, validace blokuje špatné vstupy.

---

## Fáze 2: Kontaktní matice a NGM kalibrace
**Cíl:** Korektní force of infection a kalibrace beta na R0.

1. `contact-matrix.ts`:
   - Výchozí kontaktní matice (home/school/work/community) pro 3 věkové skupiny
   - Funkce pro sčítání sub-matic
   - Funkce pro modifikaci sub-matic (pro NPIs)
2. `calibration/ngm.ts`:
   - Next-generation matrix výpočet
   - Spektrální poloměr (dominantní vlastní číslo) — implementovat power iteration
   - Výpočet implied R0 z aktuálního stavu
   - Výpočet Reff(t) z aktuálních S
3. `calibration/beta-calibration.ts`:
   - Pro dané C, demografii a cílové R0 najít beta
   - Iterativní metoda (bisection nebo analyticky přes spektrální poloměr)
4. **Testy:**
   - Homogenní populace: implied R0 = input R0
   - Heterogenní populace: implied R0 ≈ input R0 (tolerance < 0.01)
   - Spektrální poloměr identity matice = 1

**Výstup:** Spolehlivá kalibrace beta, NGM funguje.

---

## Fáze 3: Základní SEIR model (deterministický)
**Cíl:** Deterministický SEIR engine pro 6 strát.

1. `models/seir.ts`:
   - Denní krok (Euler) pro S→E→I→R
   - Force of infection přes kontaktní matici: λ_i(t) = Σ_j β(t)·C_ij(t)·I_j(t)/N_j
   - Konzervace: S+E+I+R = N pro každou stratu
   - Clamp na >= 0
   - Vrací `SimulationResult` (pole denních stavů)
2. `health-capacity.ts`:
   - Z I vypočítat H, ICU dle parametrů per strata
   - Kapacity (beds, ICU beds) — editovatelné
   - Excess deaths při překročení kapacity
3. **Testy (kritické):**
   - Konzervace populace v každém kroku
   - S monotónně klesá (bez reimportů/waning)
   - I_peak existuje a je > 0
   - S R0 < 1 → epidemie nevznikne
   - Excess deaths > 0 při překročení kapacity

**Výstup:** Funkční deterministický SEIR, testy zelené.

---

## Fáze 4: NPI engine
**Cíl:** Uživatelsky konfigurovatelné intervence.

1. `npi-engine.ts`:
   - NPI typy: beta multiplier, gamma multiplier, sub-matrix modifier
   - Timeline: startDay, endDay
   - Compliance c(t): exponential decay, piecewise-linear
   - Aplikace na kontaktní matici / beta v každém kroku
2. Integrace s SEIR: model volá NPI engine v každém kroku
3. **Testy:**
   - NPI snižuje peak infections (relačně vs. bez NPI)
   - Compliance decay: efekt NPI slábne v čase
   - Sub-matrix modifier: zavření škol eliminuje school kontakty

**Výstup:** NPIs fungují, compliance klesá.

---

## Fáze 5: Vakcinace (SEIRV)
**Cíl:** Přidat vakcinační kompartment.

1. `vaccination.ts`:
   - Rollout schedule (dávky/den nebo %/týden)
   - VE_inf(t) a VE_sev(t) s waning
   - Coverage target per strata
2. `models/seirv.ts`:
   - Rozšíření SEIR o V kompartment
   - S→V přechod dle rollout
   - V má sníženou susceptibilitu (1-VE_inf)
   - Snížená hospitalizace/ICU/IFR pro V
3. **Testy:**
   - Konzervace: S+E+I+R+V = N
   - Vakcinace snižuje peak I (relačně)
   - Waning: VE klesá v čase

**Výstup:** SEIRV model funguje.

---

## Fáze 6: Varianty a multistrain
**Cíl:** Variant shock events, immune escape.

1. `variant-engine.ts`:
   - Variant shock: fixní den X nebo náhodný (seedovaný)
   - Parametry: transmissibilityMultiplier, immuneEscape, reinfectionBoost
   - Aplikace: zvýšení beta, snížení VE, částečný přesun R→S
2. `models/multistrain.ts`:
   - Volitelný 2-strain model
   - Cross-immunity matice
3. `models/seirs.ts`:
   - Waning immunity (R→S s danou rychlostí)
4. **Testy:**
   - Varianta zvyšuje peak (relačně)
   - Immune escape snižuje VE
   - Seed reprodukovatelnost variant timing

**Výstup:** Varianty a waning fungují.

---

## Fáze 7: Stochastika a Monte Carlo
**Cíl:** Stochastické přechody, MC runner.

1. `stochastic.ts`:
   - Seedovaný RNG (mulberry32 nebo podobný)
   - Binomial transitions místo deterministických
   - Monte Carlo runner: N běhů, agregace medián + p5/p95
   - Progress callback pro UI
   - Cancellation support
2. Integrace s modely: model přijímá `transitionFn` (deterministická nebo stochastická)
3. **Testy:**
   - Seed reprodukovatelnost: stejný seed = stejný výsledek
   - Konzervace i ve stochastickém režimu
   - MC kvantily: p95 >= medián >= p5
   - Stochastika může vést k vyhasnutí i při R0 > 1

**Výstup:** Stochastika funguje, MC dává uncertainty bands.

---

## Fáze 8: Export utilities
**Cíl:** CSV/JSON/PNG export s metadaty.

1. `export-utils.ts`:
   - CSV: denní data + metadata hlavička (params, seed, verze, disclaimer)
   - JSON: kompletní scénář + výsledky + schemaVersion
2. PNG watermark (bude dokončen s UI)
3. **Testy:**
   - CSV obsahuje disclaimer
   - JSON obsahuje schemaVersion
   - Metadata jsou kompletní

**Výstup:** Exporty obsahují povinná metadata.

---

## Fáze 9: Web Worker
**Cíl:** Simulace běží mimo main thread.

1. `worker/simulation-worker.ts`:
   - Přijímá ScenarioConfig přes postMessage (structured clone)
   - Spouští simulaci, vrací výsledky
   - Progress events pro MC
   - Cancel support (AbortController pattern)
2. Worker wrapper v UI (hook `useSimulation`)
3. **Testy:**
   - Worker vrací stejné výsledky jako přímé volání
   - Cancel funguje

**Výstup:** Main thread není blokován, progress funguje.

---

## Fáze 10: UI — základní layout a disclaimer
**Cíl:** Kostra UI s povinnými bezpečnostními prvky.

1. Layout: header, sidebar, main area
2. **Disclaimer banner** — always visible, i při tisku (print CSS)
3. **Policy Literacy panel** — always visible, vysvětluje:
   - modelové předpoklady vs. realita
   - nejistota (parametrická, strukturní, scénářová)
   - R0/Reff jsou odhady modelu
   - korelace ≠ kauzalita
   - stochastika a vyhasnutí
4. Vodoznak „SIMULACE" na celé stránce
5. Student/Instructor mode toggle
6. Zustand store — základní state management

**Výstup:** Appka s disclaimer a policy literacy.

---

## Fáze 11: UI — Parameter panel a validace
**Cíl:** Uživatel může nastavit všechny parametry.

1. Parameter panel:
   - Populace (N, věkové podíly, risk podíly)
   - Epidemiologické parametry (R0, sigma, gamma, IFR, hosp rate, ICU rate)
   - Dny simulace, I0
   - Kapacity (beds, ICU)
2. Validace v UI:
   - Real-time validace (z validation.ts)
   - Chybová hlášení u polí
   - Blokace "Run" tlačítka při chybách
3. Preset scénáře (COVID-like, flu-like, measles-like)

**Výstup:** Parametry se dají nastavit, validace funguje.

---

## Fáze 12: UI — Dashboard (SEIR křivky, Reff, kapacity)
**Cíl:** Hlavní vizualizace.

1. SEIR křivky (Recharts):
   - Agregované + per strata toggle
   - Barvy per kompartment
2. Hospitalizace a ICU:
   - Křivky + kapacitní linky (horizontální čáry)
   - Excess deaths stacked area
   - Warning banner při překročení
3. Reff(t) graf:
   - Linka Reff s horizontální linkou na 1.0
4. Implied R0 display
5. Speed control: play/pause/step
6. Debounce 200 ms na parametrové změny

**Výstup:** Interaktivní dashboard s grafy.

---

## Fáze 13: UI — NPI timeline
**Cíl:** Drag & drop NPI na timeline.

1. NPI timeline komponenta:
   - Přidání/odebrání NPI
   - Drag & drop start/end day
   - Výběr typu (beta/gamma/sub-matrix)
   - Compliance nastavení (typ + parametry)
2. Vizualizace aktuálního efektu NPI
3. Propojení se store → worker → přepočet

**Výstup:** NPIs se dají interaktivně nastavit.

---

## Fáze 14: UI — Vakcinace, varianty, stochastika panely
**Cíl:** Zbývající konfigurace.

1. Vaccination panel:
   - Coverage, rollout, VE_inf, VE_sev, waning
2. Variant panel:
   - Přidání variant shock events
   - Timing (fixní / náhodný)
3. Stochastika panel:
   - Mode select (det/stoch/MC)
   - Seed input, počet MC běhů
4. Uncertainty bands v grafech (MC)

**Výstup:** Kompletní konfigurace všech modulů.

---

## Fáze 15: UI — Comparison view, Assumptions Inspector
**Cíl:** Pokročilé analytické nástroje.

1. Comparison view:
   - Scenario A vs B side-by-side
   - Uložení a pojmenování scénářů
2. Assumptions Inspector:
   - Seznam všech aktivních předpokladů
   - Zdroj: preset / user / hidden event
3. Risk group panel — detail per strata

**Výstup:** Porovnání scénářů a transparentnost.

---

## Fáze 16: Instructor mode
**Cíl:** Funkce pro výuku.

1. Lock parametrů (studenti nemohou měnit)
2. Hidden events (variant shock, náhodná událost)
3. Assignment export (JSON zadání)
4. Debriefing panel (co rozhodlo o výsledku)

**Výstup:** Instructor může vytvářet zadání.

---

## Fáze 17: Export (PNG watermark, CSV, JSON) + Print CSS
**Cíl:** Kompletní exporty s bezpečnostními metadaty.

1. PNG export grafů s watermarkem:
   - Název scénáře, parametry, seed, timestamp, verze, disclaimer
2. CSV export s metadata hlavičkou
3. JSON export kompletního scénáře
4. Print CSS: disclaimer viditelný

**Výstup:** Exporty splňují bezpečnostní požadavky.

---

## Fáze 18: Accessibility, responsivita, polish
**Cíl:** A11y a mobilní podpora.

1. ARIA atributy na všech interaktivních prvcích
2. Keyboard navigation
3. Kontrastní barvy (WCAG AA)
4. Mobile responsive layout
5. Performance audit:
   - Deterministický 730 dní < 150 ms
   - MC 200 běhů < 2 s

**Výstup:** Přístupná, responzivní, výkonná appka.

---

## Fáze 19: Model DSL (advanced/beta)
**Cíl:** Uživatelsky definované modely.

1. `models/model-dsl.ts`:
   - Parser bezpečného JSON DSL
   - Validace DSL vstupu
   - Generování step funkce z DSL
2. Testy: DSL model dává stejné výsledky jako hardcoded SEIR

**Výstup:** Rozšiřitelnost pro pokročilé uživatele.

---

## Fáze 20: Dokumentace a finalizace
**Cíl:** README, finální testy, cleanup.

1. README:
   - Jak spustit
   - Jak přidat model template
   - Seed a variant shock
   - Policy Literacy / limity modelu
2. Finální test suite: všechny testy zelené
3. Code review a cleanup
4. Verze 1.0 tag

**Výstup:** Kompletní, zdokumentovaný, otestovaný projekt.

---

## Shrnutí pořadí a závislostí

```
Fáze 0 (scaffold)
  └→ Fáze 1 (typy)
      └→ Fáze 2 (kontaktní matice + NGM)
          └→ Fáze 3 (SEIR deterministický) ← MILESTONE: základní model
              ├→ Fáze 4 (NPIs)
              ├→ Fáze 5 (vakcinace/SEIRV)
              └→ Fáze 8 (export utils)
                  Fáze 4+5 └→ Fáze 6 (varianty)
                              └→ Fáze 7 (stochastika) ← MILESTONE: kompletní engine
                                  └→ Fáze 9 (worker)
                                      └→ Fáze 10 (UI layout + disclaimer)
                                          └→ Fáze 11 (parameter panel)
                                              └→ Fáze 12 (dashboard) ← MILESTONE: funkční UI
                                                  ├→ Fáze 13 (NPI timeline)
                                                  ├→ Fáze 14 (vakcinace/varianty/stoch UI)
                                                  └→ Fáze 15 (comparison + inspector)
                                                      └→ Fáze 16 (instructor mode)
                                                          └→ Fáze 17 (export PNG/print)
                                                              └→ Fáze 18 (a11y + perf)
                                                                  └→ Fáze 19 (DSL, volitelné)
                                                                      └→ Fáze 20 (docs + finalizace)
```

## Milestones

| Milestone | Fáze | Popis |
|-----------|------|-------|
| M1 | 0-3 | Základní deterministický SEIR engine s testy |
| M2 | 4-8 | Kompletní simulační engine (NPIs, vakcinace, varianty, stochastika) |
| M3 | 9-12 | Funkční webová aplikace s dashboard |
| M4 | 13-17 | Kompletní UI se všemi panely a exporty |
| M5 | 18-20 | Polish, a11y, dokumentace, release |

## Odhad složitosti per fáze

| Fáze | Soubory | Relativní složitost |
|------|---------|-------------------|
| 0 | config files | nízká |
| 1 | 3 | střední |
| 2 | 3 | vysoká (NGM) |
| 3 | 2 | vysoká |
| 4 | 1 | střední |
| 5 | 2 | střední |
| 6 | 2 | střední |
| 7 | 1 | vysoká (MC) |
| 8 | 1 | nízká |
| 9 | 1 | střední |
| 10-12 | ~10 | vysoká (UI) |
| 13-14 | ~6 | střední |
| 15-16 | ~5 | střední |
| 17-18 | ~3 | střední |
| 19 | 1 | střední |
| 20 | docs | nízká |
