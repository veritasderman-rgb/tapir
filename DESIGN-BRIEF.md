# Zadání pro Claude-designera — vizuální identita „Nedovařeného tapíra"

> **Jak to použít:** tenhle soubor předej samostatnému Claude-agentovi v roli
> designéra (např. *„Jsi grafik. Podle `DESIGN-BRIEF.md` navrhni a vygeneruj
> SVG sadu."*). Agent má dodat **ručně psané SVG** v jednotném stylu, ne
> rastrové AI obrázky. Cílem je odstranit „AI-generated" dojem a dát produktu
> skutečný brand.

---

## 1. Kontext produktu

**Nedovařený tapír** je česká edukační platforma pro výuku epidemiologie a
krizového řízení. Uživatelé jsou **studenti SŠ a VŠ** (často 20–50 ve třídě
najednou) a jejich učitelé. Tón: **chytrý, hravý, důvěryhodný** — ne dětský, ne
sterilní korporát. Název „Nedovařený tapír" je svébytný a má zůstat; maskotem je
**tapír**.

Aktivity, pro které tvoříme grafiku:
- 🏛️ **Krizový štáb** — tahové krizové řízení epidemie
- 🦠 **Ósacká horečka** — telefonní trasování kontaktů
- 🔍 **Záhada z Oyster Bay** — historická detektivka (tyfus, 1906)
- 📖 **Příručka epidemiologa** — výukové kapitoly
- 🔬 **Odborný režim (Sandbox)** — parametrický SEIR simulátor
- 🎓 **Učitelský režim**

*(Emoji výše jen označují dnešní stav — ty máš dodat jejich plnohodnotné SVG
náhrady.)*

---

## 2. Vizuální styl — „ploché geometrické + retro-věda"

Cílová estetika: **flat / geometrické tvary** s nádechem **retro vědeckého
plakátu** (60.–70. léta, učebnicové ilustrace, mírný „risograph" pocit).

**Charakteristika:**
- Plné plochy barev, **bez fotorealismu a bez lesklého 3D**.
- Výrazné, čisté geometrické tvary; promyšlený negativní prostor.
- **Konstantní tloušťka linek** (viz tokeny níže) — jednotná „ruka".
- Jemné textury povolené střídmě (tečkový raster / halftone) pro retro nádech,
  ne na úkor čitelnosti při malých velikostech.
- Maskot tapíra: stylizovaný, geometrický, sympatický, **ne roztomile dětský**.

**Reference tonality (slovně):** vědecký plakát × moderní flat ikonografie ×
deskové hry pro starší studenty. Důstojné, ale s humorem (název napovídá).

---

## 3. Design tokeny (závazné — drží to pohromadě)

Aby výsledek nepůsobil „náhodně/AI", všechny assety dodrží stejné parametry.
Paletu ber jako výchozí návrh — finální odstíny dolaď a **vrať jako tokeny**.

**Paleta (návrh, k doladění):**
- Primární: hluboká modrozelená / teal (důvěra, „klinické") — `#0E7C7B`
- Sekundární: teplá hořčicová/okrová (retro akcent) — `#E0A458`
- Akcent/poplach: cihlově červená (epidemie, upozornění) — `#C44536`
- Neutrály: krémové pozadí `#F4EFE6`, uhlová `#22303A`
- Doplňky pro stavy: tlumená zelená (OK), šedomodrá (info)

**Pravidla:**
- Max **4–5 barev** na jeden asset (jinak „AI" chaos).
- Tloušťka linky: jednotná, ~**2 px na 24px viewBoxu** (poměrově škálovat).
- Poloměry rohů: jednotná rodina (např. 2 / 4 / 8).
- **Bezpatkové, geometrické písmo** pro wordmark; doporuč konkrétní open-source
  font (např. z rodiny grotesků) a vrať návrh do tokenů.
- Kontrast splní **WCAG AA** pro text i UI ikony.

Tokeny dodej jako:
```
brand-tokens.json   // barvy, radiusy, tloušťky, font stack
```
(my je promítneme do `web-ui/tailwind.config.js` a `web-ui/src/index.css`).

---

## 4. Co dodat (deliverables, vše jako SVG)

### A. Logo & maskot
- [ ] **Wordmark** „Nedovařený tapír" (horizontální + kompaktní varianta).
- [ ] **Logo-značka** = samotný tapír (favicon/app ikona, čtverec).
- [ ] **Maskot tapíra** ve 3 pózách pro v1:
      1. neutrální/vítací (na hub),
      2. „bádající" (lupa / poznámky — empty states, načítání),
      3. „oslava" (leaderboard / dohraná hra).

### B. Ikony dlaždic na rozcestníku (6×)
Jednotná čtvercová sada (stejný viewBox, stejná mřížka, stejná barevná logika):
- [ ] Krizový štáb (např. velín / štábní stůl)
- [ ] Ósacká horečka (telefon / síť kontaktů)
- [ ] Záhada z Oyster Bay (lupa / dobový dokument)
- [ ] Příručka epidemiologa (otevřená kniha)
- [ ] Odborný režim / Sandbox (graf SEIR křivky)
- [ ] Učitelský režim (tabule / klíč)

### C. UI ikony (mono-line, jeden styl, 24px viewBox)
- [ ] Home, menu (hamburger), zpět, sdílet, QR, kopírovat odkaz, info, zavřít,
      přehrát/další kolo, restart, žebříček/trofej.

### D. Leaderboard / odznaky
- [ ] Medaile **zlato / stříbro / bronz** (geometrické, retro).
- [ ] 3–5 **odznaků za úspěchy** (např. „nula chyb", „pod rozpočet",
      „patient zero nalezen") — volitelné do v1.

### E. Atmosféra
- [ ] 1–2 **pozadí / patterny** (jemný geometrický nebo halftone) pro hub a
      leaderboard, dlaždicovatelné.
- [ ] **Prázdné stavy** (žádné výsledky / čekání na studenty) s maskotem.

---

## 5. Technické požadavky na SVG

- **Čisté ruční SVG**, optimalizované (proběhne přes SVGO): bez zbytečných
  `<metadata>`, editor cruftu, inline rastrů.
- **Jednotné `viewBox`** v rámci kategorie (ikony dlaždic stejné, UI ikony
  stejné). Žádné napevno zadané `width/height` — škáluje se přes CSS.
- Barvy přes **`currentColor`** tam, kde má ikona dědit barvu (UI ikony), jinak
  z palety tokenů.
- `role="img"` + `<title>` pro přístupnost; smysluplné `id`/`class`.
- **Pojmenování souborů** (kebab-case), uložení do
  `web-ui/src/assets/brand/{logo,mascot,tiles,ui,badges,patterns}/`.
- Každý asset čitelný i **při 24 px** (ikony) a ostrý při projekci (leaderboard).
- Dodat **kontaktní sheet** (jeden přehledový SVG/PNG) se všemi assety pro
  rychlou revizi.

---

## 6. Do / Don't (aby to nevypadalo „AI-generated")

**Dělej:**
- Drž **jednu tloušťku linky** a jednu barevnou logiku napříč vším.
- Omezenou paletu, hodně negativního prostoru, záměrnou kompozici.
- Konzistentní mřížku a optické zarovnání ikon.

**Nedělej:**
- Žádné přehnané přechody, „glossy" odlesky, falešné 3D, dropshadow saláty.
- Žádné míchání stylů (část flat, část realistická).
- Žádná náhodná emoji ani stocková klišé (zeměkoule + viry + injekce naráz).
- Žádné nečitelné detaily, které při 24 px zaniknou.

---

## 7. Postup a výstup

1. Nejdřív dodej **mini styleguide** (1 SVG/stranu): paleta, tloušťky, 1 ukázková
   ikona + maskot v cílovém stylu → **schválíme směr**.
2. Po schválení dogeneruj zbytek sady (§4) ve stejné „ruce".
3. Vrať: `brand-tokens.json` + složku SVG + kontaktní sheet.

> Po dodání grafiky ji zapojíme ve fázích **F2 (hub)** a **F5 (brand polish)**
> podle [`PLAN-rebrand.md`](./PLAN-rebrand.md).
