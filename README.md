# Sito AIRFRAME

Sito a pagina singola, statico: nessun database, nessun servizio a pagamento, nessuna compilazione.
Si modifica cambiando file e testi, poi si ricarica la pagina.

## Struttura

```
airframe/
├── index.html          struttura della pagina (di norma non serve toccarla)
├── content.js          ← TUTTI i testi, foto, video, lavori, social e modulo
├── css/style.css       stile (colori e misure nelle variabili in cima al file)
├── js/main.js          funzionamento (di norma non serve toccarlo)
└── assets/
    ├── fonts/          carattere Archivo (ospitato in locale, niente Google Fonts)
    ├── img/            foto del team, poster del video, favicon, logo
    ├── video/          video d'apertura
    └── works/          copertine e video dei lavori
```

## Cosa sostituire

Tutti i file in `assets/` sono **segnaposto**: sostituiteli con i vostri e, se cambiate nome al file, aggiornate il percorso in `content.js`.

| Cosa | File | Consigli |
|---|---|---|
| Logo | `content.js` → `logo.image` | SVG o PNG bianco su trasparente, es. `assets/img/logo.svg`. Vuoto = nome in testo |
| Video d'apertura | `assets/video/hero.mp4` | MP4 H.264, 1920×1080, 10–30 s, senza audio, meglio sotto i 10 MB |
| Video apertura per smartphone | `content.js` → `hero.videoMobile` | Facoltativo: versione più leggera (es. 1280×720) |
| Poster apertura | `assets/img/hero-poster.jpg` | Un fotogramma del video, mostrato mentre carica |
| Foto di voi due | `assets/img/team.jpg` | Verticale 4:5, es. 1200×1500 |
| Copertine lavori | `assets/works/*.jpg` | 16:9, 1600×900, JPG qualità ~80 |
| Testi | `content.js` | Sostituite tutto ciò che è tra `[parentesi quadre]` |
| Anteprima condivisione | `index.html` → righe `og:` | Titolo e immagine quando il link viene condiviso |

Per comprimere i video gratis: **HandBrake** (preset "Fast 1080p30", spuntate "Web Optimized").

## Aggiungere un lavoro

In `content.js`, dentro `works.items`, copiate un blocco e modificatelo:

```js
{
  title: "Villa sul lago",
  place: "Como",
  cover: "assets/works/villa-lago.jpg",
  video: "assets/works/villa-lago.mp4",   // oppure un link YouTube o Vimeo
},
```

Il primo lavoro della lista appare in grande. Con un numero **dispari** di lavori la griglia resta bilanciata (1 grande + 2 per riga).

Il campo `video` accetta un file locale, un link YouTube (`https://youtu.be/...`) o Vimeo (`https://vimeo.com/...`).
Per filmati lunghi o pesanti conviene YouTube/Vimeo (anche "non in elenco"): il sito resta leggero e molti hosting gratuiti limitano la dimensione dei file (Cloudflare Pages: 25 MB per file).

## Modulo contatti

Il sito è statico, quindi l'invio delle email passa da **Web3Forms** (gratuito, nessuna carta):

1. Andate su https://web3forms.com e inserite l'email su cui volete ricevere i messaggi.
2. Riceverete una *Access Key*.
3. Incollatela in `content.js` → `form.accessKey`.

Finché la chiave è vuota, "Invia messaggio" apre il programma di posta del visitatore con il messaggio già compilato, indirizzato a `contact.email`.
Il modulo ha già controllo dei campi e un filtro anti-spam invisibile.

## Provare il sito sul computer

Doppio clic su `index.html` funziona quasi sempre. Per una prova identica al sito online, dalla cartella del sito:

```
python3 -m http.server 8000
```

e aprite http://localhost:8000

## Pubblicare gratis

- **Cloudflare Pages**: Workers & Pages → Create → Pages → "Upload assets" → trascinate la cartella `airframe`.
- **Netlify**: https://app.netlify.com/drop → trascinate la cartella.

Entrambi danno HTTPS e permettono di collegare un vostro dominio.

## Personalizzare lo stile

In cima a `css/style.css` ci sono le variabili: colori (`--black`, `--anthracite`, `--white`…), carattere e spaziature.
Il sito rispetta l'impostazione "riduci movimento" del dispositivo e mette in pausa il video d'apertura quando non è visibile.
