import { HashRouter } from "react-router-dom";
import { DbProvider } from "@/db/provider";
import AppShell from "@/components/AppShell";

function App() {
  return (
    <DbProvider>
      <HashRouter>
        <AppShell />
      </HashRouter>
    </DbProvider>
  );
}

export default App;
