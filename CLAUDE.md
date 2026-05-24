# LUXY EXPERIENCE — Specifiche Gestione Prenotazioni

> File Markdown operativo per sviluppo, manutenzione e miglioramento della dashboard **Luxy Experience**.  
> Basato sulle schermate: Proprietà, Prenotazioni, Nuova Prenotazione, Report e Impostazioni.

---

## 1. Obiettivo del progetto

Realizzare e mantenere una dashboard gestionale premium per la gestione di appartamenti, camere, prenotazioni dirette, collaboratori, incassi, report e metodi di pagamento.

Il prodotto deve avere un aspetto **luxury, dark, elegante e minimale**, coerente con il brand Luxy Experience.

La piattaforma deve permettere a un owner, admin o concierge di:

- gestire proprietà e stanze;
- inserire listini mensili;
- creare prenotazioni dirette da calendario;
- controllare prenotazioni esistenti;
- generare preventivi PDF;
- tracciare incassi e commissioni;
- consultare report analitici;
- gestire metodi di pagamento;
- aggiornare la password account.

---

## 2. Identità visiva

### Stile generale

- Tema principale: **dark luxury**.
- Sfondo: nero/antracite molto scuro.
- Card: grigio blu scuro, con bordi sottili e ombre leggere.
- Accento principale: oro/champagne.
- Font titoli: serif elegante, stile luxury.
- Font testi/UI: sans-serif leggibile e moderno.
- Interfaccia ordinata, con ampio respiro e gerarchie chiare.

### Palette consigliata

```txt
Background principale: #070A0D
Background secondario: #10141C
Card: #151A24
Card hover: #1A2030
Bordo: #2A3040
Oro primario: #C9A75F
Oro chiaro: #E0C27A
Testo principale: #F4F0E6
Testo secondario: #A6A29A
Verde positivo/incassato: #3BB273
Rosso errore/elimina/prenotato: #D95D5D
Blu azione/calendario: #4A90E2
```

### Componenti UI

- Navbar superiore con logo a sinistra e utente/logout a destra.
- Menu orizzontale con tab attive:
  - 🏠 Proprietà
  - 🧾 Prenotazioni
  - 🗓️ Nuova Prenotazione
  - 📊 Report
  - ⚙️ Impostazioni
- Pulsanti primari oro.
- Pulsanti secondari scuri con bordo.
- Pulsanti danger rossi per eliminazione.
- Badge stato colorati.
- Tabelle con righe compatte e scroll orizzontale se necessario.
- Floating action button in basso a destra con icona sparkle.

---

## 3. Struttura pagine

## 3.1 Proprietà

Pagina dedicata alla gestione delle strutture.

### Funzioni principali

- Visualizzare elenco proprietà.
- Mostrare nome proprietà, posizione e descrizione.
- Caricare immagini della proprietà.
- Eliminare immagini singole.
- Modificare proprietà.
- Eliminare proprietà.
- Mostrare numero unità associate.
- Gestire stanze/camere interne.
- Aggiungere nuova camera.
- Gestire collaboratori associati alla proprietà.

### Dati proprietà

Ogni proprietà deve avere:

```txt
id
nome
posizione
indirizzo/opzionale
descrizione
immagini[]
stanze[]
collaboratori[]
createdAt
updatedAt
```

### Dati camera/stanza

Ogni stanza deve avere:

```txt
id
propertyId
nome
capacita
descrizione
immagini[]
listinoMensile[]
createdAt
updatedAt
```

### Listino mensile

Ogni stanza deve permettere un prezzo per mese.

Esempio visualizzato:

```txt
2026-04: €120
2026-05: €150
2026-06: €170
2026-07: €170
2026-08: €170
2026-09: €120
2026-10: €150
2026-11: €120
2026-12: €120
```

Il listino mensile deve essere usato come base per il calcolo automatico del soggiorno quando si crea una prenotazione.

---

