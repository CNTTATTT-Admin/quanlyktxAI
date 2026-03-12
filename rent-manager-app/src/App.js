import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Main from "./page/user/Main";
import DashboardAdmin from "./page/admin/DashboardAdmin";
import RentalHome from "./page/user/RentalHome";
import RentailHomeDetail from "./page/user/RentailHomeDetail";
import About from "./page/user/About";
import Contact from "./page/user/Contact";
import Login from "./page/login/Login";
import { useState } from "react";
import {
  getCurrentAdmin,
  getCurrentRentaler,
  getCurrentUser,
  getCurrentUserUnified,
} from "./services/fetch/ApiUtils";
import { ACCESS_TOKEN } from "./constants/Connect";
import LoadingIndicator from "./common/LoadingIndicator";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Signup from "./page/signup/Signup";
import OAuth2RedirectHandler from "./oauth2/OAuth2RedirectHandler";
import NotFound from "./common/NotFound";
import DashboardRentaler from "./page/rentaler/DashboardRentaler";
import LoginRentaler from "./page/login/LoginRentaler";
import LoginAdmin from "./page/login/LoginAdmin";
import SignupRentaler from "./page/signup/SignupRentaler";
import ForgotPassword from "./common/ForgotPassword";
import ResetPassword from "./common/ResetPassword";
import SuccessConfirmed from "./common/SuccessConfirmed";
import AddRoom from "./page/rentaler/AddRoom";
import RoomManagement from "./page/rentaler/RoomManagement";
import EditRoom from "./page/rentaler/EditRoom";
import Profile from "./page/user/Profile";
import Message from "./page/messages/pages/Home";
import ContractManagement from "./page/rentaler/ContractManagement";
import AddContract from "./page/rentaler/AddContract";
import EditContract from "./page/rentaler/EditContract";
import MaintenceManagement from "./page/rentaler/MaintenceManagement";
import AddMaintence from "./page/rentaler/AddMaintence";
import EditMaintenance from "./page/rentaler/EditMaintence";
import RequierManagement from "./page/rentaler/RequierManagement";
import ExportBillRequier from "./page/rentaler/ExportBillRequier";
import ExportCheckoutRoom from "./page/rentaler/ExportCheckoutRoom";
import ProfileRentaler from "./page/rentaler/ProfileRentaler";
import ChangePassword from "./page/rentaler/ChangePassword";
import RoomManagementAdmin from "./page/admin/RoomManagerment";
import AccountManagement from "./page/admin/AccountManagement";
import SendEmail from "./page/admin/SendEmail";
import Chat from "./page/rentaler/Chat";
import Authorization from "./page/admin/Authorization";
import ChangePasswordOfUser from "./page/user/ChangePassword";
import RoomHired from "./page/user/RoomHired";
import AgentsGird from "./page/user/AgentsGird";
import AgentSingle from "./page/user/AgentSingle";
import SendRequest from "./page/user/SendRequest";
import Follow from "./page/user/Follow";
import SaveBlog from "./page/user/SaveBlog";
import ChatOfUser from "./page/user/ChatOfUser";
import ElectricAndWaterManagement from "./page/rentaler/ElectricAndWaterManagement";
import AddElectricAndWater from "./page/rentaler/AddElectricAndWater";
import EditElectricAndWater from "./page/rentaler/EditElectricAndWater";
import FaceRegistration from "./page/user/FaceRegistration";
import CheckInOut from "./page/user/CheckInOut";
import CheckInOutHistory from "./page/user/CheckInOutHistory";
import LeaveRequestForm from "./page/user/LeaveRequestForm";
import MaintenanceUserPage from "./page/user/MaintenanceUserPage";
import ElectricAndWaterUserPage from "./page/user/ElectricAndWaterUserPage";
import LeaveRequestManagement from "./page/rentaler/LeaveRequestManagement";
import CheckoutRequestManagement from "./page/rentaler/CheckoutRequestManagement";
import CheckInOutManagement from "./page/rentaler/CheckInOutManagement";
import BannerManagement from "./page/admin/BannerManagement";
import BannerForm from "./page/admin/BannerForm";
import PolicyManagement from "./page/admin/PolicyManagement";
import PolicyForm from "./page/admin/PolicyForm";
import PolicyView from "./page/user/PolicyView";
import ChatWidget from "./common/ChatWidget";

