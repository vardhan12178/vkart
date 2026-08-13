// Previously duplicated (identically) in AdminUsers.js and AdminEmployees.js.
export function avatarInitial(name, email) {
  const src = (name || email || "").trim();
  return src ? src.charAt(0).toUpperCase() : "?";
}
