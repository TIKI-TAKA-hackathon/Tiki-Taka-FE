import { Navigate, Route, Routes } from 'react-router-dom';
import { PhoneShell } from './components/PhoneShell';
import { CaregiverDashboardPage } from './routes/caregiver/CaregiverDashboardPage';
import { ConnectedPage } from './routes/senior/ConnectedPage';
import { DonePage } from './routes/senior/DonePage';
import { DosePage } from './routes/senior/DosePage';
import { OnboardingPage } from './routes/senior/OnboardingPage';
import { RegisterPage } from './routes/senior/RegisterPage';
import { SeniorHomePage } from './routes/senior/SeniorHomePage';

export default function App() {
  return (
    <Routes>
      <Route element={<PhoneShell />}>
        <Route index element={<Navigate to="/onboarding" replace />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="senior" element={<SeniorHomePage />} />
        <Route path="senior/register" element={<RegisterPage />} />
        <Route path="senior/connected" element={<ConnectedPage />} />
        <Route path="senior/dose" element={<DosePage />} />
        <Route path="senior/done" element={<DonePage />} />
        <Route path="caregiver" element={<CaregiverDashboardPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Route>
    </Routes>
  );
}
