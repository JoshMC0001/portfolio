(() => {
    const galleryRow = document.getElementById('galleryRow');
    const galleryForm = document.getElementById('galleryForm');
    const editGalleryIdInput = document.getElementById('editGalleryId');
    const imageTitleInput = document.getElementById('imageTitle');
    const imageTagsInput = document.getElementById('imageTags');
    const imageLinkInput = document.getElementById('imageLink');
    const imageUploadInput = document.getElementById('imageUpload');
    const saveGalleryOrderBtn = document.getElementById('saveGalleryOrderBtn');
    const cancelEditBtn = document.getElementById('cancelGalleryEditBtn');
    const formSubmitBtn = galleryForm.querySelector('button[type="submit"]');

    let galleryImages = [];
    let editingIndex = null;

    // Initialize SortableJS on galleryRow
    let sortableGallery = new Sortable(galleryRow, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd() {
            reorderGalleryFromDOM();
        }
    });

    function reorderGalleryFromDOM() {
        const newOrder = [];
        const cols = galleryRow.querySelectorAll('.col');
        cols.forEach(col => {
            const docId = col.getAttribute('data-id');
            const img = galleryImages.find(g => g.id === docId);
            if (img) newOrder.push(img);
        });
        galleryImages = newOrder;
    }

    function renderGallery() {
        galleryRow.innerHTML = '';
        galleryImages.forEach((img, index) => {
            const col = document.createElement('div');
            col.className = 'col';
            col.setAttribute('data-id', img.id);

            const card = document.createElement('div');
            card.className = 'card h-100 d-flex flex-column shadow-sm';

            // Image element
            const imgEl = document.createElement('img');
            imgEl.src = img.imageUrl;
            imgEl.alt = img.title;
            imgEl.className = 'card-img-top';

            // Card body with title and tags
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const titleEl = document.createElement('h5');
            titleEl.className = 'card-title';
            titleEl.textContent = img.title;

            const tagsEl = document.createElement('p');
            tagsEl.className = 'card-text text-muted mb-2';
            tagsEl.style.fontSize = '0.9rem';
            tagsEl.textContent = img.tags ? `Tags: ${img.tags}` : 'Tags: (none)';

            const linkEl = document.createElement('a');
            if (img.link) {
                linkEl.href = img.link;
                linkEl.target = '_blank';
                linkEl.className = 'btn btn-sm btn-outline-primary mt-auto';
                linkEl.textContent = 'View Link';
            }

            cardBody.appendChild(titleEl);
            cardBody.appendChild(tagsEl);
            if (img.link) cardBody.appendChild(linkEl);

            // Card footer with Edit/Delete buttons
            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer d-flex justify-content-end gap-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-primary';
            editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
            editBtn.onclick = () => startEdit(index);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.onclick = () => deleteImage(index);

            cardFooter.appendChild(editBtn);
            cardFooter.appendChild(deleteBtn);

            card.appendChild(imgEl);
            card.appendChild(cardBody);
            card.appendChild(cardFooter);

            col.appendChild(card);
            galleryRow.appendChild(col);
        });
    }

    function startEdit(index) {
        editingIndex = index;
        const img = galleryImages[index];

        editGalleryIdInput.value = img.id;
        imageTitleInput.value = img.title;
        imageTagsInput.value = img.tags || '';
        imageLinkInput.value = img.link || '';
        imageUploadInput.value = '';

        // When editing, image upload should NOT be required
        imageUploadInput.required = false;

        formSubmitBtn.textContent = 'Save Changes';
        cancelEditBtn.classList.remove('d-none');
    }

    cancelEditBtn.onclick = () => {
        resetForm();
    };

    function resetForm() {
        editingIndex = null;
        editGalleryIdInput.value = '';
        galleryForm.reset();
        imageUploadInput.required = true;
        formSubmitBtn.textContent = 'Upload / Save';
        cancelEditBtn.classList.add('d-none');
    }

    async function deleteImage(index) {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const img = galleryImages[index];
            await db.collection('gallery').doc(img.id).delete();
            galleryImages.splice(index, 1);
            renderGallery();
        } catch (error) {
            console.error('Failed to delete image:', error);
            alert('Failed to delete image.');
        }
    }

    // Upload image to Cloudinary or your upload service
    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'unsigned_keyart');

        const res = await fetch('https://api.cloudinary.com/v1_1/djsxsmzhr/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.secure_url;
    }

    galleryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = imageTitleInput.value.trim();
        const tags = imageTagsInput.value.trim();
        const link = imageLinkInput.value.trim();
        const file = imageUploadInput.files[0];
        const docId = editGalleryIdInput.value;

        if (!title) return alert('Please enter an image title.');

        saveGalleryOrderBtn.disabled = true;
        formSubmitBtn.disabled = true;

        try {
            let imageUrl;

            if (file) {
                imageUrl = await uploadImage(file);
            }

            if (docId) {
                // Edit mode
                const imgIndex = galleryImages.findIndex(i => i.id === docId);
                if (imgIndex === -1) throw new Error('Image not found.');

                const img = galleryImages[imgIndex];

                const updatedData = {
                    title,
                    tags,
                    link,
                    imageUrl: imageUrl || img.imageUrl,
                };

                await db.collection('gallery').doc(docId).update(updatedData);

                galleryImages[imgIndex] = { ...img, ...updatedData };
                resetForm();
            } else {
                // Add mode - image file required
                if (!file) {
                    alert('Please select an image to upload.');
                    saveGalleryOrderBtn.disabled = false;
                    formSubmitBtn.disabled = false;
                    return;
                }

                imageUrl = await uploadImage(file);

                const newImage = {
                    title,
                    tags,
                    link,
                    imageUrl,
                    order: galleryImages.length,
                    views: 0,
                };

                const docRef = await db.collection('gallery').add(newImage);
                newImage.id = docRef.id;
                galleryImages.push(newImage);
            }

            renderGallery();
            galleryForm.reset();
            imageUploadInput.required = true;
        } catch (error) {
            console.error('Failed to save image:', error);
            alert('Failed to save image.');
        }

        saveGalleryOrderBtn.disabled = false;
        formSubmitBtn.disabled = false;
    });

    saveGalleryOrderBtn.addEventListener('click', async () => {
        try {
            reorderGalleryFromDOM();
            const batch = db.batch();
            galleryImages.forEach((img, idx) => {
                const docRef = db.collection('gallery').doc(img.id);
                batch.update(docRef, { order: idx });
            });
            await batch.commit();
            alert('Gallery order saved!');
        } catch (error) {
            console.error('Failed to save gallery order:', error);
            alert('Failed to save gallery order.');
        }
    });

    async function loadGallery() {
        try {
            const snapshot = await db.collection('gallery').orderBy('order').get();
            galleryImages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderGallery();
        } catch (error) {
            console.error('Failed to load gallery:', error);
            galleryRow.innerHTML = `<p class="text-danger">Failed to load gallery.</p>`;
        }
    }

    loadGallery();

    document.addEventListener('DOMContentLoaded', () => {
        const tagInput = document.getElementById('imageTags');
        const suggestionsBox = document.getElementById('tagSuggestions');
        const selectedTagsContainer = document.getElementById('selectedTags');

        // You can load your existing tags from Firestore or keep them static for now:
        const availableTags = [
            'skin', '3d-model', 'minecraft', 'decorations', 'furniture', 'weapons'
        ];

        let selectedTags = [];

        // Helper to update the visual tags container
        function updateSelectedTags() {
            selectedTagsContainer.innerHTML = '';
            selectedTags.forEach(tag => {
                const chip = document.createElement('span');
                chip.className = 'tag-chip';
                chip.textContent = tag;

                const removeBtn = document.createElement('span');
                removeBtn.className = 'remove-tag';
                removeBtn.textContent = '×';
                removeBtn.onclick = () => {
                    selectedTags = selectedTags.filter(t => t !== tag);
                    updateSelectedTags();
                };

                chip.appendChild(removeBtn);
                selectedTagsContainer.appendChild(chip);
            });

            // Update the input's value as comma separated for form submission or saving
            tagInput.value = selectedTags.join(', ');
        }

        // Show suggestions matching the input
        function showSuggestions(query) {
            suggestionsBox.innerHTML = '';
            if (!query) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const filtered = availableTags.filter(tag =>
                tag.toLowerCase().startsWith(query.toLowerCase()) && !selectedTags.includes(tag)
            );

            if (filtered.length === 0) {
                suggestionsBox.style.display = 'none';
                return;
            }

            filtered.forEach(tag => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'list-group-item list-group-item-action';
                item.textContent = tag;
                item.onclick = () => {
                    selectedTags.push(tag);
                    updateSelectedTags();
                    suggestionsBox.style.display = 'none';
                    tagInput.value = '';
                };
                suggestionsBox.appendChild(item);
            });

            suggestionsBox.style.display = 'block';
        }

        // Event listeners
        tagInput.addEventListener('input', () => {
            const val = tagInput.value.trim();
            showSuggestions(val);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!tagInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });

        // Optional: On form submit, you can get selectedTags array or just use tagInput.value as comma separated

    });

})();


