import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useDb } from "@/db/provider";
import {
  createLocation,
  listLocations,
  type Location,
} from "@/db/operations/locations";

interface LocationSelectorProps {
  value: string;
  onChange: (locationId: string) => void;
}

export default function LocationSelector({
  value,
  onChange,
}: LocationSelectorProps) {
  const { t } = useTranslation();
  const { db, persist } = useDb();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"gym" | "crag">("gym");

  if (!db) return null;

  const locations: Location[] = listLocations(db);

  const handleQuickAdd = async () => {
    if (!newName.trim()) return;
    const id = createLocation(db, { name: newName.trim(), type: newType });
    await persist();
    onChange(String(id));
    setQuickAddOpen(false);
    setNewName("");
    setNewType("gym");
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("session.location")} />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setQuickAddOpen(true)}
        title={t("location.addNew")}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("location.addNew")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("location.name")}</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("location.name")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("location.type")}</Label>
              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as "gym" | "crag")}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickAddOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleQuickAdd}>{t("common.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
