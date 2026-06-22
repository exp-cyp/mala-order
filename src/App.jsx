import { useState, useEffect, useMemo } from "react";
import { ShoppingCart, ArrowLeft, Minus, Plus, Check, Loader, MapPin, Clock } from "lucide-react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzIXUJSBXcmVy6suk-dg8ZvJe2A8FiQo4rrzeqANzbKE3jRZISmiil8ey_ssb28OgRWyg/exec";
const LIFF_ID = "2010455338-s9xBTgbN";

// ─── Color tokens (from Figma) ─────────────────────────────────────────────
const C = {
  bg: "#FDF6EE", bgOuter: "#E8D5BE", card: "#FFFFFF",
  fg: "#1A0A06", muted: "#8B6040", border: "rgba(200,100,40,0.14)",
  borderMd: "rgba(200,100,40,0.25)", primary: "#D93026",
  accent: "#F07A20", secondary: "#FFF0E5", input: "#F5ECE2",
  line: "#06C755",
};

// ─── Static data ───────────────────────────────────────────────────────────
const SETS = [
  {
    id: "pork", name: "เซตหมู", price: 99,
    description: "สันคอหมูสไลซ์, สามชั้นสไลซ์, เห็ดรวม, ผักสด, เส้นมันเทศ",
    image: null,
    items: [
      { name: "สันคอหมูสไลซ์ + สามชั้น", grams: 120 },
      { name: "เห็ดรวม (หูหนู/เข็มทอง/ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 },
      { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศใหญ่", grams: 100 },
    ],
  },
  {
    id: "seafood", name: "เซตทะเล", price: 129,
    description: "กุ้ง, หมึก, เห็ดรวม, ผักสด, เส้นมันเทศ",
    image: null,
    items: [
      { name: "กุ้ง + หมึก", grams: 120 },
      { name: "เห็ดรวม (หูหนู/เข็มทอง/ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 },
      { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศเล็ก", grams: 100 },
    ],
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
    label: "โปรตีนเพิ่ม",
    items: [
      { id: "A1", name: "สันคอสไลซ์", grams: 60, price: 20 },
      { id: "A2", name: "สามชั้นสไลซ์", grams: 60, price: 20 },
      { id: "A3", name: "กุ้ง", grams: 60, price: 35 },
      { id: "A4", name: "หมึก", grams: 60, price: 30 },
    ],
  },
  {
    label: "ผัก / เห็ด",
    items: [
      { id: "B1", name: "เห็ดหูหนู", grams: 60, price: 15 },
      { id: "B2", name: "เห็ดเข็มทอง", grams: 60, price: 15 },
      { id: "B3", name: "เห็ดออริจิ", grams: 60, price: 20 },
      { id: "B4", name: "ผักบุ้ง", grams: 60, price: 10 },
      { id: "B5", name: "ผักกาดขาว", grams: 60, price: 10 },
    ],
  },
  {
    label: "เส้น",
    items: [
      { id: "C1", name: "เส้นมันเทศใหญ่", grams: 60, price: 15 },
      { id: "C2", name: "เส้นมันเทศเล็ก", grams: 60, price: 15 },
      { id: "C3", name: "บะหมี่ผัก", grams: 60, price: 15 },
    ],
  },
];

const allAddons = ADDON_GROUPS.flatMap(g => g.items);

function LineIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" style={{ width: 20, height: 20 }}>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [selectedSet, setSelectedSet] = useState(null);
  const [cart, setCart] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // customize state
  const [spice, setSpice] = useState("");
  const [soup, setSoup] = useState("");
  const [addonQty, setAddonQty] = useState({});
  const [orderQty, setOrderQty] = useState(1);

  // delivery state
  const [custName, setCustName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [selectedRound, setSelectedRound] = useState(null);

  // API data
  const [stock, setStock] = useState({});
  const [rounds, setRounds] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // LIFF
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
      } catch (err) {
        console.error("LIFF init error:", err);
      }

      const callbackName = "jsonpCallback_" + Date.now();
      const script = document.createElement("script");
      window[callbackName] = (data) => {
        setStock(data.stock || {});
        setRounds(data.rounds || []);
        setPickup(data.pickup || {});
        setLoading(false);
        delete window[callbackName];
        document.body.removeChild(script);
      };
      script.src = `${APPS_SCRIPT_URL}?action=getInitData&callback=${callbackName}`;
      script.onerror = () => { setLoading(false); };
      document.body.appendChild(script);
    };
    initApp();
  }, []);

  const grandTotal = useMemo(() => cart.reduce((s, i) => s + i.totalPrice, 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  function getAvailable(id) {
    const stockItem = stock[id];
    if (!stockItem) return 0;
    const inCart = cart.reduce((sum, ci) => sum + (ci.addons.find(a => a.id === id)?.qty || 0), 0);
    return stockItem.bags_remaining - inCart;
  }

  function updateAddon(id, delta) {
    const available = getAvailable(id);
    setAddonQty(prev => {
      const cur = prev[id] || 0;
      if (delta > 0 && cur >= available) return prev;
      const next = Math.max(0, Math.min(available, cur + delta));
      return { ...prev, [id]: next };
    });
  }

  function goCustomize(set) {
    setSelectedSet(set);
    setSpice(""); setSoup(""); setAddonQty({}); setOrderQty(1);
    setPage("customize");
  }

  function addToCart() {
    const addons = allAddons.filter(a => (addonQty[a.id] || 0) > 0)
      .map(a => ({ id: a.id, name: a.name, grams: stock[a.id]?.grams || a.grams, qty: addonQty[a.id], price: a.price }));
    const addonTotal = addons.reduce((s, a) => s + a.price * a.qty, 0);
    const totalPrice = (selectedSet.price + addonTotal) * orderQty;
    setCart(prev => [...prev, {
      id: Date.now() + "",
      set: selectedSet, spice, soup, addons, sideDish: true, qty: orderQty, totalPrice,
    }]);
    setPage("home");
  }

  const canAdd = spice !== "" && soup !== "";

  const canConfirm = custName.trim() !== "" && phone.trim() !== "" && deliveryType !== "" &&
    (deliveryType === "pickup" || (deliveryType === "round" && selectedRound));

  async function submitOrder() {
    setSubmitting(true); setApiError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "submitOrder",
          lineUserId, displayName: displayName || custName,
          custName, phone,
          items: cart.map(item => ({
            set: item.set.name, spice: item.spice, soup: item.soup,
            addons: item.addons, qty: item.qty, itemTotal: item.totalPrice,
          })),
          delivery_type: deliveryType,
          round_id: selectedRound || null,
          total: grandTotal,
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

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "'Sarabun', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Loader size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} />
      <span style={{ color: C.muted, fontSize: 14 }}>กำลังโหลด...</span>
    </div>
  );

  const pageWrapper = {
    display: "flex", flexDirection: "column", minHeight: "100vh",
    width: "100%", background: C.bg, maxWidth: 520, margin: "0 auto",
    boxShadow: "0 0 40px rgba(0,0,0,0.12)", fontFamily: "'Sarabun', sans-serif",
    position: "relative",
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: C.bgOuter, fontFamily: "'Sarabun', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input { outline: none; }
        button { font-family: 'Sarabun', sans-serif; }
        .tap { transition: transform 0.1s; }
        .tap:active { transform: scale(0.96); }
      `}</style>

      {page === "home" && (
        <HomePage
          sets={SETS} cart={cart} totalItems={totalItems} grandTotal={grandTotal}
          onSelect={goCustomize} onCartClick={() => setPage("cart")}
        />
      )}

      {page === "customize" && selectedSet && (
        <div style={pageWrapper}>
          <CustomizePage
            set={selectedSet} spice={spice} setSpice={setSpice}
            soup={soup} setSoup={setSoup}
            addonQty={addonQty} stock={stock}
            updateAddon={updateAddon}
            orderQty={orderQty} setOrderQty={setOrderQty}
            canAdd={canAdd} onBack={() => setPage("home")} onAdd={addToCart}
          />
        </div>
      )}

      {page === "cart" && (
        <div style={pageWrapper}>
          <CartPage
            cart={cart} grandTotal={grandTotal} totalItems={totalItems}
            onBack={() => setPage("home")}
            onAddMore={() => setPage("home")}
            onCheckout={() => setPage("delivery")}
          />
        </div>
      )}

      {page === "delivery" && (
        <div style={pageWrapper}>
          <DeliveryPage
            custName={custName} setCustName={setCustName}
            phone={phone} setPhone={setPhone}
            deliveryType={deliveryType}
            setDeliveryType={(v) => { setDeliveryType(v); setSelectedRound(null); }}
            selectedRound={selectedRound} setSelectedRound={setSelectedRound}
            rounds={rounds} pickup={pickup}
            grandTotal={grandTotal} canConfirm={canConfirm}
            submitting={submitting} apiError={apiError}
            onBack={() => setPage("cart")} onConfirm={submitOrder}
          />
        </div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)" }} onClick={resetAll}>
          <div style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 40px" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "#E0E0E0", margin: "0 auto 20px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: C.line, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LineIcon style={{ color: "#fff" }} />
              </div>
              <div>
                <p style={{ fontWeight: 700, color: C.fg, fontSize: 16, margin: 0 }}>ออเดอร์ได้รับการยืนยัน!</p>
                <p style={{ fontSize: 13, color: C.muted, margin: "2px 0 0" }}>ระบบส่งรายการเข้า LINE OA แล้ว</p>
              </div>
            </div>
            <div style={{ background: C.secondary, borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.muted }}>รหัสออเดอร์</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.fg }}>{orderId}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: C.muted }}>ยอดรวม</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: C.primary }}>฿{grandTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.muted }}>วิธีรับ</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.fg }}>
                  {deliveryType === "pickup" ? "รับทันทีที่จุดนัด" : `ส่งรอบ ${selectedRound}`}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginBottom: 16 }}>
              📌 กรุณาโอนเงินและส่งสลิปภายใน 15 นาทีในแชท LINE OA
            </p>
            <button className="tap" onClick={resetAll}
              style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: C.line, color: "#fff", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <LineIcon /> กลับหน้าหลัก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────
function HomePage({ sets, cart, totalItems, grandTotal, onSelect, onCartClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative" }}>
      {/* Hero */}
      <div style={{ position: "relative", width: "100%", height: 280, background: "#6B1A10" }}>
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #6B1A10 0%, #3D0D06 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 64 }}>🍲</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(20,5,2,0.75) 0%, rgba(20,5,2,0.2) 55%, transparent 100%)" }} />
        <button onClick={onCartClick} className="tap"
          style={{ position: "absolute", top: 20, right: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ShoppingCart size={20} color="#fff" />
          {totalItems > 0 && (
            <span style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.primary, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{totalItems}</span>
          )}
        </button>
        <div style={{ position: "absolute", bottom: 24, left: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.2em", color: "rgba(255,220,180,0.85)", margin: "0 0 4px" }}>MALA HOTPOT</p>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>คิดถึง<br />หมาล่า</h1>
        </div>
      </div>

      {/* Menu */}
      <div style={{ flex: 1, padding: "24px 16px 120px", background: "#FDF6EE" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(to bottom, ${C.primary}, ${C.accent})` }} />
          <h2 style={{ fontWeight: 700, fontSize: 17, color: C.fg, margin: 0 }}>เมนูแนะนำ</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sets.map(set => (
            <SetCard key={set.id} set={set} onClick={() => onSelect(set)} />
          ))}
        </div>
      </div>

      {/* Sticky cart bar */}
      {cart.length > 0 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, display: "flex", justifyContent: "center", padding: "0 16px 16px" }}>
          <div style={{ width: "100%", maxWidth: 520, background: "linear-gradient(135deg, #1A0A06, #2E0F08)", borderRadius: 20, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid rgba(240,122,32,0.25)", boxShadow: "0 8px 32px rgba(20,5,2,0.45)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(217,48,38,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShoppingCart size={18} color={C.accent} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,220,180,0.7)", margin: 0 }}>{totalItems} รายการในตะกร้า</p>
                <p style={{ fontWeight: 800, fontSize: 16, color: "#fff", margin: 0 }}>฿{grandTotal.toLocaleString()}</p>
              </div>
            </div>
            <button onClick={onCartClick} className="tap"
              style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.primary}, #C0271E)`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 3px 10px rgba(217,48,38,0.4)" }}>
              ไปตะกร้า →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SetCard({ set, onClick }) {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: C.card, boxShadow: "0 2px 14px rgba(180,80,30,0.1)", border: `1px solid ${C.border}` }}>
      <button onClick={onClick} style={{ width: "100%", height: 180, background: "#C0927A", border: "none", cursor: "pointer", padding: 0, position: "relative", display: "block" }}>
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #8B4513 0%, #6B1A10 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 56 }}>{set.id === "pork" ? "🥩" : "🦐"}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 60%)" }} />
      </button>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: "0 0 4px" }}>{set.name}</h3>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.5 }}>{set.description}</p>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: C.primary, marginLeft: 12 }}>฿{set.price}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClick} className="tap"
            style={{ width: 40, height: 40, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.primary}, #C0271E)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 12px rgba(217,48,38,0.35)" }}>
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customize Page ────────────────────────────────────────────────────────
function CustomizePage({ set, spice, setSpice, soup, setSoup, addonQty, stock, updateAddon, orderQty, setOrderQty, canAdd, onBack, onAdd }) {
  const addonTotal = allAddons.reduce((s, a) => s + a.price * (addonQty[a.id] || 0), 0);
  const itemTotal = (set.price + addonTotal) * orderQty;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} className="tap" style={{ width: 36, height: 36, borderRadius: "50%", background: C.input, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={16} color={C.fg} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: 0, flex: 1 }}>{set.name}</h2>
        <span style={{ fontSize: 14, color: C.muted }}>฿{set.price}</span>
      </div>

      {/* รายการใน set */}
      <div style={{ padding: "12px 16px", background: C.secondary, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, margin: "0 0 6px", letterSpacing: "0.05em" }}>ส่วนประกอบในเซต</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {set.items.map(it => (
            <span key={it.name} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: C.card, color: C.muted, border: `1px solid ${C.border}` }}>
              {it.name} ({it.grams}ก.)
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>

        {/* ความเผ็ด */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>ระดับความเผ็ด</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#FFECEB", color: C.primary }}>จำเป็น</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {SPICE_LEVELS.map(({ key, label }) => (
              <button key={key} onClick={() => setSpice(key)} className="tap"
                style={{ padding: "12px 8px", borderRadius: 14, border: spice === key ? `2px solid ${C.primary}` : `1.5px solid ${C.borderMd}`, background: spice === key ? C.primary : C.card, color: spice === key ? "#fff" : C.fg, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ซุป */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>ประเภทซุป</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#FFECEB", color: C.primary }}>จำเป็น</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {SOUPS.map(s => (
              <button key={s} onClick={() => setSoup(s)} className="tap"
                style={{ padding: "12px 8px", borderRadius: 14, border: soup === s ? `2px solid ${C.accent}` : `1.5px solid ${C.borderMd}`, background: soup === s ? C.accent : C.card, color: soup === s ? "#fff" : C.fg, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.fg }}>เพิ่มเครื่อง</span>
            <span style={{ fontSize: 11, color: C.muted }}>ไม่บังคับ</span>
          </div>
          {ADDON_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, margin: "0 0 8px", letterSpacing: "0.05em" }}>{group.label}</p>
              <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${C.border}`, background: C.card }}>
                {group.items.map((addon, i) => {
                  const qty = addonQty[addon.id] || 0;
                  const available = stock[addon.id] ? stock[addon.id].bags_remaining - qty : 0;
                  const soldOut = (stock[addon.id]?.bags_remaining || 0) <= 0;
                  const grams = stock[addon.id]?.grams || addon.grams;
                  return (
                    <div key={addon.id} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < group.items.length - 1 ? `1px solid ${C.border}` : "none", opacity: soldOut ? 0.5 : 1 }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.fg, margin: "0 0 2px" }}>{addon.name}</p>
                        <p style={{ fontSize: 11, color: C.muted, margin: 0 }}>
                          {grams}ก./ชุด · +{addon.price} บาท
                          {soldOut && <span style={{ color: C.primary, marginLeft: 6 }}>หมดแล้ว</span>}
                          {!soldOut && stock[addon.id] && stock[addon.id].bags_remaining <= 3 &&
                            <span style={{ color: C.accent, marginLeft: 6 }}>เหลือ {stock[addon.id].bags_remaining}</span>}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button onClick={() => updateAddon(addon.id, -1)} className="tap"
                          style={{ width: 28, height: 28, borderRadius: "50%", border: qty > 0 ? `1.5px solid ${C.primary}` : `1.5px solid ${C.borderMd}`, background: "transparent", color: qty > 0 ? C.primary : C.muted, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                          <Minus size={12} />
                        </button>
                        <span style={{ width: 20, textAlign: "center", fontWeight: 700, fontSize: 14, color: C.fg }}>{qty}</span>
                        <button onClick={() => updateAddon(addon.id, 1)} disabled={soldOut} className="tap"
                          style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${C.primary}`, background: "transparent", color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: soldOut ? "default" : "pointer", opacity: soldOut ? 0.3 : 1 }}>
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

        {/* ของแถม */}
        <div style={{ padding: 16, borderRadius: 16, background: C.secondary, border: `1.5px solid rgba(217,48,38,0.2)`, display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 4, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.fg }}>แถมพริกและกระเทียมสับฟรี</span>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 14, border: `1.5px solid ${C.borderMd}`, background: C.card }}>
            <button onClick={() => setOrderQty(Math.max(1, orderQty - 1))} className="tap" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Minus size={16} color={C.fg} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 15, color: C.fg, minWidth: 20, textAlign: "center" }}>{orderQty}</span>
            <button onClick={() => setOrderQty(orderQty + 1)} className="tap" style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
              <Plus size={16} color={C.fg} />
            </button>
          </div>
          <button onClick={onAdd} disabled={!canAdd} className="tap"
            style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "none", background: canAdd ? `linear-gradient(135deg, ${C.primary}, #C0271E)` : C.input, color: canAdd ? "#fff" : C.muted, fontWeight: 700, fontSize: 14, cursor: canAdd ? "pointer" : "not-allowed", boxShadow: canAdd ? "0 4px 14px rgba(217,48,38,0.3)" : "none" }}>
            {canAdd ? `ใส่ตะกร้า · ฿${itemTotal.toLocaleString()}` : "กรุณาเลือกความเผ็ดและซุป"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Page ─────────────────────────────────────────────────────────────
function CartPage({ cart, grandTotal, totalItems, onBack, onAddMore, onCheckout }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} className="tap" style={{ width: 36, height: 36, borderRadius: "50%", background: C.input, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={16} color={C.fg} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: 0, flex: 1 }}>ตะกร้าของฉัน</h2>
        {cart.length > 0 && <span style={{ fontSize: 13, color: C.muted }}>{totalItems} รายการ</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {cart.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12 }}>
            <ShoppingCart size={56} color="rgba(200,100,40,0.25)" />
            <p style={{ color: C.muted, fontSize: 14 }}>ยังไม่มีรายการในตะกร้า</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cart.map(item => (
              <div key={item.id} style={{ padding: 16, borderRadius: 20, background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(180,80,30,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: C.fg, margin: "0 0 2px" }}>{item.set.name} ×{item.qty}</p>
                    <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{item.soup} · เผ็ด{item.spice}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>฿{item.totalPrice.toLocaleString()}</span>
                </div>
                {item.addons.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {item.addons.map(a => (
                      <span key={a.id} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#FFF0E5", color: "#C45A10", border: "1px solid rgba(240,122,32,0.25)" }}>
                        {a.name} ×{a.qty}
                      </span>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 11, color: C.muted, margin: "8px 0 0" }}>+ แถมพริกและกระเทียมสับ</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={onAddMore} className="tap"
          style={{ marginTop: 12, width: "100%", padding: "14px 0", borderRadius: 16, border: `2px dashed rgba(217,48,38,0.45)`, background: "transparent", color: C.primary, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          + เพิ่มรายการอาหาร
        </button>
      </div>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: C.muted }}>{totalItems} รายการ</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, color: C.muted }}>รวม</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: C.fg }}>฿{grandTotal.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={onCheckout} disabled={cart.length === 0} className="tap"
          style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: cart.length > 0 ? `linear-gradient(135deg, ${C.primary}, #C0271E)` : C.input, color: cart.length > 0 ? "#fff" : C.muted, fontWeight: 700, fontSize: 15, cursor: cart.length > 0 ? "pointer" : "not-allowed", boxShadow: cart.length > 0 ? "0 4px 14px rgba(217,48,38,0.3)" : "none" }}>
          กรอกข้อมูลจัดส่ง
        </button>
      </div>
    </div>
  );
}

