const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const heroActions = document.querySelector('.home-page .hero-actions');

function updateHeader() {
  const compact = window.scrollY > 42;
  header.classList.toggle('is-compact', compact);
  if (heroActions) {
    const actionsTop = heroActions.getBoundingClientRect().top;
    header.classList.toggle('has-plaster-backdrop', compact && actionsTop <= header.offsetHeight + 32);
  }
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('pageshow', updateHeader);
window.addEventListener('resize', updateHeader);

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
