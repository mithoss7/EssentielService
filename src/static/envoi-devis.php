<?php
/* ---------------------------------------------------------------------------
 *  Envoi du formulaire de contact par e-mail (hébergement mutualisé OVH, PHP)
 *
 *  Les valeurs %%…%% sont remplacées par build.js depuis config/site.config.js.
 *
 *  Envoi par SMTP authentifié (recommandé par OVH) si le fichier
 *  config-smtp.php existe dans le dossier PARENT de www/ (jamais accessible
 *  depuis le web, jamais dans le dépôt Git) :
 *
 *    <?php return ['utilisateur' => 'contact@…', 'motDePasse' => '…'];
 *
 *  Sinon, repli sur la fonction mail() de PHP.
 * ------------------------------------------------------------------------- */

const DESTINATAIRE = '%%contact.email%%';
const NOM_SITE     = '%%identite.nomCommercial%%';
const DOMAINE      = '%%site.domaine%%';
const SMTP_HOTE    = 'ssl0.ovh.net';
const SMTP_PORT    = 465;

date_default_timezone_set('Europe/Paris');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

function repondre(int $code, bool $ok, string $erreur = ''): void {
  http_response_code($code);
  echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'erreur' => $erreur], JSON_UNESCAPED_UNICODE);
  exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') repondre(405, false, 'Méthode non autorisée.');

// Champ anti-robots rempli, ou formulaire envoyé trop vite : on fait semblant
// d'accepter pour ne pas renseigner le robot.
$debut = (int) ($_POST['_t'] ?? 0);
if (trim($_POST['_gotcha'] ?? '') !== '' || ($debut > 0 && (int) round(microtime(true) * 1000) - $debut < 3000)) {
  repondre(200, true);
}

// Lecture et nettoyage : une ligne (sans retour chariot) ou un texte libre
function champ(string $nom, int $max = 200): string {
  $v = trim((string) ($_POST[$nom] ?? ''));
  $v = preg_replace('/[\r\n\t]+/', ' ', $v);
  return mb_substr($v, 0, $max);
}
$nom       = champ('nom', 100);
$telephone = champ('telephone', 30);
$email     = champ('email', 150);
$commune   = champ('commune', 100);
$service   = champ('serviceLibelle', 100) ?: champ('service', 100);
$frequence = champ('frequenceLibelle', 60) ?: champ('frequence', 60);
$debutPresta = champ('debut', 100);
$classe    = champ('classe', 60);
$creneau   = champ('creneauLibelle', 60) ?: champ('creneau', 60);
$message   = mb_substr(trim(str_replace("\r\n", "\n", (string) ($_POST['message'] ?? ''))), 0, 5000);

