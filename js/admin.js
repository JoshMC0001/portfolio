const firebaseConfig = {
    apiKey: "AIzaSyDCz7E4DSG9nanQ_fmM9fF8te6TXBpXUA0",
    authDomain: "portfolio-5ed3f.firebaseapp.com",
    projectId: "portfolio-5ed3f",
    storageBucket: "portfolio-5ed3f.firebasestorage.app",
    messagingSenderId: "127710028877",
    appId: "1:127710028877:web:bde5c98f7283ee5dbc2804",
    measurementId: "G-RBDZRPQ2H9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const cardsRow = document.getElementById('cardsRow');
const cardForm = document.getElementById('cardForm');
const cardTitle = document.getElementById('cardTitle');
const cardImageUpload = document.getElementById('cardImageUpload');
const cardLink = document.getElementById('cardLink');
const editIndexInput = document.getElementById('editIndex');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveOrderBtn = document.getElementById('saveOrderBtn');

let cards = [];
let editingDocId = null;

let sortable = new Sortable(cardsRow, {
    animation: 150,
    onEnd() {
        reorderCardsFromDOM();
    }
});

function reorderCardsFromDOM() {
    const newOrder = [];
    const cols = cardsRow.querySelectorAll('.col');
    cols.forEach(col => {
        const cardId = col.getAttribute('data-id');
        const card = cards.find(c => c.id === cardId);
        if (card) newOrder.push(card);
    });
    cards = newOrder;
}

function renderCards() {
    cardsRow.innerHTML = '';
    cards.forEach((card, index) => {
        const col = document.createElement('div');
        col.className = 'col';
        col.setAttribute('data-id', card.id);

        const cardEl = document.createElement('div');
        cardEl.className = 'card h-100 d-flex flex-column';

        const a = document.createElement('a');
        a.href = card.link || '#';
        a.target = '_blank';

        const img = document.createElement('img');
        img.src = card.image;
        img.className = 'card-img-top';
        img.alt = card.title;

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const h5 = document.createElement('h5');
        h5.className = 'card-title';
        h5.textContent = card.title;

        const linkText = document.createElement('p');
        linkText.className = 'card-link-text text-truncate';
        linkText.style.fontSize = '0.85rem';
        linkText.style.marginTop = '0.25rem';

        const linkAnchor = document.createElement('a');
        linkAnchor.href = card.link || '#';
        linkAnchor.target = '_blank';
        linkAnchor.rel = 'noopener noreferrer';
        linkAnchor.textContent = card.link || '(no link)';

        linkText.appendChild(linkAnchor);

        cardBody.appendChild(h5);
        cardBody.appendChild(linkText);
        a.appendChild(img);
        a.appendChild(cardBody);
        cardEl.appendChild(a);

        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer d-flex justify-content-end gap-2';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-primary';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.onclick = () => startEdit(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.onclick = () => deleteCard(index);

        cardFooter.appendChild(editBtn);
        cardFooter.appendChild(deleteBtn);
        cardEl.appendChild(cardFooter);

        col.appendChild(cardEl);
        cardsRow.appendChild(col);
    });
}

function startEdit(index) {
    const card = cards[index];
    cardTitle.value = card.title;
    cardLink.value = card.link;
    editIndexInput.value = index;
    editingDocId = card.id;
    submitBtn.textContent = 'Update Card';
    cancelEditBtn.classList.remove('d-none');
}

function resetForm() {
    cardForm.reset();
    editIndexInput.value = '';
    editingDocId = null;
    submitBtn.textContent = 'Add Card';
    cancelEditBtn.classList.add('d-none');
}

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

async function saveCardToFirestore(card, docId = null) {
    if (docId) {
        await db.collection('mcmodels_cards').doc(docId).set(card);
    } else {
        const docRef = await db.collection('mcmodels_cards').add(card);
        card.id = docRef.id;
    }
}

async function deleteCardFromFirestore(docId) {
    await db.collection('mcmodels_cards').doc(docId).delete();
}

async function loadCards() {
    try {
        const snapshot = await db.collection('mcmodels_cards').get();
        cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        cards.sort((a, b) => {
            if (a.order === undefined) return 1;
            if (b.order === undefined) return -1;
            return a.order - b.order;
        });

        renderCards();
    } catch (err) {
        console.error('Failed to load cards from Firestore:', err);
    }
}

async function deleteCard(index) {
    if (confirm('Delete this card?')) {
        const card = cards[index];
        try {
            await deleteCardFromFirestore(card.id);
            cards.splice(index, 1);
            renderCards();
            resetForm();
        } catch (err) {
            console.error('Failed to delete card:', err);
            alert('Failed to delete card.');
        }
    }
}

cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = cardTitle.value.trim();
    const link = cardLink.value.trim();
    if (!title) return alert('Title is required');

    submitBtn.disabled = true;

    try {
        let imageUrl = '';

        if (cardImageUpload.files.length > 0) {
            imageUrl = await uploadImage(cardImageUpload.files[0]);
        } else if (editingDocId) {
            const card = cards.find(c => c.id === editingDocId);
            imageUrl = card?.image || '';
        } else {
            alert('Please upload an image');
            submitBtn.disabled = false;
            return;
        }

        const cardData = { title, link, image: imageUrl };

        if (editingDocId) {
            await saveCardToFirestore(cardData, editingDocId);
            const idx = cards.findIndex(c => c.id === editingDocId);
            if (idx !== -1) {
                cards[idx] = { id: editingDocId, ...cardData };
            }
        } else {
            await saveCardToFirestore(cardData);
            cards.push(cardData);
        }

        renderCards();
        resetForm();
    } catch (err) {
        console.error('Failed to save card:', err);
        alert('Failed to save card.');
    }

    submitBtn.disabled = false;
});

