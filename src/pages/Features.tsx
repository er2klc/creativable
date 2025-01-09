import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

const Features = () => {
  const navigate = useNavigate();

  return (
    <MainLayout
      pageTitle="Unsere Funktionen"
      pageSubtitle="Entdecke alle Möglichkeiten mit creativable"
      showButton={true}
      buttonText="Jetzt entdecken"
      buttonAction={() => navigate("/register")}
    >
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-6">Funktionen</h2>
        <p className="text-lg text-gray-400 mb-4">Hier sind einige der großartigen Funktionen, die wir anbieten:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>Intuitive Benutzeroberfläche für einfaches Navigieren</li>
          <li>Leistungsstarke Tools zur Unterstützung Ihrer Kreativität</li>
          <li>Nahtlose Integration mit verschiedenen Plattformen</li>
          <li>Umfassende Analysen und Berichte</li>
          <li>24/7 Kundensupport für alle Ihre Fragen</li>
        </ul>
      </div>
    </MainLayout>
  );
};

export default Features;
