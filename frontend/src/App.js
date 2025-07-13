import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Login from "./components/LoginPage";
import FeedPage from "./components/FeedPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import MyProfilePage from "./components/ProfilePage";
import SignUp from "./components/SignupPage";
import LogoPage from "./components/LogoPage";
import HomePage from "./components/homepage";
import NotificationListener from "./components/notificationlistener";
import DriverRegistration from "./components/DriverRegistration";

import ScheduleTrip from "./components/scheduletrip";
import JoinTrip from "./components/jointrip";
import AllVehiclesPage from "./components/Allvehicles";
import AllUsersPage from "./components/AllUsers";
import AllScheduledTripsPage from "./components/AllScheduledTrips";
import Recenttrips from "./components/TripsHistoryPage";
import RatingsOverviewPage from "./components/RatingsPage";
import Friendgroups from "./components/FriendsGroupsPage";
import Updateprofile from "./components/EditProfilePage";
import SettingsPage from "./components/ProfileSettings";
import RatingsPage from "./components/RatingsPage2";
import TripInfo from "./components/tripinfo"; // <--- added TripInfo import
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <>
        <ToastContainer position="bottom-right" autoClose={4000} theme="colored" />
        <NotificationListener />

        <Routes>
          <Route path="/" element={<LogoPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/register-driver" element={<DriverRegistration />} />
        
          <Route path="/alltrips" element={<AllScheduledTripsPage />} />
          <Route path="/view-all-vehicles" element={<AllVehiclesPage />} />
          <Route path="/allusers" element={<AllUsersPage />} />
          <Route path="/Settings-see" element={<SettingsPage />} />
          <Route path="/my-ratings" element={<RatingsOverviewPage />} />
          <Route path="/my-trips" element={<Recenttrips />} />
          <Route path="/my-FriendGroups" element={<Friendgroups />} />
          <Route path="/Edit-My-Profile" element={<Updateprofile />} />
          <Route path="/rate/:tripId/:driverId" element={<RatingsPage />} />
          <Route path="/scheduletrip" element={<ScheduleTrip />} />
          <Route path="/jointrip" element={<JoinTrip />} />
          <Route path="/tripinfo" element={<TripInfo />} /> {/* <-- added TripInfo route */}
          <Route path="*" element={<Login />} />
        </Routes>
      </>
    </Router>
  );
}

export default App;
