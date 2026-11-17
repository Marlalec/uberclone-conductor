const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const UPLOAD_ERROR = 'UPLOAD_FAILED';

export const uploadImage = async (image, folder) => {
  const formData = new FormData();

  formData.append('file', image);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', folder);

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData }).catch((cause) => {
    throw new Error(UPLOAD_ERROR, { cause });
  });

  if (!response.ok) {
    throw new Error(UPLOAD_ERROR, { cause: await response.text() });
  }

  const data = await response.json();
  return data.secure_url;
};
