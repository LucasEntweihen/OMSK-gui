import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useAppStore } from "./store/useAppStore";

export const App: React.FC = () => {
  const syncBackendModels = useAppStore((state) => state.syncBackendModels);

  React.useEffect(() => {
    // Sincroniza dinamicamente modelos e provedores ativos do runtime OMSK se conectado
    syncBackendModels();
  }, [syncBackendModels]);

  return <RouterProvider router={router} />;
};

export default App;
