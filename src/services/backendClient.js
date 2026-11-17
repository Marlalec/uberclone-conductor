const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const BACKEND_ERROR = 'BACKEND_REQUEST_FAILED';
export const BACKEND_URL_MISSING = 'BACKEND_URL_MISSING';

export const request = async (path, body) => {
  if (!API_URL) {
    throw new Error(BACKEND_URL_MISSING);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(BACKEND_ERROR);
  }

  if (!response.ok) {
    throw new Error(BACKEND_ERROR);
  }

  return response.json();
};
