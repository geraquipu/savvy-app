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
  const [pendingExperts, setPendingExperts] = useState([]);
  const [expertsList, setExpertsList] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [payoutsTableMissing, setPayoutsTableMissing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = ADMIN_EMAILS.includes(authUser?.email);

  const loadPending = () => {
    supabase.from("experts").select("id, name, role, bio, tagline, cat, location, user_id, created_at").eq("active", false).order("created_at", { ascending: false })
      .then(({ data }) => setPendingExperts(data || []));
  };

  const approveExpert = async (exp) => {
    await supabase.from("experts").update({ active: true, verified: true }).eq("id", exp.id);
    if (exp.user_id) await supabase.from("profiles").update({ is_expert: true }).eq("id", exp.user_id);
    // Notifier l'expert par email
    if (exp.user_id) {
      supabase.functions.invoke("notify-expert-approved", {
        body: { expertUserId: exp.user_id, expertName: exp.name || "Expert" },
      }).catch(e => console.warn("notify-expert-approved:", e));
    }
    setPendingExperts(p => p.filter(e => e.id !== exp.id));
    setStats(s => ({ ...s, experts: s.experts + 1 }));
  };

  const rejectExpert = async (exp) => {
    if (!window.confirm(`Rejeter la candidature de ${exp.name} ?`)) return;
    await supabase.from("experts").delete().eq("id", exp.id);
    setPendingExperts(p => p.filter(e => e.id !== exp.id));
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadPending();
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
      const revenue = books.filter(x => x.paid).reduce((s, x) => s + (x.phase_price || 0), 0);
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
      setExpertsList(exps);
      setLoading(false);
      // Virements déjà effectués (table payouts optionnelle)
      supabase.from("payouts").select("*").then(({ data, error }) => {
        if (error) setPayoutsTableMissing(true);
        else setPayouts(data || []);
      });
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
    { id: "experts", l: `Experts (${pendingExperts.length > 0 ? `⚠️ ${pendingExperts.length} en attente` : stats.experts})` },
    { id: "users", l: `Utilisateurs (${stats.users})` },
    { id: "bookings", l: `Réservations (${stats.bookings})` },
    { id: "reviews", l: `Avis (${stats.reviews})` },
    { id: "payouts", l: "Virements experts" },
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

        {/* ── Experts ── */}
        {!loading && tab === "experts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pendingExperts.length > 0 && (
              <div style={{ background: "#FEF3C7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400E", fontWeight: 600 }}>
                ⚠️ {pendingExperts.length} candidature{pendingExperts.length > 1 ? "s" : ""} en attente d'approbation
              </div>
            )}
            {pendingExperts.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: C.muted }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune candidature en attente</div>
              </div>
            )}
            {pendingExperts.map(exp => (
              <div key={exp.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.goldL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: C.goldB, flexShrink: 0 }}>
                    {(exp.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{exp.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{exp.role}</div>
                  </div>
                  <div style={{ fontSize: 10, color: C.faint }}>{new Date(exp.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                {exp.tagline && <div style={{ fontSize: 12, color: C.soft, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5, padding: "8px 10px", background: C.cream, borderRadius: 8 }}>«{exp.tagline}»</div>}
                {exp.bio && <div style={{ fontSize: 12, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>{exp.bio}</div>}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => rejectExpert(exp)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid #FCA5A5`, background: "#FEF2F2", color: "#DC2626", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕ Rejeter
                  </button>
                  <button onClick={() => approveExpert(exp)} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: C.sage, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    ✓ Approuver
                  </button>
                </div>
              </div>
            ))}
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
        {!loading && tab === "payouts" && (()=>{
          // Dû par expert = 80% des sessions payées − virements déjà effectués
          const byExpert = {};
          bookings.filter(b => b.paid).forEach(b => {
            if (!b.expert_id) return;
            if (!byExpert[b.expert_id]) byExpert[b.expert_id] = { gross: 0, sessions: 0 };
            byExpert[b.expert_id].gross += (b.phase_price || 0);
            byExpert[b.expert_id].sessions += 1;
          });
          const paidOut = {};
          payouts.forEach(p => { paidOut[p.expert_id] = (paidOut[p.expert_id] || 0) + (p.amount || 0); });
          const rows = Object.entries(byExpert).map(([eid, d]) => {
            const exp = expertsList.find(e => e.id === eid);
            const due = Math.round(d.gross * 0.8 * 100) / 100 - (paidOut[eid] || 0);
            return { eid, name: exp?.name || eid.slice(0, 8), sessions: d.sessions, gross: d.gross, due };
          }).sort((a, b) => b.due - a.due);
          const markPaid = async (r) => {
            if (!confirm(`Confirmer le virement de ${r.due}€ à ${r.name} ? (à faire manuellement par SEPA, ceci ne fait qu'enregistrer)`)) return;
            const { error } = await supabase.from("payouts").insert({ expert_id: r.eid, amount: r.due, note: `${r.sessions} session(s)` });
            if (error) { alert("Erreur : " + error.message); return; }
            const { data } = await supabase.from("payouts").select("*");
            setPayouts(data || []);
          };
          return (
            <div>
              {payoutsTableMissing && (
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 14px", marginBottom: 14, fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
                  Table <b>payouts</b> absente. Exécute dans le SQL Editor :<br/>
                  <code style={{ fontSize: 11 }}>create table payouts (id uuid primary key default gen_random_uuid(), expert_id uuid references experts(id), amount numeric not null, note text, created_at timestamptz default now());</code>
                </div>
              )}
              {rows.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>Aucune session payée pour le moment.</div>}
              {rows.map(r => (
                <div key={r.eid} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: SERIF }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{r.sessions} session(s) payée(s) · brut {r.gross}€ · commission 20%</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: r.due > 0 ? C.gold : C.sage, fontFamily: SERIF }}>{r.due > 0 ? `${r.due}€ dû` : "À jour ✓"}</div>
                    {r.due > 0 && !payoutsTableMissing && (
                      <button onClick={() => markPaid(r)} style={{ marginTop: 6, padding: "6px 12px", borderRadius: 9, border: "none", background: C.ink, color: C.white, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Marquer viré</button>
                    )}
                  </div>
                </div>
              ))}
              {payouts.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Historique des virements</div>
                  {payouts.slice().reverse().map(p => (
                    <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, padding: "7px 0", borderBottom: `1px solid ${C.borderF}` }}>
                      <span>{expertsList.find(e => e.id === p.expert_id)?.name || p.expert_id?.slice(0, 8)} · {p.note || ""}</span>
                      <span style={{ fontWeight: 700 }}>{p.amount}€ · {new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
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
