// Case Study Async Modal Logic & Dynamic Fallback System
const modal = document.getElementById('popup-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalBody = document.getElementById('modal-body');

async function openModal(url) {
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
            <i class="fas fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--accent-cyan); margin-bottom: 1rem;"></i>
            <p style="font-family: var(--font-mono); font-size: 0.9rem;">Fetching technical case study...</p>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const projectContent = doc.querySelector('.project-detail-section') 
                             || doc.querySelector('main') 
                             || doc.querySelector('article') 
                             || doc.querySelector('.container') 
                             || doc.body;

        // Fix relative pathing for dynamically loaded image assets
        const images = projectContent.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('../')) {
                img.setAttribute('src', src.replace('../', ''));
            }
        });

        // Fix relative pathing for links
        const links = projectContent.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('../')) {
                a.setAttribute('href', href.replace('../', ''));
            }
        });

        // Inject content into modal
        modalBody.innerHTML = projectContent.innerHTML;

        // Trigger Prism syntax highlighting specifically for the newly injected modal content
        if (window.Prism) {
            Prism.highlightAllUnder(modalBody);
        }

    } catch (error) {
        console.error('Case study fetch failure:', error);

        modalBody.innerHTML = `
            <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-secondary);">
                <i class="fas fa-folder-open" style="font-size: 3rem; color: var(--accent-cyan); margin-bottom: 1.25rem;"></i>
                <h3 style="color: var(--text-primary); font-size: 1.4rem; margin-bottom: 0.5rem;">Case Study Access</h3>
                <p style="font-size: 0.95rem; max-width: 500px; margin: 0 auto 1.5rem; color: var(--text-muted);">
                    If testing directly on local files (file:// protocol), browser security restrictions prevent dynamic background page fetches.
                </p>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <a href="${url}" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Open Project Page Directly</a>
                </div>
            </div>
        `;
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

const asyncModalTriggers = document.querySelectorAll('.project-banner-link, .project-title-link, .timeline-thumb');

asyncModalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        const targetUrl = trigger.getAttribute('data-url') || trigger.getAttribute('href');
        if (targetUrl && targetUrl !== '#') {
            e.preventDefault();
            openModal(targetUrl);
        }
    });
});

// Certificate Image Lightbox
const imgModal = document.getElementById('image-modal');
const closeImgModalBtn = document.getElementById('close-image-modal');
const modalImgPreview = document.getElementById('modal-image-preview');
const certTriggers = document.querySelectorAll('.cert-popup-trigger, .cert-preview-trigger');

function closeImageModal() {
    if (imgModal) imgModal.classList.remove('active');
}

if (closeImgModalBtn) closeImgModalBtn.addEventListener('click', closeImageModal);
if (imgModal) {
    imgModal.addEventListener('click', (e) => {
        if (e.target === imgModal) closeImageModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeImageModal();
    }
});

certTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const imageSrc = trigger.getAttribute('href') || trigger.getAttribute('data-img');
        if (!imgModal || !modalImgPreview || !imageSrc) return;

        const playShimmer = () => {
            imgModal.classList.remove('active');
            void imgModal.offsetWidth;
            imgModal.classList.add('active');
        };

        if (modalImgPreview.getAttribute('src') === imageSrc && modalImgPreview.complete) {
            playShimmer();
        } else {
            modalImgPreview.onload = playShimmer;
            modalImgPreview.src = imageSrc;
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const pfpTarget = document.querySelector(".scroll-reveal-pfp");

    if (pfpTarget) {
        const pfpObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle("is-visible", entry.isIntersecting);
            });
        }, { threshold: 0.3 });

        pfpObserver.observe(pfpTarget);
    }
});

document.querySelectorAll(".timeline-hint").forEach(hint => {
    hint.addEventListener("click", () => {
        const thumb = hint.closest(".timeline-content-wrapper")?.querySelector(".timeline-thumb");
        if (thumb) thumb.click();
    });
});

let hasAnimatedRadar = false;

