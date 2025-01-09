import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Features from "@/pages/Features";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/features" element={<Features />} />
      </Routes>
    </MainLayout>
  );
};

export default App;