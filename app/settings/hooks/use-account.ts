import { useCallback, useState } from "react";

export type AccountForm = {
  name: string;
  email: string;
  image: string;
};

export type UseAccountOptions = {
  onSessionUpdate?: (user: {
    name: string | null;
    email: string | null;
    image: string | null;
  }) => Promise<void>;
  onRouterRefresh?: () => void;
};

export function useAccount({ onSessionUpdate, onRouterRefresh }: UseAccountOptions = {}) {
  const [account, setAccount] = useState<AccountForm>({ name: "", email: "", image: "" });
  const [accountDirty, setAccountDirty] = useState(false);

  const fetchAccount = useCallback(async () => {
    const res = await fetch("/api/account");
    if (!res.ok) return;
    const data = await res.json();
    setAccount({
      name: data.user?.name ?? "",
      email: data.user?.email ?? "",
      image: data.user?.image ?? "",
    });
    setAccountDirty(false);
  }, []);

  const updateAccountField = (field: keyof AccountForm, value: string) => {
    setAccount((p) => ({ ...p, [field]: value }));
    setAccountDirty(true);
  };

  const saveAccount = async () => {
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    if (res.ok) {
      await onSessionUpdate?.({
        name: account.name || null,
        email: account.email || null,
        image: account.image || null,
      });
      onRouterRefresh?.();
    }
    setAccountDirty(false);
  };

  const uploadAvatar = async (file: File) => {
    const res = await fetch("/api/storage/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "image/png",
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "image/png" },
      body: file,
    });
    setAccount((p) => ({ ...p, image: data.publicUrl }));
    setAccountDirty(true);
  };

  return {
    account,
    accountDirty,
    fetchAccount,
    updateAccountField,
    saveAccount,
    uploadAvatar,
  };
}
