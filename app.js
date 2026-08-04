

// ====== SMOOTH SCROLL (Lenis) ======
(function initLenis(){
  if (typeof Lenis === "undefined") {
    console.warn("Lenis failed to load — smooth scrolling disabled.");
    return;
  }

  const lenis = new Lenis({
    // Floatier feel
    duration: 1.75,
    lerp: 0.075,

    smoothWheel: true,
    wheelMultiplier: 0.9,

    smoothTouch: false,
    touchMultiplier: 1.15,

    // “Ease out” glide
    easing: (t) => 1 - Math.pow(1 - t, 5),

    // Keep native wheel scrolling inside transfer tables and modal grids.
    // Lenis continues to control the main page exactly as before.
    prevent: (node) => Boolean(node.closest?.(
      ".transfer-table-wrap, .addlines-wrap, #pasteBox"
    ))
  });

  function raf(time){
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();

    // ====== SETTINGS ======
    const { API_URL, API_KEY, AUTO_REFRESH_MS, JSONP_URL_MAX } = window.APP_CONFIG;

    // ====== AUTO REFRESH COUNTDOWN ======
let nextAutoRefreshAt = Date.now() + AUTO_REFRESH_MS;

function formatCountdown(ms){
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function resetAutoRefreshCountdown(){
  nextAutoRefreshAt = Date.now() + AUTO_REFRESH_MS;
  updateRefreshCountdown();
}

function updateRefreshCountdown(){
  if (!refreshCountdown) return;
  refreshCountdown.textContent = `(${formatCountdown(nextAutoRefreshAt - Date.now())})`;
}

setInterval(updateRefreshCountdown, 1000);


    
    // ====== STATE ======
    let currentSheet = "PKY_TO_DTN";
    let currentDate = "";
    let rows = [];

    // ====== UI ELEMENTS ======
    const statusPill = document.getElementById("statusPill");

    const badgePKY = document.getElementById("badgePKY");
    const badgeDTN = document.getElementById("badgeDTN");
    const tabPKY = document.getElementById("tabPKY");
    const tabDTN = document.getElementById("tabDTN");
    const datePicker = document.getElementById("datePicker");

    const btnRefresh = document.getElementById("btnRefresh");
    const btnRetrySaves = document.getElementById("btnRetrySaves");
    const refreshCountdown = document.getElementById("refreshCountdown");
    const btnPasteUpload = document.getElementById("btnPasteUpload");
    const btnAddLine = document.getElementById("btnAddLine");


// ====== PAGE SEARCH (BODY FILTER) ======
let filterProduct = ""; // uppercased, trimmed

const productSearch = document.getElementById("productSearch");
const btnClearSearch = document.getElementById("btnClearSearch");
const searchMsg = document.getElementById("searchMsg");
const activeCard = document.getElementById("activeCard");
const sentCard = document.getElementById("sentCard");

    
    // Outstanding Priority Transfers
    const priorityCard = document.getElementById("priorityCard");
    const priorityBody = document.getElementById("priorityBody");
    const checkAllPriority = document.getElementById("checkAllPriority");
    const btnPrintPriority = document.getElementById("btnPrintPriority");

    
    const newCard = document.getElementById("newCard");
    const newBody = document.getElementById("newBody");
    const checkAllNew = document.getElementById("checkAllNew");
    const btnPriorityNew = document.getElementById("btnPriorityNew");
    const btnAcceptNew = document.getElementById("btnAcceptNew");
    const btnPrintNew = document.getElementById("btnPrintNew");
    const btnCancelNew = document.getElementById("btnCancelNew");

    const activeBody = document.getElementById("activeBody");
    const checkAllActive = document.getElementById("checkAllActive");
    const btnPriorityActive = document.getElementById("btnPriorityActive");
    const btnPrintActive = document.getElementById("btnPrintActive");
    const btnBulkDropped = document.getElementById("btnBulkDropped");
    const btnBulkSent = document.getElementById("btnBulkSent");
    const btnCancelActive = document.getElementById("btnCancelActive");

    const sentWrap = document.getElementById("sentWrap");
    const sentBody = document.getElementById("sentBody");
    const checkAllSent = document.getElementById("checkAllSent");
    const btnPrintSent = document.getElementById("btnPrintSent");
    const btnReverseSent = document.getElementById("btnReverseSent");
    const btnToggleSent = document.getElementById("btnToggleSent");

    const cancelCard = document.getElementById("cancelCard");
    const cancelBody = document.getElementById("cancelBody");
    const checkAllCancel = document.getElementById("checkAllCancel");
    const btnReverseCancel = document.getElementById("btnReverseCancel");

    const pasteModal = document.getElementById("pasteModal");
    const pasteBox = document.getElementById("pasteBox");
    const pastePreview = document.getElementById("pastePreview");
    const btnPasteClose = document.getElementById("btnPasteClose");
    const btnPasteSubmit = document.getElementById("btnPasteSubmit");

    const addModal = document.getElementById("addModal");
    const btnAddClose = document.getElementById("btnAddClose");
    const btnAddSubmit = document.getElementById("btnAddSubmit");
    const btnAddAnother = document.getElementById("btnAddAnother");
    const addLinesBody = document.getElementById("addLinesBody");

    const toast = document.getElementById("toast");

    // ====== BARCODE OVERLAY ======
    const barcodeOverlay = document.getElementById("barcodeOverlay");
    const boProd = document.getElementById("boProd");
    const boDest = document.getElementById("boDest");
    const boProdLabel = document.getElementById("boProdLabel");
    const boDestLabel = document.getElementById("boDestLabel");

    let __hoveredProductInput = null;
    let __hideOverlayTimer = null;

    
    // Summary
    const summaryWrap = document.getElementById("summaryWrap");
    const btnToggleSummary = document.getElementById("btnToggleSummary");
    const summaryKpis = document.getElementById("summaryKpis");
    const summaryBody = document.getElementById("summaryBody");


    // ====== LOADING OVERLAY ======
    const loadingOverlay = document.getElementById("loadingOverlay");
    const loadingTitle = document.getElementById("loadingTitle");
    const loadingSub = document.getElementById("loadingSub");
    let __busyCount = 0;

    function isBusy(){ return __busyCount > 0; }

    function showLoading(title="Working…", sub="Please wait…"){
      __busyCount++;
      loadingTitle.textContent = title;
      loadingSub.textContent = sub;
      document.body.classList.add("busy");
      loadingOverlay.style.display = "flex";
    }

    function hideLoading(){
      __busyCount = Math.max(0, __busyCount - 1);
      if (__busyCount === 0){
        loadingOverlay.style.display = "none";
        document.body.classList.remove("busy");
      }
    }

    async function withLoading(title, fn, sub){
      showLoading(title, sub || "Please wait…");
      try{
        return await fn();
      } finally {
        hideLoading();
      }
    }

    // ====== HELPERS ======
    function todayISO(){
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth()+1).padStart(2,"0");
      const dd = String(d.getDate()).padStart(2,"0");
      return `${yyyy}-${mm}-${dd}`;
    }

    function resetToTodayAndRefresh(showOverlay = true){
    const t = todayISO();
    currentDate = t;
    datePicker.value = t;
    refresh(showOverlay);
  }


    function updateDirectionLabel(){
  const el = document.getElementById("directionLabel");
  if (el) el.textContent = currentSheet === "PKY_TO_DTN" ? "Parkway to Denton" : "Denton to Parkway";
}

    function setStatus(text, kind=""){
      statusPill.textContent = text;
      statusPill.style.borderColor = "";
      statusPill.style.color = "";
      statusPill.style.background = "#fff";

      if (kind === "ok"){
        statusPill.style.borderColor = "rgba(22,163,74,0.4)";
        statusPill.style.color = "#166534";
        statusPill.style.background = "rgba(22,163,74,0.08)";
      }
      if (kind === "warn"){
        statusPill.style.borderColor = "rgba(245,158,11,0.5)";
        statusPill.style.color = "#92400e";
        statusPill.style.background = "rgba(245,158,11,0.10)";
      }
      if (kind === "err"){
        statusPill.style.borderColor = "rgba(239,68,68,0.5)";
        statusPill.style.color = "#991b1b";
        statusPill.style.background = "rgba(239,68,68,0.10)";
      }
    }

    function showToast(msg){
      toast.textContent = msg;
      toast.style.display = "block";
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => toast.style.display = "none", 3000);
    }

    function escapeHtml(s){
      return String(s ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }


   function getDestBarcodeText(){
  // Data ONLY (no asterisks) for CODE39
  return (currentSheet === "PKY_TO_DTN") ? "XCDTN" : "XCPKY";
}

function normaliseProductText(v){
  // Data ONLY (no asterisks) for CODE39
  return (v || "").toString().trim().toUpperCase();
}

function renderBarcode(svgEl, text){
  // CODE39 (matches "BC 39" labels)
  // NOTE: Code39 cannot encode the asterisk * as data (it's start/stop),
  // so ensure 'text' does NOT contain *.
  const safe = (text || "").replaceAll("*", ""); // safety net

  JsBarcode(svgEl, safe, {
    format: "CODE39",
    lineColor: "#111827",
    width: 3,        // thicker bars = better screen scanning
    height: 100,     // taller barcode = better
    margin: 0,
    displayValue: true,
    font: "Arial",
    fontSize: 18,
    textMargin: 8
  });
}


function positionOverlayNearElement(el){
  const r = el.getBoundingClientRect();
  const pad = 10;

  // Default: show below the cell
  let left = r.left;
  let top = r.bottom + pad;

  // Measure overlay (temporary show to measure)
  barcodeOverlay.style.display = "block";
  const ow = barcodeOverlay.offsetWidth;
  const oh = barcodeOverlay.offsetHeight;

  // Clamp within viewport
  left = Math.min(left, window.innerWidth - ow - pad);
  left = Math.max(pad, left);

  // If it would go off bottom, show above instead
  if (top + oh + pad > window.innerHeight){
    top = r.top - oh - pad;
  }
  top = Math.max(pad, top);

  barcodeOverlay.style.left = left + "px";
  barcodeOverlay.style.top = top + "px";
}


    function getRowTypeFromProductInput(inputEl){
  // Finds TYPE select in the same Active table row as this PRODUCT input
  const tr = inputEl.closest("tr[data-rowid]");
  if (!tr) return "";

  const typeSel = tr.querySelector("td[data-col='TYPE'] select");
  return (typeSel && typeSel.value ? typeSel.value : "").toString().trim().toUpperCase();
}

function showBarcodeOverlayForInput(inputEl){
  // Only for Active table PRODUCT column
  if (!inputEl) return;

  // Only show overlay for BULK / SPLIT
  const rowType = getRowTypeFromProductInput(inputEl);
  if (rowType !== "BULK" && rowType !== "SPLIT"){
    hideBarcodeOverlay();
    return;
  }

  const prodText = normaliseProductText(inputEl.value);
  if (!prodText){
    hideBarcodeOverlay();
    return;
  }

  const destText = getDestBarcodeText();

  // Labels can show *...* for humans, but barcode data must NOT include *
  boProdLabel.textContent = `PRODUCT (*${prodText}*)`;
  boDestLabel.textContent = `DESTINATION (*${destText}*)`;

  try{
    renderBarcode(boProd, prodText);
    renderBarcode(boDest, destText);
  } catch(e){
    hideBarcodeOverlay();
    return;
  }

  positionOverlayNearElement(inputEl);
  barcodeOverlay.setAttribute("aria-hidden", "false");
}


function hideBarcodeOverlay(){
  barcodeOverlay.style.display = "none";
  barcodeOverlay.setAttribute("aria-hidden", "true");
  __hoveredProductInput = null;
}

function scheduleHideBarcodeOverlay(delayMs = 120){
  clearTimeout(__hideOverlayTimer);
  __hideOverlayTimer = setTimeout(() => {
    // If mouse is over the overlay, don't hide yet
    if (barcodeOverlay.matches(":hover")) return;
    hideBarcodeOverlay();
  }, delayMs);
}


    function updateAddRowPrioFlag(tr){
  const sel = tr.querySelector("select[data-addcol='PRIORITY']");
  const flag = tr.querySelector("[data-prio-flag]");
  if (!sel || !flag) return;

  const yes = (sel.value || "").toString().trim().toUpperCase() === "YES";
  flag.classList.toggle("empty", !yes);
  flag.title = yes ? "Priority" : "";
}

    // ===== TYPE COLOUR HELPER =====
    
    function applyTypeColour(selectEl){
  if (!selectEl) return;

  // Remove any previous type classes
  selectEl.classList.remove("type-split", "type-bulk", "type-order");

  const v = (selectEl.value || "").toUpperCase();

  if (v === "SPLIT") selectEl.classList.add("type-split");
  else if (v === "BULK") selectEl.classList.add("type-bulk");
  else if (v === "ORDER") selectEl.classList.add("type-order");
}

    function isYes(v){
      return (v || "").toString().trim().toUpperCase() === "YES";
    }

    function markedSentStamp(){
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `[MARKED SENT @ ${hh}:${mm}]`;
}

function appendMarkedSentComment(existingComment){
  const current = (existingComment || "").toString().trim();
  const stamp = markedSentStamp();

  if (!current) return stamp;

  // Prevent duplicate stamp if the same action gets triggered twice
  if (current.includes("[MARKED SENT @")) return current;

  return `${current} ${stamp}`;
}

    function setBadge(el, count){
  const n = Number(count || 0);
  if (!el) return;

  if (n > 0){
    el.textContent = n > 99 ? "99+" : String(n);  // prevents silly-wide badges
    el.classList.add("show");
  } else {
    el.textContent = "";
    el.classList.remove("show");
  }
}

function countOutstandingFromRows(rws){
  const status = (x) => (x.STATUS || "").toString().trim().toUpperCase();
  const isSentRow = (x) => isYes(x.SENT);

  // "not yet marked sent" AND not cancelled
  return (rws || []).filter(r => !isSentRow(r) && status(r) !== "CANCELLED").length;
}


    // ====== JSONP ======
    function jsonp(url){
      return new Promise((resolve, reject) => {
        const cb = "cb_" + Math.random().toString(16).slice(2);
        const u = new URL(url);
        u.searchParams.set("callback", cb);

        const script = document.createElement("script");
        script.src = u.toString();
        script.async = true;

        let done = false;

        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          cleanup();
          reject(new Error("JSONP timeout"));
        }, 20000);

        window[cb] = (data) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          cleanup();
          resolve(data);
        };

        script.onerror = () => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          cleanup();
          reject(new Error("Failed to fetch (JSONP)"));
        };

        function cleanup(){
          try { delete window[cb]; } catch(e){}
          if (script.parentNode) script.parentNode.removeChild(script);
        }

        document.body.appendChild(script);
      });
    }

    function buildApiUrl(action, payload = {}){
      const url = new URL(API_URL);
      url.searchParams.set("action", action);
      url.searchParams.set("sheet", currentSheet);
      url.searchParams.set("date", currentDate);
      url.searchParams.set("apiKey", API_KEY);

      if (action === "add") {
        const row = payload.row || {};
        url.searchParams.set("DATE", row.DATE || currentDate || todayISO());
        url.searchParams.set("TYPE", row.TYPE || "SPLIT");
        url.searchParams.set("PRODUCT", row.PRODUCT || "");
        url.searchParams.set("QTY", (row.QTY === "" || row.QTY == null) ? "" : String(row.QTY));
        url.searchParams.set("WH", row.WH || "");
        url.searchParams.set("BIN", row.BIN || "");
        url.searchParams.set("DROPPED", row.DROPPED || "");
        url.searchParams.set("SENT", row.SENT || "");
        url.searchParams.set("COMMENTS", row.COMMENTS || "");
        url.searchParams.set("STATUS", row.STATUS || "NEW");
        // NEW COLUMN in sheet:
        url.searchParams.set("PRIORITY", row.PRIORITY || "");
      }

      if (action === "bulkAdd") url.searchParams.set("rows", JSON.stringify(payload.rows || []));
      if (action === "update") {
        url.searchParams.set("rowId", String(payload.rowId || ""));
        url.searchParams.set("patch", JSON.stringify(payload.patch || {}));
      }
      if (action === "bulkUpdate") {
        url.searchParams.set("rowIds", JSON.stringify(payload.rowIds || []));
        url.searchParams.set("patch", JSON.stringify(payload.patch || {}));
      }

      return url.toString();
    }

    async function apiCall(action, payload = {}){
      return await jsonp(buildApiUrl(action, payload));
    }

    function buildApiUrlForSheet(sheet, action, payload = {}){
  const url = new URL(API_URL);
  url.searchParams.set("action", action);
  url.searchParams.set("sheet", sheet);
  url.searchParams.set("date", currentDate);
  url.searchParams.set("apiKey", API_KEY);
  return url.toString();
}

