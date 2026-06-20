import { useState, useMemo } from "react";
import { Flame, Plus, Minus, Gift, ChefHat } from "lucide-react";

// ---------- ข้อมูล (ตัวเลขเป็นค่าตัวอย่าง แก้ไขได้ทั้งหมด) ----------

const SETS = {
  pork: {
    name: "เซ็ตหมูมาล่า",
    price: 99,
    desc: "หมู 2 ส่วนคู่เห็ดสามชนิด เคียงผักสดและเส้นมันเทศเส้นใหญ่ ซดคล่องทั้งชาม",
    items: [
      { name: "หมูสไลซ์สันคอ + สามชั้น", grams: 120 },
      { name: "เห็ดรวม (หูหนู / เข็มทอง / ออริจิ)", grams: 80 },
      { name: "ผักกาดขาว", grams: 80 },
      { name: "ผักบุ้ง", grams: 50 },
      { name: "เส้นมันเทศใหญ่", grams: 100 },
    ],
  },
  seafood: {
    name: "เซ็ตทะเลมาล่า",
    price: 129,
    desc: "กุ้งและหมึกตัวเด่น คู่เห็ดสามชนิดและผักสด เส้นมันเทศเส้นเล็กซดง่าย",
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
      { id: "pork_extra", name: "หมูสไลซ์เพิ่ม", grams: 100, price: 20 },
      { id: "shrimp", name: "กุ้ง", grams: 100, price: 35 },
      { id: "squid", name: "หมึก", grams: 100, price: 30 },
    ],
  },
  {
    label: "เพิ่มผัก / เห็ด",
    items: [
      { id: "wood_ear", name: "เห็ดหูหนู", grams: 50, price: 15 },
      { id: "enoki", name: "เห็ดเข็มทอง", grams: 50, price: 15 },
      { id: "eringi", name: "เห็ดออริจิ", grams: 50, price: 20 },
      { id: "morning_glory", name: "ผักบุ้ง", grams: 50, price: 10 },
      { id: "cabbage", name: "ผักกาดขาว", grams: 80, price: 10 },
    ],
  },
  {
    label: "เพิ่มเส้น",
    items: [
      { id: "potato_l", name: "เส้นมันเทศใหญ่", grams: 100, price: 15 },
      { id: "potato_s", name: "เส้นมันเทศเล็ก", grams: 100, price: 15 },
      { id: "veggie_noodle", name: "บะหมี่ผัก", grams: 80, price: 15 },
    ],
  },
];

const C = {
  bg: "#1A1410",
  card: "#26190F",
  cardBorder: "#3D2A1B",
  red: "#C1402A",
  redDeep: "#8E2A1D",
  gold: "#D9A441",
  cream: "#F4EBDD",
  muted: "#B7A593",
  green: "#92A876",
};