function renderRadarChart(progress = 1) {
  const svg = document.getElementById('radarChart');
  if (!svg) return;

  const categories = [
    { name: 'IC Design', domain: 'EEE' },
    { name: 'FPGA', domain: 'EEE' },
    { name: 'IoT & Embedded', domain: 'EEE' },
    { name: '3D CAD Modeling', domain: 'MCAD' },
    { name: 'Project Management', domain: 'PROJECT MGT' },
    { name: 'PCB Design', domain: 'EEE' },
    { name: 'Circuit Design', domain: 'EEE' }
  ];

  const levels = ['Unaware', 'Aware', 'Working', 'Practitioner', 'Expert'];
  const baseCurrentData = [1.3, 2.2, 2.8, 2.5, 2.5, 1.2, 1.0]; 
  const baseAimData     = [3.0, 3.0, 3.5, 3.0, 3.0, 2.5, 2.5]; 

  const currentData = baseCurrentData.map(val => val * progress);
  const aimData     = baseAimData.map(val => val * progress);

  const centerX = 300;
  const centerY = 265;
  const maxRadius = 170;
  const totalAxes = categories.length;
  const totalLevels = levels.length;

  function getCoordinates(index, valueScale) {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const radius = (maxRadius / totalLevels) * valueScale;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }

  function createPolygonPoints(data) {
    return data.map((val, i) => {
      const coord = getCoordinates(i, val);
      return `${coord.x},${coord.y}`;
    }).join(' ');
  }

  let markup = '';

  // 1. BACKGROUND FILLS
  for (let level = totalLevels; level >= 1; level--) {
    const levelPoints = categories.map((_, i) => {
      const coord = getCoordinates(i, level);
      return `${coord.x},${coord.y}`;
    }).join(' ');

    markup += `<polygon points="${levelPoints}" class="radar-level-fill" />`;
  }

  // 2. AXIS LINES
  categories.forEach((_, i) => {
    const outerCoord = getCoordinates(i, totalLevels);
    markup += `
      <line x1="${centerX}" y1="${centerY}" 
            x2="${outerCoord.x}" y2="${outerCoord.y}" 
            class="radar-axis-line" />`;
  });

  // 3. DATA POLYGONS (Rendered underneath grid lines)
  markup += `<polygon points="${createPolygonPoints(aimData)}" class="data-aim" />`;
  markup += `<polygon points="${createPolygonPoints(currentData)}" class="data-current" />`;

  // 4. GRID RINGS & LEVEL LABELS (Rendered on top so highlights/glows stay visible)
  for (let level = 1; level <= totalLevels; level++) {
    const levelPoints = categories.map((_, i) => {
      const coord = getCoordinates(i, level);
      return `${coord.x},${coord.y}`;
    }).join(' ');

    const labelCoord = getCoordinates(0, level);

    markup += `
      <g class="radar-level-group" data-level="${level}">
        <polygon points="${levelPoints}" class="radar-grid-line" />
        <polygon points="${levelPoints}" class="radar-level-hitarea" />
        <text x="${labelCoord.x + 8}" y="${labelCoord.y + 4}" class="radar-level-label">
          ${levels[level - 1]}
        </text>
      </g>`;
  }

  // 5. DOMAIN & SKILL LABELS
  categories.forEach((cat, i) => {
    const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
    const labelX = centerX + (maxRadius + 38) * Math.cos(angle);
    const labelY = centerY + (maxRadius + 26) * Math.sin(angle);

    markup += `
      <text x="${labelX}" y="${labelY - 8}" class="radar-domain-tag">${cat.domain}</text>
      <text x="${labelX}" y="${labelY + 8}" class="radar-axis-label" dominant-baseline="middle">
        ${cat.name}
      </text>`;
  });

  // 6. LEGEND
  markup += `
    <g class="radar-legend">
      <text x="480" y="35" class="radar-legend-item current">Current</text>
      <text x="480" y="55" class="radar-legend-item aim">Aim</text>
    </g>
  `;

  svg.innerHTML = markup;
}

// Sequential lighting sequence (10000 -> 01000 -> 00100 -> 00010 -> 00001)
function triggerLevelSequence() {
  const levelOrder = [1, 2, 3, 4, 5]; // 1: Unaware -> 5: Expert
  const stepDuration = 300; // ms per ring

  levelOrder.forEach((level, index) => {
    setTimeout(() => {
      document.querySelectorAll('#radarChart .radar-level-group').forEach(group => {
        group.classList.remove('is-highlighted');
      });

      const targetGroup = document.querySelector(`#radarChart .radar-level-group[data-level="${level}"]`);
      if (targetGroup) {
        targetGroup.classList.add('is-highlighted');
      }

      if (index === levelOrder.length - 1) {
        setTimeout(() => {
          if (targetGroup) targetGroup.classList.remove('is-highlighted');
        }, stepDuration);
      }
    }, index * stepDuration);
  });
}

function initRadarObserver() {
  const radarSection = document.getElementById('radar');
  const radarContainer = document.querySelector('.radar-container');
  if (!radarSection || !radarContainer) return;

  // Pre-render at 0 so data starts collapsed at the origin
  renderRadarChart(0);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedRadar) {
        hasAnimatedRadar = true;

        // 1. Trigger CSS side split emergence
        radarContainer.classList.add('is-visible');

        // 2. Animate points expanding outward from center
        const startTime = performance.now();
        const duration = 1200; // 1.2s expansion

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const rawProgress = Math.min(elapsed / duration, 1);
          
          // Smooth easeOutCubic curve
          const easeProgress = 1 - Math.pow(1 - rawProgress, 3);

          renderRadarChart(easeProgress);

          if (rawProgress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Trigger 10000 -> 00001 light wave right after chart lands
            triggerLevelSequence();
          }
        }

        requestAnimationFrame(animate);
      }
    });
  }, { threshold: 0.7 });

  observer.observe(radarSection);
}

// Initialization Logic
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRadarObserver);
} else {
  initRadarObserver();
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}