async function apiCallForSheet(sheet, action, payload = {}){
  // only "list" is needed for badges; payload is here for future-proofing
  return await jsonp(buildApiUrlForSheet(sheet, action, payload));
}

   async function refreshBothTabBadges(){
  try{
    const [pkyRes, dtnRes] = await Promise.all([
      apiCallForSheet("PKY_TO_DTN", "list"),
      apiCallForSheet("DTN_TO_PKY", "list"),
    ]);

    if (pkyRes && pkyRes.ok){
      setBadge(badgePKY, countOutstandingFromRows(pkyRes.rows || []));
    }

    if (dtnRes && dtnRes.ok){
      setBadge(badgeDTN, countOutstandingFromRows(dtnRes.rows || []));
    }
  } catch(e){
    console.warn("Badge refresh failed:", e);
  }
}


    // Robust bulk upload: automatically chunks so URL doesn’t exceed JSONP limits
    async function bulkAddChunked(allRows){
      let addedTotal = 0;
      let i = 0;

      while (i < allRows.length){
        const chunk = [];
        while (i < allRows.length){
          chunk.push(allRows[i]);
          const testUrl = buildApiUrl("bulkAdd", { rows: chunk });
          if (testUrl.length > JSONP_URL_MAX){
            chunk.pop();
            break;
          }
          i++;
        }

        if (chunk.length === 0){
          throw new Error("One line is too large to upload via JSONP. Shorten COMMENTS or upload fewer columns.");
        }

        const res = await apiCall("bulkAdd", { rows: chunk });
        if (!res.ok) throw new Error(res.error || "Upload failed");
        addedTotal += (res.added || chunk.length);
      }

      return addedTotal;
    }

    // ====== SELECTION ======
    function selectedRowIds(selector){
      return [...document.querySelectorAll(selector)]
        .filter(x => x.checked)
        .map(x => Number(x.getAttribute("data-rowid")));
    }
    function selectedRowsByIds(ids){
      const set = new Set(ids);
      return rows.filter(r => set.has(Number(r.rowId)));
    }

    function updatePriorityButton(btn, selectedIds){
      if (!selectedIds.length){
        btn.disabled = true;
        btn.textContent = "Priority";
        return;
      }
      btn.disabled = false;
      const selected = selectedRowsByIds(selectedIds);
      const allPriority = selected.length > 0 && selected.every(r => isYes(r.PRIORITY));
      btn.textContent = allPriority ? "Unmark Priority" : "Priority";
    }

    function updateButtons(){

      const prioIds = selectedRowIds("input[data-rowcheck='prio']:checked");
      btnPrintPriority.disabled = prioIds.length === 0;

      const newIds = selectedRowIds("input[data-rowcheck='new']:checked");
      btnAcceptNew.disabled = newIds.length === 0;
      btnPrintNew.disabled = newIds.length === 0;
      btnCancelNew.disabled = newIds.length === 0;
      updatePriorityButton(btnPriorityNew, newIds);

      const activeIds = selectedRowIds("input[data-rowcheck='active']:checked");
      btnPrintActive.disabled = activeIds.length === 0;
      btnBulkDropped.disabled = activeIds.length === 0;
      btnBulkSent.disabled = activeIds.length === 0;
      btnCancelActive.disabled = activeIds.length === 0;
      updatePriorityButton(btnPriorityActive, activeIds);

      const sentIds = selectedRowIds("input[data-rowcheck='sent']:checked");
      btnPrintSent.disabled = sentIds.length === 0;
      btnReverseSent.disabled = sentIds.length === 0;

      const cancelIds = selectedRowIds("input[data-rowcheck='cancel']:checked");
      btnReverseCancel.disabled = cancelIds.length === 0;
    }

    // ====== PRINTING ======
    function printLines(title, lines){
      const w = window.open("", "_blank");
      const safeTitle = escapeHtml(title);
      const dateTxt = escapeHtml(currentDate);
      const dirTxt = escapeHtml(currentSheet);

      const rowsHtml = lines.map(r => `
        <tr>
          <td>${escapeHtml(r.ITEM_NO)}</td>
          <td>${escapeHtml((r.TYPE||"").toUpperCase())}</td>
          <td>${escapeHtml(r.PRODUCT)}</td>
          <td>${escapeHtml(r.QTY)}</td>
          <td>${escapeHtml(r.WH)}</td>
          <td>${escapeHtml(r.BIN)}</td>
          <td>${escapeHtml(r.COMMENTS)}</td>
        </tr>
      `).join("");

      const closeScript = "</scr" + "ipt>";

      w.document.write(`
        <html>
        <head>
          <title>${safeTitle}</title>
          <meta charset="utf-8">
          <style>
            body{ font-family: Arial, sans-serif; padding:16px; }
            h1{ margin:0 0 6px 0; font-size:18px; }
            .meta{ margin:0 0 12px 0; color:#555; font-size:12px; }
            table{ width:100%; border-collapse:collapse; }
            th, td{ border:1px solid #ddd; padding:8px; font-size:12px; text-align:left; }
            th{ background:#f3f4f6; }
          </style>

          
        </head>

        
        <body>
          <h1>${safeTitle}</h1>
          <p class="meta">Date: ${dateTxt} • Direction: ${dirTxt}</p>
          <table>
            <thead>
              <tr>
                <th>ITEM</th><th>TYPE</th><th>PRODUCT</th><th>QTY</th><th>WH</th><th>BIN</th><th>COMMENTS</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>
            window.onload = function(){ window.print(); };
          ${closeScript}
        </body>
        </html>
      `);

      w.document.close();
    }

    // ====== RENDERING ======
    function rowClass(r){
      const status = (r.STATUS || "").toString().trim().toUpperCase();
      const sent = isYes(r.SENT);
      const dropped = isYes(r.DROPPED);
      const priority = isYes(r.PRIORITY);

      if (status === "CANCELLED") return "status-cancel";
      if (sent) return "status-sent";
      if (dropped) return "status-dropped";

      // Priority highlight remains until Dropped/Sent/Cancelled (handled above)
      if (priority) return "status-priority";

      if (status === "NEW") return "status-new";
      return "";
    }

    function buildSelect(options, value){
      const v = (value ?? "").toString();
      return `<select class="cell-select">
        ${options.map(o => `<option value="${escapeHtml(o)}" ${o===v ? "selected":""}>${escapeHtml(o)}</option>`).join("")}
      </select>`;
    }

    function buildInput(value, type="text"){
      return `<input class="cell-input" type="${type}" value="${escapeHtml(value ?? "")}">`;
    }

    
   function buildCommentHighlight(value){
  const txt = String(value ?? "");
  if (!txt.trim()) return "";
  return `<span>${escapeHtml(txt)}</span>`;
}

