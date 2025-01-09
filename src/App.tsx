import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Support from "@/pages/Support";
import News from "@/pages/News";
import Auth from "@/pages/Auth";
import Register from "@/pages/Register";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
      <Route path="/news" element={<News />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default App;