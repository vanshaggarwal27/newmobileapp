import MobileShell from "@/components/layout/MobileShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UsersRound, Shield, ScrollText, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function More() {
  return (
    <MobileShell>
      <h1 className="text-2xl font-bold mb-4">More</h1>

      <div className="rounded-xl border bg-card">
        <Accordion type="single" collapsible className="divide-y">
          <Section id="about" icon={<UsersRound className="size-5 text-primary" />} title="About Us">
            <p className="text-sm text-muted-foreground">
              We help communities report local issues quickly and get them in front of the right
              organisations to fix. Share a Snap, choose a category, and we route it to the best
              Solver nearby.
            </p>
          </Section>

          <Section id="privacy" icon={<Shield className="size-5 text-primary" />} title="Privacy Policy">
            <p className="text-sm text-muted-foreground">
              Your personal details are kept private and only shared with the selected Solver to
              progress your report. We never sell your data. Read how we collect, use and store
              information below.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Only essential details are requested for contacting you about a report.</li>
              <li>Location is opt-in and used to improve accuracy.</li>
              <li>You can request deletion of your account and data at any time.</li>
            </ul>
          </Section>

          <Section id="terms" icon={<ScrollText className="size-5 text-primary" />} title="Terms of Use">
            <p className="text-sm text-muted-foreground">
              By using the app you agree to submit respectful, lawful content and avoid sharing
              personal or sensitive information of others. Abuse, spam or illegal activity is not
              permitted.
            </p>
          </Section>

          <Section id="support" icon={<LifeBuoy className="size-5 text-primary" />} title="Customer Support">
            <SupportForm />
          </Section>
        </Accordion>
      </div>

      <p className="text-xs text-muted-foreground mt-6">Version 1.0.0</p>
    </MobileShell>
  );
}

function Section({ id, icon, title, children }: { id: string; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={id} className="px-3">
      <AccordionTrigger className="py-4">
        <div className="flex items-center gap-3">
          <span className="inline-grid size-8 place-items-center rounded-full bg-secondary">{icon}</span>
          <span className="text-base font-medium">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-5">
        <div className="px-2">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

function SupportForm() {
  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = Object.fromEntries(data.entries());
    console.log("Support request", payload);
    alert("Thanks! We\'ll be in touch shortly.");
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="name">Name</label>
        <input id="name" name="name" required className="h-11 rounded-md border px-3" placeholder="Your name" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="h-11 rounded-md border px-3" placeholder="you@example.com" />
      </div>
      <div className="grid gap-1">
        <label className="text-sm font-medium" htmlFor="message">Message</label>
        <textarea id="message" name="message" required rows={4} className="rounded-md border px-3 py-2" placeholder="How can we help?" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" className="rounded-full">Send</Button>
        <a className="text-sm underline" href="mailto:support@example.com">Email support</a>
      </div>
    </form>
  );
}
