import MobileShell from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState, useEffect, useMemo } from "react";
import {
  Camera,
  Mic,
  Square,
  Trash2,
  Check,
  Wand2,
  Loader2,
} from "lucide-react";
import { snapsStore } from "@/data/snaps";
import { useNavigate } from "react-router-dom";
import { useLocationState } from "@/context/location";
import type { AiDescribeRequest, AiDescribeResponse } from "@shared/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { db, storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { userStore } from "@/data/user";

export default function Snap() {
  const fileInputCam = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<string[]>([]);
  const [audioDataUrl, setAudioDataUrl] = useState<string | undefined>();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordMs, setRecordMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [description, setDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDisabled, setAiDisabled] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const loc = useLocationState();

  const MAX_IMAGES = 5;

  useEffect(() => {
    if (!loc.live && !loc.cityLine) loc.startLive();
  }, [loc]);

  // Auto-AI when media changes and user hasn't typed yet
  useEffect(() => {
    if ((images.length > 0 || audioDataUrl) && !dirty && !aiDisabled) {
      void runAI("Auto-filled from media");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, audioDataUrl, aiDisabled]);

  const hasMedia = images.length > 0 || !!audioDataUrl;

  function onPickCamera() {
    fileInputCam.current?.click();
  }

  function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = Math.max(0, MAX_IMAGES - images.length);
    const slice = files.slice(0, remaining);
    if (files.length > remaining) {
      toast({
        title: `Maximum ${MAX_IMAGES} images`,
        description: `Only the first ${slice.length} image(s) were added.`,
      });
    }
    const dataUrls = await Promise.all(slice.map((f) => readFileAsDataUrl(f)));
    setImages((prev) => [...prev, ...dataUrls]);
    e.currentTarget.value = "";
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : undefined;
      const mr = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: mime ?? "audio/webm" });
        const file = new File([blob], "voice-note.webm", {
          type: mime ?? "audio/webm",
        });
        const dataUrl = await readFileAsDataUrl(file);
        setAudioDataUrl(dataUrl);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecording(false);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordMs(0);
      timerRef.current = window.setInterval(
        () => setRecordMs((ms) => ms + 100),
        100,
      ) as unknown as number;
    } catch (err) {
      toast({
        title: "Microphone blocked",
        description: "Please allow mic access to record a voice note.",
      });
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }

  async function runAI(hint?: string) {
    try {
      if (!hasMedia) return;
      setAiLoading(true);
      setAiError(null);
      const payload: AiDescribeRequest = {
        imageDataUrls: images,
        audioDataUrl,
        hint,
      };
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data?.error || `AI error (${res.status})`;
        setAiError(msg);
        if (res.status === 501) {
          setAiDisabled(true);
        }
        if (!aiDisabled) {
          toast({ title: "AI unavailable", description: msg });
        }
        setAiLoading(false);
        return;
      }
      const data = (await res.json()) as AiDescribeResponse;
      setDescription(data.description);
      setDirty(false);
      setAiLoading(false);
    } catch (err: any) {
      setAiError(String(err?.message ?? err));
      setAiLoading(false);
    }
  }

  async function onSubmit() {
    if (submitting) return;
    if (!hasMedia && !description.trim()) {
      toast({
        title: "Add details",
        description:
          "Add at least one photo/voice note or type a short description.",
      });
      return;
    }
    const title = description
      ? `${description.substring(0, 40)}${description.length > 40 ? "…" : ""}`
      : "New Snap";
    const id = crypto.randomUUID();

    // Save locally (for offline UX)
    snapsStore.add({
      id,
      title,
      category: "General",
      description,
      createdAt: Date.now(),
      status: "submitted",
      location: loc.cityLine || "Near you",
      image: images[0],
    });

    // Upload media to Firebase Storage and create complaint document
    try {
      setSubmitting(true);

      // Upload all images
      const imageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const imgRef = ref(storage, `complaints/${id}/image_${i}`);
        await uploadString(imgRef, images[i], "data_url");
        const url = await getDownloadURL(imgRef);
        imageUrls.push(url);
      }

      // Upload audio if present
      let audioUrl: string | null = null;
      if (audioDataUrl) {
        const audioRef = ref(storage, `complaints/${id}/voice_note`);
        await uploadString(audioRef, audioDataUrl, "data_url");
        audioUrl = await getDownloadURL(audioRef);
      }

      // Build fixed-length media_files array: up to 5 images + 1 audio
      const media_files: { type: string; url: string }[] = Array.from(
        { length: 6 },
        () => ({ type: "", url: "" }),
      );
      for (let i = 0; i < Math.min(imageUrls.length, 5); i++) {
        media_files[i] = { type: "image", url: imageUrls[i] };
      }
      if (audioUrl) {
        const idx = Math.min(imageUrls.length, 5); // place audio after images
        if (idx < 6) media_files[idx] = { type: "audio", url: audioUrl };
      }

      const u = userStore.get();
      const user_id = u?.id || "anonymous";
      const coords = loc.coords;
      const nowIso = new Date().toISOString();

      await setDoc(doc(db, "complaints", id), {
        complaint_id: id,
        user_id,
        title,
        description,
        category: "general",
        media_files,
        location: {
          lattitude: typeof coords?.lat === "number" ? coords.lat : 0,
          longitude: typeof coords?.lon === "number" ? coords.lon : 0,
        },
        status: "pending",
        priority: "medium",
        created_at: nowIso,
        updated_at: nowIso,
      });
      toast({ title: "Submitted", description: "Thank you for reporting." });
      navigate(`/submitted/${id}`);
      return;
    } catch (err) {
      // Non-blocking
    } finally {
      setSubmitting(false);
    }
  }

  const timeStr = useMemo(() => {
    const s = Math.floor(recordMs / 1000);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, "0")}`;
  }, [recordMs]);

  return (
    <MobileShell>
      <div className="space-y-4">
        <h1 className="mb-1 text-2xl font-bold">Snap</h1>

        {/* Primary camera control */}
        <div className="flex justify-center">
          <Button
            onClick={onPickCamera}
            className="h-24 w-24 rounded-full shadow-lg bg-primary text-primary-foreground active:scale-95"
          >
            <Camera className="size-9" />
          </Button>
        </div>
        <input
          ref={fileInputCam}
          onChange={onFileChange}
          type="file"
          accept="image/*;capture=camera"
          multiple
          capture="environment"
          className="hidden"
        />

        {/* Thumbnails row */}
        {images.length > 0 ? (
          <div className="-mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((src, idx) => (
                <div
                  key={idx}
                  className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border bg-card shadow-sm"
                >
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 rounded-md bg-background/80 px-1.5 py-0.5 text-xs shadow hover:bg-background"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Description with embedded mic and AI */}
        <div className="relative rounded-2xl border bg-card shadow-sm">
          <Textarea
            className={cn(
              "min-h-[140px] w-full resize-none rounded-2xl border-0 bg-transparent p-4 pr-24 shadow-none focus-visible:ring-0",
              aiLoading && "opacity-70",
            )}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="Describe the problem…"
            rows={6}
          />
          {/* Subtle spinner overlay when generating */}
          {aiLoading ? (
            <div className="pointer-events-none absolute bottom-3 right-20 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : null}
          {/* Controls: AI + Mic */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={aiLoading || !hasMedia || aiDisabled}
              onClick={() =>
                runAI("Generate a concise description from the media")
              }
              className="h-8 rounded-full px-2.5 text-xs shadow-sm"
              aria-label="AI Auto-fill"
            >
              <Wand2 className="mr-1 size-4" />
              Auto-fill
            </Button>
            {!recording ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={startRecording}
                className="rounded-full shadow-sm"
                aria-label="Record voice note"
              >
                <Mic />
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={stopRecording}
                className="rounded-full shadow-sm"
                aria-label="Stop recording"
              >
                <Square />
              </Button>
            )}
          </div>
        </div>

        <div className="pt-1">
          <Button
            className="w-full"
            onClick={onSubmit}
            disabled={(!hasMedia && !description.trim()) || submitting}
          >
            <Check className="mr-2" /> Submit
          </Button>
        </div>
      </div>
    </MobileShell>
  );
}
