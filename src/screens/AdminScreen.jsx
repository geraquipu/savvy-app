import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { C, SERIF, SANS } from '../constants/colors';

const ADMIN_EMAILS = ["geraquipu@hotmail.com", "german@savvy.fr"];

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: C.white, borderRadius: 14, padding: "16px", border: `1px solid ${C.border}`, boxShadow: `0 2px 8px ${C.sh}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: color || C.goldL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{label}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.ink, fontFamily: SERIF }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function AdminScreen({ authUser, onBack }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, experts: 0, bookings: 0, revenue: 0, messages: 0, reviews: 0 });
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = ADMIN_EMAILS.includes(authUser?.email);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("profiles").select("id, name, email, is_expert, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("reviews").select("*, experts(name)").order("created_at", { ascending: false }).limit(50),
      supabase.from("experts").select("id, name, active").eq("active", true),
      supabase.from("messages").select("id", { count: "exact", head: true }),
    ]).then(([p, b, r, e, m]) => {
      const profs = p.data || [];
      const books = b.data || [];
      const revs  = r.data || [];
      const exps  = e.data || [];
      const msgCount = m.count || 0;
      const revenue = books.filter(x => x.paid).reduce((s, x) => s + (x.amount || 0), 0);
      setStats({
        users: profs.length,
        experts: exps.length,
        bookings: books.length,
        paid: books.filter(x => x.paid).length,
        revenue,
        messages: msgCount,
        reviews: revs.length,
      });
      setUsers(profs);
      setBookings(books);
      setReviews(revs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: C.cream }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: SERIF }}>Accès restreint</div>
        <button onClick={onBack} style={{ marginTop: 20, padding: "12px 24px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>Retour</button>
      </div>
    );
  }

  const TABS = [
    { id: "overview", l: "Vue d'ensemble" },
    { id: "users", l: `Utilisateurs (${stats.users})` },
    { id: "bookings", l: `Réservations (${stats.bookings})` },
    { id: "reviews", l: `Avis (${stats.reviews})` },
  ];

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: SANS }}>
      {/* Header */}
      <div style={{ background: C.ink, padding: "52px 20px 20px", color: C.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.12)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: SERIF }}>Admin Savvy</div>
            <div style={{ fontSize: 11, color: "rgba(253,252,248,.5)", marginTop: 2 }}>{authUser?.email}</div>
          </div>
        </div>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, border: "none", background: tab === t.id ? C.white : "rgba(255,255,255,.12)", color: tab === t.id ? C.ink : "rgba(253,252,248,.7)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {loading && <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>Chargement…</div>}

        {/* ── Overview ── */}
        {!loading && tab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <StatCard icon="👥" label="Utilisateurs" value={stats.users} sub="profiles créés" />
              <StatCard icon="🌟" label="Experts actifs" value={stats.experts} color="#EEF3E2" />
              <StatCard icon="📅" label="Réservations" value={stats.bookings} sub={`${stats.paid || 0} payées`} />
              <StatCard icon="💶" label="Revenue total" value={`${stats.revenue}€`} color="#FEF3C7" />
              <StatCard icon="💬" label="Messages" value={stats.messages} />
              <StatCard icon="⭐" label="Avis" value={stats.reviews} color="#FEF3C7" />
            </div>

            {/* Recent bookings */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 12, fontFamily: SERIF }}>Réservations récentes</div>
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.borderF}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: b.paid ? "#10B981" : "#F59E0B", flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: C.ink }}>{b.phase_name || "Session"}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{b.amount ? `${b.amount}€` : "-"}</div>
                  <div style={{ fontSize: 10, color: C.faint }}>{new Date(b.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
              ))}
              {bookings.length === 0 && <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "16px 0" }}>Aucune réservation</div>}
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {!loading && tab === "users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map(u => (
              <div key={u.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: u.is_expert ? C.goldL : C.cream2, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: u.is_expert ? C.goldB : C.muted, flexShrink: 0 }}>
                  {(u.name || u.email || "?")[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name || u.email}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{u.email}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                  {u.is_expert && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: C.goldL, color: C.goldB, fontWeight: 700 }}>EXPERT</span>}
                  <div style={{ fontSize: 10, color: C.faint }}>{new Date(u.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
            ))}
            {users.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>Aucun utilisateur</div>}
          </div>
        )}

        {/* ── Bookings ── */}
        {!loading && tab === "bookings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {bookings.map(b => (
              <div key={b.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "13px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: SERIF }}>{b.phase_name || "Session"}</div>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: b.paid ? "#D1FAE5" : "#FEF3C7", color: b.paid ? "#065F46" : "#92400E", fontWeight: 700 }}>
                    {b.paid ? "✓ Payé" : "En attente"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.muted }}>
                  <span>💶 {b.amount ? `${b.amount}€` : "-"}</span>
                  <span>📅 {new Date(b.created_at).toLocaleDateString("fr-FR")}</span>
                  {b.stripe_session_id && <span style={{ color: C.faint, overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>Stripe ✓</span>}
                </div>
              </div>
            ))}
            {bookings.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>Aucune réservation</div>}
          </div>
        )}

        {/* ── Reviews ── */}
        {!loading && tab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: "13px 15px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{r.client_name || "Client"}</div>
                  <div style={{ display: "flex", gap: 1 }}>
                    {[1,2,3,4,5].map(s => <svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s <= r.stars ? C.gold : C.border}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                  </div>
                </div>
                {r.text && <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.5, fontStyle: "italic", marginBottom: 6 }}>"{r.text}"</div>}
                <div style={{ fontSize: 10, color: C.faint, display: "flex", gap: 10 }}>
                  <span>Expert: {r.experts?.name || r.expert_id?.slice(0,8)}</span>
                  <span>{new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>Aucun avis</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScreen;