## 3.2 Prenotazioni

Pagina tabellare per visualizzare, filtrare e gestire tutte le prenotazioni.

### Filtri presenti

- Cerca cliente.
- Tutti gli stati.
- Tutte le stanze.
- Anno.
- Mese.

### Colonne tabella

La tabella prenotazioni deve mostrare:

```txt
Cliente
App./Stanza
Date
Soggiorno
Pulizie
Owner
Fee
Totale
Incasso
Preventivo
Stato
Azioni
```

### Dati prenotazione

Ogni prenotazione deve avere:

```txt
id
propertyId
roomId
clienteNome
clienteCognome
numeroOspiti
checkIn
checkOut
notti
prezzoSoggiorno
costoPulizie
ownerAmount
feeAmount
totale
incassoMetodo
incassoImporto
stato
note
collaboratoreId/opzionale
preventivoPdfUrl/opzionale
createdAt
updatedAt
```

### Regole calcolo economico

Il calcolo consigliato è:

```txt
ownerAmount = prezzoSoggiorno + costoPulizie
totale = ownerAmount + feeAmount
nettoAtteso = ownerAmount
commissioniPagate = feeAmount
fatturatoLordo = totale
```

Esempio:

```txt
Soggiorno: €1350
Pulizie: €30
Owner: €1380
Fee: €270
Totale: €1650
```

### Stati prenotazione

Stati consigliati:

```txt
in_trattativa
bloccato
prenotato
finalizzato
cancellato
```

Badge colore:

```txt
in_trattativa: oro/giallo
bloccato: blu o grigio
prenotato: rosso/bordeaux
finalizzato: verde
cancellato: grigio/rosso scuro
```

---

## 3.3 Nuova Prenotazione

Pagina per aggiungere una prenotazione diretta.

### Layout

La pagina è divisa in due blocchi principali:

1. **Stanza & Date**
2. **Dati Cliente**

### Selezione stanza

Campo select con struttura:

```txt
Nome Proprietà — Nome Stanza
```

Esempio:

```txt
La Marina Di Es Vedrà — Frangipani Room
```

### Calendario

Il calendario deve mostrare:

- mese e anno corrente/selezionato;
- prezzo mese;
- costo pulizie;
- giorni disponibili;
- giorni bloccati;
- giorni in trattativa;
- giorni prenotati;
- nome collaboratore/owner sui giorni occupati;
- selezione range check-in/check-out.

Legenda consigliata:

```txt
Disponibile: verde
Bloccato: blu/grigio
In Trattativa: oro
Prenotato: rosso
```

### Regole calendario

- Non deve essere possibile sovrapporre prenotazioni confermate.
- I giorni già prenotati devono essere non selezionabili.
- I giorni in trattativa possono essere evidenziati ma gestiti secondo permessi.
- La selezione range deve calcolare automaticamente il numero di notti.
- Il prezzo deve essere calcolato in base al listino mensile della stanza.

### Dati cliente

Campi form:

```txt
Nome *
Cognome
Numero ospiti
Note / riferimenti extra
```

Campi consigliati da aggiungere:

```txt
Telefono
Email
Metodo pagamento previsto
Acconto
Fonte prenotazione
Collaboratore associato
```

---

## 3.4 Report Analitico

Pagina dedicata ai KPI economici e alle performance.

### Filtri data

- Data inizio.
- Data fine.

Esempio:

```txt
01/05/2026 → 31/12/2026
```

### KPI principali

Card presenti:

```txt
Fatturato lordo
Netto atteso
Incassato reale
Commissioni pagate
Prenotazioni finalizzate
```

### Calcoli consigliati

```txt
fatturatoLordo = somma(totale prenotazioni nel range)
nettoAtteso = somma(ownerAmount prenotazioni nel range)
incassatoReale = somma(incassi registrati)
commissioniPagate = somma(feeAmount pagate)
prenotazioniFinalizzate = count(stato = finalizzato)
percentualeIncassata = incassatoReale / nettoAtteso * 100
```

