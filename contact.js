const topicStep = document.getElementById('futureStep');
const formStep = document.getElementById('formStep');
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const selectedTopic = document.getElementById('selectedFuture');
const topicInput = document.getElementById('futureInput');
const options = [...topicStep.querySelectorAll('.future-option')];
let activeOption;

function openTopic(option, label = option.dataset.future, value = option.dataset.message) {
  activeOption = option;
  selectedTopic.textContent = label;
  topicInput.value = value;
  status.textContent = '';
  formStep.hidden = false;
  topicStep.hidden = true;
}

options.forEach((option) => option.addEventListener('click', () => {
  openTopic(option);
  form.elements.jmeno.focus();
}));

const contactTopics = {
  mortgage: ['Vlastní bydlení', 'Hypotéka a financování bydlení'],
  investment: ['Finanční nezávislost', 'Investice a budování majetku'],
  insurance: ['Jistota pro rodinu', 'Ochrana příjmu a rodiny'],
  pension: ['Dlouhodobý finanční plán', 'Příprava na penzi'],
  rentbuy: ['Vlastní bydlení', 'Nájem nebo vlastní bydlení'],
  freedom: ['Dlouhodobý finanční plán', 'Plán finanční svobody'],
};
const banks = { moneta: 'MONETA Money Bank', csas: 'Česká spořitelna', kb: 'Komerční banka' };
const params = new URLSearchParams(location.search);
const topicKey = params.get('tema');
const bankKey = params.get('banka');

if (Object.hasOwn(contactTopics, topicKey)) {
  const [key, title] = contactTopics[topicKey];
  openTopic(options.find((option) => option.dataset.future === key), title, title);
}
if (Object.hasOwn(banks, bankKey)) {
  openTopic(options.find((option) => option.dataset.future === 'Vlastní bydlení'));
  form.elements.zprava.value = 'Zajímá mě hypotéka u banky ' + banks[bankKey] + '. Prosím o ověření aktuální sazby a podmínek.';
  params.delete('banka');
  const search = params.size ? '?' + params.toString() : '';
  history.replaceState(null, '', location.pathname + search + location.hash);
}

document.getElementById('changeFuture').addEventListener('click', () => {
  topicStep.hidden = false;
  formStep.hidden = true;
  activeOption.focus();
});

form.addEventListener('submit', (event) => {
  if (!form.checkValidity()) {
    event.preventDefault();
    status.textContent = 'Prosím doplňte povinné údaje a potvrďte souhlas.';
    form.reportValidity();
    return;
  }
  document.getElementById('contactSubject').value = 'Nezávazná konzultace – ' + selectedTopic.textContent;
  status.textContent = 'Pokračujete k bezpečnostnímu ověření a odeslání zprávy.';
});
