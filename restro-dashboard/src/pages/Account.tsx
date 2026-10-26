import {
  ChangeEvent,
  FC,
  FormEvent,
  ReactNode,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  Camera,
  Copy,
  ExternalLink,
  ImagePlus,
  Loader2,
  LogOut,
  Mail,
  QrCode,
  Store,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHandleLogout } from "@/features/authHooks";
import {
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/notify";
import {
  Profile,
  useUpdateProfile,
  useUploadImage,
} from "@/features/account/useAccount";

const Card: FC<{ title: string; hint?: string; children: ReactNode }> = ({
  title,
  hint,
  children,
}) => (
  <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
    <h3 className="font-semibold text-zinc-900">{title}</h3>
    {hint && <p className="mt-0.5 text-sm text-zinc-500">{hint}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

// Hidden file input behind a button; on phones this offers camera or gallery.
const useFilePicker = (onPick: (file: File) => void) => {
  const ref = useRef<HTMLInputElement>(null);
  const input = (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onPick(file);
        e.target.value = "";
      }}
    />
  );
  return { open: () => ref.current?.click(), input };
};

// Lets the owner turn on new-order alerts if they missed the prompt at login.
const NotificationCard: FC = () => {
  const [permission, setPermission] = useState(notificationPermission());

  if (permission === "unsupported" || permission === "granted") return null;

  const blocked = permission === "denied";

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="flex items-center gap-2 font-semibold text-amber-900">
        <BellRing className="h-4 w-4" /> New-order alerts are off
      </h3>
      <p className="mt-1 text-sm text-amber-800">
        {blocked
          ? "This browser is blocking notifications. Allow them for this site in your browser settings to get alerted when an order arrives."
          : "Get an alert when an order arrives, even when this tab is in the background."}
      </p>
      {!blocked && (
        <Button
          variant="outline"
          className="mt-3 h-11 w-full bg-white"
          onClick={async () => {
            await requestNotificationPermission(true);
            setPermission(notificationPermission());
          }}
        >
          <BellRing /> Turn on alerts
        </Button>
      )}
    </section>
  );
};

const Account: FC = () => {
  const { data: user } = useQuery<Profile>({ queryKey: ["user"] });
  const logout = useHandleLogout();
  const { updateProfile, isSaving } = useUpdateProfile();
  const { uploadImage, uploading } = useUploadImage();
  const logoPicker = useFilePicker((file) => uploadImage({ kind: "logo", file }));
  const qrPicker = useFilePicker((file) =>
    uploadImage({ kind: "paymentQr", file }),
  );

  if (!user) return null;

  const menuLink = `${import.meta.env.VITE_CUSTOMER_APP_URL}/menu/${user._id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuLink);
      toast.success("Menu link copied");
    } catch {
      toast.error("Could not copy, long-press the link instead");
    }
  };

  const saveDetails = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    updateProfile({
      restroName: String(f.get("restroName")).trim(),
      restroAddress: String(f.get("restroAddress")).trim(),
      username: String(f.get("username")).trim(),
      phone: String(f.get("phone")).trim(),
    }).catch(() => undefined);
  };

  const saveUpi = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const upiId = String(new FormData(e.currentTarget).get("upiId")).trim();
    updateProfile({ upiId }).catch(() => undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Logo + name */}
      <section className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <button
          onClick={logoPicker.open}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200"
          aria-label="Change restaurant logo"
        >
          {user.restroLogo ? (
            <img
              src={user.restroLogo}
              alt="Restaurant logo"
              className="h-full w-full object-cover"
            />
          ) : (
            <Store className="m-auto h-8 w-8 text-zinc-400" />
          )}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/55 py-1 text-white">
            {uploading === "logo" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </span>
        </button>
        {logoPicker.input}
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-zinc-900">
            {user.restroName ?? "My Restaurant"}
          </h2>
          <p className="flex items-center gap-1.5 truncate text-sm text-zinc-500">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {user.email}
          </p>
          <button
            onClick={logoPicker.open}
            className="mt-1 text-sm font-medium text-zinc-900 underline-offset-2 hover:underline"
          >
            {user.restroLogo ? "Change logo" : "Add logo"}
          </button>
        </div>
      </section>

      {/* Restaurant details */}
      <Card title="Restaurant details">
        <form
          key={`${user.restroName}|${user.restroAddress}|${user.phone}|${user.username}`}
          onSubmit={saveDetails}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Restaurant name
            <Input
              name="restroName"
              required
              minLength={3}
              defaultValue={user.restroName}
              className="h-11"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
            Address
            <textarea
              name="restroAddress"
              required
              minLength={3}
              rows={2}
              defaultValue={user.restroAddress}
              className="rounded-md border border-zinc-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
              Owner name
              <Input
                name="username"
                required
                defaultValue={user.username}
                className="h-11"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
              Phone
              <Input
                name="phone"
                type="tel"
                inputMode="tel"
                required
                minLength={10}
                maxLength={11}
                defaultValue={user.phone}
                className="h-11"
              />
            </label>
          </div>
          <Button type="submit" className="h-11" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : null}
            Save details
          </Button>
        </form>
      </Card>

      <NotificationCard />

      {/* Payments */}
      <Card
        title="Payments"
        hint="Customers can tap to pay from their phone, or scan your QR code."
      >
        <form
          key={user.upiId}
          onSubmit={saveUpi}
          className="mb-4 flex flex-col gap-1"
        >
          <label
            htmlFor="upiId"
            className="text-sm font-medium text-zinc-700"
          >
            UPI ID
          </label>
          <div className="flex gap-2">
            <Input
              id="upiId"
              name="upiId"
              defaultValue={user.upiId}
              placeholder="name@bank"
              autoCapitalize="none"
              autoCorrect="off"
              className="h-11"
            />
            <Button type="submit" variant="secondary" className="h-11 px-4">
              Save
            </Button>
          </div>
          <p className="text-xs text-zinc-500">
            With a UPI ID, customers get a "Pay now" button that opens their UPI
            app with the amount already filled in.
          </p>
        </form>

        {user.paymentQr ? (
          <img
            src={user.paymentQr}
            alt="Payment QR code"
            className="mx-auto aspect-square w-full max-w-60 rounded-lg border border-zinc-200 bg-white object-contain p-2"
          />
        ) : (
          <button
            onClick={qrPicker.open}
            className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 py-8 text-sm text-zinc-500"
          >
            <QrCode className="h-8 w-8 text-zinc-400" />
            No QR code yet
          </button>
        )}
        {qrPicker.input}
        <Button
          variant="outline"
          className="mt-3 h-11 w-full"
          onClick={qrPicker.open}
          disabled={uploading === "paymentQr"}
        >
          {uploading === "paymentQr" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ImagePlus />
          )}
          {user.paymentQr ? "Replace QR code" : "Upload QR code"}
        </Button>
      </Card>

      {/* Customer menu link */}
      <Card
        title="Customer menu link"
        hint="Share this link or put it on a QR code at your tables."
      >
        <p className="break-all rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
          {menuLink}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-11" onClick={copyLink}>
            <Copy /> Copy
          </Button>
          <Button variant="outline" className="h-11" asChild>
            <a href={menuLink} target="_blank" rel="noreferrer">
              <ExternalLink /> Open
            </a>
          </Button>
        </div>
      </Card>

      <Button
        variant="ghost"
        className="h-11 text-red-600 hover:text-red-700"
        onClick={() => logout.logout()}
      >
        <LogOut /> Log out
      </Button>
    </div>
  );
};

export default Account;