function buildTextarea(value){
  return `
    <div class="comment-wrap">
      <div class="comment-highlight" aria-hidden="true">${buildCommentHighlight(value)}</div>
      <textarea class="cell-textarea" rows="1">${escapeHtml(value ?? "")}</textarea>
    </div>
  `;
}

    
    /* ===== COMMENTS highlight state ===== */


    function syncCommentHighlight(ta){
  const wrap = ta.closest(".comment-wrap");
  if (!wrap) return;

  const highlight = wrap.querySelector(".comment-highlight");
  if (!highlight) return;

  const txt = ta.value || "";
  highlight.innerHTML = txt.trim() ? `<span>${escapeHtml(txt)}</span>` : "";
}

function updateCommentHighlightState(){
  document.querySelectorAll(".comment-wrap textarea.cell-textarea").forEach(syncCommentHighlight);
}

    function buildPrioFlag(priorityYes){
      if (priorityYes){
        return `<span class="prio-flag" title="Priority">!</span>`;
      }
      return `<span class="prio-flag empty">!</span>`;
    }


function render(){
  const status = (x) => (x.STATUS || "").toString().trim().toUpperCase();
  const isSentRow = (x) => isYes(x.SENT);

  const newReq = rows.filter(r => !isSentRow(r) && status(r) === "NEW");
  const active = rows.filter(r => !isSentRow(r) && status(r) === "ACTIVE");
  const outstandingPrio = active.filter(r => isYes(r.PRIORITY) && !isYes(r.SENT));
  const sent = rows.filter(r => isSentRow(r) && status(r) !== "CANCELLED");
  const cancelled = rows.filter(r => status(r) === "CANCELLED");

  
  // ===== Daily Summary (uses full-day sets, not filtered sets) =====
  const allRequested = rows.length; // includes cancelled
  const totalSent = sent.length; // Sent = YES (excluding cancelled by your sent filter)
  const totalCancelled = cancelled.length;
  const totalOutstanding = (newReq.length + active.length); // not sent, excluding cancelled
 
  // Update badge for the CURRENTLY loaded direction
if (currentSheet === "PKY_TO_DTN") setBadge(badgePKY, totalOutstanding);
if (currentSheet === "DTN_TO_PKY") setBadge(badgeDTN, totalOutstanding);

  const requestedExclCancelled = allRequested - totalCancelled;
  const completionPct = requestedExclCancelled > 0
    ? Math.round((totalSent / requestedExclCancelled) * 100)
    : 0;



  
  function typeCounts(arr){
    const c = { SPLIT:0, BULK:0, ORDER:0, OTHER:0 };
    arr.forEach(r => {
      const t = (r.TYPE || "").toString().trim().toUpperCase();
      if (t === "SPLIT") c.SPLIT++;
      else if (t === "BULK") c.BULK++;
      else if (t === "ORDER") c.ORDER++;
      else c.OTHER++;
    });
    return c;
  }

  const reqCounts = typeCounts(rows.filter(r => (r.STATUS || "").toString().trim().toUpperCase() !== "CANCELLED")); // requested (excl cancelled)
  const sentCounts = typeCounts(sent);
  const outCounts  = typeCounts([...newReq, ...active]);

  // KPI tiles
    summaryKpis.innerHTML = `
    <div class="kpi">
      <div class="label">Total lines requested</div>
      <div class="value">${allRequested}</div>
      <div class="hint">All lines created for the day (includes cancellations).</div>
    </div>
    <div class="kpi">
      <div class="label">Total lines transferred</div>
      <div class="value">${totalSent}</div>
      <div class="hint">Lines marked <strong>Sent = YES</strong>.</div>
    </div>
    <div class="kpi">
      <div class="label">Total outstanding</div>
      <div class="value">${totalOutstanding}</div>
      <div class="hint">Not sent yet (excludes cancellations).</div>
    </div>
    <div class="kpi">
      <div class="label">Completion</div>
      <div class="value">${completionPct}%</div>
      <div class="hint">Sent ÷ requested (excluding cancellations).</div>
    </div>
  `;


  // Summary table breakdown
  summaryBody.innerHTML = `
    <tr>
      <td><strong>SPLIT</strong></td>
      <td>${reqCounts.SPLIT}</td>
      <td>${sentCounts.SPLIT}</td>
      <td>${outCounts.SPLIT}</td>
      <td>Split transfers requested today.</td>
    </tr>
    <tr>
      <td><strong>BULK</strong></td>
      <td>${reqCounts.BULK}</td>
      <td>${sentCounts.BULK}</td>
      <td>${outCounts.BULK}</td>
      <td>Bulk transfers requested today.</td>
    </tr>
    <tr>
      <td><strong>ORDER</strong></td>
      <td>${reqCounts.ORDER}</td>
      <td>${sentCounts.ORDER}</td>
      <td>${outCounts.ORDER}</td>
      <td>Order-related transfers requested today.</td>
    </tr>
    <tr>
      <td><strong>OTHER</strong></td>
      <td>${reqCounts.OTHER}</td>
      <td>${sentCounts.OTHER}</td>
      <td>${outCounts.OTHER}</td>
      <td>Anything not labelled Split/Bulk/Order.</td>
    </tr>
    <tr>
      <td><strong>CANCELLED</strong></td>
      <td>${totalCancelled}</td>
      <td>–</td>
      <td>–</td>
      <td>Lines cancelled today.</td>
    </tr>
  `;

  
    // ===== Filter logic (multi-table) =====
  const q = (filterProduct || "").trim().toUpperCase();

  // Helper: match product contains query (allows partial)
  const match = (r) => (r.PRODUCT || "").toString().toUpperCase().includes(q);

  // Per-table matches (allow multiple tables to show)
  const mNew = q ? newReq.filter(match) : [];
  const mActive = q ? active.filter(match) : [];
  const mSent = q ? sent.filter(match) : [];
  const mCancel = q ? cancelled.filter(match) : [];

  const anyMatches = q ? (mNew.length + mActive.length + mSent.length + mCancel.length) > 0 : true;


  // ===== Card visibility =====
  if (!q){
    // Normal view
    newCard.classList.toggle("hidden", newReq.length === 0);
    cancelCard.classList.toggle("hidden", cancelled.length === 0);
    priorityCard.classList.toggle("hidden", outstandingPrio.length === 0);

    // Always restore these after a search
    activeCard.classList.remove("hidden");
    sentCard.classList.remove("hidden");

    // Search UI message
    btnClearSearch.disabled = true;
    searchMsg.className = "search-msg";
    searchMsg.textContent = "Tip: start typing a product code to filter the page.";

  } else {
    // Search view: show every table that contains matches
    // Hide Priority summary during search to avoid duplicates/confusion (it duplicates Active)
    priorityCard.classList.add("hidden");

    newCard.classList.toggle("hidden", mNew.length === 0);
    activeCard.classList.toggle("hidden", mActive.length === 0);
    sentCard.classList.toggle("hidden", mSent.length === 0);
    cancelCard.classList.toggle("hidden", mCancel.length === 0);

    btnClearSearch.disabled = false;

    if (!anyMatches){
      searchMsg.className = "search-msg bad";
      searchMsg.textContent = `Not found: ${q}`;
    } else {
      const parts = [];
      if (mNew.length) parts.push(`New: ${mNew.length}`);
      if (mActive.length) parts.push(`Active: ${mActive.length}`);
      if (mSent.length) parts.push(`Sent: ${mSent.length}`);
      if (mCancel.length) parts.push(`Cancelled: ${mCancel.length}`);

      searchMsg.className = "search-msg good";
      searchMsg.textContent = `Showing results for ${q} (${parts.join(" • ")}).`;
    }
  }

    
  // ===== Priority table (normal view only) =====
  if (!q){
    priorityBody.innerHTML = outstandingPrio.map(r => `
      <tr class="status-priority" data-rowid="${r.rowId}">
        <td><input class="checkbox" type="checkbox" data-rowcheck="prio" data-rowid="${r.rowId}"></td>
        <td><strong>${escapeHtml(r.ITEM_NO)}</strong></td>
        <td>${escapeHtml((r.TYPE || "").toUpperCase())}</td>
        <td>${escapeHtml(r.PRODUCT)}</td>
        <td>${escapeHtml(r.QTY)}</td>
        <td>${escapeHtml(r.WH)}</td>
        <td>${escapeHtml(r.BIN)}</td>
        <td>${escapeHtml(r.COMMENTS)}</td>
      </tr>
    `).join("");
  } else {
    priorityBody.innerHTML = "";
  }

  // ===== Decide which rows to render into each table =====
  const newRows = q ? mNew : newReq;
  const activeRows = q ? mActive : active;
  const sentRows = q ? mSent : sent;
  const cancelRows = q ? mCancel : cancelled;


  // ===== Render New =====
newBody.innerHTML = newRows.map(r => `
  <tr class="${rowClass(r)}" data-rowid="${r.rowId}">
    <td><input class="checkbox" type="checkbox" data-rowcheck="new" data-rowid="${r.rowId}"></td>
    <td><strong>${escapeHtml(r.ITEM_NO)}</strong></td>
    <td>${buildPrioFlag(isYes(r.PRIORITY))}</td>
    <td data-col="TYPE">${buildSelect(["SPLIT","BULK","ORDER"], (r.TYPE || "SPLIT").toString().toUpperCase())}</td>
    <td data-col="PRODUCT">${buildInput(r.PRODUCT)}</td>
    <td data-col="QTY">${buildInput(r.QTY, "number")}</td>
    <td data-col="WH">${buildInput(r.WH)}</td>
    <td data-col="BIN">${buildInput(r.BIN)}</td>
    <td data-col="COMMENTS">${buildTextarea(r.COMMENTS)}</td>
  </tr>
`).join("");

  // ===== Render Active =====
  activeBody.innerHTML = activeRows.map(r => `
    <tr class="${rowClass(r)}" data-rowid="${r.rowId}">
      <td><input class="checkbox" type="checkbox" data-rowcheck="active" data-rowid="${r.rowId}"></td>
      <td><strong>${escapeHtml(r.ITEM_NO)}</strong></td>
      <td>${buildPrioFlag(isYes(r.PRIORITY))}</td>
      <td data-col="TYPE">${buildSelect(["SPLIT","BULK","ORDER"], (r.TYPE || "SPLIT").toString().toUpperCase())}</td>
      <td data-col="PRODUCT">${buildInput(r.PRODUCT)}</td>
      <td data-col="QTY">${buildInput(r.QTY, "number")}</td>
      <td data-col="WH">${buildInput(r.WH)}</td>
      <td data-col="BIN">${buildInput(r.BIN)}</td>
      <td data-col="DROPPED">${buildSelect(["","YES"], (r.DROPPED || "").toString().toUpperCase())}</td>
      <td data-col="SENT">${buildSelect(["","YES"], (r.SENT || "").toString().toUpperCase())}</td>
      <td data-col="COMMENTS">${buildTextarea(r.COMMENTS)}</td>
    </tr>
  `).join("");

  // Apply TYPE colouring to New + Active tables
[newBody, activeBody].forEach(body => {
  body.querySelectorAll("td[data-col='TYPE'] select").forEach(sel => applyTypeColour(sel));
});

 // ===== Auto-grow COMMENTS textareas (New + Active) =====
function fitCommentTextareas(body){
  body.querySelectorAll("td[data-col='COMMENTS'] textarea.cell-textarea").forEach(ta => {
    const BASE_H = 34;
    const TOLERANCE = 2;

    const fit = () => {
      ta.style.height = BASE_H + "px";
      ta.style.height = "auto";
      const needed = ta.scrollHeight;

      ta.style.height = (needed > BASE_H + TOLERANCE ? needed : BASE_H) + "px";
    };

    fit();
    ta.addEventListener("input", fit);
  });
}

fitCommentTextareas(newBody);
fitCommentTextareas(activeBody);
updateCommentHighlightState();

  // ===== Render Sent =====
  sentBody.innerHTML = sentRows.map(r => `
    <tr class="${rowClass(r)}" data-rowid="${r.rowId}">
      <td><input class="checkbox" type="checkbox" data-rowcheck="sent" data-rowid="${r.rowId}"></td>
      <td><strong>${escapeHtml(r.ITEM_NO)}</strong></td>
      <td>${buildPrioFlag(isYes(r.PRIORITY))}</td>
      <td>${escapeHtml((r.TYPE || "").toUpperCase())}</td>
      <td>${escapeHtml(r.PRODUCT)}</td>
      <td>${escapeHtml(r.QTY)}</td>
      <td>${escapeHtml(r.WH)}</td>
      <td>${escapeHtml(r.BIN)}</td>
      <td>${escapeHtml(r.COMMENTS)}</td>
    </tr>
  `).join("");

  // ===== Render Cancelled =====
  cancelBody.innerHTML = cancelRows.map(r => `
    <tr class="${rowClass(r)}" data-rowid="${r.rowId}">
      <td><input class="checkbox" type="checkbox" data-rowcheck="cancel" data-rowid="${r.rowId}"></td>
      <td><strong>${escapeHtml(r.ITEM_NO)}</strong></td>
      <td>${buildPrioFlag(isYes(r.PRIORITY))}</td>
      <td>${escapeHtml((r.TYPE || "").toUpperCase())}</td>
      <td>${escapeHtml(r.PRODUCT)}</td>
      <td>${escapeHtml(r.QTY)}</td>
      <td>${escapeHtml(r.WH)}</td>
      <td>${escapeHtml(r.BIN)}</td>
      <td>${escapeHtml((r.DROPPED || "").toUpperCase())}</td>
      <td>${escapeHtml((r.SENT || "").toUpperCase())}</td>
      <td>${escapeHtml(r.COMMENTS)}</td>
    </tr>
  `).join("");

  // Reset "check all"
  checkAllNew.checked = false;
  checkAllActive.checked = false;
  checkAllSent.checked = false;
  checkAllCancel.checked = false;
  checkAllPriority.checked = false;

  updateButtons();

if (__pendingSaveCount > 0 || __failedSaves.length > 0){
  updateSavingPill();
} else {
  setStatus(`Loaded ${rows.length} lines`, "ok");
}
}
    
    async function refresh(showOverlay = true){
  if (showOverlay && isBusy()) return;

  const doWork = async () => {
    try {
      setStatus("Loading…", "warn");

      const data = await apiCall("list");
      if (!data.ok) throw new Error(data.error || "API error");

      rows = data.rows || [];
      render();

      // Restart countdown after any successful page data refresh
      resetAutoRefreshCountdown();

      // Keep both direction badges up to date in the background
      refreshBothTabBadges();

    } catch (e) {
      setStatus("Error loading", "err");
      showToast(String(e.message || e));
    }
  };

  if (showOverlay){
    await withLoading("Loading transfers…", doWork, "Fetching the latest lines…");
  } else {
    await doWork();
  }
}

    async function patchRow(rowId, patch){
  const res = await apiCall("update", { rowId, patch });
  if (!res.ok) throw new Error(res.error || "Update failed");
}

