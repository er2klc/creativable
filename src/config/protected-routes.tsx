import { mainRoutes } from "./routes/main-routes";
import { toolRoutes } from "./routes/tool-routes";
import { platformRoutes } from "./routes/platform-routes";

export const protectedRoutes = [
  ...mainRoutes,
  ...toolRoutes,
  ...platformRoutes,
];