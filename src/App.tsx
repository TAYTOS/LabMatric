import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useIsPresent } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import { ToastProvider } from './contexts/ToastContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { RequireAdmin, RequireAuth, RootRedirect } from './components/layout/RouteGuards';

import { Onboarding } from './pages/Onboarding';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { CourseDetails } from './pages/CourseDetails';
import { LabGroupDetails } from './pages/LabGroupDetails';
import { MyEnrollments } from './pages/MyEnrollments';
import { EnrollmentDetails } from './pages/EnrollmentDetails';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { AdminDashboard } from './pages/AdminDashboard';
import { WeeklySchedule } from './pages/WeeklySchedule';
import { CompareGroups } from './pages/CompareGroups';
import { SavedGroups } from './pages/SavedGroups';

export function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <AuthProvider>
          <EnrollmentProvider>
            <ToastProvider>
              <AnimatedRoutes />
            </ToastProvider>
          </EnrollmentProvider>
        </AuthProvider>
      </PreferencesProvider>
    </BrowserRouter>);
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <RouteTransition key={location.pathname}>
        <Routes location={location}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/cursos" element={<RequireAuth><Courses /></RequireAuth>} />
               <Route path="/cursos/:courseId" element={<RequireAuth><CourseDetails /></RequireAuth>} />
               <Route path="/cursos/:courseId/comparar" element={<RequireAuth><CompareGroups /></RequireAuth>} />
               <Route path="/cursos/:courseId/grupos/:groupId" element={<RequireAuth><LabGroupDetails /></RequireAuth>} />
               <Route path="/matriculas" element={<RequireAuth><MyEnrollments /></RequireAuth>} />
               <Route path="/matriculas/:enrollmentId" element={<RequireAuth><EnrollmentDetails /></RequireAuth>} />
               <Route path="/calendario" element={<RequireAuth><WeeklySchedule /></RequireAuth>} />
               <Route path="/guardados" element={<RequireAuth><SavedGroups /></RequireAuth>} />
              <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/notificaciones" element={<RequireAuth><Notifications /></RequireAuth>} />

              <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

              <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteTransition>
    </AnimatePresence>
  );
}

function RouteTransition({ children }: { children: React.ReactNode }) {
  const isPresent = useIsPresent();
  return <motion.div
    aria-hidden={!isPresent}
    style={!isPresent ? { pointerEvents: 'none' } : undefined}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}>
    {children}
  </motion.div>;
}
