#!/usr/bin/env node
/**
 * scripts/documents.js – Génère les modèles de documents commerciaux à partir de
 * config/site.config.js : modèle de devis et modèle de contrat de prestation,
 * chacun avec son formulaire de rétractation, au format Word (.docx).
 *
 *   node scripts/documents.js            → documents/*.docx
 *   node scripts/documents.js --pdf      → + conversion PDF (LibreOffice requis)
 *
 * Ce script utilise le module npm « docx » (npm install docx). Il n'est pas
 * nécessaire à la génération du site : à relancer seulement quand les tarifs,
 * les conditions ou les mentions légales changent.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, PageBreak, TabStopType, LevelFormat, Footer, PageNumber, HeadingLevel
} = require('docx');
const { enrichConfig } = require('../build.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'documents');
const cfg = enrichConfig(require(path.join(ROOT, 'config', 'site.config.js')));

/* --------------------------------------------------------------------------
 *  Mise en page
 * ------------------------------------------------------------------------ */

const NAVY = '0F2A44';
const AQUA = '2F8A7C';
const MUTED = '5B6B7A';
const PALE = 'EEF5F3';
const PAGE_W = 11906;          // A4 en DXA
const MARGIN = 1020;           // 1,8 cm
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FONT = 'Arial';
const TITLE_FONT = 'Georgia';

const t = (text, opts = {}) => new TextRun({ text, font: FONT, size: 18, ...opts });
const p = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [t(children)],
  spacing: { after: 50, line: 250 }, ...opts
});
const titre = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun({ text, font: TITLE_FONT, size: 32, color: NAVY })],
  spacing: { before: 60, after: 100 }
});
const article = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  children: [new TextRun({ text, font: TITLE_FONT, size: 22, color: NAVY })],
  spacing: { before: 140, after: 60 },
  keepNext: true
});
const puce = (children) => new Paragraph({
  children: Array.isArray(children) ? children : [t(children)],
  numbering: { reference: 'puces', level: 0 },
  spacing: { after: 30, line: 250 }
});
const caseACocher = (text) => p([t('☐  ', { size: 22 }), t(text)]);
// Ligne à remplir : « Libellé : ………… » jusqu'au bord droit (tabulation à points
// de suite, compatible Word et LibreOffice). « largeur » = largeur utile en DXA.
const champ = (label, valeur, largeur = CONTENT_W) => new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: largeur - 40, leader: 'dot' }],
  spacing: { after: 70, line: 250 },
  children: [
    ...(label.trim() ? [t(`${label} : `, { bold: true })] : []),
    ...(valeur ? [t(valeur)] : [new TextRun({ text: '\t', font: FONT, size: 18, color: '8A99A6' })])
  ]
});
// Lignes pointillées pour un texte libre
const lignesVides = (n, largeur) => Array.from({ length: n }, () => champ('', '', largeur));
const note = (text) => p([t(text, { size: 16, color: MUTED, italics: true })]);
const separateur = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9D6D3', space: 4 } },
  spacing: { after: 160 }
});

const bord = { style: BorderStyle.SINGLE, size: 4, color: 'C9D6D3' };
const bords = { top: bord, bottom: bord, left: bord, right: bord };
const cellule = (children, width, opts = {}) => new TableCell({
  children: (Array.isArray(children) ? children : [p(children)]),
  width: { size: width, type: WidthType.DXA },
  borders: bords,
  margins: { top: 70, bottom: 70, left: 110, right: 110 },
  ...opts
});
const enTete = (text, width) => cellule([p([t(text, { bold: true, color: 'FFFFFF' })])], width, {
  shading: { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' }
});
const tableau = (largeurs, lignes) => new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: largeurs,
  rows: lignes
});

/* --------------------------------------------------------------------------
 *  Blocs communs
 * ------------------------------------------------------------------------ */

const l = cfg.legal;
const c = cfg.contact;
const id = cfg.identite;
const ouVide = (v) => (v && String(v).trim() ? v : '');

function blocPrestataire() {
  return [
    new Paragraph({ children: [new TextRun({ text: id.nomCommercial, font: TITLE_FONT, size: 36, color: NAVY })], spacing: { after: 20 } }),
    p([t(`${id.nomEI} – ${id.statut}`, { bold: true })], { spacing: { after: 20 } }),
    p([t(`SIRET ${id.siret}${l.registre ? ' – ' + l.registre : ''}${l.codeAPE ? ' – APE ' + l.codeAPE : ''}`, { color: MUTED })], { spacing: { after: 20 } }),
    l.adresseEditeur
      ? p([t(l.adresseEditeur, { color: MUTED })], { spacing: { after: 20 } })
      : champ('Adresse', ''),
    p([t(`Tél. ${c.telephone} – ${c.email}`, { color: MUTED })], { spacing: { after: 20 } }),
    p([t(l.tvaMention, { color: MUTED })]),
    separateur()
  ];
}

