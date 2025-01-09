import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const Support = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      pageTitle="Support"
      pageSubtitle="Wir sind für dich da"
      showButton={true}
      buttonText="Hilfe erhalten"
      buttonAction={() => navigate("/register")}
    >
      <div className="container mx-auto px-4 py-20">
        {/* Content will be added later */}
      </div>
    </MainLayout>
  );
};

export default Support;