import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import store from "./redux/store";
import App from "./App";
import "./App.css"; // Tailwind base/components/utilities live here
import "./index.css";
import "./styles.css";
import { queryClient } from "./query/queryClient";
import reportWebVitals from "./utils/reportWebVitals";
import { initMonitoring } from "./utils/monitoring";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </Provider>
    </QueryClientProvider>
  </HelmetProvider>
);

// Real-user performance metrics (production only; admin pages excluded so
// the numbers reflect what shoppers experience).
if (process.env.NODE_ENV === "production" && !window.location.pathname.startsWith("/admin")) {
  reportWebVitals();
}

// Error monitoring (no-op unless VITE_SENTRY_DSN is configured).
initMonitoring();