async function bulkPatch(rowIds, patch){
  const res = await apiCall("bulkUpdate", { rowIds, patch });
  if (!res.ok) throw new Error(res.error || "Bulk update failed");
}

/* ====== FAST SCREEN UPDATE + BACKGROUND SAVE ====== */
let __pendingSaveCount = 0;
let __failedSaves = [];

function updateLocalRows(rowIds, patch){
  const idSet = new Set(rowIds.map(Number));

  rows = rows.map(r => {
    if (!idSet.has(Number(r.rowId))) return r;
    return { ...r, ...patch };
  });

  render();
}

function updateRetryButton(){
  if (!btnRetrySaves) return;

  if (__failedSaves.length > 0){
    btnRetrySaves.classList.remove("hidden");
    btnRetrySaves.textContent = `Retry (${__failedSaves.length})`;
  } else {
    btnRetrySaves.classList.add("hidden");
  }
}

function updateSavingPill(){
  updateRetryButton();

  if (__failedSaves.length > 0){
    setStatus(`${__failedSaves.length} save issue(s)`, "err");
    return;
  }

  if (__pendingSaveCount > 0){
    setStatus(`Saving ${__pendingSaveCount} change(s)…`, "warn");
    return;
  }

  setStatus("Saved", "ok");
}

async function savePatchInBackground(rowIds, patch, successMsg = "Saved"){
  __pendingSaveCount++;
  updateSavingPill();

  try{
    const cleanIds = rowIds.map(Number).filter(n => !Number.isNaN(n));

    if (!cleanIds.length){
      throw new Error("No valid row IDs found for save.");
    }

    if (cleanIds.length === 1){
      await patchRow(cleanIds[0], patch);
    } else {
      await bulkPatch(cleanIds, patch);
    }

    showToast(successMsg);
    refreshBothTabBadges();

  } catch(e){
    __failedSaves.push({
      rowIds: [...rowIds],
      patch: { ...patch },
      error: String(e.message || e),
      time: new Date().toISOString()
    });

    showToast("Save failed — change is still shown on screen. Use Retry before refreshing.");
    console.error("Background save failed:", e, { rowIds, patch });

  } finally {
    __pendingSaveCount = Math.max(0, __pendingSaveCount - 1);
    updateSavingPill();
  }
}

    /* ====== WARN BEFORE REFRESH/CLOSE IF SAVES PENDING ====== */
