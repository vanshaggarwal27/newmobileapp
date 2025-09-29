import MobileShell from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { snapsStore, SnapItem } from "@/data/snaps";
import { useLocationState } from "@/context/location";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function Repost() {
  const [params] = useSearchParams();
  const title = params.get("title") || "Report";
  const blurb = params.get("blurb") || "";
  const category = params.get("category") || "General";
  const navigate = useNavigate();
  const loc = useLocationState();
  const [preview, setPreview] = useState<string | undefined>();

  const onFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (!preview) { alert("Please add a photo"); return; }
    const item: SnapItem = {
      id: crypto.randomUUID(),
      title,
      category,
      description: blurb,
      createdAt: Date.now(),
      status: "submitted",
      location: loc.cityLine || (loc.coords ? `${loc.coords.lat.toFixed(3)}, ${loc.coords.lon.toFixed(3)}` : undefined),
      image: preview,
      repostOf: { title, blurb },
    };
    snapsStore.add(item);
    navigate("/snaps");
  };

  return (
    <MobileShell>
      <h1 className="mb-3 text-2xl font-bold">Repost snap</h1>
      <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Original</p>
        <p>{title}</p>
        {blurb && <p className="mt-1">{blurb}</p>}
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Add your photo</label>
          <input type="file" accept="image/*" capture="environment" onChange={onFile} className="rounded-md border p-2" />
          {preview && (
            <div className="overflow-hidden rounded-xl">
              <img src={preview} alt="Preview" className="aspect-[16/9] w-full object-cover" />
            </div>
          )}
        </div>
        <Button type="submit" className="h-11 rounded-full">Repost</Button>
      </form>
    </MobileShell>
  );
}
