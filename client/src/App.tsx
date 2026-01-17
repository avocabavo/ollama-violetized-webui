import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import ConversationSelectPage from "./ConversationSelectPage";
import ConversationPage from "./ConversationPage";

import { checkAuth, logout } from "./Auth";
import { LoginPage } from "./LoginPage";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  async function handleLogout() {
    await logout();
    setAuthenticated(false);
  }

  useEffect(()=> {
    checkAuth()
      .then(ok => setAuthenticated(ok))
      .finally(() => setAuthChecked(true));
  }, []);

  if (!authChecked) {
    return <div>Checking authentication...</div>;
  }

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<ConversationSelectPage onLogout={handleLogout} />} />
      <Route
        path="/conversation/:file"
        element={<ConversationPage onLogout={handleLogout} />}
      />
    </Routes>
  );
}

export default App
