export type Locale = "de" | "fr";
export const LOCALES: Locale[] = ["de", "fr"];
export const DEFAULT_LOCALE: Locale = "de";

const de = {
  // App / nav / header
  "app.name": "Rekruten-Bewertung",
  "nav.events": "Lektionen",
  "nav.recruits": "Rekruten",
  "nav.team": "Team",
  "nav.sidequest": "Sidequest",
  "header.admin": "Admin",
  "header.logout": "Abmelden",

  // Common
  "common.edit": "Bearbeiten",
  "common.delete": "Löschen",
  "common.save": "Speichern",
  "common.cancel": "Abbrechen",
  "common.add": "Hinzufügen",
  "common.backToEvents": "← Lektionen",
  "common.dash": "–",

  // Fields
  "field.email": "E-Mail",
  "field.password": "Passwort",
  "field.passwordConfirm": "Passwort bestätigen",
  "field.name": "Name",
  "field.namePlaceholder": "Vor- und Nachname",
  "field.language": "Sprache",
  "field.title": "Titel",
  "field.date": "Datum",
  "field.time": "Zeit",
  "field.chef": "Chef",

  // Languages
  "lang.de": "Deutsch",
  "lang.fr": "Französisch",
  "filter.all": "Alle",

  // Filters (Lektion list)
  "filter.day": "Tag",
  "filter.week": "Woche",
  "filter.sort": "Sortieren",
  "filter.newest": "Neuste zuerst",
  "filter.oldest": "Älteste zuerst",
  "filter.reset": "Filter zurücksetzen",

  // Login
  "login.subtitle": "Bitte melde dich an, um fortzufahren.",
  "login.invalidLink": "Der Einladungs-/Anmeldelink ist ungültig oder abgelaufen.",
  "login.submit": "Anmelden",
  "login.submitting": "Anmelden…",

  // Accept invite
  "invite.title": "Konto einrichten",
  "invite.subtitle": "Lege ein Passwort für {email} fest.",
  "invite.passwordHint": "Mindestens 8 Zeichen",
  "invite.submit": "Konto einrichten",
  "invite.submitting": "Speichern…",

  // Lektionen (events)
  "events.title": "Lektionen",
  "events.subtitle": "Wähle eine Lektion, um Rekruten zu bewerten.",
  "events.new": "Neue Lektion",
  "events.newButton": "+ Neue Lektion",
  "events.edit": "Lektion bearbeiten",
  "events.rate": "Bewerten",
  "events.results": "Auswertung",
  "events.deleteConfirm":
    "Lektion „{title}“ und alle zugehörigen Bewertungen löschen?",
  "events.empty": "Noch keine Lektionen vorhanden.",
  "events.noMatch": "Keine Lektionen gefunden.",
  "events.titlePlaceholder": "z. B. Lektion 1",
  "events.create": "Lektion erstellen",
  "events.search": "Lektion suchen…",
  "events.progressLabel": "Fortschritt",
  "events.chefNone": "Kein Chef",
  "events.chefPrefix": "Chef",

  // Bewerten / rating
  "bewerten.noRecruits": "Es sind noch keine Rekruten erfasst.",
  "bewerten.rated": "{done}/{total} bewertet",
  "bewerten.shown": "{count} angezeigt",
  "bewerten.search": "Rekrut suchen…",
  "bewerten.remarks": "Bemerkungen…",
  "save.saving": "Speichert…",
  "save.saved": "✓ Gespeichert",
  "save.error": "Fehler – erneut versuchen",
  "attendance.present": "Anwesend",
  "attendance.absent": "Abwesend",

  // Results
  "results.titlePrefix": "Auswertung – {title}",
  "results.ratingOne": "{count} Bewertung",
  "results.ratingMany": "{count} Bewertungen",

  // Recruits
  "recruits.title": "Rekruten",
  "recruits.subtitle": "Diese Liste erscheint automatisch in jeder Lektion.",
  "recruits.add": "Rekrut hinzufügen",
  "recruits.addTitle": "Neuer Rekrut",
  "recruits.editTitle": "Rekrut bearbeiten",
  "recruits.empty": "Noch keine Rekruten erfasst.",
  "recruits.noMatch": "Keine Rekruten gefunden.",
  "recruits.deleteConfirm": "Rekrut „{name}“ wirklich löschen? Der Rekrut und alle seine Bewertungen werden dauerhaft aus der Datenbank entfernt.",
  "recruits.search": "Rekrut suchen…",
  "recruits.count": "{shown}/{total} Rekruten",

  // Team
  "team.title": "Team",
  "team.subtitle": "Lade neue Teammitglieder per E-Mail ein.",
  "team.invite": "Mitglied einladen",
  "team.send": "Einladung senden",
  "team.sending": "Senden…",
  "team.inviteHint":
    "Eingeladene Personen erhalten eine E-Mail mit einem Link, um ihr Konto einzurichten.",
  "team.members": "Mitglieder",
  "team.empty": "Noch keine Mitglieder.",
  "role.admin": "Admin",
  "role.evaluator": "Bewerter",

  // Sidequests
  "sq.title": "Sidequest",
  "sq.subtitle": "Aufgaben mit Frist – für das ganze Team.",
  "sq.new": "Neue Aufgabe",
  "sq.newButton": "+ Neue Aufgabe",
  "sq.create": "Aufgabe erstellen",
  "sq.titlePlaceholder": "z. B. Material vorbereiten",
  "sq.descPlaceholder": "Details (optional)…",
  "sq.dueBy": "Zu erledigen bis",
  "sq.dueLabel": "Fällig: {datetime}",
  "sq.overdue": "Überfällig",
  "sq.done": "Erledigt",
  "sq.markDone": "Als erledigt markieren",
  "sq.markOpen": "Wieder öffnen",
  "sq.empty": "Noch keine Aufgaben erfasst.",
  "sq.deleteConfirm": "Aufgabe „{title}“ wirklich löschen?",
  "field.description": "Beschreibung",
  "err.sqTitleReq": "Titel ist erforderlich.",
  "err.sqDueReq": "Datum und Zeit sind erforderlich.",

  // Action errors / messages
  "err.credentials": "Bitte E-Mail und Passwort eingeben.",
  "err.loginFailed": "E-Mail oder Passwort ist falsch.",
  "err.emailNotConfirmed":
    "Diese E-Mail ist noch nicht bestätigt. Bestätige das Konto im Supabase-Dashboard (Auto Confirm User) und versuche es erneut.",
  "err.loginGeneric": "Anmeldung fehlgeschlagen: {msg}",
  "err.nameRequired": "Bitte deinen Namen eingeben.",
  "err.passwordMin": "Das Passwort muss mindestens 8 Zeichen lang sein.",
  "err.passwordMismatch": "Die Passwörter stimmen nicht überein.",
  "err.accountSetup": "Konto konnte nicht eingerichtet werden: {msg}",
  "err.notAllowed": "Nicht angemeldet.",
  "err.titleDateTime": "Titel, Datum und Zeit sind erforderlich.",
  "err.invalidEvent": "Ungültige Lektion.",
  "err.nameReq": "Name ist erforderlich.",
  "err.chooseLang": "Bitte eine Sprache wählen.",
  "err.invalidRecruit": "Ungültiger Rekrut.",
  "invite.emailInvalid": "Bitte eine gültige E-Mail-Adresse eingeben.",
  "invite.notConfigured":
    "Einladungen sind noch nicht konfiguriert. Bitte den Supabase Secret Key (SUPABASE_SECRET_KEY) in der Umgebung hinterlegen.",
  "invite.sent": "Einladung an {email} wurde gesendet.",
  "invite.failed": "Einladung fehlgeschlagen: {msg}",
} as const;

