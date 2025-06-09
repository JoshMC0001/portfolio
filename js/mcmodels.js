const firebaseConfig = {
    apiKey: "AIzaSyDCz7E4DSG9nanQ_fmM9fF8te6TXBpXUA0",
    authDomain: "portfolio-5ed3f.firebaseapp.com",
    projectId: "portfolio-5ed3f",
    storageBucket: "portfolio-5ed3f.appspot.com",
    messagingSenderId: "127710028877",
    appId: "1:127710028877:web:bde5c98f7283ee5dbc2804",
    measurementId: "G-RBDZRPQ2H9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function loadPublicCards() {
    const container = document.getElementById('card-container');
    try {
        const snapshot = await db.collection('mcmodels_cards').orderBy('order', 'asc').get();
        const cards = snapshot.docs.map(doc => doc.data());

        container.innerHTML = '';
        if (cards.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No cards found.</p>';
            return;
        }

        cards.forEach(card => {
            container.insertAdjacentHTML('beforeend', `
        <div class="col">
          <div class="card h-100 d-flex flex-column">
            <a href="${card.link || '#'}" target="_blank">
              <img src="${card.image}" class="card-img-top" alt="${card.title}">
              <div class="card-body">
                <h5 class="card-title">${card.title}</h5>
              </div>
            </a>
          </div>
        </div>
      `);
        });
    } catch (err) {
        console.error('Failed to load cards:', err);
        container.innerHTML = '<p class="text-center text-danger">Failed to load cards.</p>';
    }
}

loadPublicCards();