window.addEventListener("beforeunload", (e) => {
  if (__pendingSaveCount > 0 || __failedSaves.length > 0){
    e.preventDefault();
    e.returnValue = "";
  }
});


    // ====== INPUT NORMALISATION ======
    document.addEventListener("input", (ev) => {
      const input = ev.target;
      if (!(input.classList.contains("cell-input") || input.classList.contains("cell-textarea"))) return;

      const td = input.closest("td[data-col]");
      if (!td) return;

      const col = td.getAttribute("data-col");
      if (["PRODUCT","WH","BIN","COMMENTS"].includes(col)) {
        const pos = input.selectionStart;
        input.value = input.value.toUpperCase();
        try { input.setSelectionRange(pos, pos); } catch(e){}
      }

      if (col === "COMMENTS") {
  syncCommentHighlight(input);
}
    });


    async function retryFailedSaves(){
  if (!__failedSaves.length) return;

  if (isBusy()) return;

  const retryQueue = [...__failedSaves];
  __failedSaves = [];

  updateSavingPill();

  showToast(`Retrying ${retryQueue.length} failed save(s)...`);

  for (const item of retryQueue){

    try{

      if (item.rowIds.length === 1){
        await patchRow(item.rowIds[0], item.patch);
      } else {
        await bulkPatch(item.rowIds, item.patch);
      }

    } catch(e){

      __failedSaves.push({
        ...item,
        error: String(e.message || e),
        retryTime: new Date().toISOString()
      });

    }
  }

  updateSavingPill();

  if (__failedSaves.length){
    showToast(`${__failedSaves.length} save(s) still failing`);
  } else {
    showToast("All failed saves successfully retried");
    refreshBothTabBadges();
  }
}

    // ====== EVENTS ======

    btnRetrySaves.addEventListener("click", async () => {
  await retryFailedSaves();
});
    
    tabPKY.addEventListener("click", () => {
  if (isBusy()) return;

  if (__pendingSaveCount > 0){
    showToast("Please wait — changes are still saving.");
    return;
  }

  if (__failedSaves.length > 0){
    if (!confirm("There are failed saves on screen. Switching tabs may lose visibility of unsaved changes. Continue?")) return;
  }

  currentSheet = "PKY_TO_DTN";
  updateDirectionLabel();
  tabPKY.classList.add("active");
  tabDTN.classList.remove("active");
  refresh(true);
});

