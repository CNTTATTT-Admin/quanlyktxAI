import { useLocation, Navigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants/Connect";
import { useEffect } from "react";
import { toast } from "react-toastify";
import LoadingIndicator from "../common/LoadingIndicator";

function OAuth2RedirectHandler() {
  const location = useLocation();

  const getUrlParameter = (name) => {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + name + "=([^&#]*)");

    const results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  const token = getUrlParameter("token");
  const error = getUrlParameter("error");
  const redirectTo = localStorage.getItem("social_login_redirect") || "/";

  useEffect(() => {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN, token);
      localStorage.removeItem("social_login_redirect");
      toast.success("Đăng nhập thành công.");
      // Force a full page reload to the target destination to ensure App.js state is refreshed
      window.location.href = redirectTo;
    }
  }, [token, redirectTo]);

  if (error) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          state: { from: location },
          error: error,
        }}
      />
    );
  }

  return <LoadingIndicator />;
}

export default OAuth2RedirectHandler;
