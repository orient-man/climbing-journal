import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileForm, { type ProfileFormData } from "@/components/ProfileForm";
import { useDb } from "@/db/provider";
import { getProfile, updateProfile } from "@/db/operations/profile";
import { toast } from "@/components/ui/use-toast";
import { downloadDatabase, importDatabase } from "@/db/export-import";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { saveToStorage } from "@/db/persistence";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Upload } from "lucide-react";

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { db, persist } = useDb();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  if (!db) return null;

  const profile = getProfile(db);
  if (!profile) return null;

  const initial: Partial<ProfileFormData> = {
    display_name: profile.display_name ?? "",
    birth_year: profile.birth_year?.toString() ?? "",
    climbing_since: profile.climbing_since?.toString() ?? "",
    current_lead_grade_system: profile.current_lead_grade_system ?? "",
    current_lead_grade_value: profile.current_lead_grade_value ?? "",
    current_boulder_grade_system: profile.current_boulder_grade_system ?? "",
    current_boulder_grade_value: profile.current_boulder_grade_value ?? "",
    goal_grade_system: profile.goal_grade_system ?? "",
    goal_grade_value: profile.goal_grade_value ?? "",
    other_activities: profile.other_activities ?? "",
    known_injuries: profile.known_injuries ?? "",
    locale: profile.locale,
  };

  const handleSubmit = async (data: ProfileFormData) => {
    updateProfile(db, {
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
    toast({ title: t("common.save"), description: t("profile.title") });
  };

  const handleExport = () => {
    downloadDatabase(db);
    toast({ title: t("data.exportSuccess") });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportDialogOpen(true);
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!pendingFile) return;
    try {
      const newDb = await importDatabase(pendingFile);
      const data = newDb.export();
      await saveToStorage(data);
      newDb.close();
      setImportDialogOpen(false);
      setPendingFile(null);
      window.location.reload();
    } catch {
      toast({ title: t("data.importError"), variant: "destructive" });
      setImportDialogOpen(false);
      setPendingFile(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm initial={initial} onSubmit={handleSubmit} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("data.export")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t("data.export")}
          </Button>

          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("data.import")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("data.import")}</DialogTitle>
                <DialogDescription>{t("data.importConfirm")}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportDialogOpen(false);
                    setPendingFile(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button variant="destructive" onClick={handleImportConfirm}>
                  {t("common.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <input
            ref={fileInputRef}
            type="file"
            accept=".sqlite,.db"
            className="hidden"
            onChange={handleFileSelect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
