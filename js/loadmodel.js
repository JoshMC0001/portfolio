const firebaseConfig = {
  apiKey: "AIzaSyDCz7E4DSG9nanQ_fmM9fF8te6TXBpXUA0",
  authDomain: "portfolio-5ed3f.firebaseapp.com",
  projectId: "portfolio-5ed3f",
  storageBucket: "portfolio-5ed3f.firebasestorage.app",
  messagingSenderId: "127710028877",
  appId: "1:127710028877:web:bde5c98f7283ee5dbc2804",
  measurementId: "G-RBDZRPQ2H9"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const mainContainer = document.getElementById("sketchfabContainer");

function extractUID(link) {
  const match = link.match(/sketchfab\.com\/models\/([\w-]+)/);
  return match ? match[1] : "";
}

function createIframe(link) {
  const uid = extractUID(link);
  const embedURL = `https://sketchfab.com/models/${uid}/embed`;

  const iframe = document.createElement("iframe");
  iframe.src = embedURL;
  iframe.width = "100%";
  iframe.height = "600";
  iframe.frameBorder = "0";
  iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
  iframe.allowFullscreen = true;
  iframe.setAttribute("mozallowfullscreen", "true");
  iframe.setAttribute("webkitallowfullscreen", "true");

  return iframe;
}

async function fetchThumbnail(sketchfabUrl) {
  const oEmbedUrl = `https://sketchfab.com/oembed?url=${encodeURIComponent(sketchfabUrl)}`;
  try {
    const res = await fetch(oEmbedUrl);
    if (!res.ok) throw new Error("oEmbed fetch failed");
    const data = await res.json();
    return data.thumbnail_url;
  } catch (err) {
    console.error("Thumbnail fetch error:", err);
    return null;
  }
}

async function loadSketchfabModel() {
  const snapshot = await db.collection("sketchfabModels").orderBy("order", "asc").get();

  if (!snapshot.empty) {
    const models = await Promise.all(
      snapshot.docs.map(async doc => {
        const data = doc.data();
        const thumbnail = data.thumbnail || await fetchThumbnail(data.link);
        return { id: doc.id, ...data, thumbnail };
      })
    );

    const firstModel = createIframe(models[0].link);
    mainContainer.innerHTML = "";
    mainContainer.appendChild(firstModel);

    const thumbBar = document.createElement("div");
    thumbBar.className = "d-flex overflow-auto mt-2 py-2 px-2";
    thumbBar.style.scrollSnapType = "x mandatory";

    models.forEach((model, index) => {
      const thumb = document.createElement("img");
      thumb.src = model.thumbnail;
      thumb.alt = model.title || `Model ${index + 1}`;
      thumb.className = "custom-thumbnail thumbBar";
      thumb.style.flex = "0 0 auto";
      thumb.style.cursor = "pointer";
      thumb.style.scrollSnapAlign = "start";
      if (index === 0) thumb.classList.add("active-thumbnail");
      thumb.addEventListener("click", () => {
        mainContainer.innerHTML = "";
        mainContainer.appendChild(createIframe(model.link));

        document.querySelectorAll(".custom-thumbnail").forEach(img => {
          img.classList.remove("active-thumbnail");
        });
        thumb.classList.add("active-thumbnail");
      });
      thumbBar.appendChild(thumb);
    });
    mainContainer.parentElement.appendChild(thumbBar);
  }
}

loadSketchfabModel();
