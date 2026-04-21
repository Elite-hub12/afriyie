import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Shield, Users } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { RequireAuth } from "@/components/RequireAuth";
import { ToolShell } from "@/components/ToolShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listUsersAdmin, signOutUserAdmin, type AdminUserRow } from "@/utils/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Afriyie Tools" },
      { name: "description", content: "View all signed-up users." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AdminPage />
    </RequireAuth>
  ),
});

function AdminPage() {
  const { isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [busy, setBusy] = useState(true);
  const [signingOut, setSigningOut] = useState<string | null>(null);
  const listUsers = useServerFn(listUsersAdmin);
  const signOutUser = useServerFn(signOutUserAdmin);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      void navigate({ to: "/" });
    }
  }, [isAdmin, loading, navigate, user]);

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("Your session expired. Please log in again.");
    return token;
  };

  const refresh = async () => {
    setBusy(true);
    try {
      const accessToken = await getAccessToken();
      const { users: rows } = await listUsers({ data: { accessToken } });
      setUsers(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleSignOut = async (target: AdminUserRow) => {
    if (!confirm(`Sign out ${target.display_name || target.email || "this user"} from all devices?`)) return;
    setSigningOut(target.user_id);
    try {
      const accessToken = await getAccessToken();
      await signOutUser({ data: { accessToken, userId: target.user_id } });
      toast.success("User has been signed out");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to sign out user");
    } finally {
      setSigningOut(null);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ToolShell
      Icon={Shield}
      title="Admin dashboard"
      description="View everyone who has signed up to Afriyie Tools."
    >
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Registered users</h2>
          </div>
          <Badge variant="secondary">{users.length} total</Badge>
        </div>

        {busy ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last sign-in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.user_id === user?.id;
                  return (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">
                        {u.display_name || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.email || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSelf || signingOut === u.user_id}
                          onClick={() => void handleSignOut(u)}
                          title={isSelf ? "You can't sign yourself out from here" : "Force sign-out"}
                        >
                          {signingOut === u.user_id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <LogOut className="h-3.5 w-3.5" />
                          )}
                          <span className="ml-1.5 hidden sm:inline">Sign out</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ToolShell>
  );
}
