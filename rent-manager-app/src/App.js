
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Main from "./page/user/Main";
import DashboardAdmin from "./page/admin/DashboardAdmin";
import RentalHome from "./page/user/RentalHome";
import RentailHomeDetail from "./page/user/RentailHomeDetail";
import About from "./page/user/About";
import Contact from "./page/user/Contact";
import Login from "./page/login/Login";
import { useState } from "react";
import { getCurrentAdmin, getCurrentRentaler, getCurrentUser } from "./services/fetch/ApiUtils";
import { ACCESS_TOKEN } from "./constants/Connect";
import LoadingIndicator from "./common/LoadingIndicator";
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Signup from "./page/signup/Signup";
import OAuth2RedirectHandler from './oauth2/OAuth2RedirectHandler';
import NotFound from './common/NotFound';
import DashboardRentaler from './page/rentaler/DashboardRentaler';
import LoginRentaler from './page/login/LoginRentaler';
import LoginAdmin from './page/login/LoginAdmin';
import SignupRentaler from './page/signup/SignupRentaler';
import ForgotPassword from './common/ForgotPassword';
import ResetPassword from './common/ResetPassword';
import SuccessConfirmed from './common/SuccessConfirmed';
import AddRoom from './page/rentaler/AddRoom';
import RoomManagement from './page/rentaler/RoomManagement';
import EditRoom from './page/rentaler/EditRoom';
import Profile from './page/user/Profile';
import Message from './page/messages/pages/Home'
import ContractManagement from './page/rentaler/ContractManagement';
import AddContract from './page/rentaler/AddContract';
import EditContract from './page/rentaler/EditContract';
import MaintenceManagement from './page/rentaler/MaintenceManagement';
import AddMaintence from './page/rentaler/AddMaintence';
import EditMaintenance from './page/rentaler/EditMaintence';
import RequierManagement from './page/rentaler/RequierManagement';
import ExportBillRequier from './page/rentaler/ExportBillRequier';
import ExportCheckoutRoom from './page/rentaler/ExportCheckoutRoom';
import ProfileRentaler from './page/rentaler/ProfileRentaler';
import ChangePassword from './page/rentaler/ChangePassword';
import RoomManagementAdmin from './page/admin/RoomManagerment';
import AccountManagement from './page/admin/AccountManagement';
import SendEmail from './page/admin/SendEmail';
import Chat from './page/rentaler/Chat';
import Authorization from './page/admin/Authorization';
import ChangePasswordOfUser from './page/user/ChangePassword';
import RoomHired from './page/user/RoomHired';
import AgentsGird from './page/user/AgentsGird';
import AgentSingle from './page/user/AgentSingle';
import SendRequest from './page/user/SendRequest';
import RequestManagement from './page/user/RequestManagement';
import Follow from './page/user/Follow';
import SaveBlog from './page/user/SaveBlog';
import ChatOfUser from './page/user/ChatOfUser';
import ElectricAndWaterManagement from './page/rentaler/ElectricAndWaterManagement';
import AddElectricAndWater from './page/rentaler/AddElectricAndWater';
import EditElectricAndWater from './page/rentaler/EditElectricAndWater';



