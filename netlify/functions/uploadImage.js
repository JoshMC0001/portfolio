async function uploadImage(file) {
  const url = 'https://api.cloudinary.com/v1_1/djsxsmzhr/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_keyart');

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}
