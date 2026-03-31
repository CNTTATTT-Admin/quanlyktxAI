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
import RegisterParkingCard from "./page/user/RegisterParkingCard";
import ParkingCardHistory from "./page/user/ParkingCardHistory";
import VNPayReturn from "./page/user/VNPayReturn";
import LeaveRequestManagement from "./page/rentaler/LeaveRequestManagement";
import CheckoutRequestManagement from "./page/rentaler/CheckoutRequestManagement";
import CheckInOutManagement from "./page/rentaler/CheckInOutManagement";
import ParkingCardManagement from "./page/rentaler/ParkingCardManagement";
import ParkingPackageManagement from "./page/rentaler/ParkingPackageManagement";
import InvoiceManagement from "./page/rentaler/InvoiceManagement";
import BannerManagement from "./page/admin/BannerManagement";
import BannerForm from "./page/admin/BannerForm";
import PolicyManagement from "./page/admin/PolicyManagement";
import PolicyForm from "./page/admin/PolicyForm";
import PolicyView from "./page/user/PolicyView";
import ChatWidget from "./common/ChatWidget";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import RentalerLayout from "./layouts/RentalerLayout";

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
          {/* LOGIN & AUTH ROUTES - No Layout */}
          <Route
            path="/login"
            element={
              <Login
                authenticated={authenticated}
                currentUser={currentUser}
                role={role}
              />
            }
          />
          <Route
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
            path="/signup-rentaler"
            element={<SignupRentaler authenticated={authenticated} />}
          />
          <Route
            path="/forgot-password"
            element={
              <ForgotPassword
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          />
          <Route path="/reset-password/:email" element={<ResetPassword />} />
          <Route
            path="/success-comfirmed/:email"
            element={<SuccessConfirmed />}
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* USER ROUTES */}
          <Route
            element={
              <UserLayout
                authenticated={authenticated}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              index
              element={
                <Main
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="rental-home"
              element={
                <RentalHome
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="rental-home/:id"
              element={
                <RentailHomeDetail
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="angent-gird"
              element={
                <AgentsGird
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="angent-single/:id"
              element={
                <AgentSingle
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="send-request/:id"
              element={
                <SendRequest
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="follow-agents"
              element={
                <Follow
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="save-blog"
              element={
                <SaveBlog
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="about-us"
              element={
                <About
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="contact"
              element={
                <Contact
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="policy"
              element={
                <PolicyView
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="message"
              element={
                <ChatOfUser
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="room-hired"
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
              path="leave-request"
              element={
                <LeaveRequestForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="maintenance"
              element={
                <MaintenanceUserPage
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="profile"
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
              path="change-password"
              element={
                <ChangePasswordOfUser
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="check-in-out"
              element={<CheckInOut currentUser={currentUser} />}
            />
            <Route
              path="register-parking-card"
              element={
                <RegisterParkingCard 
                  authenticated={authenticated} 
                  currentUser={currentUser}
                  onLogout={handleLogout} 
                />
              }
            />
            <Route
              path="parking-card-history"
              element={
                <ParkingCardHistory
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="face-registration"
              element={<FaceRegistration currentUser={currentUser} />}
            />
            <Route
              path="electric-water-user"
              element={
                <ElectricAndWaterUserPage
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="check-in-out-history"
              element={
                <CheckInOutHistory
                  authenticated={authenticated}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route path="/vnpay-return" element={<VNPayReturn />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <AdminLayout
                authenticated={authenticated}
                role={role}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              index
              element={
                <DashboardAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="room-management"
              element={
                <RoomManagementAdmin
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="authorization/:userId"
              element={
                <Authorization
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="banner-management"
              element={
                <BannerManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="banner-management/add"
              element={
                <BannerForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="banner-management/edit/:id"
              element={
                <BannerForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="policy-management"
              element={
                <PolicyManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="policy-management/edit"
              element={
                <PolicyForm
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="account-management"
              element={
                <AccountManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="send-email/:id"
              element={
                <SendEmail
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
          </Route>

          {/* RENTALER ROUTES */}
          <Route
            path="/rentaler"
            element={
              <RentalerLayout
                authenticated={authenticated}
                role={role}
                currentUser={currentUser}
                onLogout={handleLogout}
              />
            }
          >
            <Route
              index
              element={
                <DashboardRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="change-password"
              element={
                <ChangePassword
                  authenticated={authenticated}
                  exit={exitLogoutChangePassword}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="profile"
              element={
                <ProfileRentaler
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  loadCurrentUser={loadCurrentUser}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="chat"
              element={
                <Chat
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="add-room"
              element={
                <AddRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="edit-room/:id"
              element={
                <EditRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="add-contract"
              element={
                <AddContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="electric_water/add"
              element={
                <AddElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="edit-contract/:id"
              element={
                <EditContract
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="add-maintenance"
              element={
                <AddMaintence
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="edit-maintenance/:id"
              element={
                <EditMaintenance
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="contract-management"
              element={
                <ContractManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="room-management"
              element={
                <RoomManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="maintenance-management"
              element={
                <MaintenceManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="request-management"
              element={
                <RequierManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="parking-card-management"
              element={
                <ParkingCardManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="parking-package-management"
              element={
                <ParkingPackageManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="invoice-management"
              element={
                <InvoiceManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="export-bill/:id"
              element={
                <ExportBillRequier
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="check-in-out-management"
              element={
                <CheckInOutManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="export-contract/:id"
              element={
                <ExportCheckoutRoom
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="electric_water-management"
              element={
                <ElectricAndWaterManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="leave-management"
              element={
                <LeaveRequestManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="checkout-request-management"
              element={
                <CheckoutRequestManagement
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="electric_water/edit/:id"
              element={
                <EditElectricAndWater
                  authenticated={authenticated}
                  currentUser={currentUser}
                  role={role}
                  onLogout={handleLogout}
                />
              }
            />
          </Route>

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
