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
const GH_USER = 'priyanshty19';
const REPO_EXCLUDE = new Set(['Portfolio-Priyansh', 'priyanshty19', 'IEEE-DELHI-SSN', '100-Days-of-Code']);

// Language → dot color map
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572a5',
  'C++':      '#f34b7d',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  Rust:       '#dea584',
  Go:         '#00add8',
  Java:       '#b07219',
  Swift:      '#fa7343',
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

function renderContributionGraph(contributions) {
  const calendar = document.getElementById('ghCalendar');
  const countEl  = document.getElementById('ghTotalCount');
  if (!calendar) return;

  // Build date → level map
  const map = {};
  let total = 0;
  contributions.forEach(d => {
    map[d.date] = d.level;
    total += d.count;
  });

  if (countEl) countEl.textContent = total.toLocaleString();

  // Start on the Sunday 52 full weeks ago
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(today.getDate() - 52 * 7 + 1);
  // Roll back to the nearest Sunday
  start.setDate(start.getDate() - start.getDay());

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    const level = map[iso] !== undefined ? map[iso] : 0;
    cells.push({ iso, level });
    cursor.setDate(cursor.getDate() + 1);
  }
  // Pad to complete the last column (week)
  while (cells.length % 7 !== 0) {
    cells.push({ iso: '', level: -1 }); // future/empty
  }

  calendar.innerHTML = cells.map(c => {
    if (c.level === -1) return '<span class="gh-cell future"></span>';
    return `<span class="gh-cell" data-level="${c.level}" title="${c.iso}"></span>`;
  }).join('');
}

function renderWIPRepos(repos) {
  const grid = document.getElementById('wipGrid');
  if (!grid) return;

  const filtered = repos
    .filter(r => !REPO_EXCLUDE.has(r.name))
    .filter(r => r.description || r.language) // must have something to show
    .slice(0, 6);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">No public repos to show right now.</p>';
    return;
  }

  const langDot = lang => LANG_COLORS[lang]
    ? `<span class="wip-lang"><span class="wip-lang-dot" style="background:${LANG_COLORS[lang]}"></span>${lang}</span>`
    : '';

  grid.innerHTML = filtered.map(r => {
    const name = r.name.replace(/-/g, ' ');
    const desc = r.description
      ? (r.description.length > 90 ? r.description.slice(0, 90) + '…' : r.description)
      : 'Work in progress.';
    const updated = relativeTime(r.updated_at);

    return `
      <a href="${r.html_url}" target="_blank" rel="noopener" class="wip-card reveal">
        <div class="wip-card-header">
          <svg class="wip-repo-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 19a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6a9 9 0 0 1 9 0 9 9 0 0 1 9 0M3 6v13M12 6v13M21 6v13"/></svg>
          <span class="wip-name">${name}</span>
          <span class="wip-badge">WIP</span>
        </div>
        <p class="wip-desc">${desc}</p>
        <div class="wip-footer">
          ${r.language ? langDot(r.language) : '<span></span>'}
          <span class="wip-updated">Updated ${updated}</span>
        </div>
      </a>`;
  }).join('');

  // Register newly added cards with the scroll-reveal observer
  grid.querySelectorAll('.wip-card').forEach((el, i) => {
    el.dataset.delay = i * 60;
    revealObserver.observe(el);
  });
}

async function loadGitHubActivity() {
  try {
    const [contribRes, reposRes] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}?y=last`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&type=public&per_page=20`)
    ]);

    if (contribRes.ok) {
      const data = await contribRes.json();
      renderContributionGraph(data.contributions || []);
    }

    if (reposRes.ok) {
      const repos = await reposRes.json();
      renderWIPRepos(repos);
    } else {
      // Clear skeletons even on failure
      const grid = document.getElementById('wipGrid');
      if (grid) grid.innerHTML = '';
    }
  } catch {
    // Network error — clear skeletons silently
    const grid = document.getElementById('wipGrid');
    if (grid) grid.innerHTML = '';
  }
}

// Kick off once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadGitHubActivity);
} else {
  loadGitHubActivity();
}