### Sezioni report

#### Performance Collaboratori

Tabella con:

```txt
Nick
Prenotazioni
Totale Fee
Media Notti
Fee Media
```

#### Revenue per Proprietà

Lista/card con:

```txt
Nome proprietà
Revenue
```

#### Dettaglio per Stanza

Tabella con:

```txt
Stanza
Proprietà
Revenue
```

#### Riepilogo Metodo di Pagamento

Card per ogni metodo di pagamento con:

```txt
Metodo
Entrate (+)
Uscite (-)
Saldo
```

---

## 3.5 Impostazioni

Pagina dedicata a metodi di pagamento e sicurezza account.

### Metodi di pagamento

Funzioni:

- Aggiungere metodo pagamento.
- Eliminare metodo pagamento.
- Visualizzare lista metodi disponibili.

Esempi:

```txt
Contanti
Banca
Wise
Zen
```

Ogni metodo deve avere:

```txt
id
nome
attivo
createdAt
updatedAt
```

### Cambio password

Campi:

```txt
Password attuale
Nuova password
Conferma nuova password
```

Regole:

- Minimo 6 caratteri.
- Controllare password attuale.
- Nuova password e conferma devono coincidere.
- Salvare sempre hash sicuro, mai password in chiaro.
- Mostrare feedback chiaro in caso di errore/successo.

---

## 4. Ruoli e permessi

Ruoli consigliati:

```txt
admin
owner
concierge
collaboratore
```

### Admin

Può gestire tutto:

- proprietà;
- stanze;
- listini;
- prenotazioni;
- report;
- metodi pagamento;
- utenti/collaboratori;
- password.

### Owner

Può:

- vedere proprietà associate;
- vedere prenotazioni relative;
- vedere report limitati alle proprie proprietà;
- vedere incassi owner.

### Concierge / Collaboratore

Può:

- creare prenotazioni;
- vedere prenotazioni assegnate;
- vedere fee personali;
- non deve vedere dati sensibili non necessari.

---

## 5. Modello dati consigliato

### User

```ts
User {
  id: string
  nickname: string
  email?: string
  passwordHash: string
  role: 'admin' | 'owner' | 'concierge' | 'collaboratore'
  createdAt: Date
  updatedAt: Date
}
```

### Property