export default function MalaOrderForm() {
  const [setKey, setSetKey] = useState("pork");
  const [spice, setSpice] = useState(1);
  const [addonQty, setAddonQty] = useState({});

  const set = SETS[setKey];

  const allAddons = useMemo(
    () => ADDON_GROUPS.flatMap((g) => g.items),
    []
  );

  const addonTotal = useMemo(
    () =>
      allAddons.reduce(
        (sum, item) => sum + (addonQty[item.id] || 0) * item.price,
        0
      ),
    [addonQty, allAddons]
  );

  const total = set.price + addonTotal;

  function changeQty(id, delta) {
    setAddonQty((prev) => {
      const next = Math.max(0, Math.min(3, (prev[id] || 0) + delta));
      return { ...prev, [id]: next };
    });
  }

  const selectedAddons = allAddons.filter((a) => (addonQty[a.id] || 0) > 0);

  return (
    <div
      style={{
        fontFamily: "'Noto Sans Thai', sans-serif",
        background: C.bg,
        color: C.cream,
        minHeight: "100vh",
        paddingBottom: "190px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
        .receipt-mono { font-family: 'Space Mono', monospace; }
        .pill-btn { transition: transform 0.12s ease, background 0.15s ease; }
        .pill-btn:active { transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.redDeep} 0%, ${C.red} 100%)`,
          padding: "28px 20px 22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${C.gold}33 1.5px, transparent 1.5px)`,
            backgroundSize: "18px 18px",
            opacity: 0.6,
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: C.gold,
              fontSize: "12px",
              letterSpacing: "0.15em",
              fontWeight: 700,
              marginBottom: "4px",
            }}
          >
            <ChefHat size={14} /> พรีออเดอร์รอบวันนี้
          </div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 900,
              margin: 0,
              color: C.cream,
            }}
          >
            สั่งหมาล่าโฮมเมด
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#F4EBDDcc" }}>
            เลือกเซ็ต • ระดับความเผ็ด • เพิ่มวัตถุดิบที่ชอบ
          </p>
        </div>
      </div>

      <div style={{ padding: "18px 16px 0", display: "flex", flexDirection: "column", gap: "22px" }}>
        {/* เลือกเซ็ต */}
        <section>
          <SectionTitle eyebrow="ขั้นที่ 1" title="เลือกเซ็ต" />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {Object.entries(SETS).map(([key, s]) => {
              const active = key === setKey;
              return (
                <button
                  key={key}
                  onClick={() => setSetKey(key)}
                  className="pill-btn"
                  style={{
                    textAlign: "left",
                    border: `2px solid ${active ? C.gold : C.cardBorder}`,
                    background: active ? "#3A2818" : C.card,
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                    color: C.cream,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: "17px", fontWeight: 700 }}>{s.name}</span>
                    <span className="receipt-mono" style={{ color: C.gold, fontSize: "15px" }}>
                      {s.price}.-
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: C.muted, margin: "4px 0 10px" }}>{s.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {s.items.map((it) => (
                      <div
                        key={it.name}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12.5px",
                          color: C.cream,
                          borderBottom: `1px dashed ${C.cardBorder}`,
                          paddingBottom: "3px",
                        }}
                      >
                        <span>{it.name}</span>
                        <span className="receipt-mono" style={{ color: C.muted }}>{it.grams} ก.</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ความเผ็ด */}
        <section>
          <SectionTitle eyebrow="ขั้นที่ 2" title="ระดับความเผ็ด" />
          <div style={{ display: "flex", gap: "10px" }}>
            {SPICE_LEVELS.map((label, i) => {
              const active = i === spice;
              return (
                <button
                  key={label}
                  onClick={() => setSpice(i)}
                  className="pill-btn"
                  style={{
                    flex: 1,
                    border: `2px solid ${active ? C.red : C.cardBorder}`,
                    background: active ? "#3A1B14" : C.card,
                    borderRadius: "14px",
                    padding: "12px 8px",
                    cursor: "pointer",
                    color: C.cream,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[0, 1, 2].map((f) => (
                      <Flame
                        key={f}
                        size={16}
                        fill={f <= i ? C.red : "none"}
                        color={f <= i ? C.red : C.cardBorder}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* เพิ่มวัตถุดิบ */}
        <section>
          <SectionTitle eyebrow="ขั้นที่ 3" title="เพิ่มวัตถุดิบ (เลือกได้หลายอย่าง)" />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {ADDON_GROUPS.map((group) => (
              <div key={group.label}>
                <p
                  style={{
                    fontSize: "12px",
                    color: C.gold,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    margin: "0 0 8px",
                  }}
                >
                  {group.label}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {group.items.map((item) => {
                    const qty = addonQty[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          background: C.card,
                          border: `1px solid ${qty > 0 ? C.green : C.cardBorder}`,
                          borderRadius: "12px",
                          padding: "10px 12px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 500 }}>{item.name}</div>
                          <div className="receipt-mono" style={{ fontSize: "11.5px", color: C.muted }}>
                            {item.grams} ก. / ถุง • +{item.price}.-
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            onClick={() => changeQty(item.id, -1)}
                            className="pill-btn"
                            aria-label={`ลด ${item.name}`}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: `1px solid ${C.cardBorder}`,
                              background: "transparent",
                              color: C.cream,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="receipt-mono" style={{ width: "16px", textAlign: "center" }}>{qty}</span>
                          <button
                            onClick={() => changeQty(item.id, 1)}
                            className="pill-btn"
                            aria-label={`เพิ่ม ${item.name}`}
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              border: `1px solid ${C.green}`,
                              background: qty > 0 ? C.green : "transparent",
                              color: qty > 0 ? "#1A1410" : C.green,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={14} />
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

        {/* ของแถม */}
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#2A2316",
            border: `1px dashed ${C.gold}`,
            borderRadius: "12px",
            padding: "12px 14px",
          }}
        >
          <Gift size={20} color={C.gold} />
          <p style={{ margin: 0, fontSize: "12.5px", color: C.cream }}>
            ทุกออเดอร์แถม <strong>พริก + กระเทียมเจียว 1 คู่</strong> ฟรี
          </p>
        </section>
      </div>

      {/* สรุปออเดอร์ - สไตล์ใบเสร็จ */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <div
          style={{
            height: "10px",
            backgroundColor: "#0F0B08",
            backgroundImage: `linear-gradient(45deg, ${C.bg} 25%, transparent 25%), linear-gradient(-45deg, ${C.bg} 25%, transparent 25%)`,
            backgroundSize: "16px 16px",
            backgroundPosition: "bottom",
          }}
        />
        <div className="receipt-mono" style={{ background: "#0F0B08", padding: "14px 18px 18px", color: C.cream }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
            <span>{set.name}</span>
            <span>{set.price}.-</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: C.muted, marginBottom: "6px" }}>
            <span>ความเผ็ด: {SPICE_LEVELS[spice]}</span>
            <span>{selectedAddons.length} รายการเพิ่ม</span>
          </div>
          {selectedAddons.length > 0 && (
            <div style={{ borderTop: `1px dashed ${C.cardBorder}`, paddingTop: "6px", marginBottom: "6px", display: "flex", flexDirection: "column", gap: "2px" }}>
              {selectedAddons.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: C.muted }}>
                  <span>+ {a.name} x{addonQty[a.id]}</span>
                  <span>{a.price * addonQty[a.id]}.-</span>
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              borderTop: `1px dashed ${C.cardBorder}`,
              paddingTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700 }}>รวม</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: C.gold }}>{total}.-</span>
          </div>
          <button
            className="pill-btn"
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "13px",
              borderRadius: "12px",
              border: "none",
              background: C.red,
              color: C.cream,
              fontFamily: "'Noto Sans Thai', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            ยืนยันออเดอร์
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={{ marginBottom: "10px" }}>
      <div className="receipt-mono" style={{ fontSize: "11px", color: C.muted, letterSpacing: "0.1em" }}>
        {eyebrow}
      </div>
      <h2 style={{ fontSize: "16px", fontWeight: 900, margin: "2px 0 0", color: C.cream }}>{title}</h2>
    </div>
  );
}
