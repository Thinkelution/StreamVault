import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Feeds from './pages/Feeds';
import FeedBuilder from './pages/FeedBuilder';
import Playlists from './pages/Playlists';
import Categories from './pages/Categories';
import Tags from './pages/Tags';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="videos" element={<Videos />} />
          <Route path="videos/:id" element={<VideoDetail />} />
          <Route path="upload" element={<Upload />} />
          <Route path="feeds" element={<Feeds />} />
          <Route path="feeds/new" element={<FeedBuilder />} />
          <Route path="feeds/:id" element={<FeedBuilder />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="audit-log" element={<AuditLog />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
