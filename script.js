const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

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

const homeHeader = document.querySelector('.home-page .site-header');
if (homeHeader) {
  const updateHeader = () => homeHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

document.getElementById('year').textContent = new Date().getFullYear();
