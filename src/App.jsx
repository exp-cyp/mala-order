import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, ArrowLeft, Minus, Plus, Loader, MapPin, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBpzHLDCAIIJYryXiN6c6F4VxbtkxLndxX3VKCJ6DDuf7bRYw42fLLe8vYE9X-RF_3Hw/exec";
const LIFF_ID = "2010455338-s9xBTgbN";

const C = {
  bg: "#FAFAFA", card: "#FFFFFF", fg: "#111111", muted: "#888888",
  border: "#EBEBEB", input: "#F4F4F4",
  primary: "#D93026", line: "#06C755",
  tag: "#FFF1F0", tagText: "#D93026",
};

const SETS = [
  {
    id: "pork", name: "เซตหมู", price: 99, emoji: "🥩",
    description: "สันคอหมูสไลซ์, สามชั้นสไลซ์, เห็ดรวม, ผักสด, เส้นมันเทศ",
    images: [null, null, null],
    items: [
      { name: "สันคอหมูสไลซ์ + สามชั้น", grams: 120 },
      { name: "เห็ดรวม (หูหนู/เข็มทอง/ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 }, { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศใหญ่", grams: 100 },
    ],
  },
  {
    id: "seafood", name: "เซตทะเล", price: 129, emoji: "🦐",
    description: "กุ้ง, หมึก, เห็ดรวม, ผักสด, เส้นมันเทศ",
    images: [null, null, null],
    items: [
      { name: "กุ้ง + หมึก", grams: 120 },
      { name: "เห็ดรวม (หูหนู/เข็มทอง/ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 }, { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศเล็ก", grams: 100 },
    ],
  },
  {
    id: "diy", name: "DIY เลือกเองได้เลย", price: 39, emoji: "🍳",
    description: "เลือกวัตถุดิบได้ตามใจ ราคาเริ่มต้น ฿39",
    images: [null, null],
    items: [],
  },
];

const SOUPS = ["ซุปหมาล่า", "ซุปน้ำดำ"];
const SPICE_LEVELS = [
  { key: "น้อย", label: "🌶 น้อย" },
  { key: "กลาง", label: "🌶🌶 กลาง" },
  { key: "มาก", label: "🌶🌶🌶 มาก" },
];

const ADDON_GROUPS = [
  {
    label: "โปรตีนเพิ่ม", items: [
      { id: "A1", name: "สันคอสไลซ์", grams: 60, price: 20 },
      { id: "A2", name: "สามชั้นสไลซ์", grams: 60, price: 20 },
      { id: "A3", name: "กุ้ง", grams: 60, price: 35 },
      { id: "A4", name: "หมึก", grams: 60, price: 30 },
    ],
  },
  {
    label: "ผัก / เห็ด", items: [
      { id: "B1", name: "เห็ดหูหนู", grams: 60, price: 15 },
      { id: "B2", name: "เห็ดเข็มทอง", grams: 60, price: 15 },
      { id: "B3", name: "เห็ดออริจิ", grams: 60, price: 20 },
      { id: "B4", name: "ผักบุ้ง", grams: 60, price: 10 },
      { id: "B5", name: "ผักกาดขาว", grams: 60, price: 10 },
    ],
  },
  {
    label: "เส้น", items: [
      { id: "C1", name: "เส้นมันเทศใหญ่", grams: 60, price: 15 },
      { id: "C2", name: "เส้นมันเทศเล็ก", grams: 60, price: 15 },
      { id: "C3", name: "บะหมี่ผัก", grams: 60, price: 15 },
    ],
  },
];

const allAddons = ADDON_GROUPS.flatMap(g => g.items);

function LineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

