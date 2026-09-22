import "./index.css";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { PwaProvider } from './components/PwaProvider';

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<PwaProvider><App /></PwaProvider>);
}
