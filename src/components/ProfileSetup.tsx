import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm, { type ProfileFormData } from "@/components/ProfileForm";
import { useDb } from "@/db/provider";
import { createProfile } from "@/db/operations/profile";

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { t, i18n } = useTranslation();
  const { db, persist } = useDb();

  const handleSubmit = async (data: ProfileFormData) => {
    if (!db) return;

    createProfile(db, {
      display_name: data.display_name || null,
      birth_year: data.birth_year ? parseInt(data.birth_year) : null,
      climbing_since: data.climbing_since ? parseInt(data.climbing_since) : null,
      current_lead_grade_system: data.current_lead_grade_system || null,
      current_lead_grade_value: data.current_lead_grade_value || null,
      current_boulder_grade_system: data.current_boulder_grade_system || null,
      current_boulder_grade_value: data.current_boulder_grade_value || null,
      goal_grade_system: data.goal_grade_system || null,
      goal_grade_value: data.goal_grade_value || null,
      other_activities: data.other_activities || null,
      known_injuries: data.known_injuries || null,
      locale: data.locale,
    });

    await persist();
    i18n.changeLanguage(data.locale);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{t("profile.setup")}</CardTitle>
          <CardDescription>{t("profile.setupDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm onSubmit={handleSubmit} submitLabel={t("common.confirm")} />
        </CardContent>
      </Card>
    </div>
  );
}