// ─── Image Gallery ───────────────────────────────────────────────────────────
function ImageGallery({ images, emoji }) {
  const [cur, setCur] = useState(0);
  const [lb, setLb] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const n = images.length;

  return (
    <>
      <div style={{ position: "relative", height: 240, background: "linear-gradient(135deg,#8B3A1A,#5C1208)", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          onClick={() => { setLbIdx(cur); setLb(true); }}>
          {images[cur]
            ? <img src={images[cur]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 56, opacity: 0.45 }}>{emoji}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Tap เพื่อดูรูป</span>
              </div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 50%)" }} />
        </div>
        {n > 1 && <>
          <button onClick={e => { e.stopPropagation(); setCur(i => (i - 1 + n) % n); }}
            style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={16} color="#fff" />
          </button>
          <button onClick={e => { e.stopPropagation(); setCur(i => (i + 1) % n); }}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.35)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={16} color="#fff" />
          </button>
          <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
            {images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setCur(i); }}
                style={{ width: i === cur ? 18 : 6, height: 6, borderRadius: 3, background: i === cur ? "#fff" : "rgba(255,255,255,0.4)", border: "none", padding: 0, cursor: "pointer", transition: "width 0.2s" }} />
            ))}
          </div>
        </>}
      </div>

      {lb && (
        <div onClick={() => setLb(false)}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLb(false)}
            style={{ position: "absolute", top: 18, right: 18, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={16} color="#fff" />
          </button>
          {n > 1 && <>
            <button onClick={e => { e.stopPropagation(); setLbIdx(i => (i - 1 + n) % n); }}
              style={{ position: "absolute", left: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={22} color="#fff" />
            </button>
            <button onClick={e => { e.stopPropagation(); setLbIdx(i => (i + 1) % n); }}
              style={{ position: "absolute", right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={22} color="#fff" />
            </button>
          </>}
          <div onClick={e => e.stopPropagation()}
            style={{ width: "82%", maxWidth: 400, aspectRatio: "1", borderRadius: 18, overflow: "hidden", background: "#333", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {images[lbIdx] ? <img src={images[lbIdx]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 72 }}>{emoji}</span>}
          </div>
          {n > 1 && (
            <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
              {images.map((_, i) => (
                <div key={i} style={{ width: i === lbIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === lbIdx ? "#fff" : "rgba(255,255,255,0.35)", transition: "width 0.2s" }} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
// คำนวณ addon ที่ถูก reserve ใน cart ทั้งหมด (ไม่นับ currentCartItemId ถ้าระบุ)
function calcCartReserved(cart, excludeId = null) {
  const reserved = {};
  cart.forEach(item => {
    if (item.id === excludeId) return;
    item.addons.forEach(a => {
      reserved[a.id] = (reserved[a.id] || 0) + a.qty * item.qty;
    });
  });
  return reserved;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedSet, setSelectedSet] = useState(null);
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // customize state
  const [soup, setSoup] = useState("");
  const [spice, setSpice] = useState("");
  const [addonQty, setAddonQty] = useState({});
  const [orderQty, setOrderQty] = useState(1);
  const [includeSideDish, setIncludeSideDish] = useState(true);
  const [note, setNote] = useState("");

  // delivery state
  const [custName, setCustName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [selectedRound, setSelectedRound] = useState(null);

  // API data — stock เก็บ bags_remaining จริงจาก server
  const [serverStock, setServerStock] = useState({});
  const [rounds, setRounds] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [lineUserId, setLineUserId] = useState("test-user");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const initApp = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) { liff.login(); return; }
        const profile = await liff.getProfile();
        setLineUserId(profile.userId);
        setDisplayName(profile.displayName);
      } catch (err) { console.error("LIFF init:", err); }

      const cbName = "jcb_" + Date.now();
      const script = document.createElement("script");
      window[cbName] = (data) => {
        setServerStock(data.stock || {});
        setRounds(data.rounds || []);
        setPickup(data.pickup || {});
        setLoading(false);
        delete window[cbName];
        document.body.removeChild(script);
      };
      script.src = `${APPS_SCRIPT_URL}?action=getInitData&callback=${cbName}`;
      script.onerror = () => setLoading(false);
      document.body.appendChild(script);
    };
    initApp();
  }, []);

  const grandTotal = useMemo(() => cart.reduce((s, i) => s + i.totalPrice, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  // Stock ที่เหลือจริง = server stock - ของที่ reserve ใน cart แล้ว
  const cartReserved = useMemo(() => calcCartReserved(cart), [cart]);

  function effectiveStock(id) {
    const serverAmt = serverStock[id]?.bags_remaining || 0;
    const reserved = cartReserved[id] || 0;
    return Math.max(0, serverAmt - reserved);
  }

  // ใน customize page: available สำหรับ addon id นี้
  // = effectiveStock - (addonQty[id] * orderQty ที่กำลัง config อยู่แล้ว)
  // แต่ addonQty ยังไม่ได้ add to cart ดังนั้น effectiveStock คือ max ที่เลือกได้ทั้งหมด
  // ต้องคำนวณว่าเลือกได้กี่ถุงต่อ orderQty
  function maxAddonPerUnit(id) {
    const avail = effectiveStock(id);
    if (orderQty <= 0) return 0;
    return Math.floor(avail / orderQty);
  }

  function updateAddon(id, delta) {
    setAddonQty(prev => {
      const cur = prev[id] || 0;
      const max = maxAddonPerUnit(id);
      if (delta > 0 && cur >= max) return prev;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  }

  function goCustomize(set) {
    setSelectedSet(set);
    setSoup(""); setSpice(""); setAddonQty({});
    setOrderQty(1); setIncludeSideDish(true); setNote("");
    setPage("customize");
  }

  function addToCart() {
    const addons = allAddons.filter(a => (addonQty[a.id] || 0) > 0)
      .map(a => ({ id: a.id, name: a.name, grams: serverStock[a.id]?.grams || a.grams, qty: addonQty[a.id], price: a.price }));
    const addonTotal = addons.reduce((s, a) => s + a.price * a.qty, 0);
    const totalPrice = (selectedSet.price + addonTotal) * orderQty;
    setCart(prev => [...prev, {
      id: Date.now() + "", set: selectedSet, spice, soup,
      addons, includeSideDish, note, qty: orderQty, totalPrice,
    }]);
    setPage("home");
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  // UX: soup เลือกแล้ว + ซุปน้ำดำ ไม่ต้องเลือกความเผ็ด
  const needSpice = soup === "ซุปหมาล่า";
  const canAdd = soup !== "" && (!needSpice || spice !== "");

  // ข้อความปุ่มใส่ตะกร้า
  function addBtnLabel(itemTotal) {
    if (!soup) return "กรุณาเลือกน้ำซุป";
    if (needSpice && !spice) return "กรุณาเลือกระดับความเผ็ด";
    return `ใส่ตะกร้า · ฿${itemTotal.toLocaleString()}`;
  }

  const canConfirm = custName.trim() && phone.trim() && deliveryType &&
    (deliveryType === "pickup" || (deliveryType === "round" && selectedRound));

  async function submitOrder() {
    setSubmitting(true); setApiError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "submitOrder", lineUserId,
          displayName: displayName || custName, custName, phone,
          items: cart.map(item => ({
            set: item.set.name, spice: item.spice || "-", soup: item.soup,
            addons: item.addons, includeSideDish: item.includeSideDish,
            note: item.note, qty: item.qty, itemTotal: item.totalPrice,
          })),
          delivery_type: deliveryType, round_id: selectedRound || null, total: grandTotal,
        }),
      });
      const data = await res.json();
      if (data.success) { setOrderId(data.orderId); setShowConfirm(true); }
      else setApiError(data.error || "เกิดข้อผิดพลาด");
    } catch { setApiError("ส่งออเดอร์ไม่ได้ กรุณาลองใหม่"); }
    setSubmitting(false);
  }

  function resetAll() {
    setShowConfirm(false); setCart([]); setPage("home");
    setCustName(""); setPhone(""); setDeliveryType(""); setSelectedRound(null);
  }

  const pageStyle = { display: "flex", flexDirection: "column", height: "100vh", background: C.bg, maxWidth: 520, margin: "0 auto", fontFamily: "'Sarabun', sans-serif" };

  if (loading) return (
    <div style={{ ...pageStyle, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Loader size={24} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ color: C.muted, fontSize: 13 }}>กำลังโหลด...</span>
    </div>
  );

  return (
    <div style={{ background: "#F0F0F0", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box} input,textarea{outline:none;font-family:'Sarabun',sans-serif}
        button{font-family:'Sarabun',sans-serif} .tap{transition:transform 0.1s} .tap:active{transform:scale(0.97)}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {page === "home" && (
        <HomePage sets={SETS} cart={cart} totalItems={totalItems} grandTotal={grandTotal}
          onSelect={goCustomize} onCartClick={() => setPage("cart")} />
      )}

      {page === "customize" && selectedSet && (
        <div style={pageStyle}>
          <CustomizePage
            set={selectedSet} soup={soup} setSoup={s => { setSoup(s); if (s !== "ซุปหมาล่า") setSpice(""); }}
            spice={spice} setSpice={setSpice} needSpice={needSpice}
            addonQty={addonQty} serverStock={serverStock} maxAddonPerUnit={maxAddonPerUnit}
            updateAddon={updateAddon} orderQty={orderQty}
            setOrderQty={newQty => {
              // re-cap addons when qty changes
              setAddonQty(prev => {
                const next = { ...prev };
                allAddons.forEach(a => {
                  const avail = effectiveStock(a.id);
                  const newMax = newQty > 0 ? Math.floor(avail / newQty) : 0;
                  if ((prev[a.id] || 0) > newMax) next[a.id] = newMax;
                });
                return next;
              });
              setOrderQty(newQty);
            }}
            includeSideDish={includeSideDish} setIncludeSideDish={setIncludeSideDish}
            note={note} setNote={setNote}
            canAdd={canAdd} addBtnLabel={addBtnLabel}
            onBack={() => setPage("home")} onAdd={addToCart}
          />
        </div>
      )}

      {page === "cart" && (
        <div style={pageStyle}>
          <CartPage cart={cart} grandTotal={grandTotal} totalItems={totalItems}
            onBack={() => setPage("home")} onAddMore={() => setPage("home")}
            onRemove={removeFromCart} onCheckout={() => setPage("delivery")} />
        </div>
      )}

      {page === "delivery" && (
        <div style={pageStyle}>
          <DeliveryPage custName={custName} setCustName={setCustName}
            phone={phone} setPhone={setPhone}
            deliveryType={deliveryType} setDeliveryType={v => { setDeliveryType(v); setSelectedRound(null); }}
            selectedRound={selectedRound} setSelectedRound={setSelectedRound}
            rounds={rounds} pickup={pickup} grandTotal={grandTotal}
            canConfirm={canConfirm} submitting={submitting} apiError={apiError}
            onBack={() => setPage("cart")} onConfirm={submitOrder} />
        </div>
      )}

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.5)" }} onClick={resetAll}>
          <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: "24px 24px 0 0", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 24px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: C.line, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LineIcon />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: 0 }}>ออเดอร์ได้รับการยืนยัน</p>
                <p style={{ fontSize: 13, color: C.muted, margin: "3px 0 0" }}>ระบบส่งรายการเข้า LINE OA แล้ว</p>
              </div>
            </div>
            <div style={{ background: C.input, borderRadius: 16, padding: 16, marginBottom: 20 }}>
              {[["รหัสออเดอร์", orderId], ["ยอดรวม", `฿${grandTotal.toLocaleString()}`],
                ["วิธีรับ", deliveryType === "pickup" ? "รับทันทีที่จุดนัด" : `ส่งรอบ ${selectedRound}`]
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: C.muted }}>{k}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.fg }}>{v}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 16 }}>กรุณาโอนเงินและส่งสลิปภายใน 15 นาทีในแชท LINE OA</p>
            <button className="tap" onClick={resetAll} style={{ width: "100%", padding: "15px 0", borderRadius: 16, border: "none", background: C.line, color: "#fff", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <LineIcon /> กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ sets, cart, totalItems, grandTotal, onSelect, onCartClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", maxWidth: 520, margin: "0 auto", background: C.bg, fontFamily: "'Sarabun', sans-serif", position: "relative" }}>
      <div style={{ position: "relative", width: "100%", height: 220, background: "linear-gradient(135deg,#5C1208,#2E0803)", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 72, opacity: 0.18 }}>🍲</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(10,2,0,0.6) 0%,transparent 60%)" }} />
        <button onClick={onCartClick} className="tap" style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ShoppingCart size={18} color="#fff" />
          {totalItems > 0 && <span style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: C.primary, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>}
        </button>
        <div style={{ position: "absolute", bottom: 20, left: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,210,170,0.7)", margin: "0 0 6px" }}>MALA HOTPOT</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: 0 }}>คิดถึงหมาล่า</h1>
        </div>
      </div>

      <div style={{ flex: 1, padding: "20px 16px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: C.primary }} />
          <h2 style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: 0 }}>เมนูแนะนำ</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
          {sets.map((set, idx) => (
            <button key={set.id} onClick={() => onSelect(set)} className="tap"
              style={{ display: "flex", alignItems: "center", padding: 0, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", borderTop: idx > 0 ? `1px solid ${C.border}` : "none", width: "100%" }}>
              <div style={{ width: 100, height: 88, flexShrink: 0, background: set.id === "diy" ? "linear-gradient(135deg,#2A5C2A,#1A3A1A)" : "linear-gradient(135deg,#8B3A1A,#5C1208)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 36 }}>{set.emoji}</span>
              </div>
              <div style={{ flex: 1, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: C.fg, margin: 0 }}>{set.name}</p>
                  {set.id === "diy" && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 10, background: "#E8F5E8", color: "#2A7A2A", fontWeight: 700 }}>DIY</span>}
                </div>
                <p style={{ fontSize: 12, color: C.muted, margin: "0 0 8px", lineHeight: 1.4 }}>{set.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: C.fg }}>{set.id === "diy" ? "เริ่ม " : ""}฿{set.price}</span>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plus size={16} color="#fff" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {cart.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, display: "flex", justifyContent: "center", padding: "0 16px 16px" }}>
          <button onClick={onCartClick} className="tap" style={{ width: "100%", maxWidth: 520, background: C.fg, borderRadius: 16, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", border: "none", cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{totalItems}</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>ดูตะกร้า</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>฿{grandTotal.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Customize Page ───────────────────────────────────────────────────────────
function CustomizePage({ set, soup, setSoup, spice, setSpice, needSpice, addonQty, serverStock, maxAddonPerUnit, updateAddon, orderQty, setOrderQty, includeSideDish, setIncludeSideDish, note, setNote, canAdd, addBtnLabel, onBack, onAdd }) {
  const isDIY = set.id === "diy";
  const addonTotal = allAddons.reduce((s, a) => s + a.price * (addonQty[a.id] || 0), 0);
  const itemTotal = (set.price + addonTotal) * orderQty;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* Image gallery + back btn */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ImageGallery images={set.images} emoji={set.emoji} name={set.name} />
        <button onClick={onBack} className="tap"
          style={{ position: "absolute", top: 14, left: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 10 }}>
          <ArrowLeft size={16} color="#fff" />
        </button>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: "#fff", margin: 0 }}>{set.name}</h2>
              {isDIY && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "rgba(255,255,255,0.2)", color: "#fff", fontWeight: 700 }}>DIY</span>}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 700 }}>{isDIY ? "เริ่ม " : ""}฿{set.price}</span>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* ส่วนประกอบ */}
        {!isDIY && set.items.length > 0 && (
          <div style={{ padding: "12px 16px", background: C.card, borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: "0 0 7px", letterSpacing: "0.04em" }}>ส่วนประกอบในเซต</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {set.items.map(it => (
                <span key={it.name} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: C.input, color: C.muted, border: `1px solid ${C.border}` }}>
                  {it.name} {it.grams}ก.
                </span>
              ))}
            </div>
          </div>
        )}
        {isDIY && (
          <div style={{ padding: "12px 16px", background: "#F0FAF0", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 12, color: "#2A7A2A", margin: 0, fontWeight: 600 }}>🎉 เลือกวัตถุดิบได้ตามใจ เพิ่มเองได้ทั้งหมดด้านล่าง</p>
          </div>
        )}

        <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 1. ประเภทซุป (ก่อน) */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>ประเภทซุป</span>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: C.tag, color: C.tagText, fontWeight: 600 }}>จำเป็น</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {SOUPS.map(s => (
                <button key={s} onClick={() => setSoup(s)} className="tap"
                  style={{ padding: "11px 8px", borderRadius: 12, border: soup === s ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`, background: soup === s ? C.tag : C.card, color: soup === s ? C.primary : C.fg, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 2. ระดับความเผ็ด (แสดงเฉพาะซุปหมาล่า) */}
          {needSpice && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>ระดับความเผ็ด</span>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: C.tag, color: C.tagText, fontWeight: 600 }}>จำเป็น</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {SPICE_LEVELS.map(({ key, label }) => (
                  <button key={key} onClick={() => setSpice(key)} className="tap"
                    style={{ padding: "11px 6px", borderRadius: 12, border: spice === key ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`, background: spice === key ? C.tag : C.card, color: spice === key ? C.primary : C.fg, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. เพิ่มเครื่อง */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>เพิ่มเครื่อง</span>
              <span style={{ fontSize: 11, color: C.muted }}>{isDIY ? "เลือกได้ตามใจ" : "ไม่บังคับ"}</span>
            </div>
            {ADDON_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: "0 0 7px", letterSpacing: "0.04em" }}>{group.label}</p>
                <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
                  {group.items.map((addon, i) => {
                    const qty = addonQty[addon.id] || 0;
                    const stockItem = serverStock[addon.id];
                    const maxPerUnit = maxAddonPerUnit(addon.id);
                    const totalAvail = stockItem?.bags_remaining || 0;
                    const soldOut = totalAvail <= 0;
                    const atMax = qty >= maxPerUnit;
                    const grams = stockItem?.grams || addon.grams;

                    return (
                      <div key={addon.id} style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderBottom: i < group.items.length - 1 ? `1px solid ${C.border}` : "none", opacity: soldOut ? 0.45 : 1 }}>
                        <div style={{ flex: 1, marginRight: 10 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: C.fg, margin: "0 0 2px" }}>{addon.name}</p>
                          <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                            {grams}ก./ชุด · +{addon.price}฿
                            {soldOut && <span style={{ color: C.primary, marginLeft: 6 }}>หมดแล้ว</span>}
                            {!soldOut && maxPerUnit <= 2 && maxPerUnit > 0 && <span style={{ color: "#E07000", marginLeft: 6 }}>เหลือ {maxPerUnit}</span>}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button onClick={() => updateAddon(addon.id, -1)} disabled={qty === 0} className="tap"
                            style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${qty > 0 ? C.primary : C.border}`, background: "transparent", color: qty > 0 ? C.primary : C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: qty === 0 ? "default" : "pointer" }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ width: 20, textAlign: "center", fontWeight: 700, fontSize: 14, color: C.fg }}>{qty}</span>
                          <button onClick={() => updateAddon(addon.id, 1)} disabled={soldOut || atMax} className="tap"
                            style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${soldOut || atMax ? C.border : C.primary}`, background: "transparent", color: soldOut || atMax ? C.muted : C.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: soldOut || atMax ? "default" : "pointer" }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 4. ของแถม */}
          <button onClick={() => setIncludeSideDish(!includeSideDish)} className="tap"
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 14, border: `1.5px solid ${includeSideDish ? C.primary : C.border}`, background: includeSideDish ? C.tag : C.card, cursor: "pointer", textAlign: "left", width: "100%" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${includeSideDish ? C.primary : C.border}`, background: includeSideDish ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {includeSideDish && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>แถมพริกและกระเทียมสับฟรี</span>
              <p style={{ fontSize: 11, color: C.muted, margin: "2px 0 0" }}>กดยกเลิกถ้าไม่ต้องการ</p>
            </div>
          </button>

          {/* 5. Note */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.fg, margin: "0 0 8px" }}>หมายเหตุเพิ่มเติม</p>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น ไม่ใส่กระเทียม, แพ้อาหาร..." rows={3}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.fg, fontSize: 13, resize: "none", fontFamily: "'Sarabun', sans-serif" }} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: C.card, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Qty picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, border: `1.5px solid ${C.border}` }}>
            <button onClick={() => setOrderQty(Math.max(1, orderQty - 1))} className="tap"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Minus size={15} color={C.fg} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.fg, minWidth: 18, textAlign: "center" }}>{orderQty}</span>
            <button onClick={() => setOrderQty(orderQty + 1)} className="tap"
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Plus size={15} color={C.fg} />
            </button>
          </div>
          {/* Add to cart */}
          <button onClick={canAdd ? onAdd : undefined} className="tap"
            style={{ flex: 1, padding: "13px 0", borderRadius: 12, border: "none", background: canAdd ? C.primary : C.input, color: canAdd ? "#fff" : C.muted, fontWeight: 700, fontSize: 13, cursor: canAdd ? "pointer" : "not-allowed" }}>
            {addBtnLabel(itemTotal)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Page ─────────────────────────────────────────────────────────────────
function CartPage({ cart, grandTotal, totalItems, onBack, onAddMore, onRemove, onCheckout }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} className="tap" style={{ width: 34, height: 34, borderRadius: "50%", background: C.input, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={15} color={C.fg} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: C.fg, margin: 0, flex: 1 }}>ตะกร้าของฉัน</h2>
        {totalItems > 0 && <span style={{ fontSize: 12, color: C.muted }}>{totalItems} รายการ</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {cart.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
            <ShoppingCart size={48} color={C.border} />
            <p style={{ color: C.muted, fontSize: 14 }}>ยังไม่มีรายการ</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cart.map(item => (
              <div key={item.id} style={{ padding: 16, borderRadius: 16, background: C.card, border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: C.fg, margin: "0 0 2px" }}>{item.set.name} ×{item.qty}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                      {item.soup}{item.spice ? ` · เผ็ด${item.spice}` : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: C.fg }}>฿{item.totalPrice.toLocaleString()}</span>
                    <button onClick={() => onRemove(item.id)} className="tap"
                      style={{ fontSize: 11, color: C.primary, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Sarabun', sans-serif" }}>
                      ลบ
                    </button>
                  </div>
                </div>
                {item.addons.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                    {item.addons.map(a => (
                      <span key={a.id} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.input, color: C.muted }}>
                        {a.name} ×{a.qty}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {item.includeSideDish && <span style={{ fontSize: 11, color: C.muted }}>🌶 พริก+กระเทียมฟรี</span>}
                  {item.note && <span style={{ fontSize: 11, color: C.muted }}>📝 {item.note}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onAddMore} className="tap" style={{ marginTop: 12, width: "100%", padding: "13px 0", borderRadius: 14, border: `2px dashed ${C.border}`, background: "transparent", color: C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          + เพิ่มรายการอาหาร
        </button>
      </div>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, background: C.card, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, color: C.muted }}>รวมทั้งหมด</span>
          <span style={{ fontWeight: 800, fontSize: 22, color: C.fg }}>฿{grandTotal.toLocaleString()}</span>
        </div>
        <button onClick={onCheckout} disabled={cart.length === 0} className="tap"
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: cart.length > 0 ? C.primary : C.input, color: cart.length > 0 ? "#fff" : C.muted, fontWeight: 700, fontSize: 15, cursor: cart.length > 0 ? "pointer" : "not-allowed" }}>
          กรอกข้อมูลจัดส่ง →
        </button>
      </div>
    </div>
  );
}

// ─── Delivery Page ─────────────────────────────────────────────────────────────
function DeliveryPage({ custName, setCustName, phone, setPhone, deliveryType, setDeliveryType, selectedRound, setSelectedRound, rounds, pickup, grandTotal, canConfirm, submitting, apiError, onBack, onConfirm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, background: C.card }}>
        <button onClick={onBack} className="tap" style={{ width: 34, height: 34, borderRadius: "50%", background: C.input, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={15} color={C.fg} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 15, color: C.fg, margin: 0 }}>ข้อมูลจัดส่ง</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        {[{ label: "ชื่อ-นามสกุล", val: custName, set: setCustName, type: "text", ph: "กรอกชื่อ-นามสกุล" },
          { label: "เบอร์โทรศัพท์", val: phone, set: setPhone, type: "tel", ph: "กรอกเบอร์โทรศัพท์" }
        ].map(({ label, val, set, type, ph }) => (
          <div key={label} style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 7 }}>{label}</label>
            <input value={val} onChange={e => set(e.target.value)} placeholder={ph} type={type}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${val ? C.primary : C.border}`, background: C.card, color: C.fg, fontSize: 14 }} />
          </div>
        ))}

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 8 }}>วิธีรับอาหาร</label>
          <div style={{ display: "flex", gap: 5, padding: 5, borderRadius: 14, background: C.input }}>
            {[{ key: "pickup", label: "รับทันที" }, { key: "round", label: "ส่งตามรอบ" }].map(({ key, label }) => (
              <button key={key} onClick={() => setDeliveryType(key)} className="tap"
                style={{ flex: 1, padding: "10px 8px", borderRadius: 11, border: "none", background: deliveryType === key ? C.card : "transparent", color: deliveryType === key ? C.primary : C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: deliveryType === key ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {deliveryType === "pickup" && pickup && (
          <div style={{ padding: 14, borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, marginBottom: 18, display: "flex", gap: 10 }}>
            <MapPin size={16} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: C.fg, margin: "0 0 3px" }}>จุดรับอาหาร</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{pickup.pickup_location}</p>
              {pickup.pickup_note && <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0" }}>{pickup.pickup_note}</p>}
            </div>
          </div>
        )}

        {deliveryType === "round" && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Clock size={14} color={C.muted} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>เลือกรอบเวลา</span>
            </div>
            {rounds.length === 0 ? (
              <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "20px 0" }}>ยังไม่มีรอบส่งที่เปิดรับ</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {rounds.map(r => (
                  <button key={r.round_id} onClick={() => setSelectedRound(r.round_id)} className="tap"
                    style={{ padding: "12px 8px", borderRadius: 12, border: selectedRound === r.round_id ? `2px solid ${C.primary}` : `1.5px solid ${C.border}`, background: selectedRound === r.round_id ? C.tag : C.card, color: selectedRound === r.round_id ? C.primary : C.fg, cursor: "pointer", textAlign: "center" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>{r.time} น.</p>
                    <p style={{ fontSize: 10, color: selectedRound === r.round_id ? C.primary : C.muted, margin: 0 }}>{r.label}</p>
                    <p style={{ fontSize: 10, color: C.muted, margin: "2px 0 0" }}>ว่าง {r.remaining}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {apiError && <p style={{ color: C.primary, fontSize: 13, textAlign: "center", marginBottom: 8 }}>{apiError}</p>}
      </div>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, background: C.card, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: C.muted }}>ยอดรวม</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: C.fg }}>฿{grandTotal.toLocaleString()}</span>
        </div>
        <button onClick={onConfirm} disabled={!canConfirm || submitting} className="tap"
          style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: canConfirm && !submitting ? C.line : C.input, color: canConfirm && !submitting ? "#fff" : C.muted, fontWeight: 700, fontSize: 15, cursor: canConfirm && !submitting ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {submitting ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> กำลังส่ง...</> : <><LineIcon /> ยืนยันออเดอร์</>}
        </button>
      </div>
    </div>
  );
}