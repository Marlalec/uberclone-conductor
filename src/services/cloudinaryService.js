const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const MIME_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  webp: 'image/webp',
};

export const UPLOAD_ERROR = 'UPLOAD_FAILED';

export const uploadImage = async (uri, folder) => {
  const name = uri.split('/').pop();
  const extension = name.split('.').pop().toLowerCase();
  const formData = new FormData();

  formData.append('file', { uri, name, type: MIME_TYPES[extension] ?? 'image/jpeg' });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });

  if (!response.ok) {
    throw new Error(UPLOAD_ERROR);
  }

  const data = await response.json();
  return data.secure_url;
};
