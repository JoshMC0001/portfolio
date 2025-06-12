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

function updateGalleryLikesCount() {
    const totalLikesEl = document.getElementById('totalLikes');
    db.collection("gallery").get().then(snapshot => {
        let totalLikes = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.likes && typeof data.likes === 'number') {
                totalLikes += data.likes;
            }
        });
        totalLikesEl.textContent = totalLikes;
    }).catch(error => {
        console.error("Failed to count total likes:", error);
        totalLikesEl.textContent = "Error";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateGalleryLikesCount();
});