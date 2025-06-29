import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId="807473090069-f7obrffiql0ns8fj0mh7peu5fef67spi.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
