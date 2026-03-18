import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDb } from "@/db/provider";
import {
  createLocation,
  listLocations,
  updateLocation,
  deleteLocation,
  isLocationInUse,
  type Location,
} from "@/db/operations/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";

interface LocationFormData {
  name: string;
  type: "gym" | "crag";
  region: string;
}

const EMPTY_FORM: LocationFormData = { name: "", type: "gym", region: "" };

export default function LocationsPage() {
  const { t } = useTranslation();
  const { db, persist } = useDb();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<LocationFormData>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [, setRefresh] = useState(0);

  const forceRefresh = useCallback(() => setRefresh((n) => n + 1), []);

  if (!db) return null;

  const locations = listLocations(db);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditingId(loc.id);
    setForm({ name: loc.name, type: loc.type, region: loc.region ?? "" });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    if (editingId) {
      updateLocation(db, editingId, {
        name: form.name.trim(),
        type: form.type,
        region: form.region.trim() || null,
      });
    } else {
      createLocation(db, {
        name: form.name.trim(),
        type: form.type,
        region: form.region.trim() || undefined,
      });
    }

    await persist();
    setFormOpen(false);
    forceRefresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (isLocationInUse(db, deleteTarget.id)) {
      toast({
        title: t("location.inUse"),
        variant: "destructive",
      });
      setDeleteTarget(null);
      return;
    }

    deleteLocation(db, deleteTarget.id);
    await persist();
    setDeleteTarget(null);
    forceRefresh();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("location.title")}</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {t("location.addNew")}
        </Button>
      </div>

      {locations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("location.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="font-medium">{loc.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {t(`location.types.${loc.type}`)}
                    {loc.region && ` · ${loc.region}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(loc)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(loc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("common.edit") : t("location.addNew")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("location.name")}</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder={t("location.name")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("location.type")}</Label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, type: v as "gym" | "crag" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gym">{t("location.types.gym")}</SelectItem>
                  <SelectItem value="crag">
                    {t("location.types.crag")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("location.region")}</Label>
              <Input
                value={form.region}
                onChange={(e) =>
                  setForm((f) => ({ ...f, region: e.target.value }))
                }
                placeholder={t("location.region")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("common.delete")}</DialogTitle>
            <DialogDescription>
              {t("location.deleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
