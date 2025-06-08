const galleryGrid = document.getElementById('galleryGrid');
const tagFilter = document.getElementById('tagFilter');

let galleryImages = [];
const IMAGES_PER_PAGE = 24;
let currentPage = 1;
let filteredImages = [];

async function loadGalleryImagesOnly() {
    try {
        const snapshot = await db.collection('gallery').orderBy('order').get();
        galleryImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        applyFilterAndRender();
    } catch (error) {
        console.error('Failed to load gallery images:', error);
        galleryGrid.innerHTML = `<p class="text-danger">Failed to load images.</p>`;
    }
}

function applyFilterAndRender() {
    const filterTag = tagFilter.value.trim().toLowerCase();

    filteredImages = filterTag
        ? galleryImages.filter(img => {
            if (!img.tags) return false;
            const tagsArray = img.tags.split(',').map(t => t.trim().toLowerCase());
            return tagsArray.includes(filterTag);
        })
        : galleryImages;

    currentPage = 1; // reset to first page on filter change
    renderImageGrid();
    renderPaginationControls();
}

function renderImageGrid() {
    galleryGrid.innerHTML = '';

    if (filteredImages.length === 0) {
        galleryGrid.innerHTML = `<p>No images found${tagFilter.value ? ` for tag: <strong>${tagFilter.value}</strong>` : ''}</p>`;
        return;
    }

    const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    const imagesToShow = filteredImages.slice(startIndex, endIndex);

    imagesToShow.forEach(img => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4 col-md-4 col-lg-3 d-flex justify-content-center';

        const container = document.createElement('div');
        container.style.width = '100%';  // full width of the column
        container.style.height = 'auto';
        container.style.display = 'flex';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'flex-start';
        container.style.overflow = 'hidden';

        const imgEl = document.createElement('img');
        imgEl.src = img.imageUrl;
        imgEl.alt = img.title;
        imgEl.style.width = '100%';    // fill container width
        imgEl.style.height = 'auto';   // maintain aspect ratio
        imgEl.style.objectFit = 'contain';
        imgEl.style.marginBottom = '6px';

        container.appendChild(imgEl);
        col.appendChild(container);
        galleryGrid.appendChild(col);
    });
}

function renderPaginationControls() {
    // Remove old controls first
    let oldControls = document.getElementById('paginationControls');
    if (oldControls) oldControls.remove();

    if (filteredImages.length <= IMAGES_PER_PAGE) return; // no pagination needed

    const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);

    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'paginationControls';
    paginationDiv.className = 'd-flex justify-content-center align-items-center gap-2 flex-wrap mt-3';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary'; // changed from 'btn-primary'
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderImageGrid();
            renderPaginationControls();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationDiv.appendChild(prevBtn);

    // Page number buttons
    // We'll limit the number of buttons shown for usability if there are many pages
    const maxPageButtons = 7; // max number of page buttons to show at once
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // If startPage > 1, add "1" and "..." before the range
    if (startPage > 1) {
        paginationDiv.appendChild(createPageButton(1));
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'mx-1';
            paginationDiv.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = createPageButton(i);
        if (i === currentPage) btn.classList.add('active');
        paginationDiv.appendChild(btn);
    }

    // If endPage < totalPages, add "..." and last page button
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'mx-1';
            paginationDiv.appendChild(dots);
        }
        paginationDiv.appendChild(createPageButton(totalPages));
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary'; // changed from 'btn-primary'
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderImageGrid();
            renderPaginationControls();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationDiv.appendChild(nextBtn);

    // Append pagination controls after gallery
    galleryGrid.parentNode.appendChild(paginationDiv);
}

function createPageButton(pageNumber) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-secondary'; // gray color
    btn.textContent = pageNumber;
    btn.addEventListener('click', () => {
        if (pageNumber !== currentPage) {
            currentPage = pageNumber;
            renderImageGrid();
            renderPaginationControls();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    return btn;
}


// Filter change listener
tagFilter.addEventListener('change', applyFilterAndRender);

document.addEventListener('DOMContentLoaded', loadGalleryImagesOnly);
