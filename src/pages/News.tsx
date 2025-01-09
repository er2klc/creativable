import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const News = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      pageTitle="News & Updates"
      pageSubtitle="Bleib auf dem Laufenden"
      showButton={true}
      buttonText="Mehr erfahren"
      buttonAction={() => navigate("/register")}
    >
      <div className="container mx-auto px-4 py-20">
        {/* Content will be added later */}
      </div>
    </MainLayout>
  );
};

export default News;