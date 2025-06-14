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
    const showMoreBtn = document.getElementById('showMoreBtn');

    try {
        const snapshot = await db.collection('mcmodels_cards').orderBy('order', 'asc').get();
        const allCards = snapshot.docs.map(doc => doc.data());

        const isMobile = window.innerWidth < 767;
        const maxCards = isMobile ? 4 : 8;
        const visibleCards = allCards.slice(0, maxCards);

        container.innerHTML = '';

        visibleCards.forEach(card => {
            container.insertAdjacentHTML('beforeend', `
                <div class="col">
                    <div class="card h-100 d-flex flex-column bg-black">
                        <a href="${card.link || '#'}" target="_blank">
                            <img src="${card.image}" class="card-img-top" alt="${card.title}">
                            <div class="card-body p-0 pt-3">
                                <h5 class="card-title text-white text-start fs-5">${card.title}</h5>
                            </div>
                        </a>
                    </div>
                </div>
            `);
        });

        showMoreBtn.style.display = allCards.length > maxCards ? 'inline-block' : 'none';

    } catch (err) {
        console.error('Failed to load cards:', err);
        container.innerHTML = '<p class="text-center text-danger">Failed to load cards.</p>';
    }
}

loadPublicCards();

let path = window.location.pathname;
if (path === "/" || path === "/index.html") path = "home";
const page = path.replace(/\//g, "_");

const pageRef = db.collection("pageViews").doc(page);

pageRef.get().then((doc) => {
    if (doc.exists) {
        pageRef.update({ count: firebase.firestore.FieldValue.increment(1) });
    } else {
        pageRef.set({ count: 1 });
    }
}).catch((error) => {
    console.error("Error updating view count:", error);
});