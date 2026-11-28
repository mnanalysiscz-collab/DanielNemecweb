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
      "minLoanExclusive": null,
      "maxLtv": 80,
      "conditions": "Ceníková sazba od, fixace 3 roky, LTV do 80 %. Zahrnuje slevu za aktivní účet a pojištění schopnosti splácet. Modelová splátka je bez pojistného.",
      "source": "https://www.moneta.cz/hypoteky/hypoteka",
      "checkedOn": "2026-11-23",
      "checkedAt": "2026-11-28T05:30:36.232Z",
      "expiresOn": "2026-12-01",
      "status": "verified",
      "lastAttemptAt": "2026-11-28T05:30:36.232Z",
      "rateSource": "tomastik-index"
    },
    {
      "id": "csas",
      "name": "Česká spořitelna",
      "mark": "ČS",
      "rate": 5.49,
      "conditions": "Veřejně uváděná sazba „od“. Konkrétní fixaci, LTV a podmínky zvýhodnění je nutné ověřit individuálně.",
      "source": "https://www.csas.cz/cs/osobni-finance/hypoteky/hypoteka",
      "checkedOn": "2026-11-28",
      "checkedAt": "2026-11-28T05:30:36.232Z",
      "expiresOn": "2026-12-01",
      "status": "verified",
      "lastAttemptAt": "2026-11-28T05:30:36.232Z"
    },
    {
      "id": "kb",
      "name": "Komerční banka",
      "mark": "KB",
      "rate": 5.69,
      "conditions": "Sazba „od“ při příjmu na účet KB, rizikovém životním pojištění a pojištění nemovitosti u Komerční pojišťovny a PENB A/B. Konkrétní fixaci a LTV ověříme.",
      "source": "https://www.kb.cz/cs/obcane/pujcky/hypoteky/hypoteka",
      "checkedOn": "2026-11-28",
      "checkedAt": "2026-11-28T05:30:36.232Z",
      "expiresOn": "2026-12-01",
      "status": "verified",
      "lastAttemptAt": "2026-11-28T05:30:36.232Z"
    }
  ],
  "automatic": true
};
