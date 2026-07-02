import { Component, lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { OnboardingPage } from './routes/senior/OnboardingPage';
import { SplashPage } from './routes/SplashPage';
import { Loading } from './components/ui';

const AddPrescriptionPage = lazy(() =>
  import('./routes/caregiver/AddPrescriptionPage').then((module) => ({ default: module.AddPrescriptionPage })),
);
const CaregiverDashboardPage = lazy(() =>
  import('./routes/caregiver/CaregiverDashboardPage').then((module) => ({ default: module.CaregiverDashboardPage })),
);
const CaregiverNotifyPage = lazy(() =>
  import('./routes/caregiver/CaregiverNotifyPage').then((module) => ({ default: module.CaregiverNotifyPage })),
);
const CaregiverSignupPage = lazy(() =>
  import('./routes/caregiver/CaregiverSignupPage').then((module) => ({ default: module.CaregiverSignupPage })),
);
const ManagePage = lazy(() =>
  import('./routes/caregiver/ManagePage').then((module) => ({ default: module.ManagePage })),
);
const PhotoGalleryPage = lazy(() =>
  import('./routes/caregiver/PhotoGalleryPage').then((module) => ({ default: module.PhotoGalleryPage })),
);
const PillDetailPage = lazy(() =>
  import('./routes/caregiver/PillDetailPage').then((module) => ({ default: module.PillDetailPage })),
);
const SettingsPage = lazy(() =>
  import('./routes/caregiver/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const TimelinePage = lazy(() =>
  import('./routes/caregiver/TimelinePage').then((module) => ({ default: module.TimelinePage })),
);
const SeniorAddPrescriptionPage = lazy(() =>
  import('./routes/senior/AddPrescriptionPage').then((module) => ({ default: module.SeniorAddPrescriptionPage })),
);
const AlertsPage = lazy(() => import('./routes/senior/AlertsPage').then((module) => ({ default: module.AlertsPage })));
const CameraPage = lazy(() => import('./routes/senior/CameraPage').then((module) => ({ default: module.CameraPage })));
const ConnectedPage = lazy(() =>
  import('./routes/senior/ConnectedPage').then((module) => ({ default: module.ConnectedPage })),
);
const DonePage = lazy(() => import('./routes/senior/DonePage').then((module) => ({ default: module.DonePage })));
const DosePage = lazy(() => import('./routes/senior/DosePage').then((module) => ({ default: module.DosePage })));
const LoginPage = lazy(() => import('./routes/senior/LoginPage').then((module) => ({ default: module.LoginPage })));
const NotifyPage = lazy(() => import('./routes/senior/NotifyPage').then((module) => ({ default: module.NotifyPage })));
const RegisterPage = lazy(() =>
  import('./routes/senior/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const SeniorHomePage = lazy(() =>
  import('./routes/senior/SeniorHomePage').then((module) => ({ default: module.SeniorHomePage })),
);

type RouteErrorBoundaryProps = {
  children: ReactNode;
};

type RouteErrorBoundaryState = {
  failed: boolean;
};

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { failed: true };
  }

  reload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <h1 className="text-xl font-extrabold text-ink">화면을 불러오지 못했어요</h1>
          <p className="text-base font-medium text-ink-soft">앱을 다시 불러오면 최신 화면으로 이어갈 수 있어요.</p>
          <button
            type="button"
            onClick={this.reload}
            className="rounded-2xl bg-brand-600 px-5 py-3 text-base font-bold text-white"
          >
            앱 다시 불러오기
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function routeElement(children: ReactNode) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<Loading label="화면을 불러오는 중…" />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<SplashPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="login" element={routeElement(<LoginPage />)} />
        <Route path="senior" element={<Navigate to="/senior/today" replace />} />
        <Route path="senior/today" element={routeElement(<SeniorHomePage />)} />
        <Route path="senior/register" element={routeElement(<RegisterPage />)} />
        <Route path="senior/connected" element={routeElement(<ConnectedPage />)} />
        <Route path="senior/add-prescription" element={routeElement(<SeniorAddPrescriptionPage />)} />
        <Route path="senior/dose" element={routeElement(<DosePage />)} />
        <Route path="senior/done" element={routeElement(<DonePage />)} />
        <Route path="senior/notify" element={routeElement(<NotifyPage />)} />
        <Route path="senior/alerts" element={routeElement(<AlertsPage />)} />
        <Route path="senior/alarm" element={<Navigate to="/senior/dose" replace />} />
        <Route path="senior/camera" element={routeElement(<CameraPage />)} />
        <Route path="caregiver" element={routeElement(<CaregiverDashboardPage />)} />
        <Route path="caregiver/notify" element={routeElement(<CaregiverNotifyPage />)} />
        <Route path="caregiver/signup" element={routeElement(<CaregiverSignupPage />)} />
        <Route path="caregiver/settings" element={routeElement(<SettingsPage />)} />
        <Route path="caregiver/pills" element={routeElement(<PillDetailPage />)} />
        <Route path="caregiver/photos" element={routeElement(<PhotoGalleryPage />)} />
        <Route path="caregiver/timeline" element={routeElement(<TimelinePage />)} />
        <Route path="caregiver/manage" element={routeElement(<ManagePage />)} />
        <Route path="caregiver/add-prescription" element={routeElement(<AddPrescriptionPage />)} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Route>
    </Routes>
  );
}
