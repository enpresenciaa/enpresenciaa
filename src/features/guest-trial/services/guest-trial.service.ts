import type { GuestTrialStatus } from "@/features/guest-trial/utils/guest-trial.utils";
import { parseGuestTrialRows } from "@/features/guest-trial/utils/guest-trial.utils";
import { supabase } from "@/lib/supabase";

export async function getGuestTrial(): Promise<GuestTrialStatus> {
  const { data, error } = await supabase.rpc("get_guest_trial");

  if (error) {
    throw error;
  }

  return parseGuestTrialRows(data);
}
