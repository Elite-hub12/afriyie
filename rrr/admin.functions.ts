import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface AdminUserRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

async function getAdminUserId(accessToken: string) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !authData.user) {
    throw new Error("Your session expired. Please log in again.");
  }

  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");

  return authData.user.id;
}

export const listUsersAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string }) => {
    if (!input?.accessToken || typeof input.accessToken !== "string") {
      throw new Error("accessToken is required");
    }
    return input;
  })
  .handler(async ({ data }): Promise<{ users: AdminUserRow[] }> => {
    await getAdminUserId(data.accessToken);

    const { data: profiles, error: pErr } = await supabaseAdmin
      .from("profiles")
      .select("user_id, display_name, created_at")
      .order("created_at", { ascending: false });
    if (pErr) throw new Error(pErr.message);

    const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (uErr) throw new Error(uErr.message);

    const emailMap = new Map(usersData.users.map((u) => [u.id, u]));

    const users: AdminUserRow[] = (profiles ?? []).map((p) => {
      const u = emailMap.get(p.user_id);
      return {
        user_id: p.user_id,
        display_name: p.display_name,
        created_at: p.created_at,
        email: u?.email ?? null,
        last_sign_in_at: u?.last_sign_in_at ?? null,
      };
    });

    return { users };
  });

export const signOutUserAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { accessToken: string; userId: string }) => {
    if (!input?.accessToken || typeof input.accessToken !== "string") {
      throw new Error("accessToken is required");
    }
    if (!input?.userId || typeof input.userId !== "string") {
      throw new Error("userId is required");
    }
    return input;
  })
  .handler(async ({ data }): Promise<{ success: true }> => {
    await getAdminUserId(data.accessToken);
    const { error } = await supabaseAdmin.auth.admin.signOut(data.userId, "global");
    if (error) throw new Error(error.message);
    return { success: true };
  });
