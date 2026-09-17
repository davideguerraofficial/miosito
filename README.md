# Sito di Davide Guerra

Sito statico in italiano, pronto per GitHub Pages. Le pagine principali sono:

- `index.html` — Home e opere in primo piano.
- `chi-sono.html` — Biografia e metodo creativo.
- `libri.html` — Schede dei libri e collegamenti di acquisto/campagna.
- `progetti.html` — Concept, Kickstarter e progetti in sviluppo.
- `contatti.html` — Email e canali ufficiali.

## Aggiornamenti futuri

- Per una nuova opera, aggiungere una scheda nella sezione `books` di `libri.html`, copiare la copertina nella cartella `img/` e inserire il relativo collegamento.
- Quando sarà disponibile la copertina finale di *Daniel Belmont*, sostituire `img/copertina-belmont.avif` e aggiornare nella relativa scheda il testo che la definisce provvisoria.
- Per un nuovo progetto, aggiungere una `project-card` in `progetti.html`. Il nome, lo stato e la descrizione sono già organizzati per rendere l'aggiornamento semplice.
- I collegamenti ai canali sono presenti nella pagina Contatti e nel piè di pagina di ogni pagina. Quando un indirizzo cambia, aggiornarlo in tutti questi punti.
- La versione inglese potrà essere inserita in una cartella `en/`, mantenendo immagini e struttura identiche e traducendo le singole pagine.

## Immagini

- `img/profilo.jpeg` — ritratto dell'autore.
- `img/copertina-solitudine.jpg` — copertina di *L'Arte della Solitudine*.
- `img/copertina-belmont.avif` — immagine provvisoria di Kickstarter per *Daniel Belmont*. Il file originale era un AVIF con estensione `.jpg`: è stato rinominato per consentire una corretta pubblicazione.
## URL puliti

Le pagine pubbliche usano indirizzi senza `.html`, ad esempio `davideguerra.com/opere/` e `davideguerra.com/en/books/`.

I file principali restano nella cartella del sito (`libri.html`, `en/libri.html` e così via). Le cartelle con gli URL puliti vengono generate automaticamente: dopo ogni modifica a una pagina, esegui `node build-clean-urls.js` prima di caricare il sito su GitHub.

Per una pagina futura, ad esempio `nuovo-progetto.html`, il generatore creerà automaticamente `/nuovo-progetto/` e, per la versione inglese, `/en/nuovo-progetto/`. I percorsi speciali già esistenti sono raccolti all’inizio di `build-clean-urls.js`.
