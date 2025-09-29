import MobileShell from "@/components/layout/MobileShell";

export default function Placeholder({ title }: { title: string }) {
  return (
    <MobileShell>
      <div className="mx-auto max-w-sm text-center py-24">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">
          This page is ready to be filled. Tell me what to show here next and Ill build it.
        </p>
      </div>
    </MobileShell>
  );
}
