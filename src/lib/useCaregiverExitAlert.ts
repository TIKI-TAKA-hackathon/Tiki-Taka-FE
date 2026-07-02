import { useEffect, useRef } from 'react';
import { pushCaregiverAlert } from './caregiverAlerts';

type ExitAlert = {
  id: string;
  title: string;
  body: string;
};

export function useCaregiverExitAlert(enabled: boolean, alert: ExitAlert): void {
  const { body, id, title } = alert;
  const enabledRef = useRef(enabled);
  const alertRef = useRef(alert);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    alertRef.current = { body, id, title };
  }, [body, id, title]);

  useEffect(() => {
    let sent = false;

    function send() {
      if (!enabledRef.current || sent) {
        return;
      }
      sent = true;
      pushCaregiverAlert(alertRef.current);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        send();
      }
    }

    window.addEventListener('blur', send);
    window.addEventListener('pagehide', send);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('blur', send);
      window.removeEventListener('pagehide', send);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);
}
