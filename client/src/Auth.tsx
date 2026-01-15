

async function checkAuth(): Promise<boolean> {
  const res = await fetch("/api/me");
  return res.ok;
}

export { checkAuth };