tabDTN.addEventListener("click", () => {
  if (isBusy()) return;

  if (__pendingSaveCount > 0){
    showToast("Please wait — changes are still saving.");
    return;
  }

  if (__failedSaves.length > 0){
    if (!confirm("There are failed saves on screen. Switching tabs may lose visibility of unsaved changes. Continue?")) return;
  }

  currentSheet = "DTN_TO_PKY";
  updateDirectionLabel();
  tabDTN.classList.add("active");
  tabPKY.classList.remove("active");
  refresh(true);
});

   btnRefresh.addEventListener("click", () => {
  if (__pendingSaveCount > 0){
    showToast("Please wait — changes are still saving.");
    return;
  }

  if (__failedSaves.length > 0){
    if (!confirm("There are failed saves on screen. Refreshing may lose visibility of unsaved changes. Continue?")) return;
  }

  resetToTodayAndRefresh(true);
});

    // ====== PAGE SEARCH EVENTS ======
productSearch.addEventListener("input", () => {
  if (isBusy()) return;
  filterProduct = (productSearch.value || "").toString().trim().toUpperCase();
  btnClearSearch.disabled = filterProduct.length === 0;
  render();
});

btnClearSearch.addEventListener("click", () => {
  if (isBusy()) return;
  productSearch.value = "";
  filterProduct = "";
  btnClearSearch.disabled = true;
  render();
  productSearch.focus();
});

// ESC clears search
productSearch.addEventListener("keydown", (e) => {
  if (e.key === "Escape"){
    btnClearSearch.click();
  }
});
    
    datePicker.addEventListener("change", () => {
      if (isBusy()) return;
      currentDate = datePicker.value || todayISO();
      refresh(true);
    });

    function setAll(which, checked){
      if (isBusy()) return;
      document.querySelectorAll(`input[data-rowcheck='${which}']`).forEach(c => c.checked = checked);
      updateButtons();
    }
    checkAllNew.addEventListener("change", () => setAll("new", checkAllNew.checked));
    checkAllActive.addEventListener("change", () => setAll("active", checkAllActive.checked));
    checkAllSent.addEventListener("change", () => setAll("sent", checkAllSent.checked));
    checkAllCancel.addEventListener("change", () => setAll("cancel", checkAllCancel.checked));
    checkAllPriority.addEventListener("change", () => setAll("prio", checkAllPriority.checked));

    document.addEventListener("change", (ev) => {
      if (ev.target && ev.target.matches("input[type='checkbox'][data-rowcheck]")) updateButtons();
    });

    // Inline edit changes (Active Transfers)
    document.addEventListener("change", async (ev) => {
      if (isBusy()) return;

      const tr = ev.target.closest("tr[data-rowid]");
      if (!tr) return;

      const td = ev.target.closest("td[data-col]");
      if (!td) return;

      const rowId = Number(tr.getAttribute("data-rowid"));
      const col = td.getAttribute("data-col");

      let value = (ev.target.tagName === "SELECT") ? ev.target.value : ev.target.value;

      if (col === "TYPE") value = (value || "SPLIT").toUpperCase();

    // Update colour immediately in UI when TYPE changes
if (col === "TYPE" && ev.target.tagName === "SELECT"){
  applyTypeColour(ev.target);

  // If the currently-hovered row gets changed to ORDER, hide overlay immediately
  if (__hoveredProductInput){
    const hoveredRow = __hoveredProductInput.closest("tr[data-rowid]");
    if (hoveredRow && hoveredRow === tr){
      const newType = (ev.target.value || "").toString().trim().toUpperCase();
      if (newType !== "BULK" && newType !== "SPLIT"){
        hideBarcodeOverlay();
      } else {
        // If changed back to BULK/SPLIT, refresh overlay contents/position
        showBarcodeOverlayForInput(__hoveredProductInput);
      }
    }
  }
}


      if (col === "DROPPED") value = (value || "").toUpperCase();
      if (col === "SENT") value = (value || "").toUpperCase();

      if (col === "PRODUCT" || col === "WH" || col === "BIN") value = (value || "").toString().trim().toUpperCase();
      if (col === "COMMENTS") value = (value || "").toString().toUpperCase();
      if (col === "QTY") value = value === "" ? "" : Number(value);

      // PRODUCT still required, but WH/BIN now allowed to be blank
      if (col === "PRODUCT" && value === "") { showToast("Product cannot be blank"); await refresh(true); return; }

      let patch = { [col]: value };

if (col === "SENT" && value === "YES"){
  const existingRow = rows.find(r => Number(r.rowId) === Number(rowId));
  patch.COMMENTS = appendMarkedSentComment(existingRow ? existingRow.COMMENTS : "");
}

updateLocalRows([rowId], patch);
savePatchInBackground([rowId], patch, "Saved");
    });

    // ====== PRIORITY ACTIONS ======
  async function togglePriorityForSelected(which){
  const ids = selectedRowIds(`input[data-rowcheck='${which}']:checked`);
  if (!ids.length) return;

  const selected = selectedRowsByIds(ids);
  const allPriority = selected.length > 0 && selected.every(r => isYes(r.PRIORITY));
  const newValue = allPriority ? "" : "YES";
  const patch = { PRIORITY: newValue };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, allPriority ? "Priority removed" : "Marked as Priority");
}

    btnPriorityNew.addEventListener("click", async () => {
      if (isBusy()) return;
      await togglePriorityForSelected("new");
    });

    btnPriorityActive.addEventListener("click", async () => {
      if (isBusy()) return;
      await togglePriorityForSelected("active");
    });

    // ====== NEW ACTIONS ======
    btnAcceptNew.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='new']:checked");
  if (!ids.length) return;

  const patch = { STATUS: "ACTIVE" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Accepted");
});

    btnPrintNew.addEventListener("click", () => {
      const ids = selectedRowIds("input[data-rowcheck='new']:checked");
      if (!ids.length) return;
      printLines("New Transfer Requests", selectedRowsByIds(ids));
    });

    btnPrintPriority.addEventListener("click", () => {
      const ids = selectedRowIds("input[data-rowcheck='prio']:checked");
      if (!ids.length) return;
      printLines("Outstanding Priority Transfers", selectedRowsByIds(ids));
    });

    btnCancelNew.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='new']:checked");
  if (!ids.length) return;
  if (!confirm("Cancel the selected request(s)?")) return;

  const patch = { STATUS: "CANCELLED" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Cancelled");
});

    // ====== ACTIVE ACTIONS ======
    btnPrintActive.addEventListener("click", () => {
      const ids = selectedRowIds("input[data-rowcheck='active']:checked");
      if (!ids.length) return;
      printLines("Active Transfers", selectedRowsByIds(ids));
    });

    btnBulkDropped.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='active']:checked");
  if (!ids.length) return;

  const patch = { DROPPED: "YES" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Marked Dropped");
});

    btnBulkSent.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='active']:checked");
  if (!ids.length) return;

  const selected = selectedRowsByIds(ids);