```ts
Property {
  id: string
  name: string
  location: string
  description?: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Room

```ts
Room {
  id: string
  propertyId: string
  name: string
  capacity: number
  description?: string
  images: string[]
  createdAt: Date
  updatedAt: Date
}
```

### MonthlyRate

```ts
MonthlyRate {
  id: string
  roomId: string
  year: number
  month: number
  price: number
  cleaningFee: number
}
```

### Booking

```ts
Booking {
  id: string
  propertyId: string
  roomId: string
  clientFirstName: string
  clientLastName?: string
  guests: number
  checkIn: Date
  checkOut: Date
  nights: number
  stayAmount: number
  cleaningAmount: number
  ownerAmount: number
  feeAmount: number
  totalAmount: number
  collectedAmount: number
  paymentMethodId?: string
  status: 'in_trattativa' | 'bloccato' | 'prenotato' | 'finalizzato' | 'cancellato'
  notes?: string
  collaboratorId?: string
  quotePdfUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

### PaymentMethod

```ts
PaymentMethod {
  id: string
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}
```

### PropertyCollaborator

```ts
PropertyCollaborator {
  id: string
  propertyId: string
  userId: string
  roleOnProperty: 'owner' | 'concierge' | 'collaboratore'
  createdAt: Date
}
```

---

## 6. Funzioni PDF preventivo

Ogni prenotazione deve avere la possibilità di generare un PDF preventivo.

Il PDF deve includere:

```txt
Logo Luxy Experience
Dati cliente
Proprietà
Stanza
Date soggiorno
Numero notti
Numero ospiti
Soggiorno
Pulizie
Fee/eventuali costi extra
Totale
Note
Condizioni
Data generazione
```

Stile PDF:

- dark/luxury o versione chiara elegante;
- logo in alto;
- accenti oro;
- layout professionale;
- riepilogo finale ben visibile.

---

## 7. Regole UX importanti

- Ogni azione distruttiva deve chiedere conferma.
- I form devono mostrare errori inline.
- I campi obbligatori devono essere indicati con `*`.
- I bottoni principali devono essere sempre chiari e visibili.
- Le tabelle devono essere leggibili anche con molte colonne.
- Le date devono essere sempre coerenti in formato italiano.
- Gli importi devono essere sempre formattati in euro.
- Le card devono mantenere la stessa spaziatura su tutte le pagine.
- Lo scroll orizzontale nella tabella prenotazioni deve essere gestito in modo pulito.

---

## 8. Responsive

### Desktop

Layout principale progettato per desktop.

### Tablet

- Card su 1 o 2 colonne.
- Tabella con scroll orizzontale.
- Calendario adattato alla larghezza disponibile.

### Mobile

- Navbar trasformabile in menu compatto.
- Card verticali.
- Tabelle trasformabili in card-list.
- Form a colonna singola.
- Calendario scrollabile o semplificato.

---

## 9. Validazioni

### Proprietà

```txt
Nome proprietà obbligatorio
Posizione consigliata
Descrizione opzionale
Almeno una stanza consigliata
```

### Camera

```txt
Nome camera obbligatorio
Capacità minimo 1
Prezzi mensili numerici e positivi
```

### Prenotazione

```txt
Nome cliente obbligatorio
Camera obbligatoria
Check-in obbligatorio
Check-out obbligatorio
Check-out > check-in
Numero ospiti >= 1
Numero ospiti <= capacità stanza
No sovrapposizione con prenotazioni confermate
Importi >= 0
```

### Password

```txt
Password attuale obbligatoria
Nuova password minimo 6 caratteri
Conferma uguale alla nuova password
```

---

## 10. Checklist sviluppo

### Proprietà

- [ ] CRUD proprietà.
- [ ] Upload immagini proprietà.
- [ ] Delete immagini proprietà.
- [ ] CRUD stanze.
- [ ] Upload immagini stanza.
- [ ] Listino mensile per stanza.
- [ ] Collaboratori per proprietà.

### Prenotazioni

- [ ] Lista prenotazioni.
- [ ] Filtri cliente/stato/stanza/anno/mese.
- [ ] Stato prenotazione con badge.
- [ ] Calcolo notti.
- [ ] Calcolo owner, fee e totale.
- [ ] Generazione PDF preventivo.
- [ ] Gestione incasso.

### Nuova prenotazione

- [ ] Select proprietà/stanza.
- [ ] Calendario mensile.
- [ ] Evidenzia stati giorni.
- [ ] Selezione range date.
- [ ] Blocco sovrapposizioni.
- [ ] Form dati cliente.
- [ ] Salvataggio prenotazione.

### Report

- [ ] Filtri per range date.
- [ ] KPI fatturato lordo.
- [ ] KPI netto atteso.
- [ ] KPI incassato reale.
- [ ] KPI commissioni pagate.
- [ ] Performance collaboratori.
- [ ] Revenue per proprietà.
- [ ] Dettaglio per stanza.
- [ ] Riepilogo metodo pagamento.

### Impostazioni

- [ ] CRUD metodi pagamento.
- [ ] Cambio password.
- [ ] Validazioni sicurezza.

---

## 11. Migliorie consigliate

### Funzionali

- Storico modifiche prenotazione.
- Log attività admin/collaboratori.
- Esportazione Excel/CSV report.
- Invio preventivo via email o WhatsApp.
- Acconti multipli per prenotazione.
- Gestione spese extra.
- Gestione cauzione.
- Sincronizzazione calendario esterno iCal/Airbnb/Booking.
- Notifiche automatiche check-in/check-out.
- Dashboard occupazione mensile.

### UI/UX

- Skeleton loading sulle pagine.
- Toast premium per conferme/errori.
- Modal eleganti per modifica rapida.
- Ricerca globale.
- Statistiche con grafici.
- Versione mobile ottimizzata.

### Sicurezza

- Autenticazione sicura con sessioni protette.
- Rate limit su login.
- Hash password con algoritmo sicuro.
- Protezione CSRF dove necessario.
- Validazione server-side di tutti i dati.
- Controllo permessi per ruolo su ogni endpoint.

---

## 12. Note per AI Agent / Developer

Quando lavori su questo progetto:

1. Mantieni sempre lo stile **dark luxury**.
2. Non semplificare la UI rendendola generica o troppo chiara.
3. Non rimuovere navbar, logo, tab o gerarchie esistenti.
4. Mantieni i colori oro per le azioni principali.
5. Mantieni importi in euro.
6. Mantieni date in formato italiano.
7. Non rompere i calcoli economici: soggiorno, pulizie, owner, fee, totale.
8. Prima di modificare calendario o prenotazioni, controlla sempre la logica anti-sovrapposizione.
9. Ogni modifica a report deve rispettare i filtri data.
10. Le azioni elimina devono avere conferma.
11. Ogni dato sensibile deve essere protetto lato server.
12. Non mostrare password in chiaro.
13. Il PDF preventivo deve mantenere immagine premium e professionale.

---

## 13. Priorità MVP

Priorità alta:

```txt
1. Proprietà + stanze + listino
2. Calendario nuova prenotazione
3. Lista prenotazioni con filtri
4. Calcoli economici corretti
5. Report base
6. Metodi pagamento
7. Cambio password
8. PDF preventivo
```

Priorità media:

```txt
1. Collaboratori avanzati
2. Performance collaboratori
3. Export report
4. Incassi parziali
5. Mobile migliorato
```

Priorità futura:

```txt
1. Sync OTA/iCal
2. Automazioni email/WhatsApp
3. Dashboard grafica avanzata
4. Multi-lingua
5. App mobile
```

---

## 14. Definizione di completato

Una funzione può essere considerata completata solo se:

- è coerente con lo stile visivo Luxy Experience;
- funziona su desktop;
- gestisce errori e validazioni;
- aggiorna correttamente il database;
- non rompe dati già esistenti;
- rispetta ruoli e permessi;
- mantiene calcoli economici corretti;
- mostra feedback chiari all’utente;
- non introduce regressioni nelle altre pagine.

---

## 15. Naming consigliato file progetto

```txt
/components
  Navbar.tsx
  PropertyCard.tsx
  RoomCard.tsx
  BookingTable.tsx
  BookingCalendar.tsx
  ReportCard.tsx
  PaymentMethodSettings.tsx

/app o /pages
  properties
  bookings
  new-booking
  reports
  settings

/lib
  auth.ts
  db.ts
  booking-calculations.ts
  date-utils.ts
  pdf-generator.ts

/types
  property.ts
  room.ts
  booking.ts
  report.ts
  user.ts
```

---

## 16. Convenzioni testo UI

Usare etichette in italiano:

```txt
Proprietà
Prenotazioni
Nuova Prenotazione
Report
Impostazioni
Modifica
Elimina
Calendario
Aggiungi Camera
Aggiungi Metodo
Aggiorna Password
Cerca cliente...
Tutti gli stati
Tutte le stanze
Anno
Mese
Preventivo
Incasso
Totale
```

---

## 17. Obiettivo finale

La dashboard deve trasmettere la sensazione di un gestionale privato, elegante e professionale per strutture luxury.  
Ogni pagina deve essere semplice da usare, ma visivamente curata e coerente con il posizionamento premium del brand.