const PrivateRoute = ({ children, authenticated, role, allowedRoles }) => {
  if (!authenticated) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = () => {
    getCurrentUserUnified()
      .then((response) => {
        setCurrentUser(response);
        setUsername(response.name);
        // Priority: ROLE_ADMIN > ROLE_RENTALER > ROLE_USER
        const roles = response.roles.map((r) => r.name);
        if (roles.includes("ROLE_ADMIN")) {
          setRole("ROLE_ADMIN");
        } else if (roles.includes("ROLE_RENTALER")) {
          setRole("ROLE_RENTALER");
        } else {
          setRole(roles[0] || "");
        }
        setAuthenticated(true);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    setRole("");
    toast.success("Bạn đăng xuất thành công!!!");
  };

  const exitLogoutChangePassword = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    setRole("");
  };

  useEffect(() => {
    if (localStorage.getItem(ACCESS_TOKEN)) {
      loadCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <LoadingIndicator />;
  }

  console.log("DEBUG App State:", {
    authenticated,
    username,
    currentUser,
    role,
    loading,
  });
  if (currentUser) {
    console.log("DEBUG Face ID Condition:", {
      hasFaceVector: !!currentUser.faceVector,
      hasAllocatedRoom: currentUser.allocatedRoomId != null,
      isNotOnRegPage: window.location.pathname !== "/face-registration",
      shouldShowOverlay:
        authenticated &&
        currentUser &&
        !currentUser.faceVector &&
        currentUser.allocatedRoomId != null &&
        window.location.pathname !== "/face-registration",
    });
  }
  return (
    <>
      <Router>
        <ChatWidget />
        <Routes>
          <Route
            exact
            path="/"
            element={
              <Main
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/rental-home"
            element={
              <RentalHome
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/rental-home/:id"
            element={
              <RentailHomeDetail
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/angent-gird"
            element={
              <AgentsGird
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/angent-single/:id"
            element={
              <AgentSingle
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/send-request/:id"
            element={
              <SendRequest
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/follow-agents"
            element={
              <Follow
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/save-blog"
            element={
              <SaveBlog
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/about-us"
            element={
              <About
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/contact"
            element={
              <Contact
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/policy"
            element={
              <PolicyView
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/forgot-password"
            element={
              <ForgotPassword
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/message"
            element={
              <ChatOfUser
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/room-hired"
            element={
              <RoomHired
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/leave-request"
            element={
              <LeaveRequestForm
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/maintenance"
            element={
              <MaintenanceUserPage
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/reset-password/:email"
            element={<ResetPassword />}
          />
          <Route
            exact
            path="/success-comfirmed/:email"
            element={<SuccessConfirmed />}
          />
          <Route
            exact
            path="/profile"
            element={
              <Profile
                authenticated={authenticated}
                loadCurrentUser={loadCurrentUser}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/change-password"
            element={
              <ChangePasswordOfUser
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/login"
            element={<Login authenticated={authenticated} />}
          />
          <Route
            exact
            path="/login-rentaler"
            element={
              <LoginRentaler
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
              />
            }
          />
          <Route
            exact
            path="/login-admin"
            element={
              <LoginAdmin
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
              />
            }
          />
          <Route
            exact
            path="/signup"
            element={
              <Signup
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
              />
            }
          />
          <Route
            exact
            path="/signup-rentaler"
            element={<SignupRentaler authenticated={authenticated} />}
          />
          {/* ADMIN */}
          <Route
            exact
            path="/admin"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <DashboardAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/room-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <RoomManagementAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/authorization/:userId"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <Authorization
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />

          <Route
            exact
            path="/admin/banner-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <BannerManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/banner-management/add"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <BannerForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/banner-management/edit/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <BannerForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/policy-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <PolicyManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/policy-management/edit"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <PolicyForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/account-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <AccountManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/admin/send-email/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_ADMIN"]}
              >
                <SendEmail
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          {/* RENTALER */}
          <Route
            exact
            path="/rentaler/change-password"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ChangePassword
                  authenticated={authenticated}
                  exit={exitLogoutChangePassword}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/profile"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ProfileRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  loadCurrentUser={loadCurrentUser}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <DashboardRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/chat"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <Chat
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/add-room"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <AddRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/edit-room/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <EditRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/add-contract"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <AddContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="rentaler/electric_water/add"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <AddElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/edit-contract/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <EditContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/add-maintenance"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <AddMaintence
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/edit-maintenance/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <EditMaintenance
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/contract-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ContractManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/room-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <RoomManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/maintenance-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <MaintenceManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/request-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <RequierManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/export-bill/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ExportBillRequier
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/check-in-out-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <CheckInOutManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/export-contract/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ExportCheckoutRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/electric_water-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <ElectricAndWaterManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/leave-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <LeaveRequestManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/checkout-request-management"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <CheckoutRequestManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route
            exact
            path="/rentaler/electric_water/edit/:id"
            element={
              <PrivateRoute
                authenticated={authenticated}
                role={role}
                allowedRoles={["ROLE_RENTALER", "ROLE_ADMIN"]}
              >
                <EditElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              </PrivateRoute>
            }
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route
            exact
            path="/check-in-out"
            element={<CheckInOut currentUser={currentUser} />}
          />
          <Route
            exact
            path="/face-registration"
            element={<FaceRegistration currentUser={currentUser} />}
          />
          <Route
            exact
            path="/electric-water-user"
            element={
              <ElectricAndWaterUserPage
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            exact
            path="/check-in-out-history"
            element={
              <CheckInOutHistory
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {authenticated &&
          currentUser &&
          !currentUser.faceVector &&
          currentUser.allocatedRoomId != null &&
          window.location.pathname !== "/face-registration" && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(255,255,255,0.98)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "#333",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                style={{ maxWidth: "800px", width: "100%", padding: "20px" }}
              >
                <FaceRegistration currentUser={currentUser} />
              </div>
            </div>
          )}
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
