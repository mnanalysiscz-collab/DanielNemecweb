// Automatically checked public starting rates. See scripts/update-bank-rates.cjs.
window.mortgageBankData = {
  "checkedOn": "2026-10-02",
  "expiresOn": "2026-10-10",
  "banks": [
    {
      "id": "moneta",
      "name": "MONETA Money Bank",
      "mark": "M",
      "rate": 4.99,
      "minLoanExclusive": 1000000,
      "maxLtv": 80,
      "conditions": "Fixace 1 rok, LTV do 80 %, úvěr nad 1 milion Kč. Schválení závisí na posouzení bankou.",
      "source": "https://www.moneta.cz/hypoteky/hypoteka",
      "checkedOn": "2026-11-23",
      "checkedAt": "2026-11-23T11:20:57.986Z",
      "expiresOn": "2026-11-26",
      "status": "verified",
      "lastAttemptAt": "2026-11-23T11:22:22.639Z",
      "verifiedManually": true
    },
    {
      "id": "csas",
      "name": "Česká spořitelna",
      "mark": "ČS",
      "rate": 5.49,
      "conditions": "Veřejně uváděná sazba „od“. Konkrétní fixaci, LTV a podmínky zvýhodnění je nutné ověřit individuálně.",
      "source": "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
      "checkedOn": "2026-11-23",
      "checkedAt": "2026-11-23T11:22:22.639Z",
      "expiresOn": "2026-11-26",
      "status": "verified",
      "lastAttemptAt": "2026-11-23T11:22:22.639Z"
    },
    {
      "id": "kb",
      "name": "Komerční banka",
      "mark": "KB",
      "rate": 5.69,
      "conditions": "Sazba „od“ při příjmu na účet KB, rizikovém životním pojištění a pojištění nemovitosti u Komerční pojišťovny a PENB A/B. Konkrétní fixaci a LTV ověříme.",
      "source": "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
      "checkedOn": "2026-11-23",
      "checkedAt": "2026-11-23T11:22:22.639Z",
      "expiresOn": "2026-11-26",
      "status": "verified",
      "lastAttemptAt": "2026-11-23T11:22:22.639Z"
    }
  ],
  "automatic": true
};
