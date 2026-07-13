export async function readJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const snippet = text.replace(/\s+/g, " ").slice(0, 220);
    if (snippet.startsWith("<") || snippet.includes("<!doctype html") || snippet.includes("<html")) {
      throw new Error("La respuesta del servidor no fue válida.");
    }
    throw new Error(snippet || "Error inesperado del servidor.");
  }
}
