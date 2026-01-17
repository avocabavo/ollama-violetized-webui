

async function checkAuth(): Promise<boolean> {
  const res = await fetch("/api/me");
  return res.ok;
}

async function logout() {
  const res = await fetch("/api/logout", {
    method: "POST"
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
}

export { checkAuth, logout };
