import { createContext, useContext, useState, useEffect } from "react";

export const ScrollspyContext = createContext({ activeSection: "now-showing", setActiveSection: () => {} });
export const useScrollspy = () => useContext(ScrollspyContext);

// AuthContext để quản lý trạng thái đăng nhập
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  userProfile: null,
  login: () => {},
  logout: () => {},
  updateUserProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Kiểm tra trạng thái đăng nhập từ localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const userObj = JSON.parse(userStr);
        setUser(userObj.fullName || userObj.username || "");
        setIsLoggedIn(true);
        setUserProfile(userObj);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
      setUserProfile(null);
    }
  }, []);

  const login = (userData) => {
    setUser(userData.fullName || userData.username || "");
    setIsLoggedIn(true);
    setUserProfile(userData);
  };

  const logout = () => {
    // Lấy user trước khi xóa để xóa birthday popup
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.customerID) {
      localStorage.removeItem(`birthdayPopupShown_${user.customerID}`);
    }
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("id");
    localStorage.removeItem("gender");
    localStorage.removeItem("user");
    localStorage.removeItem("movieTitle");
    localStorage.removeItem("isGamePlayed");
    
    setIsLoggedIn(false);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = (profile) => {
    setUserProfile(profile);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      userProfile,
      login,
      logout,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 