# Daniel Němec – osobní web

Statický web v češtině. `index.html` obsahuje představení, služby a dvoukrokový kontakt. `kalkulacky.html` obsahuje šest orientačních kalkulaček převzatých z webu Ondřeje Křapky. Vstupy, scénáře a výsledky se zpracovávají v prohlížeči.

## Místní náhled

V kořeni projektu spusťte `python -m http.server 8000` a otevřete `http://localhost:8000/`.

## Kontakt

Poptávky odesílá FormSubmit na `daniel.nemec@kooperativa.cz`. Pokud služba při prvním odeslání vyžádá aktivaci, příjemce ji potvrdí v doručeném e-mailu. Formulář umí předvyplnit téma podle zvolené kalkulačky a u přehledu hypoték také banku.

## Kontroly

```sh
node tests/site-structure.test.cjs
node tests/calculators.test.cjs
node tests/bank-comparison.test.cjs
node tests/bank-update.test.cjs
```

## Sazby hypoték

Workflow **Daily mortgage rates** kontroluje zveřejněné výchozí sazby přímo u bank kolem 01:00 pražského času. Aktualizaci lze spustit i ručně v Actions. Neověřená nebo expirovaná sazba se nezobrazuje. Pokud produktová stránka MONETY vrátí HTTP 403, kontrola načte tříletou ceníkovou sazbu z veřejného Indexu hypoték Finance Tomaštík. Kalkulačka uvede zdroj, podmínky a datum indexu. Platnost končí osm dní od data indexu, i když se stejný přehled stáhne opakovaně. Čerstvá ručně ověřená sazba může zůstat do původní expirace, pokud není dostupný ani index. Částečná nedostupnost zdrojů se v Actions hlásí jako varování. Pokud se nepodaří ověřit žádnou banku, běh končí chybou. Výchozí sazby neslouží jako individuální nabídky.
