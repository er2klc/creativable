import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Todo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to /todo-list since this is the new todo page
    navigate("/todo-list");
  }, [navigate]);

  return null;
};

export default Todo;