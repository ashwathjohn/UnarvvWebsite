export const normalizeName = (value = "") => {
  return value.trim().replace(/\s+/g, " ");
};

export const normalizeEmail = (value = "") => {
  return value.trim().toLowerCase();
};

export const normalizePhone = (value = "") => {
  return value.replace(/\D/g, "");
};

export const normalizeParish = (value = "") => {
  return value.trim().replace(/\s+/g, " ");
};