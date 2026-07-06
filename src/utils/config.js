// ¿CÓMO funciona?
// Define y exporta la URL base del backend utilizando variables de entorno de CRA o un fallback seguro.
// ¿POR QUÉ esta estructura?
// Centraliza la configuración de red y garantiza que el despliegue no falle si no se define la variable de entorno.
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://backendproyectodf.onrender.com";
