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

Workflow **Daily mortgage rates** kontroluje zveřejněné výchozí sazby přímo u bank kolem 01:00 pražského času. Aktualizaci lze spustit i ručně v Actions. Údaj, který se při posledním pokusu nepodařilo potvrdit nebo jehož platnost vypršela, se návštěvníkům nezobrazí jako aktuální sazba. Výchozí sazby neslouží jako individuální nabídky.
