import { sha256 } from './js/sha256.js';

// Cloudflare Pages / Vercel Middleware
export default async function middleware(request) {
  const url = new URL(request.url);

  // 只處理 HTML 頁面
  const isHtmlPage = url.pathname.endsWith('.html') || 
                     url.pathname.endsWith('/') || 
                     url.pathname === '';
  
  if (!isHtmlPage) {
    return;
  }

  // ================== 在這裡設定你的密碼 ==================
  const password = "123456";   // ←←← 改成你想要的密碼！！！
  // ======================================================

  let passwordHash = '';
  if (password) {
    passwordHash = await sha256(password);
  }

  // 取得原始回應
  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) {
    return response;
  }

  let originalHtml = await response.text();

  // 替換密碼
  let modifiedHtml = originalHtml.replace(
    /window\.__ENV__\.PASSWORD\s*=\s*".*?"/g,
    `window.__ENV__.PASSWORD = "${passwordHash}"`
  );

  // 如果沒找到就強制加入
  if (!modifiedHtml.includes('window.__ENV__.PASSWORD')) {
    modifiedHtml = modifiedHtml.replace(
      '</head>',
      `<script>window.__ENV__ = window.__ENV__ || {}; window.__ENV__.PASSWORD = "${passwordHash}";</script></head>`
    );
  }

  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

export const config = {
  matcher: ['/', '/((?!api|_next/static|_vercel|favicon.ico).*)'],
};
