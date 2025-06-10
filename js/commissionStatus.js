const pcStatus = document.getElementById('commissionStatus');
const mobileStatus = document.getElementById('commissionStatusMobile');

function updateCommissionStatus() {
    const db = firebase.firestore(); // Make sure Firestore is initialized

    db.collection('siteSettings').doc('commissions').get().then(doc => {
        const isOpen = doc.exists && doc.data().open;

        const statusText = isOpen ? 'Commissions Open' : 'Commissions Closed';
        const statusClass = isOpen ? 'bg-success text-white' : 'bg-danger text-white';

        const pcStatus = document.getElementById('commissionStatus');
        const mobileStatus = document.getElementById('commissionStatusMobile');

        [pcStatus, mobileStatus].forEach(el => {
            if (el) {
                el.textContent = statusText;
                el.className = ''; // Clear existing classes
                el.classList.add('badge', 'rounded-pill', 'fw-semibold', ...statusClass.split(' '));
                if (el.id === 'commissionStatus') {
                    el.classList.add('d-none', 'd-md-inline-flex', 'ms-3', 'px-3', 'py-2', 'fs-6', 'fs-md-4');
                } else {
                    el.classList.add('px-3', 'py-2', 'my-3', 'fs-6');
                }
            }
        });
    });
}