const fr = {
  // App / nav / header
  "app.name": "Évaluation des recrues",
  "nav.events": "Leçons",
  "nav.recruits": "Recrues",
  "nav.team": "Équipe",
  "nav.sidequest": "Sidequest",
  "header.admin": "Admin",
  "header.logout": "Se déconnecter",

  // Common
  "common.edit": "Modifier",
  "common.delete": "Supprimer",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.add": "Ajouter",
  "common.backToEvents": "← Leçons",
  "common.dash": "–",

  // Fields
  "field.email": "E-mail",
  "field.password": "Mot de passe",
  "field.passwordConfirm": "Confirmer le mot de passe",
  "field.name": "Nom",
  "field.namePlaceholder": "Prénom et nom",
  "field.language": "Langue",
  "field.title": "Titre",
  "field.date": "Date",
  "field.time": "Heure",
  "field.chef": "Chef",

  // Languages
  "lang.de": "Allemand",
  "lang.fr": "Français",
  "filter.all": "Toutes",

  // Filters (Leçon list)
  "filter.day": "Jour",
  "filter.week": "Semaine",
  "filter.sort": "Trier",
  "filter.newest": "Plus récentes d’abord",
  "filter.oldest": "Plus anciennes d’abord",
  "filter.reset": "Réinitialiser",

  // Login
  "login.subtitle": "Connecte-toi pour continuer.",
  "login.invalidLink":
    "Le lien d’invitation/de connexion est invalide ou expiré.",
  "login.submit": "Se connecter",
  "login.submitting": "Connexion…",

  // Accept invite
  "invite.title": "Configurer le compte",
  "invite.subtitle": "Définis un mot de passe pour {email}.",
  "invite.passwordHint": "Au moins 8 caractères",
  "invite.submit": "Configurer le compte",
  "invite.submitting": "Enregistrement…",

  // Leçons (events)
  "events.title": "Leçons",
  "events.subtitle": "Choisis une leçon pour évaluer les recrues.",
  "events.new": "Nouvelle leçon",
  "events.newButton": "+ Nouvelle leçon",
  "events.edit": "Modifier la leçon",
  "events.rate": "Évaluer",
  "events.results": "Résultats",
  "events.deleteConfirm":
    "Supprimer la leçon « {title} » et toutes les évaluations associées ?",
  "events.empty": "Aucune leçon pour l’instant.",
  "events.noMatch": "Aucune leçon trouvée.",
  "events.titlePlaceholder": "p. ex. Leçon 1",
  "events.create": "Créer la leçon",
  "events.search": "Rechercher une leçon…",
  "events.progressLabel": "Progression",
  "events.chefNone": "Aucun chef",
  "events.chefPrefix": "Chef",

  // Bewerten / rating
  "bewerten.noRecruits": "Aucune recrue n’a encore été enregistrée.",
  "bewerten.rated": "{done}/{total} évaluées",
  "bewerten.shown": "{count} affichées",
  "bewerten.search": "Rechercher une recrue…",
  "bewerten.remarks": "Remarques…",
  "save.saving": "Enregistrement…",
  "save.saved": "✓ Enregistré",
  "save.error": "Erreur – réessayer",
  "attendance.present": "Présent",
  "attendance.absent": "Absent",

  // Results
  "results.titlePrefix": "Résultats – {title}",
  "results.ratingOne": "{count} évaluation",
  "results.ratingMany": "{count} évaluations",

  // Recruits
  "recruits.title": "Recrues",
  "recruits.subtitle": "Cette liste apparaît automatiquement dans chaque leçon.",
  "recruits.add": "Ajouter une recrue",
  "recruits.addTitle": "Nouvelle recrue",
  "recruits.editTitle": "Modifier la recrue",
  "recruits.empty": "Aucune recrue enregistrée.",
  "recruits.noMatch": "Aucune recrue trouvée.",
  "recruits.deleteConfirm": "Supprimer définitivement la recrue « {name} » ? La recrue et toutes ses évaluations seront supprimées de la base de données.",
  "recruits.search": "Rechercher une recrue…",
  "recruits.count": "{shown}/{total} recrues",

  // Team
  "team.title": "Équipe",
  "team.subtitle": "Invite de nouveaux membres par e-mail.",
  "team.invite": "Inviter un membre",
  "team.send": "Envoyer l’invitation",
  "team.sending": "Envoi…",
  "team.inviteHint":
    "Les personnes invitées reçoivent un e-mail avec un lien pour configurer leur compte.",
  "team.members": "Membres",
  "team.empty": "Aucun membre.",
  "role.admin": "Admin",
  "role.evaluator": "Évaluateur",

  // Sidequests
  "sq.title": "Sidequest",
  "sq.subtitle": "Tâches avec échéance – pour toute l’équipe.",
  "sq.new": "Nouvelle tâche",
  "sq.newButton": "+ Nouvelle tâche",
  "sq.create": "Créer la tâche",
  "sq.titlePlaceholder": "p. ex. Préparer le matériel",
  "sq.descPlaceholder": "Détails (facultatif)…",
  "sq.dueBy": "À terminer avant le",
  "sq.dueLabel": "Échéance : {datetime}",
  "sq.overdue": "En retard",
  "sq.done": "Terminé",
  "sq.markDone": "Marquer comme terminé",
  "sq.markOpen": "Rouvrir",
  "sq.empty": "Aucune tâche pour l’instant.",
  "sq.deleteConfirm": "Supprimer la tâche « {title} » ?",
  "field.description": "Description",
  "err.sqTitleReq": "Le titre est obligatoire.",
  "err.sqDueReq": "La date et l’heure sont obligatoires.",

  // Action errors / messages
  "err.credentials": "Veuillez saisir l’e-mail et le mot de passe.",
  "err.loginFailed": "E-mail ou mot de passe incorrect.",
  "err.emailNotConfirmed":
    "Cet e-mail n’est pas encore confirmé. Confirme le compte dans le tableau de bord Supabase (Auto Confirm User) puis réessaie.",
  "err.loginGeneric": "Échec de la connexion : {msg}",
  "err.nameRequired": "Veuillez saisir votre nom.",
  "err.passwordMin": "Le mot de passe doit comporter au moins 8 caractères.",
  "err.passwordMismatch": "Les mots de passe ne correspondent pas.",
  "err.accountSetup": "Impossible de configurer le compte : {msg}",
  "err.notAllowed": "Non connecté.",
  "err.titleDateTime": "Titre, date et heure sont obligatoires.",
  "err.invalidEvent": "Leçon invalide.",
  "err.nameReq": "Le nom est obligatoire.",
  "err.chooseLang": "Veuillez choisir une langue.",
  "err.invalidRecruit": "Recrue invalide.",
  "invite.emailInvalid": "Veuillez saisir une adresse e-mail valide.",
  "invite.notConfigured":
    "Les invitations ne sont pas encore configurées. Veuillez renseigner la clé secrète Supabase (SUPABASE_SECRET_KEY) dans l’environnement.",
  "invite.sent": "Invitation envoyée à {email}.",
  "invite.failed": "Échec de l’invitation : {msg}",
} satisfies Record<keyof typeof de, string>;

export const translations = { de, fr };
export type TranslationKey = keyof typeof de;

export function t(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let str: string =
    (translations[locale] as Record<string, string>)[key] ??
    (de as Record<string, string>)[key] ??
    key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}

/** Localized label for a recruit's language value ('de' | 'fr'). */
export function recruitLangLabel(locale: Locale, lang: string): string {
  return t(locale, lang === "fr" ? "lang.fr" : "lang.de");
}