selected.forEach(r => {
  const patch = {
    SENT: "YES",
    COMMENTS: appendMarkedSentComment(r.COMMENTS)
  };

  updateLocalRows([r.rowId], patch);
  savePatchInBackground([r.rowId], patch, "Marked Sent");
});
      
});

    btnCancelActive.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='active']:checked");
  if (!ids.length) return;
  if (!confirm("Cancel the selected active transfer(s)?")) return;

  const patch = { STATUS: "CANCELLED" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Cancelled");
});

    // ====== SENT ACTIONS ======
    btnPrintSent.addEventListener("click", () => {
      const ids = selectedRowIds("input[data-rowcheck='sent']:checked");
      if (!ids.length) return;
      printLines("Sent Transfers", selectedRowsByIds(ids));
    });

    btnReverseSent.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='sent']:checked");
  if (!ids.length) return;
  if (!confirm("Reverse 'Sent' for the selected line(s)? They will return to Active Transfers.")) return;

  const patch = { SENT: "", STATUS: "ACTIVE" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Reversed Sent");
});

    btnToggleSent.addEventListener("click", () => {
      const hidden = sentWrap.style.display === "none";
      sentWrap.style.display = hidden ? "block" : "none";
      btnToggleSent.textContent = hidden ? "Hide" : "Show";
    });

    
    btnToggleSummary.addEventListener("click", () => {
    const hidden = summaryWrap.style.display === "none";
    summaryWrap.style.display = hidden ? "block" : "none";
    btnToggleSummary.textContent = hidden ? "Hide" : "Show";
    });


    // ====== CANCELLED ACTIONS ======
    btnReverseCancel.addEventListener("click", async () => {
  if (isBusy()) return;

  const ids = selectedRowIds("input[data-rowcheck='cancel']:checked");
  if (!ids.length) return;
  if (!confirm("Reverse cancellation for the selected line(s)? They will return to Active Transfers.")) return;

  const patch = { STATUS: "ACTIVE" };

  updateLocalRows(ids, patch);
  savePatchInBackground(ids, patch, "Reversed Cancellation");
});

    // ====== PASTE UPLOAD (unchanged rules: requires PRODUCT, WH, BIN) ======
    btnPasteUpload.addEventListener("click", () => {
      if (isBusy()) return;
      pasteBox.value = "";
      pastePreview.textContent = "Nothing pasted yet.";
      pasteModal.style.display = "flex";
      pasteBox.focus();
    });
    btnPasteClose.addEventListener("click", () => pasteModal.style.display = "none");

    function normaliseHeader(h){
      return String(h || "").trim().toUpperCase().replaceAll(" ", "_").replaceAll("-", "_");
    }

    function parsePaste(text){
      const t = (text || "").trim();
      if (!t) return { rows: [], preview: "Nothing pasted yet." };

      const lines = t.split(/\r?\n/).filter(x => x.trim() !== "");
      const grid = lines.map(line => line.split("\t"));

      const first = grid[0].map(normaliseHeader);
      const headerLike =
        first.includes("PRODUCT") || first.includes("PRODUCT_CODE") ||
        first.includes("QTY") || first.includes("WH") ||
        first.includes("BIN") || first.includes("TYPE");

      let headers = [];
      let startRow = 0;

      if (headerLike) { headers = first; startRow = 1; }
      else { headers = ["PRODUCT","QTY","WH","BIN"]; startRow = 0; }

      const mapKey = (h) => {
        if (h === "PRODUCT_CODE" || h === "PRODUCTCODE") return "PRODUCT";
        if (h === "PRODUCT") return "PRODUCT";
        if (h === "QTY" || h === "QUANTITY") return "QTY";
        if (h === "WH" || h === "WAREHOUSE") return "WH";
        if (h === "BIN") return "BIN";
        if (h === "TYPE") return "TYPE";
        if (h === "COMMENTS" || h === "COMMENT") return "COMMENTS";
        return h;
      };

      const keys = headers.map(mapKey);

      const out = [];
      for (let r = startRow; r < grid.length; r++){
        const row = grid[r];
        const obj = {
          DATE: currentDate || todayISO(),
          TYPE: "BULK",
          PRODUCT: "",
          QTY: "",
          WH: "",
          BIN: "",
          DROPPED: "",
          SENT: "",
          COMMENTS: "",
          STATUS: "NEW",
          PRIORITY: "" // new column
        };

        for (let c = 0; c < row.length; c++){
          const k = keys[c] || "";
          const vRaw = (row[c] ?? "").toString();
          const v = vRaw.trim();
          if (!k) continue;

          if (k === "TYPE") obj.TYPE = (v || "BULK").toUpperCase();
          else if (k === "QTY") obj.QTY = v === "" ? "" : Number(v);
          else if (k === "PRODUCT") obj.PRODUCT = v.toUpperCase();
          else if (k === "WH") obj.WH = v.toUpperCase();
          else if (k === "BIN") obj.BIN = v.toUpperCase();
          else if (k === "COMMENTS") obj.COMMENTS = vRaw.toUpperCase();
        }

        if (!headerLike && row.length >= 1) obj.PRODUCT = (row[0] ?? "").toString().trim().toUpperCase();
        if (!headerLike && row.length >= 2) obj.QTY = (row[1] ?? "").toString().trim() === "" ? "" : Number(row[1]);
        if (!headerLike && row.length >= 3) obj.WH = (row[2] ?? "").toString().trim().toUpperCase();
        if (!headerLike && row.length >= 4) obj.BIN = (row[3] ?? "").toString().trim().toUpperCase();

        // Keep existing rule: paste uploads require PRODUCT + WH + BIN
        if (obj.PRODUCT && obj.WH && obj.BIN) out.push(obj);
      }

      const preview = `Parsed ${out.length} line(s). First line: ` +
        (out[0] ? `${out[0].TYPE} ${out[0].PRODUCT} x${out[0].QTY} (${out[0].WH}/${out[0].BIN})` : "n/a");

      return { rows: out, preview };
    }

    pasteBox.addEventListener("input", () => {
      const parsed = parsePaste(pasteBox.value);
      pastePreview.textContent = parsed.preview;
    });

    btnPasteSubmit.addEventListener("click", async () => {
      if (isBusy()) return;
      const parsed = parsePaste(pasteBox.value);
      if (!parsed.rows.length){
        showToast("Nothing valid to upload (requires PRODUCT, WH, BIN)");
        return;
      }

      await withLoading("Uploading lines…", async () => {
        try{
          setStatus("Uploading…", "warn");
          const added = await bulkAddChunked(parsed.rows);
          showToast(`Uploaded ${added} lines`);
          pasteModal.style.display = "none";
          await refresh(false);
        } catch(e){
          setStatus("Upload failed", "err");
          showToast(String(e.message || e));
        }
      }, "Saving pasted lines and refreshing…");
    });

    // ====== ADD LINES (multi-row) ======
    
