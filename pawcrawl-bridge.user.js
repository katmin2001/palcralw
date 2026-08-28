// ==UserScript==
// @name         pawcrawl bridge
// @namespace    pawcrawl
// @version      1.0
// @description  Cau noi cho pawcrawl web: goi API pawchive tu chinh trinh duyet ban (vuot CORS + qua duoc challenge DDoS-Guard vi dung IP/cookie that cua ban).
// @author       pawcrawl
// @match        https://*.github.io/*
// @match        http://127.0.0.1:*/*
// @match        http://localhost:*/*
// @connect      pawchive.pw
// @connect      pawchive.st
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

/*
  Cach hoat dong:
  - Trang web (index.html) gui yeu cau qua window.postMessage({__pawcrawl:"fetch", id, url}).
  - Userscript nay goi URL do bang GM_xmlhttpRequest (khong bi CORS chan, va di bang
    IP residential + cookie cua ban nen pawchive khong challenge), roi tra ket qua ve
    trang bang window.postMessage({__pawcrawl:"reply", ...}).
  - Chi cho phep goi toi pawchive.pw / pawchive.st.

  Cai dat: mo Tampermonkey -> Create a new script -> dan file nay -> Save (Ctrl+S).
  Hoac keo-tha file .user.js vao trinh duyet, Tampermonkey se hoi cai dat.
*/

(function () {
  "use strict";

  var OK_HOST = /(^|\.)pawchive\.(pw|st)$/i;

  function post(msg) {
    try { window.postMessage(msg, "*"); } catch (e) {}
  }
  function announce() { post({ __pawcrawl: "ready", v: 1 }); }

  // bao "san sang" nhieu lan de trang chac chan nhan duoc du thu tu tai
  announce();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", announce);
  }
  window.addEventListener("load", announce);

  window.addEventListener("message", function (ev) {
    var d = ev.data;
    if (!d || typeof d !== "object") return;

    // trang hoi tham -> tra loi san sang
    if (d.__pawcrawl === "ping") { announce(); return; }

    if (d.__pawcrawl !== "fetch" || !d.id || !d.url) return;

    var host;
    try { host = new URL(d.url).hostname; } catch (e) {
      return post({ __pawcrawl: "reply", id: d.id, ok: false, status: 0, error: "URL loi" });
    }
    if (!OK_HOST.test(host)) {
      return post({ __pawcrawl: "reply", id: d.id, ok: false, status: 0, error: "host khong duoc phep: " + host });
    }

    GM_xmlhttpRequest({
      method: "GET",
      url: d.url,
      headers: { Accept: "application/json, text/plain, */*" },
      timeout: 60000,
      onload: function (r) {
        post({
          __pawcrawl: "reply",
          id: d.id,
          ok: r.status >= 200 && r.status < 300,
          status: r.status,
          body: r.responseText,
        });
      },
      onerror: function () {
        post({ __pawcrawl: "reply", id: d.id, ok: false, status: 0, error: "mang loi" });
      },
      ontimeout: function () {
        post({ __pawcrawl: "reply", id: d.id, ok: false, status: 0, error: "qua thoi gian" });
      },
    });
  });
})();
