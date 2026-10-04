/**
 * main.js – Interactions du site (aucune dépendance)
 *
 *  1. En-tête : ombre au défilement
 *  2. Menu mobile (bouton « burger ») et sous-menu « Services » accessibles
 *  3. Apparition progressive des blocs .reveal (IntersectionObserver)
 *  4. Formulaire de contact : envoi vers le service configuré (Formspree,
 *     FormSubmit…) ou, à défaut, ouverture de la messagerie (mailto:)
 *  5. Pré-sélection du service depuis l'URL (?service=menage)
 *  6. Simulateur de tarif (page Tarifs)
 */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
   * 1. En-tête
   * ------------------------------------------------------------------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------------
   * 2. Menus
   * ------------------------------------------------------------------- */
  var burger = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.getElementById('menu-mobile');

  if (burger && mobileMenu) {
    mobileMenu.hidden = false; // le CSS gère l'affichage (translation)

    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    };

    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        burger.focus();
      }
    });

    // Ferme le menu si l'on repasse en affichage large
    var mq = window.matchMedia('(min-width: 960px)');
    var onChange = function (ev) { if (ev.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else mq.addListener(onChange);
  }

  // Sous-menu « Services » : clic (tactile / clavier) en plus du survol CSS
  document.querySelectorAll('[data-submenu-toggle]').forEach(function (btn) {
    var submenu = btn.nextElementSibling;
    if (!submenu) return;

    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      submenu.classList.toggle('is-open', open);
    };

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('click', function (e) {
      if (!btn.parentElement.contains(e.target)) setOpen(false);
    });
    btn.parentElement.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); btn.focus(); }
    });
  });

  /* ---------------------------------------------------------------------
   * 3. Apparition au défilement
   * ------------------------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------------
   * 4. Formulaire de contact
   * ------------------------------------------------------------------- */
  var form = document.getElementById('formulaire-contact');
  if (form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var mailto = (form.getAttribute('data-mailto') || '').trim();

    var showStatus = function (type, message) {
      if (!status) return;
      status.className = 'form__status is-' + type;
      status.textContent = message;
      status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    var serviceLabel = function () {
      var select = form.querySelector('[name="service"]');
      return select && select.selectedIndex > 0 ? select.options[select.selectedIndex].text : 'Non précisé';
    };

    var optionLabel = function (name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el && el.selectedIndex > 0 ? el.options[el.selectedIndex].text : 'non précisé';
    };

    var buildMailto = function (data) {
      var subject = 'Demande de devis – ' + serviceLabel();
      var body = [
        'Bonjour,',
        '',
        data.get('message') || '',
        '',
        '— ',
        'Nom : ' + (data.get('nom') || ''),
        'E-mail : ' + (data.get('email') || ''),
        'Téléphone : ' + (data.get('telephone') || 'non renseigné'),
        'Commune : ' + (data.get('commune') || 'non renseignée'),
        'Service souhaité : ' + serviceLabel(),
        'Fréquence : ' + optionLabel('frequence'),
        'À partir de : ' + (data.get('debut') || 'non précisé'),
        'Âge ou classe de l\'enfant : ' + (data.get('classe') || 'non précisé'),
        'Créneau de rappel : ' + optionLabel('creneau')
      ].join('\n');
      return 'mailto:' + mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validation native (les messages du navigateur sont en français)
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);

      // Anti-robots : si le champ caché est rempli, on ne fait rien
      if ((data.get('_gotcha') || '').trim() !== '') return;

      // Pas de service d'envoi configuré → messagerie du visiteur
      if (!endpoint) {
        window.location.href = buildMailto(data);
        showStatus('success', 'Votre logiciel de messagerie va s\'ouvrir avec le message pré-rempli. Il ne vous reste qu\'à cliquer sur « Envoyer ».');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      var originalLabel = submitBtn.innerHTML;
      submitBtn.textContent = 'Envoi en cours…';

      fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        showStatus('success', 'Merci ! Votre demande a bien été envoyée. Je vous réponds sous 48 h.');
      }).catch(function () {
        showStatus('error', 'Oups, l\'envoi a échoué. Vous pouvez réessayer ou m\'écrire directement à ' + mailto + '.');
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitBtn.innerHTML = originalLabel;
      });
    });

    /* -------------------------------------------------------------------
     * 5. Pré-sélection du service (lien « Demander un devis » des pages service)
     * ----------------------------------------------------------------- */
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('service');
    var select = form.querySelector('[name="service"]');
    if (wanted && select) {
      for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === wanted) { select.selectedIndex = i; break; }
      }
    }
  }
  /* ---------------------------------------------------------------------
   * 6. Simulateur de tarif (page Tarifs)
   *    Compare le coût mensuel à l'heure et, si le service en propose,
   *    le coût avec le forfait le plus adapté au volume d'heures.
   * ------------------------------------------------------------------- */
  var simBox = document.getElementById('simulateur');
  var simData = document.getElementById('simulateur-data');
  if (simBox && simData) {
    var services = [];
    try { services = JSON.parse(simData.textContent || '[]'); } catch (e) { services = []; }
    var selService = document.getElementById('sim-service');
    var inDuree = document.getElementById('sim-duree');
    var inNombre = document.getElementById('sim-nombre');
    var out = document.getElementById('sim-resultat');

    var euros = function (n) {
      return (Math.round(n * 100) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' €';
    };
    var heures = function (n) {
      var h = Math.floor(n), m = Math.round((n - h) * 60);
      return h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : '');
    };
    var ligne = function (titre, montant, detail, best) {
      return '<div class="simulateur__ligne' + (best ? ' simulateur__ligne--best' : '') + '"><span>' + titre +
        '</span><strong>' + montant + '</strong>' + (detail ? '<small>' + detail + '</small>' : '') + '</div>';
    };

    var calculer = function () {
      var s = services[selService.selectedIndex];
      if (!s) return;
      var duree = Math.max(parseFloat(String(inDuree.value).replace(',', '.')) || 0, 0);
      var nombre = Math.max(parseInt(inNombre.value, 10) || 0, 0);
      var avertissement = '';
      if (duree < s.dureeMin) {
        avertissement = '<p class="form__help">Durée minimale pour ce service : ' + heures(s.dureeMin) + '. Le calcul utilise cette durée.</p>';
        duree = s.dureeMin;
      }
      var total = duree * nombre;
      var html = ligne('Volume mensuel', heures(total), '');
      var aLHeure = total * s.taux;
      // Meilleure combinaison de forfaits entiers (5, 10, 20 h…), le reste au
      // tarif horaire, sans acheter plus d'heures que nécessaire.
      // Calcul par demi-heures (programmation dynamique).
      var forfaits = s.forfaits || [];
      var demi = Math.round(total * 2);
      var cout = [0], choix = [null];
      for (var u = 1; u <= demi; u++) {
        cout[u] = cout[u - 1] + s.taux / 2; choix[u] = null;
        forfaits.forEach(function (f) {
          var fu = Math.round(f.heures * 2);
          if (fu <= u && cout[u - fu] + f.prix < cout[u] - 0.001) { cout[u] = cout[u - fu] + f.prix; choix[u] = f; }
        });
      }
      var combinaison = {}, resteHeures = 0, v = demi;
      while (v > 0) {
        if (choix[v]) { combinaison[choix[v].heures] = (combinaison[choix[v].heures] || 0) + 1; v -= Math.round(choix[v].heures * 2); }
        else { resteHeures += 0.5; v -= 1; }
      }
      var avecForfaits = Object.keys(combinaison).length > 0;
      html += ligne('À l\'heure (' + euros(s.taux) + '/h)', euros(aLHeure) + ' / mois', '', !avecForfaits);
      if (avecForfaits) {
        var detail = Object.keys(combinaison).sort(function (x, y) { return y - x; }).map(function (h) {
          var f = forfaits.filter(function (x) { return String(x.heures) === h; })[0];
          return combinaison[h] + ' forfait' + (combinaison[h] > 1 ? 's' : '') + ' de ' + h + ' h (' + euros(f.prix) + ')';
        }).join(' + ');
        if (resteHeures) detail += ' + ' + heures(resteHeures) + ' à l\'heure';
        html += ligne('Avec des forfaits', euros(cout[demi]) + ' / mois',
          detail + '. Économie estimée : ' + euros(aLHeure - cout[demi]) + ' par mois.', true);
      } else if (forfaits.length) {
        html += '<p class="form__help">Forfaits disponibles à partir de ' + forfaits[0].heures + ' h par mois.</p>';
      }
      out.innerHTML = avertissement + html;
    };

    if (services.length) {
      services.forEach(function (s) {
        var o = document.createElement('option');
        o.textContent = s.titre;
        selService.appendChild(o);
      });
      selService.addEventListener('change', function () {
        var s = services[selService.selectedIndex];
        if (s && (parseFloat(inDuree.value) || 0) < s.dureeMin) inDuree.value = s.dureeMin;
        calculer();
      });
      inDuree.addEventListener('input', calculer);
      inNombre.addEventListener('input', calculer);
      simBox.hidden = false;
      calculer();
    }
  }
})();
