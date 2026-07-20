import { legalLine, EMAIL_CONTACT } from '../constants/company';
import { expertPayout } from '../constants/config';

/**
 * Relevé de revenus (conseiller) ou de paiements (client), imprimable en PDF.
 *
 * RÈGLE : les lignes viennent uniquement de réservations réellement payées.
 * Ce document porte la mention « revenus imposables » et sert de justificatif —
 * y écrire des montants d'exemple produirait une pièce comptable fausse au nom
 * de l'utilisateur. Quand il n'y a rien à déclarer, on l'écrit.
 *
 * Était dupliqué entre ClientView et ExpertView, avec dans les deux copies des
 * lignes de démonstration codées en dur (Sophie Martin, 60€…).
 */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
  : '—';

const openPDF = (title, bodyHTML) => {
  const html = '<html><head><meta charset="UTF-8"><title>' + esc(title) + '</title>'
    + '<style>body{font-family:-apple-system,sans-serif;padding:40px;max-width:700px;margin:0 auto;color:#1C1917}'
    + '.logo{font-size:26px;font-weight:700;font-family:Georgia,serif;margin-bottom:24px}'
    + 'table{width:100%;border-collapse:collapse;margin:20px 0}'
    + 'th{background:#1C1917;color:#fff;padding:9px 12px;text-align:left;font-size:12px}'
    + 'td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}'
    + 'h2{font-family:Georgia,serif;margin:24px 0 8px}'
    + 'p{font-size:13px;line-height:1.8;color:#44403C}'
    + '.footer{margin-top:40px;font-size:11px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px}'
    + '@media print{.noprint{display:none}}</style></head><body>'
    + '<div class="logo">sav<em style="color:#B8864A;font-style:italic">vy</em></div>'
    + bodyHTML
    + `<div class="footer">${legalLine()} &middot; ${EMAIL_CONTACT} &middot; &copy; ${new Date().getFullYear()}</div>`
    + '<div class="noprint" style="margin-top:24px;text-align:center">'
    + '<button onclick="window.print()" style="background:#1C1917;color:#fff;border:none;padding:11px 24px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer">'
    + 'Enregistrer en PDF</button></div>'
    + '</body></html>';
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
};

/**
 * @param {string}  userName  nom réel de l'utilisateur
 * @param {boolean} isExpert  relevé de revenus (true) ou de paiements (false)
 * @param {Array}   bookings  réservations payées ({date_session, phase_name, phase_price})
 */
export function generateReleve(userName, isExpert, bookings = []) {
  const list = Array.isArray(bookings) ? bookings : [];
  const date = new Date().toLocaleDateString('fr-FR');

  const headers = isExpert
    ? '<th>Date</th><th>Session</th><th>Montant</th><th>Commission 20%</th><th>Re&ccedil;u 80%</th>'
    : '<th>Date</th><th>Session</th><th>Montant</th>';

  const rows = list.map(b => {
    const total = Number(b.phase_price) || 0;
    const net = expertPayout(total);
    const label = esc(b.phase_name || b.notes || 'Session');
    return isExpert
      ? `<tr><td>${fmtDate(b.date_session)}</td><td>${label}</td><td>${total}&euro;</td>`
        + `<td>${total - net}&euro;</td><td style="color:#065F46;font-weight:700">${net}&euro;</td></tr>`
      : `<tr><td>${fmtDate(b.date_session)}</td><td>${label}</td><td style="font-weight:700">${total}&euro;</td></tr>`;
  }).join('');

  const total = list.reduce((s, b) => {
    const p = Number(b.phase_price) || 0;
    return s + (isExpert ? expertPayout(p) : p);
  }, 0);

  const table = list.length
    ? '<table><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>'
      + `<p style="font-size:14px;font-weight:700;text-align:right;margin-top:4px">Total : ${total}&euro;</p>`
      + '<p style="font-size:12px;color:#78716C">'
      + (isExpert ? '&bull; Ces revenus sont imposables en France. Conservez ce document pour votre d&eacute;claration.'
                  : '&bull; Ces d&eacute;penses peuvent &ecirc;tre d&eacute;ductibles si usage professionnel.')
      + '</p>'
    : '<p style="background:#FAFAF9;border:1px solid #eee;border-radius:8px;padding:16px;text-align:center;color:#78716C">'
      + (isExpert
          ? 'Aucune session pay&eacute;e pour le moment. Ce relev&eacute; se remplira apr&egrave;s ta premi&egrave;re session.'
          : 'Aucun paiement pour le moment.')
      + '</p>';

  const body = '<h2>' + (isExpert ? 'Mes revenus — ' : 'Mes paiements — ') + esc(userName) + '</h2>'
    + '<p style="font-size:12px;color:#78716C">G&eacute;n&eacute;r&eacute; le ' + date + '</p>'
    + table;

  openPDF((isExpert ? 'Revenus' : 'Factures') + ' Savvy — ' + userName, body);
}
