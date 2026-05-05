import { sha256 } from '../js/sha256.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("text/html")) {
    let html = await response.text();
    
    // ================== 改這裡 ==================
    const password = "@10101";   //
    // ===========================================
    
    let passwordHash = "";
    if (password) {
      passwordHash = await sha256(password);
    }
    
    html = html.replace('window.__ENV__.PASSWORD = "{{PASSWORD}}";', 
      `window.__ENV__.PASSWORD = "${passwordHash}";`);
    
    // 如果 replace 沒生效，強制注入
    if (!html.includes('window.__ENV__.PASSWORD')) {
      html = html.replace(
        '</head>',
        `<script>window.__ENV__ = window.__ENV__ || {}; window.__ENV__.PASSWORD = "${passwordHash}";</script></head>`
      );
    }
    
    return new Response(html, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }
  
  return response;
}
