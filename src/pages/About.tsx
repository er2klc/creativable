import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const About = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      pageTitle="Über uns"
      pageSubtitle="Ein Tool, das Dein Wachstum unterstützt"
      showButton={true}
      buttonText="Team kennenlernen"
      buttonAction={() => navigate("/register")}
    >
      <div className="container mx-auto px-4 py-20">
        {/* Content will be added later */}
      </div>
    </MainLayout>
  );
};

export default About;