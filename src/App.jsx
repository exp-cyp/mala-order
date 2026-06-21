import { useState, useEffect, useMemo } from "react";
import { Flame, Plus, Minus, Gift, ChefHat, ShoppingCart, Trash2, MapPin, Clock, User, CheckCircle, Loader } from "lucide-react";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBpzHLDCAIIJYryXiN6c6F4VxbtkxLndxX3VKCJ6DDuf7bRYw42fLLe8vYE9X-RF_3Hw/exec";

const SETS = {
  pork: {
    key: "pork", name: "เซ็ตหมูมาล่า", price: 99,
    desc: "หมู 2 ส่วนคู่เห็ดสามชนิด เคียงผักสดและเส้นมันเทศเส้นใหญ่",
    items: [
      { name: "หมูสไลซ์สันคอ + สามชั้น", grams: 120 },
      { name: "เห็ดรวม (หูหนู / เข็มทอง / ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 },
      { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศใหญ่", grams: 100 },
    ],
  },
  seafood: {
    key: "seafood", name: "เซ็ตทะเลมาล่า", price: 129,
    desc: "กุ้งและหมึกตัวเด่น คู่เห็ดสามชนิดและผักสด เส้นมันเทศเส้นเล็ก",
    items: [
      { name: "กุ้ง + หมึก", grams: 120 },
      { name: "เห็ดรวม (หูหนู / เข็มทอง / ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 },
      { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศเล็ก", grams: 100 },
    ],
  },
};

const SPICE_LEVELS = ["น้อย", "กลาง", "มาก"];

const ADDON_GROUPS = [
  {
    label: "เพิ่มโปรตีน",
    items: [
      { id: "A1", name: "สันคอสไลซ์", grams: 60, price: 20 },
      { id: "A2", name: "สามชั้นสไลซ์", grams: 60, price: 20 },
      { id: "A3", name: "กุ้ง", grams: 60, price: 35 },
      { id: "A4", name: "หมึก", grams: 60, price: 30 },
    ],
  },
  {
    label: "เพิ่มผัก / เห็ด",
    items: [
      { id: "B1", name: "เห็ดหูหนู", grams: 60, price: 15 },
      { id: "B2", name: "เห็ดเข็มทอง", grams: 60, price: 15 },
      { id: "B3", name: "เห็ดออริจิ", grams: 60, price: 20 },
      { id: "B4", name: "ผักบุ้ง", grams: 60, price: 10 },
      { id: "B5", name: "ผักกาดขาว", grams: 60, price: 10 },
    ],
  },
  {
    label: "เพิ่มเส้น",
    items: [
      { id: "C1", name: "เส้นมันเทศใหญ่", grams: 60, price: 15 },
      { id: "C2", name: "เส้นมันเทศเล็ก", grams: 60, price: 15 },
      { id: "C3", name: "บะหมี่ผัก", grams: 60, price: 15 },
    ],
  },
];

const C = {
  bg: "#1A1410", card: "#26190F", cardBorder: "#3D2A1B",
  red: "#C1402A", redDeep: "#8E2A1D", gold: "#D9A441",
  cream: "#F4EBDD", muted: "#B7A593", green: "#92A876",
  disabled: "#4A4A4A",
};

const allAddons = ADDON_GROUPS.flatMap(g => g.items);

export default function App() {
  const [step, setStep] = useState(1);
  const [stock, setStock] = useState({});
  const [rounds, setRounds] = useState([]);
  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const [setKey, setSetKey] = useState("pork");
  const [spice, setSpice] = useState(1);
  const [addonQty, setAddonQty] = useState({});
  const [cart, setCart] = useState([]);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [selectedRound, setSelectedRound] = useState(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
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
  script.onerror = () => {
    setError("โหลดข้อมูลไม่ได้");
    setLoading(false);
  };
  document.body.appendChild(script);
}, []);

  const currentSet = SETS[setKey];
  const addonTotal = useMemo(() => allAddons.reduce((sum, item) => sum + (addonQty[item.id] || 0) * item.price, 0), [addonQty]);
  const currentItemTotal = currentSet.price + addonTotal;
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.itemTotal, 0), [cart]);

  function getAvailable(id) {
    const stockItem = stock[id];
    if (!stockItem) return 0;
    const inCart = cart.reduce((sum, ci) => sum + (ci.addons.find(a => a.id === id)?.qty || 0), 0);
    return stockItem.bags_remaining - inCart;
  }

  function changeQty(id, delta) {
    setAddonQty(prev => {
      const cur = prev[id] || 0;
      if (delta > 0 && cur >= getAvailable(id)) return prev;
      const next = Math.max(0, Math.min(3, cur + delta));
      return { ...prev, [id]: next };
    });
  }

  function addToCart() {
    const addons = allAddons.filter(a => (addonQty[a.id] || 0) > 0)
      .map(a => ({ id: a.id, name: a.name, qty: addonQty[a.id], price: a.price }));
    setCart(prev => [...prev, { setKey, setName: currentSet.name, spice: SPICE_LEVELS[spice], addons, itemTotal: currentItemTotal }]);
    setAddonQty({});
    setStep(2);
  }

  function removeFromCart(idx) { setCart(prev => prev.filter((_, i) => i !== idx)); }

  async function submitOrder() {
    if (!customerName.trim()) { setError("กรุณากรอกชื่อ"); return; }
    if (deliveryType === "round" && !selectedRound) { setError("กรุณาเลือกรอบส่ง"); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "submitOrder",
          lineUserId: "test-user",
          displayName: customerName,
          items: cart.map(item => ({ set: item.setName, spice: item.spice, addons: item.addons, itemTotal: item.itemTotal })),
          delivery_type: deliveryType,
          round_id: selectedRound || null,
          total: cartTotal,
        }),
      });
      const data = await res.json();
      if (data.success) { setOrderId(data.orderId); setStep(4); }
      else setError(data.error || "เกิดข้อผิดพลาด");
    } catch { setError("ส่งออเดอร์ไม่ได้ กรุณาลองใหม่"); }
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: C.muted, fontFamily: "'Noto Sans Thai', sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Loader size={28} color={C.gold} style={{ animation: "spin 1s linear infinite" }} />
      <span>กำลังโหลด...</span>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Noto Sans Thai', sans-serif", background: C.bg, color: C.cream, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
        .mono{font-family:'Space Mono',monospace}
        .btn{transition:transform 0.12s ease,opacity 0.15s}
        .btn:active{transform:scale(0.96)}
        *{box-sizing:border-box}
        input{outline:none}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg,${C.redDeep},${C.red})`, padding: "22px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.gold}33 1.5px,transparent 1.5px)`, backgroundSize: "18px 18px", opacity: 0.5 }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.gold, fontSize: 11, letterSpacing: "0.15em", fontWeight: 700, marginBottom: 3 }}>
              <ChefHat size={12} /> สั่งหมาล่าโฮมเมด
            </div>
            <h1 style={{ fontSize: 21, fontWeight: 900, margin: 0, color: C.cream }}>KhitthuengMala</h1>
          </div>
          {step < 4 && cart.length > 0 && (
            <button className="btn" onClick={() => setStep(2)} style={{ background: C.gold, border: "none", borderRadius: 10, padding: "6px 12px", display: "flex", alignItems: "center", gap: 5, cursor: "pointer", color: "#1A1410", fontWeight: 700, fontSize: 13 }}>
              <ShoppingCart size={14} /><span className="mono">{cart.length}</span>
            </button>
          )}
        </div>
        {step < 4 && (
          <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
            {["เซ็ต", "ตะกร้า", "ยืนยัน"].map((label, i) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: step > i ? C.gold : step === i + 1 ? C.red : "#3D2A1B", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: step > i ? "#1A1410" : C.cream }}>{i + 1}</div>
                <span style={{ fontSize: 10, color: step === i + 1 ? C.cream : C.muted }}>{label}</span>
                {i < 2 && <div style={{ width: 14, height: 1, background: C.cardBorder }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ padding: "16px 16px 200px", display: "flex", flexDirection: "column", gap: 20 }}>
          <section>
            <SectionTitle title="เลือกเซ็ต" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.values(SETS).map(s => {
                const active = s.key === setKey;
                return (
                  <button key={s.key} onClick={() => setSetKey(s.key)} className="btn"
                    style={{ textAlign: "left", border: `2px solid ${active ? C.gold : C.cardBorder}`, background: active ? "#3A2818" : C.card, borderRadius: 14, padding: 14, cursor: "pointer", color: C.cream }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{s.name}</span>
                      <span className="mono" style={{ color: C.gold, fontSize: 14 }}>{s.price}.-</span>
                    </div>
                    <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 8px" }}>{s.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {s.items.map(it => (
                        <div key={it.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: `1px dashed ${C.cardBorder}`, paddingBottom: 2 }}>
                          <span>{it.name}</span>
                          <span className="mono" style={{ color: C.muted }}>{it.grams} ก.</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionTitle title="ระดับความเผ็ด" />
            <div style={{ display: "flex", gap: 10 }}>
              {SPICE_LEVELS.map((label, i) => {
                const active = i === spice;
                return (
                  <button key={label} onClick={() => setSpice(i)} className="btn"
                    style={{ flex: 1, border: `2px solid ${active ? C.red : C.cardBorder}`, background: active ? "#3A1B14" : C.card, borderRadius: 14, padding: "10px 6px", cursor: "pointer", color: C.cream, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ display: "flex", gap: 1 }}>
                      {[0, 1, 2].map(f => <Flame key={f} size={14} fill={f <= i ? C.red : "none"} color={f <= i ? C.red : C.cardBorder} />)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionTitle title="เพิ่มวัตถุดิบ" />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {ADDON_GROUPS.map(group => (
                <div key={group.label}>
                  <p style={{ fontSize: 11, color: C.gold, fontWeight: 700, letterSpacing: "0.05em", margin: "0 0 6px" }}>{group.label}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {group.items.map(item => {
                      const qty = addonQty[item.id] || 0;
                      const available = getAvailable(item.id);
                      const soldOut = available <= 0;
                      return (
                        <div key={item.id}
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: soldOut ? "#1E1E1E" : C.card, border: `1px solid ${soldOut ? C.disabled : qty > 0 ? C.green : C.cardBorder}`, borderRadius: 12, padding: "9px 12px", opacity: soldOut ? 0.6 : 1 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: soldOut ? C.muted : C.cream }}>{item.name}</div>
                            <div className="mono" style={{ fontSize: 11, color: C.muted }}>
                              {stock[item.id]?.grams || item.grams} ก./ถุง • +{item.price}.-
                              {soldOut && <span style={{ color: C.red, marginLeft: 6 }}>หมดแล้ว</span>}
                              {!soldOut && available <= 3 && <span style={{ color: C.gold, marginLeft: 6 }}>เหลือ {available}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button onClick={() => changeQty(item.id, -1)} disabled={qty === 0} className="btn"
                              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${C.cardBorder}`, background: "transparent", color: C.cream, display: "flex", alignItems: "center", justifyContent: "center", cursor: qty === 0 ? "default" : "pointer", opacity: qty === 0 ? 0.3 : 1 }}>
                              <Minus size={12} />
                            </button>
                            <span className="mono" style={{ width: 14, textAlign: "center", fontSize: 13 }}>{qty}</span>
                            <button onClick={() => changeQty(item.id, 1)} disabled={soldOut || qty >= available} className="btn"
                              style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${soldOut ? C.disabled : C.green}`, background: qty > 0 ? C.green : "transparent", color: qty > 0 ? "#1A1410" : C.green, display: "flex", alignItems: "center", justifyContent: "center", cursor: soldOut || qty >= available ? "default" : "pointer", opacity: soldOut || qty >= available ? 0.3 : 1 }}>
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
          </section>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#2A2316", border: `1px dashed ${C.gold}`, borderRadius: 12, padding: "10px 14px" }}>
            <Gift size={16} color={C.gold} />
            <p style={{ margin: 0, fontSize: 12, color: C.cream }}>ทุกออเดอร์แถม <strong>พริก + กระเทียมเจียว 1 คู่</strong> ฟรี</p>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ padding: "16px 16px 120px", display: "flex", flexDirection: "column", gap: 12 }}>
          <SectionTitle title="ตะกร้าของคุณ" />
          {cart.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: "40px 0", fontSize: 14 }}>ยังไม่มีรายการ</div>}
          {cart.map((item, idx) => (
            <div key={idx} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.setName}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>เผ็ด{item.spice}</div>
                  {item.addons.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                      {item.addons.map(a => (
                        <div key={a.id} className="mono" style={{ fontSize: 11, color: C.muted }}>+ {a.name} x{a.qty} ({a.price * a.qty}.-)</div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className="mono" style={{ color: C.gold, fontSize: 15, fontWeight: 700 }}>{item.itemTotal}.-</span>
                  <button onClick={() => removeFromCart(idx)} className="btn"
                    style={{ background: "transparent", border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: C.muted, fontSize: 11 }}>
                    <Trash2 size={11} /> ลบ
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setStep(1)} className="btn"
            style={{ background: "transparent", border: `2px dashed ${C.cardBorder}`, borderRadius: 14, padding: 12, cursor: "pointer", color: C.muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Plus size={15} /> เพิ่มรายการอีก
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ padding: "16px 16px 120px", display: "flex", flexDirection: "column", gap: 20 }}>
          <section>
            <SectionTitle title="ชื่อผู้สั่ง" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "12px 14px" }}>
              <User size={15} color={C.muted} />
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="กรอกชื่อของคุณ"
                style={{ flex: 1, background: "transparent", border: "none", color: C.cream, fontSize: 14, fontFamily: "'Noto Sans Thai', sans-serif" }} />
            </div>
          </section>

          <section>
            <SectionTitle title="เลือกวิธีรับ" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pickup?.allow_pickup && (
                <button onClick={() => setDeliveryType("pickup")} className="btn"
                  style={{ textAlign: "left", border: `2px solid ${deliveryType === "pickup" ? C.gold : C.cardBorder}`, background: deliveryType === "pickup" ? "#3A2818" : C.card, borderRadius: 14, padding: 14, cursor: "pointer", color: C.cream }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                    <MapPin size={15} color={C.gold} /> รับเองที่จุดนัด
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{pickup.pickup_location}</div>
                </button>
              )}

              {rounds.length > 0 && (
                <div>
                  <button onClick={() => setDeliveryType("round")} className="btn"
                    style={{ width: "100%", textAlign: "left", border: `2px solid ${deliveryType === "round" ? C.gold : C.cardBorder}`, background: deliveryType === "round" ? "#3A2818" : C.card, borderRadius: 14, padding: 14, cursor: "pointer", color: C.cream }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14 }}>
                      <Clock size={15} color={C.gold} /> ส่งตามรอบเวลา
                    </div>
                  </button>
                  {deliveryType === "round" && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 7 }}>
                      {rounds.map(r => (
                        <button key={r.round_id} onClick={() => setSelectedRound(r.round_id)} className="btn"
                          style={{ textAlign: "left", border: `1px solid ${selectedRound === r.round_id ? C.green : C.cardBorder}`, background: selectedRound === r.round_id ? "#1E2A1E" : "#1E1A14", borderRadius: 12, padding: "10px 14px", cursor: "pointer", color: C.cream }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                              <div className="mono" style={{ fontSize: 11, color: C.muted }}>{r.date} • {r.time} น.</div>
                            </div>
                            <span style={{ fontSize: 11, color: C.muted }}>ว่าง {r.remaining} ที่</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {error && <div style={{ color: C.red, fontSize: 13, textAlign: "center" }}>{error}</div>}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div style={{ padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
          <CheckCircle size={52} color={C.green} />
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>ออเดอร์เข้าแล้ว!</h2>
          <div className="mono" style={{ fontSize: 13, color: C.gold }}>{orderId}</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
            รายการออเดอร์ถูกส่งเข้าแชท LINE ของคุณแล้ว<br />
            กรุณาโอนเงินและส่งสลิปภายใน 15 นาทีนะคะ
          </p>
          <div style={{ background: C.card, border: `1px dashed ${C.cardBorder}`, borderRadius: 14, padding: "14px 20px", width: "100%", maxWidth: 320 }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{item.setName} (เผ็ด{item.spice})</span>
                <span className="mono" style={{ color: C.gold }}>{item.itemTotal}.-</span>
              </div>
            ))}
            <div style={{ borderTop: `1px dashed ${C.cardBorder}`, marginTop: 8, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>รวม</span>
              <span className="mono" style={{ color: C.gold }}>{cartTotal}.-</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      {step < 4 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0F0B08", padding: "12px 16px 18px", borderTop: `1px solid ${C.cardBorder}` }}>
          {step === 1 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: C.muted }}>{currentSet.name}</span>
                <span className="mono" style={{ color: C.gold }}>{currentItemTotal}.-</span>
              </div>
              <button onClick={addToCart} className="btn"
                style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.red, color: C.cream, fontFamily: "'Noto Sans Thai', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
                เพิ่มลงตะกร้า
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: C.muted }}>{cart.length} รายการ</span>
                <span className="mono" style={{ color: C.gold }}>{cartTotal}.-</span>
              </div>
              <button onClick={() => { if (cart.length > 0) setStep(3); }} className="btn"
                style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: cart.length > 0 ? C.red : C.disabled, color: C.cream, fontFamily: "'Noto Sans Thai', sans-serif", fontWeight: 700, fontSize: 15, cursor: cart.length > 0 ? "pointer" : "default" }}>
                ไปยืนยันออเดอร์
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: C.muted }}>รวมทั้งหมด</span>
                <span className="mono" style={{ color: C.gold }}>{cartTotal}.-</span>
              </div>
              <button onClick={submitOrder} disabled={submitting} className="btn"
                style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: submitting ? C.disabled : C.green, color: "#1A1410", fontFamily: "'Noto Sans Thai', sans-serif", fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? <><Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> กำลังส่ง...</> : "ยืนยันออเดอร์"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ title }) {
  return <h2 style={{ fontSize: 15, fontWeight: 900, margin: "0 0 10px", color: C.cream }}>{title}</h2>;
}
