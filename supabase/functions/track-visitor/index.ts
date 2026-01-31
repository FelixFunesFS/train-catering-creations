import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VisitorData {
  path: string;
  referrer?: string;
  sessionId: string;
  userEmail?: string;
}

interface GeoLocation {
  city?: string;
  region?: string;
  country?: string;
  lat?: number;
  lon?: number;
}

// Parse user agent to extract device info
function parseUserAgent(userAgent: string): { deviceType: string; browser: string; os: string } {
  const ua = userAgent.toLowerCase();
  
  // Device type
  let deviceType = "Desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile/.test(ua)) {
    deviceType = ua.includes("ipad") || ua.includes("tablet") ? "Tablet" : "Mobile";
  }

  // Browser
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("edg")) browser = "Edge";
  else if (ua.includes("opera") || ua.includes("opr")) browser = "Opera";

  // OS
  let os = "Unknown";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac")) os = "macOS";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("linux")) os = "Linux";

  return { deviceType, browser, os };
}

// Get geolocation from IP (using free ip-api.com)
async function getGeoFromIP(ip: string): Promise<GeoLocation> {
  try {
    // Skip localhost/private IPs
    if (ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip === "::1") {
      return { city: "Local", region: "Development", country: "US" };
    }

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,lat,lon`);
    if (!response.ok) {
      await response.text();
      return {};
    }
    
    const data = await response.json();
    return {
      city: data.city,
      region: data.regionName,
      country: data.country,
      lat: data.lat,
      lon: data.lon,
    };
  } catch (error) {
    console.error("Geo lookup failed:", error);
    return {};
  }
}

// Parse referrer to friendly name
function parseReferrer(referrer: string): string {
  if (!referrer) return "Direct";
  
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    
    if (host.includes("google")) return "Google";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("twitter") || host.includes("x.com")) return "X/Twitter";
    if (host.includes("bing")) return "Bing";
    if (host.includes("yahoo")) return "Yahoo";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("pinterest")) return "Pinterest";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("yelp")) return "Yelp";
    if (host.includes("weddingwire")) return "WeddingWire";
    if (host.includes("theknot")) return "The Knot";
    
    return host;
  } catch {
    return referrer.substring(0, 50);
  }
}

// Format page path to friendly name
function formatPageName(path: string): string {
  const pageNames: Record<string, string> = {
    "/": "Home",
    "/menu": "Menu",
    "/about": "About",
    "/gallery": "Gallery",
    "/reviews": "Reviews",
    "/faq": "FAQ",
    "/request-quote": "Quote Request",
    "/request-quote/regular": "Regular Event Quote",
    "/request-quote/wedding": "Wedding Quote",
    "/install": "Install App",
  };
  
  return pageNames[path] || path;
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

    const body: VisitorData = await req.json();
    const { path, referrer, sessionId, userEmail } = body;

    // Get IP from headers (Supabase/Cloudflare provides this)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("cf-connecting-ip") ||
               req.headers.get("x-real-ip") ||
               "unknown";
    
    const userAgent = req.headers.get("user-agent") || "";

    // Parse device info
    const { deviceType, browser, os } = parseUserAgent(userAgent);

    // Get geolocation
    const geo = await getGeoFromIP(ip);

    // Format location string
    const locationStr = geo.city && geo.region 
      ? `${geo.city}, ${geo.region}` 
      : geo.city || geo.region || "Unknown location";

    // Parse referrer
    const referrerSource = parseReferrer(referrer || "");

    // Check if this is a returning visitor (same session in last 24h)
    const { data: existingVisit } = await supabaseClient
      .from("analytics_events")
      .select("id, created_at")
      .eq("session_id", sessionId)
      .eq("event_type", "page_visit")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    const isReturning = !!existingVisit;

    // Log the visit to analytics_events
    const { error: insertError } = await supabaseClient
      .from("analytics_events")
      .insert({
        event_type: "page_visit",
        entity_type: "visitor",
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer || null,
        session_id: sessionId,
        metadata: {
          path,
          page_name: formatPageName(path),
          device_type: deviceType,
          browser,
          os,
          location: locationStr,
          geo,
          referrer_source: referrerSource,
          is_returning: isReturning,
          user_email: userEmail || null,
        },
      });

    if (insertError) {
      console.error("Failed to log visit:", insertError);
    }

    // Check if any admin wants visitor alerts
    const { data: alertPrefs } = await supabaseClient
      .from("admin_notification_preferences")
      .select("user_id")
      .eq("visitor_alerts", true);

    if (!alertPrefs || alertPrefs.length === 0) {
      console.log("No admins subscribed to visitor alerts");
      return new Response(
        JSON.stringify({ success: true, tracked: true, notified: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: don't spam notifications for same session
    // Only notify for first visit or significant page (quote pages)
    const isSignificantPage = path.includes("request-quote") || path.includes("estimate");
    
    if (isReturning && !isSignificantPage) {
      console.log("Skipping notification for returning visitor on non-significant page");
      return new Response(
        JSON.stringify({ success: true, tracked: true, notified: false, reason: "rate_limited" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build notification message
    let title = "👀 New Visitor";
    let messageBody = `Someone from ${locationStr} is viewing ${formatPageName(path)}`;
    
    if (isReturning) {
      title = "🔄 Returning Visitor";
      messageBody = `A visitor is back on ${formatPageName(path)}`;
    }
    
    if (userEmail) {
      title = "👋 Customer Online";
      messageBody = `${userEmail} is viewing ${formatPageName(path)}`;
    }

    // Add device info
    messageBody += ` (${deviceType} • ${browser})`;

    // Add referrer if notable
    if (referrerSource !== "Direct" && !isReturning) {
      messageBody += ` via ${referrerSource}`;
    }

    // Send push notification to all subscribed admins
    const { data: pushResult, error: pushError } = await supabaseClient
      .functions.invoke("send-push-notification", {
        body: {
          alertType: "visitor",
          payload: {
            title,
            body: messageBody,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "visitor-alert",
            data: {
              url: "/admin",
              sessionId,
              path,
            },
          },
        },
      });

    if (pushError) {
      console.error("Push notification failed:", pushError);
    } else {
      console.log("Push result:", pushResult);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tracked: true, 
        notified: !pushError,
        visitor: {
          location: locationStr,
          device: deviceType,
          browser,
          isReturning,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Track visitor error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
