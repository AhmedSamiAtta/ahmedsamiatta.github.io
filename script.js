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

        const images = projectContent.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src && src.startsWith('../')) {
                img.setAttribute('src', src.replace('../', ''));
            }
        });

        const links = projectContent.querySelectorAll('a');
        links.forEach(a => {
            const href = a.getAttribute('href');
            if (href && href.startsWith('../')) {
                a.setAttribute('href', href.replace('../', ''));
            }
        });

        modalBody.innerHTML = projectContent.innerHTML;

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