function blocClient() {
  const w = [CONTENT_W / 2, CONTENT_W / 2];
  return tableau(w, [
    new TableRow({ children: [enTete('Client (signataire)', w[0]), enTete('Bénéficiaire, si différent (parent âgé, enfant)', w[1])] }),
    new TableRow({ children: [
      cellule([champ('Nom et prénom', '', w[0] - 220), champ('Adresse', '', w[0] - 220), champ('', '', w[0] - 220), champ('Téléphone', '', w[0] - 220), champ('E-mail', '', w[0] - 220)], w[0]),
      cellule([champ('Nom et prénom', '', w[1] - 220), champ('Âge ou classe (enfant)', '', w[1] - 220), champ('Lien avec le client', '', w[1] - 220), champ('Lieu d\'intervention', '', w[1] - 220), champ('', '', w[1] - 220)], w[1])
    ] })
  ]);
}

function blocServices() {
  return [
    p([t('Service concerné :   ', { bold: true }), ...cfg.services.flatMap((s) => [t('☐ ', { size: 20 }), t(`${s.titre}     `)])], { spacing: { before: 80, after: 80 } })
  ];
}

function tarifsDeReference() {
  const w = [3000, 1700, CONTENT_W - 4700];
  return [
    p([t('Tarifs de référence', { bold: true, color: NAVY })], { spacing: { before: 60, after: 60 } }),
    tableau(w, [
      new TableRow({ tableHeader: true, cantSplit: true, children: [enTete('Service', w[0]), enTete('Tarif horaire', w[1]), enTete('Forfaits et précisions', w[2])] }),
      ...cfg.services.map((s) => new TableRow({ cantSplit: true, children: [
        cellule([p([t(s.titre, { size: 16 })])], w[0]),
        cellule([p([t(s.tarif ? `${s.tarif.montantAffiche} / h` : 'Sur devis', { size: 16 })])], w[1]),
        cellule([
          ...(s.tarif && s.tarif.forfaits && s.tarif.forfaits.length
            ? [p([t(s.tarif.forfaits.map((f) => `${f.heures} h : ${f.prixAffiche} (${f.parHeure})`).join(' · '), { size: 16 })])] : []),
          ...(s.tarif && s.tarif.precision ? [p([t(s.tarif.precision, { size: 15, color: MUTED })])] : [])
        ], w[2])
      ] }))
    ]),
    note(`Prix nets en euros – ${l.tvaMention}.`)
  ];
}

function blocRetractationAnticipee() {
  return [
    p([t('☐  ', { size: 22 }), t('Je demande expressément que la prestation commence avant la fin du délai de rétractation de 14 jours. J\'ai bien noté qu\'en cas de rétractation, je paierai les heures déjà réalisées au moment où j\'informe la Prestataire de ma décision.')]),
    note('À cocher uniquement si le Client souhaite un démarrage avant la fin du délai de rétractation (contrat conclu à distance ou au domicile du Client).')
  ];
}

function blocMediationAssurance() {
  const m = l.mediateur || {};
  const a = l.assurance || {};
  return [
    m.nom
      ? p([t('Médiateur de la consommation : ', { bold: true }), t(`${m.nom}${m.adresse ? ', ' + m.adresse : ''}${m.site ? ' – ' + m.site : ''}`)])
      : champ('Médiateur de la consommation (nom, adresse, site)', ''),
    a.nom
      ? p([t('Assurance responsabilité civile professionnelle : ', { bold: true }), t(`${a.nom}${a.adresse ? ', ' + a.adresse : ''}${a.couverture ? ' – couverture : ' + a.couverture : ''}`)])
      : champ('Assurance RC Pro (assureur, adresse, couverture)', '')
  ];
}

function blocSignatures(mentionClient) {
  const w = [CONTENT_W / 2, CONTENT_W / 2];
  const vide = () => p(' ', { spacing: { after: 240 } });
  return tableau(w, [
    new TableRow({ children: [enTete('Le Client', w[0]), enTete('La Prestataire', w[1])] }),
    new TableRow({ cantSplit: true, children: [
      cellule([champ('Date', '', w[0] - 220), p([t(mentionClient, { italics: true, color: MUTED })]), p([t('Signature :', { bold: true })]), vide(), vide()], w[0]),
      cellule([champ('Date', '', w[1] - 220), p([t(id.nomEI, { color: MUTED })]), p([t('Signature :', { bold: true })]), vide(), vide()], w[1])
    ] })
  ]);
}

