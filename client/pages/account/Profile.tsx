import MobileShell from "@/components/layout/MobileShell";
import { Button } from "@/components/ui/button";
import { userStore, UserProfile } from "@/data/user";

export default function Profile() {
  const user = userStore.get() || {};

  const submit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: UserProfile = {
      first: String(data.get("first") || ""),
      last: String(data.get("last") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
    };
    userStore.save(next);
    alert("Profile saved");
  };

  return (
    <MobileShell>
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field id="first" label="First name" defaultValue={user.first} />
          <Field id="last" label="Last name" defaultValue={user.last} />
        </div>
        <Field id="email" label="Email" type="email" defaultValue={user.email} />
        <Field id="phone" label="Mobile" defaultValue={user.phone} />
        <Button type="submit" className="h-11 rounded-full">Save</Button>
      </form>
    </MobileShell>
  );
}

function Field({ id, label, defaultValue, type = "text" }: { id: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <div className="grid gap-1">
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      <input id={id} name={id} defaultValue={defaultValue} type={type} className="h-11 rounded-md border px-3" />
    </div>
  );
}
