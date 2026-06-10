// ─── Custom Cursor ────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

// ─── Nav scroll behavior ──────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ─── Mobile nav ───────────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMobile.classList.toggle('open');
  document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMobile.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ─── Reveal on scroll ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  const siblings = el.parentElement ? [...el.parentElement.querySelectorAll('.reveal')] : [];
  const sibIndex = siblings.indexOf(el);
  el.dataset.delay = sibIndex * 80;
  revealObserver.observe(el);
});

// ─── Smooth scroll for anchor links ──────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── Hero name stagger animation on load ─────────────────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 120);
  });
});

// ─── Parallax glow on hero ────────────────────────────────────────
const heroGlow = document.querySelector('.hero-glow');
if (heroGlow) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    heroGlow.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });
}

// ─── Active nav link on scroll ────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${id}`
          ? 'var(--text)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── GitHub Activity Section ──────────────────────────────────────
const GH_USER        = 'priyanshty19';
const PUBLIC_REPOS   = ['PlaceStacks', 'personal-yt', 'military-morning-tracker'];

// Manual overrides (fill gaps in GitHub API descriptions)
const REPO_META = {
  'military-morning-tracker': {
    desc:   'Military-style morning routine tracker — structured daily check-ins built to enforce discipline and log habit consistency.',
    status: 'In Dev'
  },
  'PlaceStacks':  { status: 'In Dev' },
  'personal-yt':  { status: 'In Dev' }
};

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  'C++':      '#f34b7d',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  Rust:       '#dea584',
  Go:         '#00add8',
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function titleCase(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\byt\b/i, 'YT')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function renderContributionGraph(contributions) {
  const calendar = document.getElementById('ghCalendar');
  const countEl  = document.getElementById('ghTotalCount');
  if (!calendar) return;

  const map = {};
  let total = 0;
  contributions.forEach(d => { map[d.date] = d.level; total += d.count; });
  if (countEl) countEl.textContent = total.toLocaleString();

  // Start on the nearest Sunday ≥ 52 weeks ago
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 52 * 7 + 1);
  start.setDate(start.getDate() - start.getDay()); // snap to Sunday

  const cells = [];
  const cur = new Date(start);
  while (cur <= today) {
    const iso = cur.toISOString().slice(0, 10);
    cells.push({ iso, level: map[iso] !== undefined ? map[iso] : 0 });
    cur.setDate(cur.getDate() + 1);
  }
  while (cells.length % 7 !== 0) cells.push({ iso: '', level: -1 });

  calendar.innerHTML = cells.map(c =>
    c.level === -1
      ? '<span class="gh-cell future"></span>'
      : `<span class="gh-cell" data-level="${c.level}" title="${c.iso}"></span>`
  ).join('');
}

function renderPublicRepos(repos) {
  const grid = document.getElementById('wipGrid');
  if (!grid) return;

  if (!repos.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = repos.map(r => {
    const meta    = REPO_META[r.name] || {};
    const desc    = meta.desc || r.description || 'Work in progress.';
    const status  = meta.status || 'In Dev';
    const lang    = r.language || '';
    const dot     = LANG_COLORS[lang]
      ? `<span class="build-pub-lang-dot" style="background:${LANG_COLORS[lang]}"></span>`
      : '';
    const descShort = desc.length > 88 ? desc.slice(0, 88) + '…' : desc;

    return `
      <a href="${r.html_url}" target="_blank" rel="noopener" class="build-pub-card reveal">
        <div class="build-pub-header">
          <span class="build-pub-name">${titleCase(r.name)}</span>
          <span class="build-status build-status--dev">${status}</span>
        </div>
        <p class="build-pub-desc">${descShort}</p>
        <div class="build-pub-footer">
          ${lang ? `<span class="build-pub-lang">${dot}${lang}</span>` : '<span></span>'}
          <span class="build-pub-updated">Updated ${relativeTime(r.updated_at)}</span>
        </div>
      </a>`;
  }).join('');

  grid.querySelectorAll('.build-pub-card').forEach((el, i) => {
    el.dataset.delay = i * 70;
    revealObserver.observe(el);
  });
}

async function loadGitHubActivity() {
  // Heatmap
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`);
    if (res.ok) renderContributionGraph((await res.json()).contributions || []);
  } catch { /* silent */ }

  // Curated public repos
  try {
    const repos = (await Promise.all(
      PUBLIC_REPOS.map(name =>
        fetch(`https://api.github.com/repos/${GH_USER}/${name}`)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    )).filter(Boolean);
    renderPublicRepos(repos);
  } catch {
    const g = document.getElementById('wipGrid');
    if (g) g.innerHTML = '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGitHubActivity);
} else {
  loadGitHubActivity();
}