function formulaireRetractation() {
  return [
    new Paragraph({ children: [new PageBreak()] }),
    titre('Formulaire de rétractation'),
    note('À compléter et à renvoyer uniquement si vous souhaitez vous rétracter du contrat (article L.221-18 du Code de la consommation). Délai : 14 jours à compter de la conclusion du contrat.'),
    p([t(`À l'attention de ${id.nomEI} – ${l.adresseEditeur || 'adresse indiquée en tête du devis'} – ${c.email} :`, { bold: true })], { spacing: { before: 160, after: 160 } }),
    p('Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de services ci-dessous :'),
    champ('Prestation', ''),
    champ('Commandée le', ''),
    champ('Nom du Client', ''),
    champ('Adresse du Client', ''),
    champ('', ''),
    champ('Date', ''),
    p([t('Signature du Client (uniquement en cas de notification sur papier) :', { bold: true })], { spacing: { after: 900 } })
  ];
}

const conditionsPaiement = [
  'Paiement par virement, chèque ou espèces (espèces limitées à 1 000 € par opération).',
  'Prestations ponctuelles : règlement après chaque intervention. Prestations régulières : facture récapitulative en fin de mois, à régler à réception.',
  'Pas d\'acompte pour les prestations habituelles ; un acompte peut être demandé pour une prestation importante ou nécessitant une réservation spécifique.'
];
const conditionsAnnulation = [
  'Annulation ou report sans frais jusqu\'à 24 heures avant l\'intervention. Une première annulation tardive (moins de 24 heures avant) reste sans frais.',
  'En cas d\'annulations tardives répétées, ou d\'annulation tardive ayant entraîné un déplacement inutile, 1 heure de prestation peut être facturée.',
  'Si le Client est absent à l\'heure prévue et que l\'intervention ne peut pas être réalisée (par exemple faute d\'accès au logement), 1 heure de prestation peut être facturée. La Prestataire privilégie toujours l\'échange et la recherche d\'une solution adaptée.'
];

function pied(nom) {
  return {
    default: new Footer({ children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        t(`${id.nomCommercial} – ${id.nomEI} – SIRET ${id.siret} – ${nom} – page `, { size: 15, color: MUTED }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 15, color: MUTED }),
        t(' / ', { size: 15, color: MUTED }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 15, color: MUTED })
      ]
    })] })
  };
}

function documentWord(nom, enfants) {
  return new Document({
    creator: id.nomComplet,
    title: nom,
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    numbering: { config: [{ reference: 'puces', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 900, bottom: 900, left: MARGIN, right: MARGIN } } },
      footers: pied(nom),
      children: enfants
    }]
  });
}

/* --------------------------------------------------------------------------
 *  Modèle de devis
 * ------------------------------------------------------------------------ */

function devis() {
  const w = [4466, 1500, 1900, 2000];
  const ligneVide = () => new TableRow({ children: w.map((x) => cellule(' ', x)) });
  const ligneTotal = (label, gras) => new TableRow({ children: [
    cellule([p([t(label, { bold: gras })])], w[0] + w[1] + w[2], { columnSpan: 3 }),
    cellule(' ', w[3])
  ] });
  return documentWord('Devis', [
    ...blocPrestataire(),
    titre('Devis'),
    champ('Devis n°', ''),
    champ('Date', ''),
    champ('Valable jusqu\'au', ''),
    blocClient(),
    p(' '),
    ...blocServices(),
    p([t('Description de la prestation (tâches, fréquence, durée de chaque intervention) :', { bold: true })]),
    ...lignesVides(2),
    champ('Date de début', ''),
    champ('Jours et horaires', ''),
    note(`Interventions ${c.horairesIntervention}. Durée minimale : 2 heures pour le ménage, 1 h 30 pour les autres services.`),
    tableau(w, [
      new TableRow({ children: [enTete('Désignation', w[0]), enTete('Quantité (h ou forfait)', w[1]), enTete('Prix unitaire', w[2]), enTete('Montant', w[3])] }),
      ligneVide(), ligneVide(), ligneVide(),
      ligneTotal('Frais de déplacement (au-delà de la zone d\'intervention)', false),
      ligneTotal('Majorations éventuelles (jours fériés, intervention urgente)', false),
      ligneTotal('Remise (tarif dégressif, plusieurs enfants)', false),
      ligneTotal(`TOTAL NET À PAYER – ${l.tvaMention}`, true)
    ]),
    new Paragraph({ children: [new PageBreak()] }),
    ...tarifsDeReference(),
    article('Conditions'),
    ...conditionsPaiement.map(puce),
    ...conditionsAnnulation.map(puce),
    puce('Les produits d\'entretien et le matériel sont fournis par le Client (ménage, aide aux seniors). La Prestataire n\'intervient pas en présence d\'animaux.'),
    puce('Tarifs révisés une fois par an et communiqués à l\'avance.'),
    article('Droit de rétractation (clients consommateurs)'),
    p('Lorsque le contrat est conclu à distance ou au domicile du Client, le Client consommateur dispose d\'un délai de 14 jours à compter de la signature pour se rétracter, sans motif ni pénalité, au moyen du formulaire joint ou de toute déclaration dénuée d\'ambiguïté. Aucun paiement ne peut être exigé avant l\'expiration d\'un délai de 7 jours à compter de la conclusion d\'un contrat hors établissement, sauf cas prévus par la loi.'),
    ...blocRetractationAnticipee(),
    article('Médiation et assurance'),
    ...blocMediationAssurance(),
    p([t(`Les conditions générales de prestation sont remises avec ce devis et consultables sur ${cfg.site.url}/conditions-generales.html. En signant, le Client reconnaît en avoir pris connaissance.`, { size: 17, color: MUTED })], { spacing: { before: 120, after: 160 } }),
    blocSignatures('Mention manuscrite « Bon pour accord »'),
    ...formulaireRetractation()
  ]);
}

