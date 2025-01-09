import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      pageTitle="Preise"
      pageSubtitle="Wähle den Plan, der zu dir passt"
      showButton={true}
      buttonText="Plan wählen"
      buttonAction={() => navigate("/register")}
    >
      <div className="container mx-auto px-4 py-20">
        {/* Content will be added later */}
      </div>
    </MainLayout>
  );
};

export default Pricing;