import { Outlet, useLocation } from "react-router-dom";
import HeaderComponent from "../components/Header/Header";
import FooterComponent from "../components/Footer/Footer";

import "react-toastify/dist/ReactToastify.css";
import React, { createContext, useState, useEffect } from "react";
import { ScrollspyContext, AuthProvider } from "../context/ScrollspyContext";
import PageTransitionOverlay from '../components/PageTransition/PageTransitionOverlay';
import Preloader from '../components/PageTransition/Preloader';

export const LoginVersionContext = createContext();

function RootLayout() {
  const [loginVersion, setLoginVersion] = useState(0);
  const [activeSection, setActiveSection] = useState("now-showing");
  const [showPreloader, setShowPreloader] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Chỉ hiện preloader khi load lần đầu (không phải chuyển route)
    if (!window.__hasLoadedOnce) {
      setShowPreloader(true);
      window.__hasLoadedOnce = true;
    }
  }, []);

  React.useEffect(() => {
    // Nếu không phải trang landing thì reset activeSection để header không hiển thị bracket
    if (!['/', '/home', '/landing'].includes(location.pathname)) {
      setActiveSection("");
    }
  }, [location.pathname]);

  return (
    <AuthProvider>
      <LoginVersionContext.Provider value={{ loginVersion, setLoginVersion }}>
        <ScrollspyContext.Provider value={{ activeSection, setActiveSection }}>
          <>
            {showPreloader && <Preloader onFinish={() => setShowPreloader(false)} />}
            <div className="min-h-screen flex flex-col">
              {!showPreloader && <PageTransitionOverlay />}
              <HeaderComponent />
              <main className="flex-1 pt-16">
                <Outlet />
              </main>
              {/* Container bọc Snackbar và Footer */}
              <div className="relative w-full">
                <FooterComponent />
              </div>

            </div>
          </>
        </ScrollspyContext.Provider>
      </LoginVersionContext.Provider>
    </AuthProvider>
  );
}

export default RootLayout;
