import { Routes, Route } from "react-router-dom";
import ConversationSelectPage from "./ConversationSelectPage";
import ConversationPage from "./ConversationPage";

function App() {
  // return <ModelSelectPage />;
  return (
    <Routes>
      <Route path="/" element={<ConversationSelectPage />} />
      <Route path="/conversation/:file" element={<ConversationPage />} />
    </Routes>
  );
}

export default App