if ($nom === '' || $telephone === '' || $message === '' || empty($_POST['consentement'])) {
  repondre(422, false, 'Merci de remplir les champs obligatoires.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) repondre(422, false, 'Adresse e-mail invalide.');

// Limite simple : 5 envois par heure et par adresse IP
$dossierLimite = dirname(__DIR__) . '/tmp-formulaire';
if (!is_dir($dossierLimite)) @mkdir($dossierLimite, 0700, true);
$fichierIp = $dossierLimite . '/' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . DOMAINE);
$envois = array_filter(
  is_file($fichierIp) ? array_map('intval', file($fichierIp, FILE_IGNORE_NEW_LINES)) : [],
  fn($t) => $t > time() - 3600
);
if (count($envois) >= 5) repondre(429, false, 'Trop de demandes envoyées. Merci de réessayer plus tard ou de téléphoner.');

$nonPrecise = 'non précisé';
$sujet = 'Demande de devis – ' . ($service ?: 'service non précisé') . ' – ' . $nom;
$corps = implode("\n", [
  'Nouvelle demande reçue via le formulaire de ' . DOMAINE,
  '',
  'Nom : ' . $nom,
  'Téléphone : ' . $telephone,
  'E-mail : ' . $email,
  'Commune : ' . ($commune ?: 'non précisée'),
  'Service souhaité : ' . ($service ?: $nonPrecise),
  'Fréquence : ' . ($frequence ?: $nonPrecise),
  'À partir de : ' . ($debutPresta ?: $nonPrecise),
  "Âge ou classe de l'enfant : " . ($classe ?: $nonPrecise),
  'Créneau de rappel : ' . ($creneau ?: 'peu importe'),
  '',
  'Message :',
  $message,
  '',
  '—',
  'Consentement RGPD donné le ' . date('d/m/Y à H:i') . '.',
  'Répondre à ce message écrit directement à ' . $email . '.',
]);

$enTetes = [
  'From'                      => '=?UTF-8?B?' . base64_encode(NOM_SITE . ' (site)') . '?= <' . DESTINATAIRE . '>',
  'To'                        => DESTINATAIRE,
  'Reply-To'                  => '=?UTF-8?B?' . base64_encode($nom) . '?= <' . $email . '>',
  'Subject'                   => '=?UTF-8?B?' . base64_encode($sujet) . '?=',
  'Date'                      => date('r'),
  'Message-ID'                => '<' . bin2hex(random_bytes(12)) . '@' . DOMAINE . '>',
  'MIME-Version'              => '1.0',
  'Content-Type'              => 'text/plain; charset=UTF-8',
  'Content-Transfer-Encoding' => 'base64',
];
$corpsEncode = rtrim(chunk_split(base64_encode($corps), 76, "\r\n"));

/* Envoi SMTP minimal (SSL implicite, AUTH LOGIN) */
function envoyerSmtp(array $id, array $enTetes, string $corps): bool {
  $f = @stream_socket_client('ssl://' . SMTP_HOTE . ':' . SMTP_PORT, $errno, $errstr, 15);
  if (!$f) return false;
  stream_set_timeout($f, 15);
  $lire = function () use ($f) {
    $r = '';
    while (($l = fgets($f, 515)) !== false) { $r .= $l; if (isset($l[3]) && $l[3] === ' ') break; }
    return (int) substr($r, 0, 3);
  };
  $cmd = function (string $c, int $attendu) use ($f, $lire) {
    fwrite($f, $c . "\r\n");
    return $lire() === $attendu;
  };
  $ok = $lire() === 220
    && $cmd('EHLO ' . DOMAINE, 250)
    && $cmd('AUTH LOGIN', 334)
    && $cmd(base64_encode($id['utilisateur']), 334)
    && $cmd(base64_encode($id['motDePasse']), 235)
    && $cmd('MAIL FROM:<' . $id['utilisateur'] . '>', 250)
    && $cmd('RCPT TO:<' . DESTINATAIRE . '>', 250)
    && $cmd('DATA', 354);
  if ($ok) {
    $donnees = '';
    foreach ($enTetes as $k => $v) $donnees .= $k . ': ' . $v . "\r\n";
    $ok = $cmd($donnees . "\r\n" . $corps . "\r\n.", 250);
  }
  @fwrite($f, "QUIT\r\n");
  fclose($f);
  return $ok;
}

$identifiants = dirname(__DIR__) . '/config-smtp.php';
if (is_file($identifiants)) {
  $envoye = envoyerSmtp(require $identifiants, $enTetes, $corpsEncode);
} else {
  $autres = $enTetes;
  unset($autres['To'], $autres['Subject']);
  $lignes = '';
  foreach ($autres as $k => $v) $lignes .= $k . ': ' . $v . "\r\n";
  $envoye = mail(DESTINATAIRE, $enTetes['Subject'], $corpsEncode, rtrim($lignes), '-f' . DESTINATAIRE);
}

if (!$envoye) repondre(502, false, "L'envoi a échoué.");

$envois[] = time();
@file_put_contents($fichierIp, implode("\n", $envois), LOCK_EX);
repondre(200, true);