function makeAddRow(prefillType){
  const type = (prefillType || "SPLIT").toUpperCase();
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <!-- PRIORITY (NEW) -->
    <td style="width:110px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <select class="cell-select" data-addcol="PRIORITY" style="min-width:72px;">
          <option value="">NO</option>
          <option value="YES">YES</option>
        </select>
        <span class="prio-flag empty" data-prio-flag title="Priority">!</span>
      </div>
    </td>

    <td>
      <select class="cell-select" data-addcol="TYPE">
        <option ${type==="SPLIT" ? "selected":""}>SPLIT</option>
        <option ${type==="BULK" ? "selected":""}>BULK</option>
        <option ${type==="ORDER" ? "selected":""}>ORDER</option>
      </select>
    </td>
    <td><input class="cell-input" data-addcol="PRODUCT" placeholder="e.g. 18DR1810A" /></td>
    <td><input class="cell-input" data-addcol="QTY" type="number" min="0" step="1" placeholder="e.g. 6" /></td>
    <td><input class="cell-input" data-addcol="WH" placeholder="e.g. BB" /></td>
    <td><input class="cell-input" data-addcol="BIN" placeholder="e.g. F49E" /></td>
    <td><input class="cell-input" data-addcol="COMMENTS" placeholder="Optional notes (urgency, order ref, etc.)" /></td>
    <td><button class="iconbtn danger" data-action="remove">Remove</button></td>
  `;
  // ensure initial flag matches default priority (NO)
  updateAddRowPrioFlag(tr);
  return tr;
}


    function resetAddModal(){
      addLinesBody.innerHTML = "";
      addLinesBody.appendChild(makeAddRow("SPLIT"));
      // focus first product
      const firstProduct = addLinesBody.querySelector("input[data-addcol='PRODUCT']");
      if (firstProduct) firstProduct.focus();
    }

    btnAddLine.addEventListener("click", () => {
      if (isBusy()) return;
      resetAddModal();
      addModal.style.display = "flex";
    });

    btnAddClose.addEventListener("click", () => addModal.style.display = "none");

    btnAddAnother.addEventListener("click", () => {
      if (isBusy()) return;
      // default new row uses the last row's TYPE if available
      const lastTypeSel = addLinesBody.querySelector("tr:last-child select[data-addcol='TYPE']");
      const nextType = lastTypeSel ? lastTypeSel.value : "SPLIT";
      addLinesBody.appendChild(makeAddRow(nextType));
      const newRowProduct = addLinesBody.querySelector("tr:last-child input[data-addcol='PRODUCT']");
      if (newRowProduct) newRowProduct.focus();
    });

    addLinesBody.addEventListener("click", (ev) => {
      const btn = ev.target.closest("button[data-action='remove']");
      if (!btn) return;
      const tr = btn.closest("tr");
      if (!tr) return;

      // Keep at least one row visible
      if (addLinesBody.querySelectorAll("tr").length <= 1){
        showToast("At least one line is required.");
        return;
      }
      tr.remove();
    });

    addLinesBody.addEventListener("change", (ev) => {
  const sel = ev.target && ev.target.matches("select[data-addcol='PRIORITY']") ? ev.target : null;
  if (!sel) return;
  const tr = sel.closest("tr");
  if (!tr) return;
  updateAddRowPrioFlag(tr);
});

    // Uppercase while typing in Add modal (PRODUCT/WH/BIN/COMMENTS)
    addLinesBody.addEventListener("input", (ev) => {
      const el = ev.target;
      if (!el || !el.matches("input.cell-input")) return;
      const col = el.getAttribute("data-addcol");
      if (!["PRODUCT","WH","BIN","COMMENTS"].includes(col)) return;

      const pos = el.selectionStart;
      el.value = (el.value || "").toUpperCase();
      try { el.setSelectionRange(pos, pos); } catch(e){}
    });

    function readAddModalRows(){
      const trs = [...addLinesBody.querySelectorAll("tr")];
      const out = [];

      for (const tr of trs){
        const get = (col) => {
          const el = tr.querySelector(`[data-addcol='${col}']`);
          return el ? el.value : "";
        };

        const row = {
          DATE: currentDate || todayISO(),
          PRIORITY: (get("PRIORITY") || "").toString().trim().toUpperCase(),
          TYPE: (get("TYPE") || "SPLIT").toString().trim().toUpperCase(),
          PRODUCT: (get("PRODUCT") || "").toString().trim().toUpperCase(),
          QTY: get("QTY") === "" ? "" : Number(get("QTY")),
          WH: (get("WH") || "").toString().trim().toUpperCase(),
          BIN: (get("BIN") || "").toString().trim().toUpperCase(),
          DROPPED: "",
          SENT: "",
          COMMENTS: (get("COMMENTS") || "").toString().toUpperCase(),
          STATUS: "NEW",
        };

        // Only PRODUCT is forced
        if (!row.PRODUCT){
          return { ok:false, error:"Product is required on all lines." };
        }

        // TYPE safeguard
        if (!["SPLIT","BULK","ORDER"].includes(row.TYPE)) row.TYPE = "SPLIT";

        // PRIORITY safeguard
        if (row.PRIORITY !== "YES") row.PRIORITY = "";

    out.push(row);
      }

      return { ok:true, rows: out };
    }

    btnAddSubmit.addEventListener("click", async () => {
      if (isBusy()) return;

      const parsed = readAddModalRows();
      if (!parsed.ok){
        showToast(parsed.error || "Check your lines.");
        return;
      }

      await withLoading("Adding line(s)…", async () => {
        try{
          setStatus("Adding…", "warn");
          const added = await bulkAddChunked(parsed.rows);
          showToast(`Added ${added} line(s) to New Requests`);
          addModal.style.display = "none";
          await refresh(false);
        } catch(e){
          setStatus("Add failed", "err");
          showToast(String(e.message || e));
        }
      }, "Saving the new line(s) and refreshing…");
    });


            // Hover overlay on PRODUCT inputs in Active table
document.addEventListener("mouseover", (ev) => {
  const input = ev.target.closest("#activeBody td[data-col='PRODUCT'] input.cell-input");
  if (!input) return;

  // Only show for PKY_TO_DTN or DTN_TO_PKY (your two tabs)
  __hoveredProductInput = input;
  clearTimeout(__hideOverlayTimer);
  showBarcodeOverlayForInput(input);
});

document.addEventListener("mouseout", (ev) => {
  const leavingInput = ev.target.closest("#activeBody td[data-col='PRODUCT'] input.cell-input");
  if (!leavingInput) return;

  // If moving into overlay, keep it visible
  const toEl = ev.relatedTarget;
  if (toEl && (barcodeOverlay === toEl || barcodeOverlay.contains(toEl))) return;

  scheduleHideBarcodeOverlay(120);
});

// Keep visible if cursor moves onto overlay; hide when leaving overlay
barcodeOverlay.addEventListener("mouseleave", () => scheduleHideBarcodeOverlay(80));
barcodeOverlay.addEventListener("mouseenter", () => clearTimeout(__hideOverlayTimer));

// If user edits product while hovering, refresh barcode live
document.addEventListener("input", (ev) => {
  if (!__hoveredProductInput) return;
  if (ev.target === __hoveredProductInput){
    showBarcodeOverlayForInput(__hoveredProductInput);
  }
});

// Hide overlay on scroll or resize (prevents it floating in wrong place)
window.addEventListener("scroll", () => hideBarcodeOverlay(), true);
window.addEventListener("resize", () => hideBarcodeOverlay());

            

   
    // ====== AUTO REFRESH ======
setInterval(() => {

  if (isBusy()) return;
  if (__pendingSaveCount > 0) return;
  if (__failedSaves.length > 0) return;

  const activeEl = document.activeElement;

  if (
    activeEl &&
    (
      activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.tagName === "SELECT"
    )
  ){
    return;
  }

  resetToTodayAndRefresh(false);

}, AUTO_REFRESH_MS);


// ====== DYNAMIC STICKY OFFSETS ======
function updateStickyOffsets(){
  const mainHeader = document.querySelector("body > header");
  const searchCard = document.getElementById("searchCard");

  const headerH = mainHeader ? Math.ceil(mainHeader.getBoundingClientRect().height) : 72;
  const searchH = searchCard ? Math.ceil(searchCard.getBoundingClientRect().height) : 0;

  document.documentElement.style.setProperty("--appHeaderH", `${headerH}px`);
  document.documentElement.style.setProperty("--searchCardH", `${searchH}px`);
}

window.addEventListener("resize", updateStickyOffsets);
window.addEventListener("load", updateStickyOffsets);

    // ====== START ======
    
   (function(){
  updateStickyOffsets();
  updateDirectionLabel();
  currentDate = todayISO();
  datePicker.value = currentDate;
  refresh(true);
})();
