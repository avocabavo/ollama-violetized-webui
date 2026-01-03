import { Routes, Route } from "react-router-dom";
import ModelSelectPage from "./ModelSelectPage";
import ConversationPage from "./ConversationPage";

function App() {
  // return <ModelSelectPage />;
  return (
    <Routes>
      <Route path="/" element={<ModelSelectPage />} />
      <Route path="/conversation/:file" element={<ConversationPage />} />
    </Routes>
  );
}

export default App
