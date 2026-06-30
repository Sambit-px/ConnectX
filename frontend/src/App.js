import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import HomeComponent from './pages/home';
import History from './pages/history';
import withAuth from './utils/withAuth';

const ProtectedHome = withAuth(HomeComponent);
const ProtectedHistory = withAuth(History);
const ProtectedVideoMeet = withAuth(VideoMeetComponent);

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/home' element={<ProtectedHome />} />
            <Route path='/history' element={<ProtectedHistory />} />
            <Route path='/:url' element={<ProtectedVideoMeet />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;