cancelEditBtn.addEventListener('click', () => {
    resetForm();
});

saveOrderBtn.addEventListener('click', async () => {
    try {
        reorderCardsFromDOM();

        for (let i = 0; i < cards.length; i++) {
            await db.collection('mcmodels_cards').doc(cards[i].id).update({ order: i });
        }

        alert('Card order saved!');
    } catch (err) {
        console.error('Failed to save card order:', err);
        alert('Failed to save card order.');
    }
});

loadCards();

const auth = firebase.auth();

auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "login.html";
    }
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}

function fetchCardCountFromFirestore() {
    db.collection("mcmodels_cards").get()
        .then((querySnapshot) => {
            const count = querySnapshot.size;
            document.getElementById("totalCardCount").textContent = count;
        })
        .catch((error) => {
            console.error("Error fetching card count: ", error);
            document.getElementById("totalCardCount").textContent = "Error";
        });
}

fetchCardCountFromFirestore();

function updateGalleryImageCount() {
    const totalViewsEl = document.getElementById('totalViews');
    db.collection("gallery").get().then(snapshot => {
        const imageCount = snapshot.size;
        totalViewsEl.textContent = imageCount;
    }).catch(error => {
        console.error("Failed to count gallery images:", error);
        totalViewsEl.textContent = "Error";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateGalleryImageCount();
});


const galleryRow = document.getElementById('galleryRow');

function renderGalleryCard(doc) {
    const data = doc.data();
    const cardCol = document.createElement('div');
    cardCol.className = 'col';

    cardCol.innerHTML = `
    <div class="card h-100">
      <img src="${data.imageUrl || 'img/default.png'}" class="card-img-top" alt="${data.title || 'Gallery Image'}" />
      <div class="card-body">
        <h5 class="card-title">${data.title || 'Untitled'}</h5>
        ${data.link ? `<a href="${data.link}" target="_blank" class="btn btn-primary btn-sm">View</a>` : ''}
      </div>
    </div>
    `;
    galleryRow.appendChild(cardCol);
}

function loadGallery() {
    galleryRow.innerHTML = 'Loading...';
    db.collection('gallery').get()
        .then(snapshot => {
            galleryRow.innerHTML = '';
            if (snapshot.empty) {
                galleryRow.innerHTML = '<p>No gallery items found.</p>';
                return;
            }
            snapshot.forEach(doc => {
                renderGalleryCard(doc);
            });
        })
        .catch(error => {
            galleryRow.innerHTML = `<p>Error loading gallery: ${error.message}</p>`;
        });
}

loadGallery();

const latestCardTitle = document.getElementById('latestCardTitle');
const latestCardImage = document.getElementById('latestCardImage');
const latestCardLink = document.getElementById('latestCardLink');

function fetchLatestMCModel() {
    db.collection('mcmodels_cards')
        .orderBy('order')
        .limit(1)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                const doc = snapshot.docs[0].data();
                latestCardTitle.textContent = doc.title || 'No title';
                latestCardImage.src = doc.image || 'img/default.jpg';
                latestCardLink.href = doc.link || '#';
            }
        })
        .catch(error => {
            console.error("Error fetching latest product:", error);
        });
}


fetchLatestMCModel();

const commissionToggle = document.getElementById('commissionToggle');

db.collection('siteSettings').doc('commissions').get().then(doc => {
    if (doc.exists) {
        commissionToggle.checked = doc.data().open;
    }
});

commissionToggle.addEventListener('change', () => {
    const isOpen = commissionToggle.checked;
    db.collection('siteSettings').doc('commissions').set({ open: isOpen });
});


document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebase.auth().signOut()
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error('Logout error:', error);
                    alert('Logout failed. Please try again.');
                });
        });
    }
});