// ─── Delivery Page ─────────────────────────────────────────────────────────
function DeliveryPage({ custName, setCustName, phone, setPhone, deliveryType, setDeliveryType, selectedRound, setSelectedRound, rounds, pickup, grandTotal, canConfirm, submitting, apiError, onBack, onConfirm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 16px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <button onClick={onBack} className="tap" style={{ width: 36, height: 36, borderRadius: "50%", background: C.input, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <ArrowLeft size={16} color={C.fg} />
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: C.fg, margin: 0 }}>ข้อมูลจัดส่ง</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        {/* ชื่อ */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 8 }}>ชื่อ-นามสกุล</label>
          <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="ชื่อ-นามสกุล"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: custName ? `1.5px solid rgba(217,48,38,0.4)` : `1.5px solid ${C.borderMd}`, background: C.card, color: C.fg, fontSize: 14, fontFamily: "'Sarabun', sans-serif" }} />
        </div>

        {/* เบอร์โทร */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 8 }}>เบอร์โทรศัพท์</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="เบอร์โทรศัพท์" type="tel"
            style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: phone ? `1.5px solid rgba(217,48,38,0.4)` : `1.5px solid ${C.borderMd}`, background: C.card, color: C.fg, fontSize: 14, fontFamily: "'Sarabun', sans-serif" }} />
        </div>

        {/* วิธีรับ */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.fg, marginBottom: 10 }}>วิธีรับอาหาร</label>
          <div style={{ display: "flex", gap: 6, padding: 6, borderRadius: 16, background: C.input }}>
            {[
              { key: "pickup", label: "รับทันที" },
              { key: "round", label: "ส่งตามรอบ" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setDeliveryType(key)} className="tap"
                style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: "none", background: deliveryType === key ? C.card : "transparent", color: deliveryType === key ? C.primary : C.muted, fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: deliveryType === key ? "0 1px 4px rgba(180,80,30,0.18)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* รับทันที — แสดงที่อยู่ */}
        {deliveryType === "pickup" && pickup && (
          <div style={{ padding: 16, borderRadius: 16, background: C.card, border: `1px solid ${C.border}`, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <MapPin size={18} color={C.primary} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: C.fg, margin: "0 0 4px" }}>จุดรับอาหาร</p>
              <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>{pickup.pickup_location}</p>
              {pickup.pickup_note && <p style={{ fontSize: 12, color: C.muted, margin: "4px 0 0" }}>{pickup.pickup_note}</p>}
            </div>
          </div>
        )}

        {/* ส่งตามรอบ — grid */}
        {deliveryType === "round" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={15} color={C.muted} />
              <label style={{ fontSize: 13, fontWeight: 700, color: C.fg }}>เลือกรอบเวลา</label>
            </div>
            {rounds.length === 0 ? (
              <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "20px 0" }}>ยังไม่มีรอบส่งที่เปิดรับ</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {rounds.map(r => (
                  <button key={r.round_id} onClick={() => setSelectedRound(r.round_id)} className="tap"
                    style={{ padding: "12px 8px", borderRadius: 14, border: selectedRound === r.round_id ? `2px solid ${C.primary}` : `1.5px solid ${C.borderMd}`, background: selectedRound === r.round_id ? `linear-gradient(135deg, ${C.primary}, #C0271E)` : C.card, color: selectedRound === r.round_id ? "#fff" : C.fg, cursor: "pointer", textAlign: "center" }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 2px" }}>{r.time} น.</p>
                    <p style={{ fontSize: 10, margin: 0, opacity: 0.8 }}>{r.label}</p>
                    <p style={{ fontSize: 10, margin: "2px 0 0", opacity: 0.7 }}>ว่าง {r.remaining}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {apiError && <p style={{ color: C.primary, fontSize: 13, textAlign: "center", marginBottom: 8 }}>{apiError}</p>}
      </div>

      <div style={{ padding: "16px", borderTop: `1px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 14, color: C.muted }}>ยอดรวมทั้งหมด</span>
          <span style={{ fontWeight: 800, fontSize: 22, color: C.fg }}>฿{grandTotal.toLocaleString()}</span>
        </div>
        <button onClick={onConfirm} disabled={!canConfirm || submitting} className="tap"
          style={{ width: "100%", padding: "16px 0", borderRadius: 16, border: "none", background: canConfirm && !submitting ? C.line : C.input, color: canConfirm && !submitting ? "#fff" : C.muted, fontWeight: 700, fontSize: 15, cursor: canConfirm && !submitting ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: canConfirm ? "0 4px 16px rgba(6,199,85,0.3)" : "none" }}>
          {submitting ? <><Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> กำลังส่ง...</> : <><LineIcon /> ยืนยันออเดอร์</>}
        </button>
      </div>
    </div>
  );
}
