const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

function updateHeader() {
  header.classList.toggle('is-compact', window.scrollY > 42);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('pageshow', updateHeader);

function setMenuOpen(open) {
  menu.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
}

menu.addEventListener('click', () => setMenuOpen(menu.getAttribute('aria-expanded') === 'false'));
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenuOpen(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    setMenuOpen(false);
    menu.focus();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
