import type { HistoricalCase } from '../../types/didaktikon';

export const historicalCases: HistoricalCase[] = [
  {
    year: 1900,
    location: 'Mamaroneck, New York',
    infected: 7,
    deaths: 0,
    description:
      'Zámožná rodina najala novou kuchařku. Tři týdny po jejím nástupu onemocnělo 7 členů domácnosti břišním tyfem. Kuchařka sama zůstala zcela zdravá. Krátce po vypuknutí epidemie z domu odešla, ještě před zahájením jakéhokoli vyšetřování. Zdroj nákazy nebyl nikdy oficiálně objasněn.',
    pattern:
      'Nová kuchařka nastoupila → 3 týdny poté propukl tyfus → kuchařka neonemocněla → odešla před vyšetřováním',
  },
  {
    year: 1901,
    location: 'New York City',
    infected: 11,
    deaths: 1,
    description:
      'V domácnosti na Manhattanu se po příchodu nové kuchařky objevil tyfus. Onemocnělo celkem 11 osob — členové rodiny i personál. Pradlena, která prala kontaminované prádlo nakažených, onemocněla a zemřela. Kuchařka po celou dobu nepociťovala žádné příznaky. Po epidemii dala výpověď a odešla na jiné místo.',
    pattern:
      'Nová kuchařka nastoupila → tyfus u 11 osob → pradlena zemřela → kuchařka zdravá → odešla',
  },
  {
    year: 1902,
    location: 'Dark Harbor, Maine',
    infected: 9,
    deaths: 0,
    description:
      'Letní sídlo na ostrově u pobřeží Maine. Rodina si najala novou kuchařku na letní sezónu. Během dvou týdnů po jejím nástupu onemocnělo 9 osob. Místní úřady podezřívaly kontaminovanou vodu, ale laboratorní šetření bylo neprůkazné. Kuchařka odešla na konci sezóny — byla zdravá po celou dobu svého pobytu.',
    pattern:
      'Nová kuchařka na sezónu → 2 týdny poté tyfus u 9 osob → podezření na vodu (nepotvrzeno) → kuchařka zdravá → odešla',
  },
  {
    year: 1904,
    location: 'Sands Point, Long Island',
    infected: 4,
    deaths: 0,
    description:
      'Další letní sídlo na Long Islandu, nedaleko Oyster Bay. Čtyři členové domácnosti onemocněli břišním tyfem po příchodu nové kuchařky. V zachovaných záznamech z tohoto případu se poprvé objevuje jméno kuchařky: „Mary". I tentokrát byla kuchařka zcela zdravá a po propuknutí nemoci v domě odešla a nastoupila do jiné domácnosti.',
    pattern:
      'Nová kuchařka jménem „Mary" → tyfus u 4 osob → kuchařka zdravá → odešla jinam',
  },
];
