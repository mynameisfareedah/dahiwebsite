export const REGISTRATION_STATUS = {
  OPEN: 'open',
  COMING_SOON: 'coming_soon',
  CLOSED: 'closed',
};

export function resolveRegistrationState(event, defaultOpenLabel = 'Register Now') {
  const registrationUrl =
    event?.registrationUrl ||
    event?.registration_url ||
    '';
  const registrationButtonText =
    event?.registrationButtonText ||
    event?.registration_button_text ||
    defaultOpenLabel;

  const rawEnabled = event?.registrationEnabled ?? event?.registration_enabled;
  const registrationEnabled = rawEnabled == null ? true : Boolean(rawEnabled);

  const registrationStatus =
    event?.registrationStatus ||
    event?.registration_status ||
    REGISTRATION_STATUS.OPEN;

  if (!registrationEnabled || registrationStatus === REGISTRATION_STATUS.CLOSED) {
    return {
      enabled: false,
      status: REGISTRATION_STATUS.CLOSED,
      label: 'Registration Closed',
      href: null,
    };
  }

  if (registrationStatus === REGISTRATION_STATUS.COMING_SOON) {
    return {
      enabled: false,
      status: REGISTRATION_STATUS.COMING_SOON,
      label: 'Registration Opens Soon',
      href: null,
    };
  }

  if (registrationStatus === REGISTRATION_STATUS.OPEN && registrationUrl) {
    return {
      enabled: true,
      status: REGISTRATION_STATUS.OPEN,
      label: registrationButtonText || defaultOpenLabel,
      href: registrationUrl,
    };
  }

  return {
    enabled: false,
    status: REGISTRATION_STATUS.COMING_SOON,
    label: 'Registration Opens Soon',
    href: null,
  };
}
