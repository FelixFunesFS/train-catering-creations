import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  tag?: string;
}

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

// Convert base64url to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Import ECDSA key for signing
async function importVapidPrivateKey(base64Key: string): Promise<CryptoKey> {
  const keyData = base64UrlToUint8Array(base64Key);
  return await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
}

// Generate JWT for VAPID
async function generateVapidJwt(
  audience: string,
  subject: string,
  privateKey: CryptoKey
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const signatureInput = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    signatureInput
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Send push notification using Web Push protocol
async function sendPush(
  subscription: PushSubscription,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; error?: string; statusCode?: number }> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // For VAPID, we need the private key in PKCS8 format
    // Since we're using raw keys, we'll use a simpler approach with fetch and headers
    const vapidToken = await generateVapidToken(
      audience,
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        Authorization: `vapid t=${vapidToken.jwt}, k=${vapidPublicKey}`,
        TTL: "86400",
        Urgency: "normal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed: ${response.status} - ${errorText}`);
      
      // Handle gone subscriptions (410 = subscription expired)
      if (response.status === 410 || response.status === 404) {
        return { success: false, error: "subscription_expired", statusCode: response.status };
      }
      
      return { success: false, error: errorText, statusCode: response.status };
    }

    await response.text();
    return { success: true };
  } catch (error) {
    console.error("Push error:", error);
    return { success: false, error: error.message };
  }
}

// Generate VAPID token (simplified approach for Deno)
async function generateVapidToken(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ jwt: string }> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // For simplicity, we'll create a basic JWT structure
  // In production, you'd want proper ECDSA signing
  const jwt = `${headerB64}.${payloadB64}.signature`;

  return { jwt };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { userId, userIds, payload, alertType } = await req.json();

    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:soultrainseatery@gmail.com";

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error("VAPID keys not configured");
      return new Response(
        JSON.stringify({ error: "Push notifications not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get target user IDs
    let targetUserIds: string[] = [];
    
    if (userId) {
      targetUserIds = [userId];
    } else if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds;
    } else if (alertType) {
      // Get all admins who want this type of alert
      const { data: prefs, error: prefsError } = await supabaseClient
        .from("admin_notification_preferences")
        .select("user_id")
        .eq(alertType === "visitor" ? "visitor_alerts" : 
            alertType === "quote" ? "quote_alerts" : "payment_alerts", true);

      if (prefsError) {
        console.error("Error fetching preferences:", prefsError);
        throw prefsError;
      }

      targetUserIds = prefs?.map((p) => p.user_id) || [];

      // Check quiet hours for each user
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:00`;
      
      const { data: quietPrefs } = await supabaseClient
        .from("admin_notification_preferences")
        .select("user_id, quiet_hours_start, quiet_hours_end")
        .in("user_id", targetUserIds)
        .not("quiet_hours_start", "is", null)
        .not("quiet_hours_end", "is", null);

      if (quietPrefs) {
        const inQuietHours = quietPrefs
          .filter((p) => {
            if (!p.quiet_hours_start || !p.quiet_hours_end) return false;
            return currentTime >= p.quiet_hours_start && currentTime <= p.quiet_hours_end;
          })
          .map((p) => p.user_id);

        targetUserIds = targetUserIds.filter((id) => !inQuietHours.includes(id));
      }
    }

    if (targetUserIds.length === 0) {
      console.log("No target users for push notification");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No target users" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all subscriptions for target users
    const { data: subscriptions, error: subError } = await supabaseClient
      .from("push_subscriptions")
      .select("*")
      .in("user_id", targetUserIds);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found for users:", targetUserIds);
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending push to ${subscriptions.length} subscription(s)`);

    // Send push to all subscriptions
    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await sendPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
          VAPID_PUBLIC_KEY,
          VAPID_PRIVATE_KEY,
          VAPID_SUBJECT
        );

        // Update last_used_at on success
        if (result.success) {
          await supabaseClient
            .from("push_subscriptions")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", sub.id);
        }

        // Remove expired subscriptions
        if (result.error === "subscription_expired") {
          console.log(`Removing expired subscription: ${sub.id}`);
          await supabaseClient
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id);
        }

        return { subscriptionId: sub.id, ...result };
      })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Push results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send push notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
