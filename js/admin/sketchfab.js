let sortable = null; // Declare globally

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

const modelCollection = db.collection("sketchfabModels");

db.collection('settings').doc('sketchfabEmbed').get().then(doc => {
    if (doc.exists) {
        const iframeUrl = doc.data().iframeUrl;
        const container = document.getElementById('sketchfabContainer');
        if (container) {
            container.innerHTML = `
        <iframe src="${iframeUrl}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen frameborder="0" style="width:100%; height:100%;"></iframe>
      `;
        }
    }
});

async function renderModels() {
    const snapshot = await modelCollection.orderBy("order", "asc").get();
    const row = document.getElementById("modelRow");
    row.innerHTML = "";

    snapshot.forEach(doc => {
        const model = doc.data();
        const index = doc.id;

        const col = document.createElement("div");
        col.className = "col col-12 col-sm-6 col-md-4 col-lg-3";
        col.dataset.id = index;

        col.innerHTML = `
            <div class="card h-100 d-flex flex-column">
                <div class="ratio ratio-16x9">
                    <iframe src="${model.link}" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen frameborder="0"></iframe>
                </div>
                <div class="card-body d-flex flex-column justify-content-between">
                    <div>
                        <h5 class="card-title">${model.title}</h5>
                        <p class="card-text">${model.tags?.join(", ") || ""}</p>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div>
                            <button class="btn btn-sm btn-primary me-2" onclick="editModel('${index}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteModel('${index}')">Delete</button>
                        </div>
                        ${model.thumbnailUrl
                ? `<img src="${model.thumbnailUrl}" class="img-thumbnail" style="max-width: 100px;" alt="Thumbnail">`
                : `<div class="bg-light text-center py-2 px-2" style="max-width: 100px;">No thumbnail</div>`}
                    </div>
                </div>
            </div>
        `;
        row.appendChild(col);
    });

    if (sortable) sortable.destroy(); // Destroy previous instance
    sortable = new Sortable(row, {
        animation: 150
    });
}

document.getElementById("modelForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("modelTitle").value.trim();
    const tags = document.getElementById("modelTags").value.split(",").map(t => t.trim()).filter(Boolean);
    const link = document.getElementById("sketchfabLink").value.trim();
    const editId = document.getElementById("editModelId").value;
    const file = document.getElementById("modelImage").files[0];

    let thumbnailUrl = null;

    if (file) {
        try {
            thumbnailUrl = await uploadImage(file);
        } catch (err) {
            alert("Image upload failed.");
            console.error(err);
            return;
        }
    }

    if (editId) {
        const updateData = { title, tags, link };
        if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;
        await modelCollection.doc(editId).update(updateData);
    } else {
        const count = (await modelCollection.get()).size;
        await modelCollection.add({
            title,
            tags,
            link,
            thumbnailUrl,
            order: count
        });
    }

    this.reset();
    document.getElementById("editModelId").value = "";
    document.getElementById("cancelModelEditBtn").classList.add("d-none");

    renderModels();
});

async function editModel(id) {
    const doc = await modelCollection.doc(id).get();
    const data = doc.data();

    document.getElementById("modelTitle").value = data.title;
    document.getElementById("modelTags").value = data.tags.join(", ");
    document.getElementById("sketchfabLink").value = data.link;
    document.getElementById("editModelId").value = id;
    document.getElementById("cancelModelEditBtn").classList.remove("d-none");
}

async function deleteModel(id) {
    await modelCollection.doc(id).delete();
    renderModels();
}

document.getElementById("cancelModelEditBtn").addEventListener("click", () => {
    document.getElementById("modelForm").reset();
    document.getElementById("editModelId").value = "";
    document.getElementById("cancelModelEditBtn").classList.add("d-none");
});

document.getElementById("saveModelOrderBtn").addEventListener("click", async () => {
    const columns = document.querySelectorAll("#modelRow .col");
    for (let i = 0; i < columns.length; i++) {
        const docId = columns[i].dataset.id;
        await modelCollection.doc(docId).update({ order: i });
    }
    alert("Model order saved!");
});

renderModels();
