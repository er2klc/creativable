import SmtpSettingsSimplified from "./SmtpSettingsSimplified";

export function SmtpSettings({ onSettingsSaved }: { onSettingsSaved?: () => void }) {
  return <SmtpSettingsSimplified />;
}