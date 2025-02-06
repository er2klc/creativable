import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /leads since this is the new contacts page
    navigate("/leads");
  }, [navigate]);

  return null;
};

export default Contacts;