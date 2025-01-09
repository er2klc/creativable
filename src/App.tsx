import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Features from "@/pages/Features";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
    </Routes>
  );
};

export default App;
