# Ironvale Open Air

Site d'un festival rock/metal **fictif** (8–11 juillet 2027), réalisé pour mon portfolio. C'est la refonte
d'un site de festival que j'avais codé en 2017 (HTML/CSS/jQuery, 15 pages).

**Site en ligne : https://ironvale-open-air.netlify.app/**

## Ce qui a changé par rapport à 2017
- **Une page au lieu de quinze** : line up, timetable et tickets sont des sections ; les quatre pages de paiement identiques sont devenues une seule boîte de dialogue.
- **Une seule source de données** : la line up et le timetable sont construits à partir du même tableau (`LINEUP` dans `js/main.js`). Changer un horaire le change partout.
- **De vraies photos de concert** : le visuel principal et chaque groupe utilisent des photos [Unsplash](https://unsplash.com) (licence Unsplash), choisies selon le style du groupe et listées dans l'objet `PHOTOS` de `js/main.js`. Les crédits sont générés dans le pied de page. Si une photo ne charge pas (hors ligne), une image générée par du code prend le relais.
- **HTML sémantique** : `<header>`, `<main>`, `<section>`, listes, `<dialog>` natif, `<time>`.
- **CSS moderne** : variables CSS, Grid et Flexbox, tailles fluides avec `clamp()`, `prefers-reduced-motion`.
- **JavaScript natif** (plus de jQuery) : filtre par jour, onglets au clavier, fenêtre de paiement de démonstration.
- **Accessibilité** : lien d'évitement, rôles `tablist`/`tab`, focus visible, `aria-live`.

## Structure
```
index.html
css/style.css
js/main.js
images/logo.svg
```

## À savoir
- Le festival, les groupes et les prix sont **inventés** ; les photos montrent d'autres artistes.
- Les photos sont chargées depuis Unsplash : il faut une connexion internet.
- Le paiement est une **démonstration** : rien n'est envoyé ni enregistré.

## Lancer le site
Ouvrir `index.html` dans un navigateur (aucune installation nécessaire).
