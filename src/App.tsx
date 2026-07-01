import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { CaregiverDashboardPage } from './routes/caregiver/CaregiverDashboardPage';
import { ManagePage } from './routes/caregiver/ManagePage';
import { PillDetailPage } from './routes/caregiver/PillDetailPage';
import { TimelinePage } from './routes/caregiver/TimelinePage';
import { AlarmPage } from './routes/senior/AlarmPage';
import { AlertsPage } from './routes/senior/AlertsPage';
import { CameraPage } from './routes/senior/CameraPage';
import { ConnectedPage } from './routes/senior/ConnectedPage';
import { DonePage } from './routes/senior/DonePage';
import { DosePage } from './routes/senior/DosePage';
import { LoginPage } from './routes/senior/LoginPage';
import { MedicationPhotoPage } from './routes/senior/MedicationPhotoPage';
import { OnboardingPage } from './routes/senior/OnboardingPage';
import { RegisterPage } from './routes/senior/RegisterPage';
import { SeniorHomePage } from './routes/senior/SeniorHomePage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/onboarding" replace />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="senior" element={<SeniorHomePage />} />
        <Route path="senior/register" element={<RegisterPage />} />
        <Route path="senior/connected" element={<ConnectedPage />} />
        <Route path="senior/dose" element={<DosePage />} />
        <Route path="senior/done" element={<DonePage />} />
        <Route path="senior/photo" element={<MedicationPhotoPage />} />
        <Route path="senior/alerts" element={<AlertsPage />} />
        <Route path="senior/login" element={<LoginPage />} />
        <Route path="senior/alarm" element={<AlarmPage />} />
        <Route path="senior/camera" element={<CameraPage />} />
        <Route path="caregiver" element={<CaregiverDashboardPage />} />
        <Route path="caregiver/pills" element={<PillDetailPage />} />
        <Route path="caregiver/timeline" element={<TimelinePage />} />
        <Route path="caregiver/manage" element={<ManagePage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Route>
    </Routes>
  );
}
