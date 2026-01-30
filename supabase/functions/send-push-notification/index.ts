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

// Convert Uint8Array to base64url
function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Convert raw 32-byte ECDSA private key to PKCS8 format for Web Crypto
function rawPrivateKeyToPkcs8(rawKey: Uint8Array): Uint8Array {
  // PKCS8 header for P-256 EC private key
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, // SEQUENCE, length 135
    0x02, 0x01, 0x00, // INTEGER 0 (version)
    0x30, 0x13,       // SEQUENCE, length 19
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID 1.2.840.10045.2.1 (ecPublicKey)
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID 1.2.840.10045.3.1.7 (P-256)
    0x04, 0x6d,       // OCTET STRING, length 109
    0x30, 0x6b,       // SEQUENCE, length 107
    0x02, 0x01, 0x01, // INTEGER 1 (version)
    0x04, 0x20        // OCTET STRING, length 32 (private key follows)
  ]);
  
  // For a minimal PKCS8, we just need the header + raw private key
  // This simpler format works with Web Crypto
  const simpleHeader = new Uint8Array([
    0x30, 0x41,       // SEQUENCE, length 65
    0x02, 0x01, 0x00, // INTEGER 0 (version)
    0x30, 0x13,       // SEQUENCE, length 19
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ecPublicKey
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // OID P-256
    0x04, 0x27,       // OCTET STRING, length 39
    0x30, 0x25,       // SEQUENCE, length 37
    0x02, 0x01, 0x01, // INTEGER 1
    0x04, 0x20        // OCTET STRING, length 32
  ]);
  
  const result = new Uint8Array(simpleHeader.length + rawKey.length);
  result.set(simpleHeader);
  result.set(rawKey, simpleHeader.length);
  return result;
}

// Sign JWT using ECDSA P-256
async function signVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  const headerB64 = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(header))
  );
  const payloadB64 = uint8ArrayToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload))
  );

  const signatureInput = `${headerB64}.${payloadB64}`;

  // Convert the base64url private key to raw bytes
  const rawKey = base64UrlToUint8Array(privateKeyBase64);
  
  // Create PKCS8 formatted key
  const pkcs8Key = rawPrivateKeyToPkcs8(rawKey);

  // Import the private key for ECDSA signing
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8Key,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  // Sign the JWT
  const signatureArrayBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  // Convert DER signature to raw format (r || s)
  const derSignature = new Uint8Array(signatureArrayBuffer);
  const rawSignature = derToRaw(derSignature);
  
  const signatureB64 = uint8ArrayToBase64Url(rawSignature);

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

// Convert DER encoded ECDSA signature to raw format (r || s)
function derToRaw(der: Uint8Array): Uint8Array {
  // DER format: 0x30 [total-len] 0x02 [r-len] [r] 0x02 [s-len] [s]
  // We need to extract r and s and pad them to 32 bytes each
  
  // If it's already 64 bytes, it might already be raw format
  if (der.length === 64) {
    return der;
  }
  
  let offset = 0;
  
  // Skip the SEQUENCE tag and length
  if (der[offset] !== 0x30) {
    // Not DER format, return as-is
    return der;
  }
  offset++;
  
  // Skip the total length (might be 1 or 2 bytes)
  if (der[offset] & 0x80) {
    offset += (der[offset] & 0x7f) + 1;
  } else {
    offset++;
  }
  
  // Read r
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature: expected INTEGER for r");
  offset++;
  const rLen = der[offset++];
  let rStart = offset;
  let rBytes = rLen;
  
  // Skip leading zero if present (added for positive number)
  if (der[rStart] === 0x00 && rLen > 32) {
    rStart++;
    rBytes--;
  }
  offset += rLen;
  
  // Read s
  if (der[offset] !== 0x02) throw new Error("Invalid DER signature: expected INTEGER for s");
  offset++;
  const sLen = der[offset++];
  let sStart = offset;
  let sBytes = sLen;
  
  // Skip leading zero if present
  if (der[sStart] === 0x00 && sLen > 32) {
    sStart++;
    sBytes--;
  }
  
  // Create 64-byte raw signature (32 bytes r + 32 bytes s)
  const raw = new Uint8Array(64);
  
  // Copy r, padding with zeros on the left if needed
  raw.set(der.slice(rStart, rStart + Math.min(rBytes, 32)), 32 - Math.min(rBytes, 32));
  
  // Copy s, padding with zeros on the left if needed  
  raw.set(der.slice(sStart, sStart + Math.min(sBytes, 32)), 64 - Math.min(sBytes, 32));
  
  return raw;
}

// Send push notification using Web Push protocol (simplified - no encryption for JSON payload)
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

    // Generate properly signed VAPID JWT
    const jwt = await signVapidJwt(audience, vapidSubject, vapidPrivateKey);

    console.log(`[Push] Sending to ${subscription.endpoint.substring(0, 50)}...`);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
        "TTL": "86400",
        "Urgency": "normal",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Push] Failed: ${response.status} - ${errorText}`);
      
      // Handle gone subscriptions (410 = subscription expired)
      if (response.status === 410 || response.status === 404) {
        return { success: false, error: "subscription_expired", statusCode: response.status };
      }
      
      return { success: false, error: errorText, statusCode: response.status };
    }

    await response.text();
    console.log(`[Push] Success for endpoint`);
    return { success: true };
  } catch (error) {
    console.error("[Push] Error:", error);
    return { success: false, error: error.message };
  }
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

    console.log(`[Push] VAPID configured, subject: ${VAPID_SUBJECT}`);

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

    console.log(`[Push] Target users: ${targetUserIds.length}`);

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

    console.log(`[Push] Sending to ${subscriptions.length} subscription(s)`);

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
          console.log(`[Push] Removing expired subscription: ${sub.id}`);
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

    console.log(`[Push] Results: ${successful} successful, ${failed} failed`);

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