function App() {

  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCurrentlyLoggedInUser = () => {
    getCurrentUser()
      .then(response => {
        setCurrentUser(response);
        setUsername(response.name);
        setRole(response.roles[0].name);
        setAuthenticated(true);
        setLoading(false);
        console.log(response)
        console.log({ authenticated, username, currentUser, role, loading });
      }).catch(error => {
        setLoading(false);
      });
  }

  const loadCurrentlyLoggedInRetanler = () => {
    getCurrentRentaler()
      .then(response => {
        setCurrentUser(response);
        setUsername(response.name);
        setRole(response.roles[0].name);
        setAuthenticated(true);
        setLoading(false);
        console.log({ authenticated, username, currentUser, role, loading });
      }).catch(error => {
        setLoading(false);
      });
  }

  const loadCurrentlyLoggedInAdmin = () => {
    getCurrentAdmin()
      .then(response => {
        setCurrentUser(response);
        setUsername(response.name);
        setRole(response.roles[0].name);
        setAuthenticated(true);
        setLoading(false);
        console.log({ authenticated, username, currentUser, role, loading });
      }).catch(error => {
        setLoading(false);
      });
  }

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
    toast.success("Bạn đăng xuất thành công!!!");
  }

  const exitLogoutChangePassword = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setAuthenticated(false);
    setCurrentUser(null);
  }

  useEffect(() => {
    loadCurrentlyLoggedInUser();
    loadCurrentlyLoggedInRetanler();
    loadCurrentlyLoggedInAdmin();
  }, []);

  if (loading) {
    return <LoadingIndicator />
  }

  console.log({ authenticated, username, currentUser, role, loading });
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Main authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/rental-home" element={<RentalHome authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/rental-home/:id" element={<RentailHomeDetail authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/angent-gird" element={<AgentsGird authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/angent-single/:id" element={<AgentSingle authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/send-request/:id" element={<SendRequest authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/request-status" element={<RequestManagement authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/follow-agents" element={<Follow authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/save-blog" element={<SaveBlog authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/about-us" element={<About authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/contact" element={<Contact authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/forgot-password" element={<ForgotPassword authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/message" element={<ChatOfUser authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/room-hired" element={<RoomHired authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/reset-password/:email" element={<ResetPassword />} />
          <Route exact path="/success-comfirmed/:email" element={<SuccessConfirmed />} />
          <Route exact path="/profile" element={<Profile authenticated={authenticated} loadCurrentUser={loadCurrentlyLoggedInUser} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/change-password" element={<ChangePasswordOfUser authenticated={authenticated} currentUser={currentUser} onLogout={handleLogout} />} />
          <Route exact path="/login" element={<Login authenticated={authenticated} />} />
          <Route exact path="/login-rentaler" element={<LoginRentaler authenticated={authenticated} currentUser={currentUser} role={role} />} />
          <Route exact path="/login-admin" element={<LoginAdmin authenticated={authenticated} currentUser={currentUser} role={role} />} />
          <Route exact path="/signup" element={<Signup authenticated={authenticated} currentUser={currentUser} role={role} />} />
          <Route exact path="/signup-rentaler" element={<SignupRentaler authenticated={authenticated} />} />
          {/* ADMIN */}
          <Route exact path="/admin" element={<DashboardAdmin authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/admin/room-management" element={<RoomManagementAdmin authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/admin/authorization/:userId" element={<Authorization authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/admin/account-management" element={<AccountManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/admin/send-email/:id" element={<SendEmail authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          {/* RENTALER */}
          <Route exact path="/rentaler/change-password" element={<ChangePassword authenticated={authenticated} exit={exitLogoutChangePassword} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/profile" element={<ProfileRentaler authenticated={authenticated} currentUser={currentUser} role={role} loadCurrentUser={loadCurrentlyLoggedInRetanler} onLogout={handleLogout} />} />
          <Route exact path="/rentaler" element={<DashboardRentaler authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/chat" element={<Chat authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/add-room" element={<AddRoom authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/edit-room/:id" element={<EditRoom authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/add-contract" element={<AddContract authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="rentaler/electric_water/add" element={<AddElectricAndWater authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/edit-contract/:id" element={<EditContract authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/add-maintenance" element={<AddMaintence authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/edit-maintenance/:id" element={<EditMaintenance authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/contract-management" element={<ContractManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/room-management" element={<RoomManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/maintenance-management" element={<MaintenceManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/request-management" element={<RequierManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/export-bill/:id" element={<ExportBillRequier authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/export-contract/:id" element={<ExportCheckoutRoom authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/electric_water-management" element={<ElectricAndWaterManagement authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route exact path="/rentaler/electric_water/edit/:id" element={<EditElectricAndWater authenticated={authenticated} currentUser={currentUser} role={role} onLogout={handleLogout} />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        </Routes>
        <Routes>
          <Route path="*" exact={true} component={NotFound} />
        </Routes>
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