/* --------------------------------------------------------------------------
 *  Modèle de contrat de prestation (prestations régulières)
 * ------------------------------------------------------------------------ */

function contrat() {
  return documentWord('Contrat de prestation', [
    ...blocPrestataire(),
    titre('Contrat de prestation de services à domicile'),
    p([t('Entre ', {}), t(`${id.nomEI}`, { bold: true }), t(`, ${id.statut}, SIRET ${id.siret}, ci-après « la Prestataire »,`)]),
    p('et le Client désigné ci-dessous, ci-après « le Client » :'),
    blocClient(),
    article('Article 1 – Objet'),
    ...blocServices(),
    p([t('Tâches confiées :', { bold: true })]),
    ...lignesVides(3),
    p([t('Tâches exclues : ', { bold: true }), t('celles listées sur la page de chaque service du site et, en particulier, l\'aide à la toilette, à l\'habillage et au lever, les soins, la garde des enfants de moins de 3 ans, de nuit ou d\'un enfant malade, le transport en voiture et les travaux en hauteur ou dangereux.')]),
    article('Article 2 – Durée et planning'),
    champ('Date de début', ''),
    caseACocher('Contrat à durée indéterminée'),
    caseACocher('Contrat à durée déterminée, jusqu\'au : ………………………'),
    champ('Jours et horaires convenus', ''),
    p(`Les interventions ont lieu ${c.horairesIntervention}. Durée minimale : 2 heures pour le ménage, 1 h 30 pour les autres services.${c.conges ? ' ' + c.conges : ''} Les dates précises sont communiquées à l'avance ; en cas d'empêchement, la Prestataire prévient le Client dès que possible et, si elle le peut, propose un remplacement ou un report.`),
    article('Article 3 – Prix'),
    champ('Tarif horaire', ''),
    champ('ou forfait (nombre d\'heures et prix)', ''),
    champ('Frais de déplacement', ''),
    champ('Majorations éventuelles / remise', ''),
    p(`Prix nets en euros – ${l.tvaMention}. Les tarifs sont révisés une fois par an et communiqués au Client à l'avance ; le Client peut alors résilier le contrat dans les conditions de l'article 8.`),
    ...tarifsDeReference(),
    article('Article 4 – Facturation et paiement'),
    ...conditionsPaiement.map(puce),
    article('Article 5 – Engagements de la Prestataire'),
    puce('Réaliser les tâches convenues avec soin, ponctualité et discrétion.'),
    puce('Respecter la vie privée du Client et la confidentialité de ce qu\'elle voit ou entend à son domicile.'),
    puce('Prévenir le Client dès que possible en cas d\'empêchement.'),
    article('Article 6 – Engagements du Client'),
    puce('Permettre l\'accès au lieu d\'intervention aux horaires convenus ; fournir les produits d\'entretien, le matériel, l\'eau et l\'électricité nécessaires.'),
    puce('S\'assurer qu\'aucun animal n\'est présent pendant l\'intervention : la Prestataire n\'intervient pas en présence d\'animaux.'),
    puce('Signaler toute consigne utile à la sécurité (zones fragiles, besoins particuliers de l\'enfant ou de la personne âgée).'),
    puce('Garde d\'enfants : rester joignable pendant l\'intervention, ou désigner une personne de confiance, et remplir la fiche de renseignements en annexe.'),
    puce('Soutien scolaire : fournir le matériel scolaire de l\'enfant et informer la Prestataire de ses difficultés et de ses objectifs.'),
    article('Article 7 – Annulation, absence, report'),
    ...conditionsAnnulation.map(puce),
    article('Article 8 – Résiliation'),
    p('Chaque partie peut mettre fin au contrat à tout moment, par écrit (courrier ou e-mail), moyennant un préavis de …… jours. En cas de manquement grave de l\'une des parties, le contrat peut être résilié sans préavis. Les heures réalisées restent dues ; les heures d\'un forfait non utilisées sont traitées comme indiqué au devis.'),
    article('Article 9 – Droit de rétractation (clients consommateurs)'),
    p('Lorsque le contrat est conclu à distance ou au domicile du Client, le Client consommateur dispose d\'un délai de 14 jours à compter de la signature pour se rétracter, sans motif ni pénalité, au moyen du formulaire joint ou de toute déclaration dénuée d\'ambiguïté.'),
    ...blocRetractationAnticipee(),
    article('Article 10 – Responsabilité et assurance'),
    p('La Prestataire est responsable des dommages causés par sa faute dans l\'exécution de la prestation. Tout dommage doit être signalé sans délai, de préférence dans les 48 heures. Le soutien scolaire est une aide au travail de l\'enfant et ne garantit pas de résultats scolaires.'),
    ...blocMediationAssurance(),
    article('Article 11 – Données personnelles'),
    p('Les informations recueillies (coordonnées, consignes, renseignements de l\'annexe) servent uniquement à l\'exécution du contrat et à la facturation. Elles sont conservées pendant la durée du contrat puis le temps des obligations comptables, et les renseignements de santé éventuels sont détruits à la fin du contrat. Le Client peut exercer ses droits (accès, rectification, effacement…) à l\'adresse ' + c.email + '.'),
    article('Article 12 – Litiges'),
    p('Le contrat est soumis au droit français. En cas de difficulté, les parties recherchent d\'abord une solution amiable ; le Client consommateur peut ensuite recourir gratuitement au médiateur de la consommation indiqué à l\'article 10, puis saisir la juridiction compétente.'),
    p([t('Fait en deux exemplaires, dont un remis au Client avec les conditions générales de prestation.', { italics: true, color: MUTED })], { spacing: { before: 160, after: 160 } }),
    champ('Fait à', ''),
    blocSignatures('Mention manuscrite « Lu et approuvé »'),
    // Annexe : fiche de renseignements
    new Paragraph({ children: [new PageBreak()] }),
    titre('Annexe – Fiche de renseignements'),
    note('À remplir avec le Client. Les informations de santé (allergies, traitements) ne sont recueillies qu\'avec l\'accord du Client et détruites à la fin du contrat.'),
    article('Personnes à contacter en cas d\'urgence'),
    champ('Nom, lien, téléphone', ''),
    champ('Nom, lien, téléphone', ''),
    article('Garde d\'enfants'),
    champ('Prénom et âge de chaque enfant', ''),
    champ('', ''),
    champ('Personnes autorisées à venir chercher l\'enfant', ''),
    champ('Allergies, consignes alimentaires ou médicales', ''),
    caseACocher('J\'autorise les sorties au parc et les trajets à pied vers les activités.'),
    article('Aide aux seniors'),
    champ('Personne aidée (nom, âge)', ''),
    champ('Membre de la famille à tenir informé (compte rendu)', ''),
    champ('Précautions particulières', ''),
    article('Accès au logement'),
    champ('Code, clés, consignes d\'accès', ''),
    ...formulaireRetractation()
  ]);
}

/* --------------------------------------------------------------------------
 *  Écriture des fichiers
 * ------------------------------------------------------------------------ */

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const fichiers = [['modele-devis.docx', devis()], ['modele-contrat.docx', contrat()]];
  for (const [nom, doc] of fichiers) {
    fs.writeFileSync(path.join(OUT, nom), await Packer.toBuffer(doc));
    console.log(`✔ documents/${nom}`);
  }
  if (process.argv.includes('--pdf')) {
    execFileSync('soffice', ['--headless', '--convert-to', 'pdf', '--outdir', OUT,
      ...fichiers.map(([nom]) => path.join(OUT, nom))], { stdio: 'ignore' });
    for (const [nom] of fichiers) console.log(`✔ documents/${nom.replace('.docx', '.pdf')}`);
  }
}

main().catch((err) => { console.error('✖', err.message); process.exit(1); });
