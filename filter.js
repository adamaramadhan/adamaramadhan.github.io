/**
 * filter.js
 * Shared filter logic + endnote builder.
 */

/* ══════════════════════════════════════════════════
   FILTER DROPDOWN
   ══════════════════════════════════════════════════ */
function toggleFilter(id) {
    const dropdown = document.getElementById(id);
    const isOpen = dropdown.classList.contains('open');
    document.querySelectorAll('.filter-dropdown.open').forEach(d => d.classList.remove('open'));
    if (!isOpen) {
        dropdown.classList.add('open');
        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                    document.removeEventListener('click', handler);
                }
            });
        }, 0);
    }
}

/* ══════════════════════════════════════════════════
   YEAR FILTER (events, publications)
   ══════════════════════════════════════════════════ */
function filterCards(filterId, listId, year, btn) {
    document.getElementById(filterId + 'Menu').querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#' + listId + ' .card').forEach(card => {
        card.classList.toggle('hidden', !(year === 'all' || card.dataset.year === year));
    });
    document.getElementById(filterId).classList.remove('open');
}

/* ══════════════════════════════════════════════════
   PUBLICATION YEAR FILTER
   ══════════════════════════════════════════════════ */
function filterPub(year, btn) {
    document.querySelectorAll('#pubFilterMenu button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#pubList .card').forEach(card => {
        card.classList.toggle('hidden', !(year === 'all' || card.dataset.year === year));
    });
    document.getElementById('pubFilter').classList.remove('open');
}

/* ══════════════════════════════════════════════════
   BLOG FILTER — year + tags combined
   ══════════════════════════════════════════════════ */
var blogActiveYear = 'all';
var blogActiveTag  = 'all';

function filterBlogYear(year, btn) {
    blogActiveYear = year;
    document.querySelectorAll('#blogYearSection button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyBlogFilter();
    document.getElementById('blogFilter').classList.remove('open');
}

function filterBlogTag(tag, btn) {
    blogActiveTag = tag;
    document.querySelectorAll('#blogTagSection button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyBlogFilter();
    document.getElementById('blogFilter').classList.remove('open');
}

function applyBlogFilter() {
    document.querySelectorAll('#blogList .card').forEach(card => {
        const yearMatch = blogActiveYear === 'all' || card.dataset.year === blogActiveYear;
        let tagMatch = true;
        if (blogActiveTag !== 'all') {
            const tags = (card.dataset.tags || '').split(' ').map(t => t.toLowerCase().trim());
            tagMatch = tags.includes(blogActiveTag.toLowerCase());
        }
        card.classList.toggle('hidden', !(yearMatch && tagMatch));
    });
}

/**
 * buildBlogTagButtons()
 *
 * Reads tags from the single master tag list:
 *   <meta name="blog-tags" content="#tag1 #tag2 #tag3">
 * located in the <head> of blog.html.
 *
 * To add a new tag: edit the content attribute of that <meta> tag,
 * adding #newtag separated by a space.
 *
 * Also reads data-tags from cards to ensure only tags that actually
 * appear on a card get a button.
 */
function buildBlogTagButtons() {
    // Collect tags used on cards
    const usedTags = new Set();
    document.querySelectorAll('#blogList .card').forEach(card => {
        (card.dataset.tags || '').split(' ').forEach(t => {
            const clean = t.replace(/^#+/, '').trim();
            if (clean) usedTags.add(clean.toLowerCase());
        });
    });

    // Read master tag order from <meta name="blog-tags">
    const metaEl = document.querySelector('meta[name="blog-tags"]');
    let orderedTags = [];
    if (metaEl) {
        orderedTags = metaEl.getAttribute('content')
            .split(/\s+/)
            .map(t => t.replace(/^#+/, '').trim().toLowerCase())
            .filter(t => t && usedTags.has(t));
    } else {
        // Fallback: alphabetical from cards
        orderedTags = Array.from(usedTags).sort();
    }

    const section = document.getElementById('blogTagSection');
    if (!section) return;

    // Remove previously injected buttons (keep "All")
    section.querySelectorAll('button.tag-btn').forEach(b => b.remove());

    orderedTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = '#' + tag;
        btn.onclick = function () { filterBlogTag(tag, this); };
        section.appendChild(btn);
    });
}

/* ══════════════════════════════════════════════════
   ENDNOTES
   Usage in post body: <cite class="en">Note text here.</cite>
   JS replaces each with a superscript link and builds the
   Notes section automatically.
   ══════════════════════════════════════════════════ */
function buildEndnotes() {
    const cites = document.querySelectorAll('cite.en');
    if (!cites.length) return;

    const content = document.querySelector('.blog-post .content');
    if (!content) return;

    // Replace each cite with a numbered superscript link
    cites.forEach((cite, i) => {
        const n = i + 1;
        const ref = document.createElement('a');
        ref.href = '#en' + n;
        ref.id = 'enr' + n;
        ref.className = 'en-ref';
        ref.title = cite.textContent.trim();
        ref.innerHTML = '<sup>' + n + '</sup>';
        cite.parentNode.insertBefore(ref, cite);
        // leave cite in DOM but hidden (CSS hides cite.en)
    });

    // Build Notes section after .content
    const section = document.createElement('div');
    section.className = 'endnotes-section';

    const heading = document.createElement('h2');
    heading.textContent = 'Notes';
    section.appendChild(heading);

    const list = document.createElement('ol');
    list.className = 'endnotes-list';

    cites.forEach((cite, i) => {
        const n = i + 1;
        const li = document.createElement('li');
        li.id = 'en' + n;

        const numSpan = document.createElement('span');
        numSpan.className = 'en-num';
        numSpan.textContent = n + '.';

        const textSpan = document.createElement('span');
        textSpan.textContent = cite.textContent.trim();

        const back = document.createElement('a');
        back.href = '#enr' + n;
        back.className = 'en-back';
        back.title = 'Return to text';
        back.textContent = '↩';

        li.appendChild(numSpan);
        li.appendChild(textSpan);
        li.appendChild(back);
        list.appendChild(li);
    });

    section.appendChild(list);

    // Insert after .content inside .blog-post > .container
    const container = content.closest('.container') || content.parentNode;
    container.appendChild(section);
}
