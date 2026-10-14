/* =====================================================================
   AIRFRAME — CONTENUTI DEL SITO
   ---------------------------------------------------------------------
   Questo è l'unico file da modificare per cambiare testi, foto, video,
   lavori, social e impostazioni del modulo contatti.

   • Le immagini e i video vanno nella cartella /assets (vedi README.md).
   • Dopo una modifica basta salvare e ricaricare la pagina:
     non serve ricostruire nulla.
   • I testi tra [PARENTESI QUADRE] sono segnaposto da sostituire.
   ===================================================================== */

window.AIRFRAME = {

  /* ---------------------------------------------------------------
     LOGO
     image: percorso del file logo (SVG o PNG con sfondo trasparente,
            preferibilmente bianco). Se lasci "" viene mostrato il
            nome scritto in testo.
     --------------------------------------------------------------- */
  logo: {
    image: "",            // es. "assets/img/logo.svg"
    text: "AIRFRAME",
  },

  /* ---------------------------------------------------------------
     APERTURA (video a tutto schermo)
     video:       filmato principale (MP4 H.264, consigliato 1920×1080,
                  10–30 secondi, senza audio, sotto i 10 MB)
     videoMobile: versione più leggera per smartphone (facoltativa)
     poster:      immagine mostrata mentre il video carica
     --------------------------------------------------------------- */
  hero: {
    video: "assets/video/hero.mp4",
    videoMobile: "",      // es. "assets/video/hero-mobile.mp4"
    poster: "assets/img/hero-poster.jpg",
    title: "Il volo che racconta una casa.",
    subtitle: "Video cinematografici con droni FPV per il settore immobiliare: entriamo, attraversiamo e mostriamo ogni proprietà come nessuna fotografia può fare.",
    cta: "Guarda i lavori",
  },

  /* ---------------------------------------------------------------
     CHI SIAMO
     paragraphs: un elemento per ogni paragrafo
     --------------------------------------------------------------- */
  about: {
    title: "Due piloti, un solo sguardo.",
    photo: "assets/img/team.jpg",
    photoAlt: "[Nome 1] e [Nome 2], fondatori di AIRFRAME",
    paragraphs: [
      "AIRFRAME nasce da [Nome 1] e [Nome 2]. [Racconta qui in due righe come vi siete conosciuti e quando avete iniziato a volare insieme.]",
      "Il drone FPV ci permette di fare ciò che una ripresa tradizionale non può: passare da una finestra, scendere lungo una scala, attraversare un giardino e tornare in quota in un'unica inquadratura continua. [Aggiungi qui cosa vi appassiona di questo modo di girare.]",
      "Il nostro obiettivo è dare a ogni immobile il racconto che merita: un video che faccia percepire gli spazi, la luce e il contesto a chi non ci ha ancora messo piede.",
    ],
    signature: "[Nome 1] & [Nome 2]",
  },

  /* ---------------------------------------------------------------
     I NOSTRI LAVORI
     Per aggiungere un lavoro copia un blocco { ... } e modificalo.
     Il primo della lista viene mostrato in grande.

     cover:  immagine di copertina (16:9, consigliato 1600×900)
     video:  può essere
               – un file nella cartella assets, es. "assets/works/villa.mp4"
               – un link YouTube, es. "https://youtu.be/XXXXXXXXXXX"
               – un link Vimeo,   es. "https://vimeo.com/123456789"
     place:  località o tipologia (facoltativo, lascia "" per nasconderlo)
     --------------------------------------------------------------- */
  works: {
    title: "I nostri lavori",
    intro: "Ville, case e proprietà raccontate in volo.",
    items: [
      {
        title: "[Titolo progetto 1]",
        place: "[Località]",
        cover: "assets/works/progetto-1-copertina.jpg",
        video: "assets/video/hero.mp4",
      },
      {
        title: "[Titolo progetto 2]",
        place: "[Località]",
        cover: "assets/works/progetto-2-copertina.jpg",
        video: "assets/video/hero.mp4",
      },
      {
        title: "[Titolo progetto 3]",
        place: "[Località]",
        cover: "assets/works/progetto-3-copertina.jpg",
        video: "assets/video/hero.mp4",
      },
      {
        title: "[Titolo progetto 4]",
        place: "[Località]",
        cover: "assets/works/progetto-4-copertina.jpg",
        video: "assets/video/hero.mp4",
      },
      {
        title: "[Titolo progetto 5]",
        place: "[Località]",
        cover: "assets/works/progetto-5-copertina.jpg",
        video: "assets/video/hero.mp4",
      },
    ],
  },

  /* ---------------------------------------------------------------
     CONTATTI
     --------------------------------------------------------------- */
  contact: {
    title: "Avete una proprietà da raccontare?",
    text: "Scriveteci qualche riga sull'immobile e su cosa avete in mente. Vi rispondiamo con una proposta.",
    email: "[email@tuodominio.it]",   // mostrata in pagina e usata come riserva
    phone: "",                         // es. "+39 000 000 0000" ("" = nascosto)
  },

  /* ---------------------------------------------------------------
     SOCIAL — lascia url: "" per nascondere un profilo
     --------------------------------------------------------------- */
  social: [
    { name: "Instagram", url: "https://instagram.com/[tuo-profilo]" },
    { name: "YouTube",   url: "https://youtube.com/@[tuo-canale]" },
    { name: "TikTok",    url: "" },
    { name: "LinkedIn",  url: "" },
    { name: "Vimeo",     url: "" },
  ],

  /* ---------------------------------------------------------------
     MODULO CONTATTI
     Il sito è statico, quindi l'invio passa da un servizio gratuito.
     Consigliato: Web3Forms (gratuito, nessuna carta richiesta).
       1. Vai su https://web3forms.com e inserisci la vostra email
       2. Ricevi una "Access Key" via email
       3. Incollala qui sotto in accessKey

     Finché accessKey è vuota, il pulsante "Invia" apre il programma
     di posta del visitatore con il messaggio già compilato,
     indirizzato a contact.email.
     --------------------------------------------------------------- */
  form: {
    endpoint: "https://api.web3forms.com/submit",
    accessKey: "",
    subject: "Nuova richiesta dal sito AIRFRAME",
  },

  /* Testo a fondo pagina */
  footer: "AIRFRAME",
};
