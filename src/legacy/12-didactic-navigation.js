
// ── V9: Didaktik-Zurück überall + Präzession nur Polarstern/Errai/Alderamin ──
(function(){
  if(window.__v9DidacticBackAndPrecessionLabelsPatch) return;
  window.__v9DidacticBackAndPrecessionLabelsPatch = true;

  function ensureDidacticBackButton(){
    const sky=document.getElementById('page-sky')||document.body;
    let btn=document.getElementById('didactic-back');
    if(!btn){
      btn=document.createElement('button');
      btn.id='didactic-back';
      btn.type='button';
      btn.innerHTML='✕';
      btn.title='Zurück zur didaktischen Sprungseite';
      sky.appendChild(btn);
    }
    if(!document.getElementById('didactic-back-style')){
      const css=document.createElement('style');
      css.id='didactic-back-style';
      css.textContent=`
        #didactic-back{
          position:absolute;left:calc(env(safe-area-inset-left,0px) + 10px);top:calc(env(safe-area-inset-top,0px) + 8px);
          z-index:210;display:none;align-items:center;gap:.35rem;
          font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:.76rem;font-weight:750;letter-spacing:.01em;color:#f6f7fb;
          background:rgba(7,12,24,.66);border:1px solid rgba(255,255,255,.16);border-radius:999px;
          padding:0;width:44px;height:44px;justify-content:center;font-size:1.15rem;box-shadow:0 12px 34px rgba(0,0,0,.34);
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent
        }
        #didactic-back:active{background:rgba(125,214,255,.18);border-color:rgba(125,214,255,.42);transform:translateY(1px)}
        body.fullscreen #didactic-back{display:none!important}
        #constellation-back{display:none!important}
      `;
      document.head.appendChild(css);
    }
    /* Bisher löste nur pointerdown aus, click war stillgelegt. Verwirft der Browser
       das Zeigerereignis, weil er die Berührung zunächst für den Beginn einer
       Wischgeste hält, kam der Rücksprung gar nicht zustande — der Schalter wirkte
       tot. Jetzt lösen beide Wege aus, gegen doppeltes Auslösen sichert eine Sperre. */
    var __didLock=0;
    var __didGo=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      var t=Date.now(); if(t-__didLock<600)return; __didLock=t;
      try{returnToDidacticPage()}catch(err){}
    };
    btn.onpointerdown=__didGo;
    btn.onclick=__didGo;
    return btn;
  }
  function ensureDidacticHelpButton(){
    const sky=document.getElementById('page-sky')||document.body;
    let btn=document.getElementById('didactic-help');
    if(!btn){
      btn=document.createElement('button');
      btn.id='didactic-help';
      btn.type='button';
      btn.innerHTML='?';
      btn.title='Erläuterung zur aktuellen Ansicht';
      sky.appendChild(btn);
    }
    if(!document.getElementById('didactic-help-style')){
      const css=document.createElement('style');
      css.id='didactic-help-style';
      css.textContent=`
        #didactic-help{
          position:absolute;left:calc(env(safe-area-inset-left,0px) + 10px);top:calc(env(safe-area-inset-top,0px) + 60px);
          z-index:210;display:none;align-items:center;justify-content:center;
          font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          font-size:1.15rem;font-weight:750;color:#f6f7fb;
          background:rgba(7,12,24,.66);border:1px solid rgba(255,255,255,.16);border-radius:999px;
          padding:0;width:44px;height:44px;box-shadow:0 12px 34px rgba(0,0,0,.34);
          backdrop-filter:blur(18px) saturate(1.3);-webkit-backdrop-filter:blur(18px) saturate(1.3);
          cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent
        }
        #didactic-help:active{background:rgba(125,214,255,.18);border-color:rgba(125,214,255,.42);transform:translateY(1px)}
        body.fullscreen #didactic-help{display:none!important}
      `;
      document.head.appendChild(css);
    }
    var __helpLock=0;
    var __helpGo=function(e){
      if(e){e.preventDefault();e.stopPropagation();}
      var t=Date.now(); if(t-__helpLock<600)return; __helpLock=t;
      try{ if(typeof window.openDidacticHelp==="function") window.openDidacticHelp(); }catch(err){}
    };
    btn.onpointerdown=__helpGo;
    btn.onclick=__helpGo;
    return btn;
  }
  function showDidacticBack(show){
    const btn=ensureDidacticBackButton();
    const hbtn=ensureDidacticHelpButton();
    window.__v9DidacticBackActive=!!show;
    btn.style.display=show?'flex':'none';
    hbtn.style.display=show?'flex':'none';
    try{document.body.classList.toggle('did-back-active',!!show)}catch(e){}
  }
  var HELP_ID={
    "spring-equinox":{t:"Frühlingsanfang",s:"Tag und Nacht sind weltweit fast gleich lang, weil die Sonne senkrecht über dem Äquator steht.",d:"Die Erdachse ist um 23,44° gegen die Bahnebene (Ekliptik) geneigt und behält diese Richtung im Raum während des gesamten Jahres bei — sie \"zeigt\" also über Monate hinweg konstant zum selben Punkt am Himmel (nahe Polaris). Dadurch ändert sich im Laufe eines Umlaufs um die Sonne, welche Erdhälfte der Sonne zugeneigt ist. Am Frühlingspunkt (astronomisch der Beginn des Frühlings der Nordhalbkugel) durchquert die Sonne, von der Erde aus gesehen, den Himmelsäquator von Süden nach Norden. In diesem Moment steht die Sonne senkrecht über dem Erdäquator, ihre Deklination ist 0°. Da der Tag-Nacht-Terminator dadurch beide Pole gleichzeitig streift, sind Tag und Nacht überall auf der Erde nahezu 12 Stunden lang (die geringe Abweichung kommt von der Refraktion der Atmosphäre, die die Sonne noch sichtbar macht, wenn sie geometrisch schon knapp unter dem Horizont steht). Von hier an wandert die Sonnendeklination weiter nach Norden, die Tage auf der Nordhalbkugel werden länger."},
    "summer-solstice":{t:"Sommeranfang",s:"Die Nordhalbkugel ist der Sonne am stärksten zugeneigt — höchster Sonnenstand, längster Tag.",d:"Zur Sommersonnenwende erreicht die Sonnendeklination ihren Höchstwert von +23,44° — genau der Betrag der Erdachsneigung. Das bedeutet: Die Sonne steht an diesem Tag senkrecht über dem nördlichen Wendekreis (23,44° N). Für einen Beobachter auf der Nordhalbkugel ist dies der Tag mit der größten Mittagshöhe der Sonne und der längsten Tageslänge im Jahr, weil der beleuchtete Teil der Erdkugel bei dieser Achsneigung die Nordhalbkugel am großzügigsten überdeckt. Nördlich des nördlichen Polarkreises (66,56° N) geht die Sonne an diesem Tag gar nicht unter (Mitternachtssonne) — südlich des südlichen Polarkreises geht sie gar nicht auf (Polarnacht). Wichtig für das Verständnis: Die Jahreszeiten entstehen NICHT durch einen wechselnden Sonnenabstand — die Erde ist Anfang Juli sogar am weitesten von der Sonne entfernt (Aphel) —, sondern ausschließlich durch den Einstrahlwinkel, der von der Achsneigung bestimmt wird."},
    "autumn-equinox":{t:"Herbstanfang",s:"Wie beim Frühlingspunkt steht die Sonne senkrecht über dem Äquator — diesmal auf dem Weg nach Süden.",d:"Am Herbstpunkt überquert die Sonne den Himmelsäquator ein zweites Mal im Jahr, diesmal von Norden nach Süden. Die Deklination ist erneut 0°, Tag und Nacht sind weltweit annähernd gleich lang. Geometrisch ist die Situation der des Frühlingspunkts sehr ähnlich — derselbe Punkt auf der Bahn der scheinbaren Sonnenbewegung (der Ekliptik) wird durchlaufen, nur mit umgekehrter Bewegungsrichtung in Deklination. Für die Nordhalbkugel beginnt ab hier die Jahreszeit mit abnehmender Tageslänge und sinkendem Mittagssonnenstand, weil sich die Nordhalbkugel zunehmend von der Sonne abwendet. Die beiden Äquinoktien (Frühlings- und Herbstpunkt) markieren zugleich die Schnittpunkte von Ekliptik und Himmelsäquator — genau jene zwei Punkte, die durch die Präzession der Erdachse im Lauf von rund 25.800 Jahren einmal komplett durch den Tierkreis wandern (siehe die Erläuterung zur Präzession)."},
    "winter-solstice":{t:"Winteranfang",s:"Die Nordhalbkugel ist am stärksten von der Sonne abgewandt — tiefster Sonnenstand, kürzester Tag.",d:"Zur Wintersonnenwende erreicht die Sonnendeklination ihren Tiefstwert von −23,44°, sie steht senkrecht über dem südlichen Wendekreis. Für die Nordhalbkugel ist dies der Tag mit der geringsten Mittagshöhe der Sonne und der kürzesten Tageslänge im Jahr. Nördlich des nördlichen Polarkreises herrscht Polarnacht, südlich des südlichen Polarkreises Mitternachtssonne — exakt spiegelverkehrt zur Sommersonnenwende. Bemerkenswert: Die Erde durchläuft ihr Perihel (den sonnennächsten Bahnpunkt) astronomisch bereits Anfang Januar, also nur wenige Tage NACH der Wintersonnenwende — der geringere Sonnenabstand macht die Nordhalbkugel-Winter dadurch sogar geringfügig milder, als sie bei kreisförmiger Bahn wären. Die Wintersonnenwende ist zugleich der Bezugspunkt für die Präzessions- und Sonnenjahr-Simulationen dieser App (Datum 21. Dezember als feste Referenz)."},
    "midnight-sun":{t:"Mitternachtssonne",s:"Nördlich des Polarkreises geht die Sonne im Hochsommer gar nicht unter.",d:"Die Mitternachtssonne tritt auf, wenn die Sonnendeklination betragsmäßig größer ist als 90° minus der geografischen Breite — für den Polarkreis bei 66,56° N ist das um die Sommersonnenwende (Deklination bis +23,44°) der Fall. Der Zirkumpolarkreis (in dieser App als grüner Kreis dargestellt, Radius 90°−|Breite|) markiert für jede Deklination innerhalb dieses Radius genau jenen Bereich um den Himmelspol, den die Sonne nicht mehr verlässt: Sie bleibt während der gesamten scheinbaren Tagesdrehung über dem Horizont, sinkt zur \"Mitternacht\" nur bis knapp über den Nordhorizont ab und steigt dann wieder. Je näher man am Pol selbst ist, desto länger dauert die Periode der Mitternachtssonne — am Pol selbst geht die Sonne ein halbes Jahr lang gar nicht unter."},
    "polar-night":{t:"Polarnacht",s:"Nördlich des Polarkreises geht die Sonne im Winter gar nicht auf.",d:"Die Polarnacht ist das winterliche Gegenstück zur Mitternachtssonne: Steht die Sonnendeklination betragsmäßig stärker im Süden, als es die geografische Breite zulässt (nördlich des Polarkreises zur Zeit um die Wintersonnenwende), bleibt die Sonne während der gesamten Tagesdrehung unter dem Horizont. Das bedeutet nicht zwangsläufig völlige Dunkelheit rund um die Uhr — je nach genauer Breite kann es noch eine Dämmerungsphase in der Mittagszeit geben, wenn die Sonne nur knapp unter dem Horizont bleibt. Erst innerhalb des Polarkreises selbst tritt echte durchgehende Polarnacht auf; je weiter man sich Richtung Pol bewegt, desto länger dauert sie."},
    "eclipse-solar":{t:"Sonnenfinsternis",s:"Der Mond schiebt sich zwischen Erde und Sonne — nur möglich nahe einem Mondknoten.",d:"Eine Sonnenfinsternis tritt bei Neumond auf, wenn Mond, Erde und Sonne (in dieser Reihenfolge) nahezu exakt auf einer Linie liegen und der Mondschatten auf die Erdoberfläche fällt. Da die Mondbahn um etwa 5,14° gegen die Ekliptik geneigt ist, reicht \"Neumond\" allein normalerweise nicht aus — der Mond steht meist etwas ober- oder unterhalb der Sonne am Himmel. Eine Finsternis ist nur möglich, wenn der Neumond gleichzeitig nahe einem der beiden Punkte liegt, an denen die Mondbahn die Ekliptik schneidet (den Mondknoten). Weil Sonne und Mond von der Erde aus zufällig fast dieselbe scheinbare Größe haben (der Mond ist ca. 400-mal kleiner als die Sonne, aber auch etwa 400-mal näher), kann der Mond die Sonnenscheibe nahezu exakt bedecken — das Ergebnis ist je nach genauer Entfernung des Mondes (seine Bahn ist elliptisch) eine totale, ringförmige oder partielle Finsternis. Die App sucht rechnerisch den nächsten Zeitpunkt einer solchen Knoten-Neumond-Konstellation und bestimmt den Ort der besten Sichtbarkeit."},
    "eclipse-lunar":{t:"Mondfinsternis",s:"Der Mond läuft durch den Erdschatten — sichtbar von der gesamten Nachthalbkugel aus.",d:"Eine Mondfinsternis tritt bei Vollmond auf, wenn der Mond durch den Kernschatten (Umbra) der Erde läuft, den die Sonne auf der erdabgewandten Seite wirft. Wie bei der Sonnenfinsternis reicht \"Vollmond\" allein nicht: Auch hier muss der Mond gleichzeitig nahe einem Mondknoten stehen, sonst verfehlt er den relativ schmalen Erdschatten. Da der Erdschatten deutlich größer ist als der Mond, dauert eine Mondfinsternis meist länger als eine Sonnenfinsternis und ist zudem von der gesamten Nachthälfte der Erde gleichzeitig zu sehen — anders als die Sonnenfinsternis, die nur in einem schmalen Streifen sichtbar ist. Der Mond verschwindet während der Totalität meist nicht vollständig, sondern erscheint durch ins Erdschattengebiet gebrochenes, rötliches Sonnenlicht (durch die Erdatmosphäre gestreut, derselbe Effekt wie beim Abendrot) — daher der Name \"Blutmond\"."},
    "new-moon":{t:"Neumond",s:"Mond zwischen Erde und Sonne — die beleuchtete Seite zeigt von der Erde weg.",d:"Der Mond durchläuft seine Phasen, weil wir von der Erde aus stets nur den sonnenbeleuchteten Teil seiner Oberfläche sehen, und der Winkel Sonne–Mond–Erde sich durch den Mondumlauf ständig ändert. Bei Neumond steht der Mond (von der Erde aus gesehen) nahe der Sonne am Himmel; seine beleuchtete Halbkugel zeigt von der Erde weg, die uns zugewandte Seite liegt im Dunkeln. Ein voller Zyklus von Neumond zu Neumond (der synodische Monat) dauert im Mittel 29,53 Tage — länger als der siderische Monat (27,32 Tage, ein voller Umlauf relativ zu den Sternen), weil sich die Erde in der Zwischenzeit selbst ein Stück um die Sonne weiterbewegt hat und der Mond diesen Vorsprung erst noch einholen muss."},
    "first-quarter":{t:"Erstes Viertel (Halbmond)",s:"Sonne–Erde–Mond bilden einen rechten Winkel — genau die Hälfte der sichtbaren Scheibe ist beleuchtet.",d:"Beim ersten Viertel steht der Mond 90° von der Sonne entfernt am Himmel (östliche Quadratur). Von der Erde aus gesehen ist genau die uns zugewandte rechte Hälfte der Mondscheibe beleuchtet (auf der Nordhalbkugel). Dieser Mondphasenpunkt liegt etwa eine Woche nach Neumond, ungefähr ein Viertel des synodischen Monats. Zu dieser Zeit steht der Mond bei Sonnenuntergang etwa im Süden und geht selbst um Mitternacht unter — ein guter Zeitpunkt für Beobachtungen, weil der Kontrast entlang des Terminators (der Licht-Schatten-Grenze) Krater und Gebirge besonders plastisch hervortreten lässt."},
    "full-moon":{t:"Vollmond",s:"Erde zwischen Sonne und Mond — die volle beleuchtete Seite zeigt zur Erde.",d:"Bei Vollmond steht der Mond der Sonne am Himmel genau gegenüber (Opposition), die Erde befindet sich näherungsweise zwischen beiden. Die uns zugewandte Mondseite ist dadurch vollständig beleuchtet. Weil Sonne und Mond gegenüberstehen, geht der Vollmond bei Sonnenuntergang auf und bei Sonnenaufgang unter — er ist die ganze Nacht über sichtbar. Läge die Mondbahn exakt in der Ekliptikebene, gäbe es bei jedem Vollmond eine Mondfinsternis; wegen der 5,14°-Neigung der Mondbahn passiert das aber nur, wenn der Vollmond zusätzlich nahe einem Mondknoten steht."},
    "last-quarter":{t:"Letztes Viertel (Halbmond)",s:"Erneut ein rechter Winkel Sonne–Erde–Mond — jetzt ist die andere Hälfte beleuchtet.",d:"Beim letzten Viertel steht der Mond wieder 90° von der Sonne entfernt (westliche Quadratur), diesmal ist die linke Hälfte der Mondscheibe beleuchtet. Dieser Zeitpunkt liegt etwa drei Wochen nach Neumond. Der Mond geht nun etwa um Mitternacht auf und ist erst am Morgenhimmel gut zu sehen. Nach dem letzten Viertel nimmt der beleuchtete Anteil weiter ab, bis der Mond wieder so nah an die Sonne heranrückt, dass er unsichtbar wird — der Zyklus schließt sich zum nächsten Neumond."},
    "sim-seasons":{t:"Sonnenjahr — das Analemma",s:"Fotografiert man die Sonne ein Jahr lang stets zur gleichen Uhrzeit, ergibt sich eine Achterschleife am Himmel.",d:"Das Analemma entsteht aus dem Zusammenspiel zweier unabhängiger Effekte, die beide die \"wahre Sonnenzeit\" von der gleichmäßig fortschreitenden Uhrzeit abweichen lassen — zusammengefasst als Zeitgleichung (Equation of Time). Erstens: Die Erdbahn ist eine Ellipse, nicht ein Kreis; nach dem zweiten Kepler'schen Gesetz bewegt sich die Erde nahe dem Perihel (Januar) schneller, nahe dem Aphel (Juli) langsamer. Dadurch wandert die Sonne am Himmel mal schneller, mal langsamer in Rektaszension. Zweitens: Die Ekliptik ist gegen den Himmelsäquator geneigt (23,44°); selbst bei gleichmäßiger Bewegung entlang der Ekliptik ändert sich die Rektaszensions-Geschwindigkeit der Sonne, weil deren Projektion auf den Äquator nahe den Solstitien schneller, nahe den Äquinoktien langsamer verläuft. Beide Effekte überlagern sich zu einer Kurve mit zwei ungleich großen Schleifen — die Zeitgleichung schwankt zwischen etwa −14 und +16 Minuten im Jahresverlauf. Die Simulation hält Uhrzeit und Zeitzone bewusst fest und lässt nur das Kalenderdatum fortschreiten, wodurch exakt diese Abweichung als wachsende Spur sichtbar wird."},
    "prec-year-1":{t:"Präzession — Jahr 1 n. Chr.",s:"Vor rund 2000 Jahren zeigte die Erdachse noch nicht auf den heutigen Polarstern.",d:"Die Erdachse bewegt sich nicht starr durch den Raum, sondern beschreibt — ähnlich einem taumelnden Kreisel — einen Kegel um den Pol der Ekliptik, mit einem Öffnungswinkel von 23,44° (der Achsneigung) und einer vollen Umlaufzeit von rund 25.800 Jahren. Ursache ist das Drehmoment, das die Anziehungskraft von Sonne und Mond auf den nicht perfekt kugelförmigen, an den Polen abgeplatteten Erdkörper ausüben — physikalisch dasselbe Prinzip wie bei einem taumelnden Kreisel, dessen Achse sich unter dem Einfluss der Schwerkraft langsam im Kreis bewegt. Im Jahr 1 n. Chr. stand der Himmelsnordpol noch spürbar neben dem heutigen Polarstern entfernt vom nächsten hellen Stern — als Orientierungsstern für die Nordrichtung war er zu dieser Zeit deutlich weniger geeignet als heute."},
    "prec-today":{t:"Präzession — Heute",s:"Der Polarstern steht zufällig gerade jetzt sehr nah am Himmelsnordpol.",d:"Wir leben aus astronomischer Sicht in einer glücklichen Epoche: Der Himmelsnordpol nähert sich derzeit dem hellen Stern Polaris bis auf weniger als ein Grad an (die größte Annäherung erfolgt um das Jahr 2100). Das ist reiner Zufall der Positionierung entlang des 25.800-jährigen Präzessionskreises — in weiten Teilen des Zyklus steht gar kein auffälliger Stern in Polnähe. Zugleich hat sich der Tierkreis gegenüber der Antike um etwa ein Zwölftel verschoben: Das Tierkreiszeichen Zwilling (benannt nach seiner Lage vor rund 2000 Jahren) liegt heute tatsächlich im Sternbild Krebs — ein direkter, beobachtbarer Effekt derselben Präzession, die auch den Polarstern wandern lässt."},
    "prec-6000":{t:"Präzession — Jahr 6000",s:"Der Himmelspol hat sich bereits deutlich von Polaris entfernt und wandert weiter durch den Sternenhimmel.",d:"Etwa 4000 Jahre nach heute hat der Himmelsnordpol den engen Kontakt zu Polaris längst wieder verlassen. Er bewegt sich mit einer Geschwindigkeit von rund 50,3 Bogensekunden pro Jahr entlang des Präzessionskreises weiter — das entspricht etwa einem vollen Monddurchmesser alle 36 Jahre. Bis zum Jahr 6000 hat der Pol damit einen spürbaren Bogen durchlaufen und nähert sich allmählich dem Sternbild Kepheus, wo später (um das Jahr 4000 bzw. 7500) die Sterne Errai und Alderamin ihre größte Polnähe erreichen."},
    "prec-vega":{t:"Präzession — Jahr 12000 (Vega-Nähe)",s:"Der zukünftige Polarstern wird Wega sein — einer der hellsten Sterne des Nordhimmels.",d:"Um das Jahr 13.600 n. Chr. — also etwas später als die in dieser Szene gezeigte Jahreszahl 12000 — wird der Himmelsnordpol seine größte Annäherung an Wega (α Lyrae) erreichen, mit knapp 5° Abstand nie ganz so nah wie aktuell an Polaris, aber dafür an einem der hellsten Sterne des gesamten Himmels (0,0 mag, verglichen mit Polaris' 2,0 mag). Zu dieser Zeit hat sich der gesamte sichtbare Sternhimmel gegenüber heute bereits deutlich verschoben: Sternbilder, die heute zirkumpolar sind (nie untergehen), können dann auf- und untergehen, und umgekehrt."},
    "prec-cycle":{t:"Präzession — Jahr 26000 (fast ein voller Zyklus)",s:"Nach fast 26.000 Jahren nähert sich der Himmelspol wieder der Region um Polaris.",d:"Ein vollständiger Präzessionszyklus dauert rund 25.800 Jahre (der genaue Wert ist wegen kleiner zusätzlicher Störungen nicht exakt konstant). Die hier gezeigte Jahreszahl 26000 liegt bereits über neun Zehntel des Zyklus nach dem heutigen Datum und der Pol nähert sich der Ausgangsregion erneut an — der Kreis schließt sich. Dieselbe Bewegung ist auch der Grund, warum die tropischen Tierkreiszeichen (definiert relativ zum Frühlingspunkt) im Lauf der Jahrtausende systematisch durch alle zwölf Sternbilder des Tierkreises wandern: Ein voller Umlauf des Frühlingspunkts entspricht genau einem vollen Präzessionszyklus."},
    "sim-precession":{t:"Präzessions-Jahreslauf",s:"Der Zeitraffer zeigt, wie der Himmelsnordpol im Lauf der Jahrtausende einen Kreis um den Ekliptikpol beschreibt.",d:"Diese Simulation lässt die Jahreszahl mit 100 Jahren pro Sekunde fortschreiten und zeigt dabei fortlaufend, wo sich der Himmelsnordpol gerade befindet sowie welche Sterne er im Lauf der Zeit passiert (unter anderem Thuban, Kochab, Polaris, Errai, Alderamin, Deneb und Wega). Die zugrundeliegende Berechnung nutzt das Vondrák-2011-Modell für die Präzession, das über sehr lange Zeiträume (mehrere Zehntausend Jahre in beide Richtungen) deutlich genauer ist als die einfachere IAU-1976-Formel, die nur für wenige Jahrhunderte um die Gegenwart gültig ist."},
    "sim-daily-rotation":{t:"Tagesdrehung",s:"Der gesamte Sternhimmel dreht sich scheinbar einmal pro Tag um den Himmelspol — tatsächlich dreht sich die Erde.",d:"Was wie eine Drehung des Himmels erscheint, ist die Rotation der Erde um ihre eigene Achse — von der Erdoberfläche aus gesehen bewegen sich Sonne, Mond und Sterne scheinbar von Ost nach West, tatsächlich dreht sich der Beobachter mit der Erde von West nach Ost unter dem ruhenden Sternhimmel hindurch. Eine volle Umdrehung relativ zu den Sternen (der Sterntag) dauert 23 Stunden 56 Minuten — etwas kürzer als der gewöhnliche 24-Stunden-Tag, weil sich die Erde während eines Tages zusätzlich ein kleines Stück auf ihrer Bahn um die Sonne weiterbewegt hat und sich dadurch geringfügig weiterdrehen muss, bis die Sonne wieder an derselben Stelle steht. Sterne nahe dem Himmelspol beschreiben dabei kleine Kreise und gehen nie unter (zirkumpolare Sterne), während äquatornahe Sterne auf- und untergehen."},
    "obs-equator-spring":{t:"Beobachtungspunkt: Äquator zur Tagundnachtgleiche",s:"Am Äquator steht die Sonne zur Tagundnachtgleiche exakt im Zenit — wie an jedem Tag ist Tag und Nacht hier fast gleich lang.",d:"Am Äquator (0° Breite) verläuft der Himmelsäquator exakt durch den Zenit, und die Himmelspole liegen genau im Norden bzw. Süden auf Horizonthöhe. Weil der Tagbogen der Sonne dadurch das ganze Jahr über annähernd senkrecht zum Horizont steht, sind Tageslänge und Nachtlänge hier fast konstant bei zwölf Stunden — unabhängig von der Jahreszeit. Zur hier gezeigten Tagundnachtgleiche (20. März bzw. 22./23. September) steht die Sonne zusätzlich exakt im Zenit — ihre Deklination ist an diesem Tag 0°, identisch mit der geografischen Breite des Äquators. Zu den Sonnenwenden dagegen erreicht sie \"nur\" rund 66,6° Höhe im Norden bzw. Süden (siehe die Sommerwende-Szene). Der Äquator erlebt damit zwar keine ausgeprägten Jahreszeiten im Sinne von Tageslängen-Unterschieden, aber durchaus im Sinne von Regen- und Trockenzeiten, die vom wandernden Zenitstand der Sonne mitbestimmt werden."},
    "obs-equator-summer":{t:"Beobachtungspunkt: Äquator zur Sommersonnenwende",s:"Zur Sommersonnenwende steht die Sonne am Äquator nicht mehr im Zenit, sondern rund 23,4° nach Norden versetzt — die Tageslänge bleibt dennoch bei zwölf Stunden.",d:"Anders als an den meisten anderen Orten der Erde ändert sich am Äquator die Tageslänge im Jahresverlauf kaum: Weil der Himmelsäquator hier stets senkrecht zum Horizont steht, sind Tag und Nacht ganzjährig annähernd zwölf Stunden lang. Was sich zur hier gezeigten Sommersonnenwende (21. Juni) ändert, ist allein der Einstrahlwinkel: Die Sonnendeklination erreicht ihren Höchstwert von +23,44°, die Sonne kulminiert dadurch nicht mehr exakt im Zenit wie zur Tagundnachtgleiche, sondern rund 23,4° nach Norden versetzt, mit einer Mittagshöhe von etwa 66,6°. Für den nördlichen Wendekreis (23,44° N) ist genau dieser Tag hingegen der Zenit-Tag — der Vergleich beider Standorte am selben Datum zeigt anschaulich, wie der Zenitpunkt der Sonne im Jahresverlauf zwischen den beiden Wendekreisen hin- und herwandert."},
    "obs-tropic-spring":{t:"Beobachtungspunkt: Nördlicher Wendekreis zur Tagundnachtgleiche",s:"Zur Tagundnachtgleiche steht die Sonne auf dem Wendekreis noch nicht im Zenit — das geschieht erst zur Sommersonnenwende.",d:"Der nördliche Wendekreis liegt bei 23,44° N — exakt jener Breite, die dem Betrag der Erdachsneigung entspricht. Zur hier gezeigten Tagundnachtgleiche (20. März) ist die Sonnendeklination 0°, die Sonne kulminiert entsprechend rund 23,4° südlich des Zenits, in etwa 66,6° Höhe — Tag und Nacht sind wie überall auf der Erde an diesem Datum annähernd gleich lang. Erst drei Monate später, zur Sommersonnenwende, erreicht die Sonne auf dem Wendekreis exakt den Zenit (siehe die Sommerwende-Szene) — der einzige Tag im Jahr, an dem das hier geschieht. Der Name \"Wendekreis\" (von griechisch trópos, \"Wendung\") bezieht sich auf genau diesen Zenit-Moment: Hier \"wendet\" der Zenitpunkt der Sonne um und wandert wieder zurück Richtung Äquator."},
    "obs-tropic-summer":{t:"Beobachtungspunkt: Nördlicher Wendekreis zur Sommersonnenwende",s:"Der Tag, der dem Wendekreis seinen Namen gibt: Die Sonne steht hier exakt im Zenit.",d:"Zur Sommersonnenwende (21. Juni) erreicht die Sonnendeklination ihren Höchstwert von +23,44° — exakt die geografische Breite des nördlichen Wendekreises. Nur an diesem einen Tag im Jahr steht die Sonne hier exakt senkrecht über dem Beobachter, im Zenit; das ist der namensgebende Moment des Wendekreises (\"Tropic\", von griechisch trópos, \"Wendung\") — von hier an wandert der Zenitpunkt der Sonne wieder zurück Richtung Äquator und weiter zum südlichen Wendekreis. Zugleich ist dies für die gesamte Nordhalbkugel der Tag mit dem höchsten Sonnenstand und den intensivsten Einstrahlungswerten im Jahr. Zwischen den beiden Wendekreisen — der tropischen Zone — steht die Sonne an mindestens einem Tag im Jahr im Zenit; außerhalb dieser Zone, etwa in Mitteleuropa, erreicht sie diesen Punkt nie."},
    "obs-arctic-spring":{t:"Beobachtungspunkt: Nördlicher Polarkreis zur Tagundnachtgleiche",s:"Zur Tagundnachtgleiche verhält sich der Polarkreis noch wie jeder andere Ort — die Extreme beginnen erst zur Sommersonnenwende.",d:"Der nördliche Polarkreis liegt bei 66,56° N — bei 90° minus der Erdachsneigung von 23,44°. Zur hier gezeigten Tagundnachtgleiche (20. März) ist die Sonnendeklination 0°, Tag und Nacht sind wie überall auf der Erde an diesem Datum annähernd zwölf Stunden lang — der Polarkreis unterscheidet sich an diesem Tag noch nicht von gemäßigten Breiten. Das ändert sich erst zur Sommersonnenwende: Sobald die Sonnendeklination betragsmäßig größer wird als 90° minus die geografische Breite, geht die Sonne hier gar nicht mehr unter (Mitternachtssonne, siehe die Sommerwende-Szene). Direkt auf dem Polarkreis selbst ist das nur ein einzelner Tag im Jahr; je weiter man sich Richtung Pol bewegt, desto länger dauert das Phänomen."},
    "obs-arctic-summer":{t:"Beobachtungspunkt: Nördlicher Polarkreis zur Sommersonnenwende",s:"Der Tag, an dem die Mitternachtssonne beginnt: Auf dem Polarkreis geht die Sonne heute gerade eben nicht unter.",d:"Zur Sommersonnenwende (21. Juni) erreicht die Sonnendeklination ihren Höchstwert von +23,44°. Auf dem Polarkreis (66,56° N) reicht das gerade so aus, dass die Sonne um \"Mitternacht\" den Horizont nur noch streift, statt darunter zu sinken — der erste und einzige Tag im Jahr mit Mitternachtssonne exakt auf dieser Breite. Nördlich davon dauert das Phänomen bereits mehrere Tage bis Wochen, südlich davon geht die Sonne weiterhin jede Nacht unter, wenn auch nur kurz. Sechs Monate später, zur Wintersonnenwende, tritt hier spiegelbildlich für einen Tag Polarnacht ein: Die Sonne geht dann gar nicht auf."},
    "obs-northpole-spring":{t:"Beobachtungspunkt: Nordpol zur Tagundnachtgleiche",s:"Am Pol beginnt zur Tagundnachtgleiche der halbjährige Polartag — die Sonne steigt gerade erst über den Horizont.",d:"Am geografischen Nordpol (90° N) fällt der Himmelspol exakt mit dem Zenit zusammen — alle Sterne bewegen sich hier auf Kreisen parallel zum Horizont, nichts geht auf oder unter, alles ist zirkumpolar. Zur hier gezeigten Tagundnachtgleiche (20. März) überschreitet die Sonnendeklination gerade 0° und wird positiv — für den Nordpol bedeutet das den Beginn des halbjährigen Polartags: Die Sonne, die zuvor ein halbes Jahr lang unter dem Horizont stand, umkreist den Horizont jetzt knapp darüber, ohne unter- oder aufzugehen. In den folgenden Monaten steigt sie langsam höher, bis sie zur Sommersonnenwende ihren höchsten Stand von rund 23,4° erreicht (siehe die Sommerwende-Szene)."},
    "obs-northpole-summer":{t:"Beobachtungspunkt: Nordpol zur Sommersonnenwende",s:"Die Sonne steht am Nordpol auf ihrem höchsten Stand des Jahres und umkreist den Himmel in konstanter Höhe, ohne unterzugehen.",d:"Zur Sommersonnenwende (21. Juni) erreicht die Sonnendeklination ihren Höchstwert von +23,44° — für den Nordpol bedeutet das zugleich die höchste Sonnenposition des gesamten Jahres, denn am Pol entspricht die Sonnenhöhe direkt dem Betrag der Deklination. Die Sonne läuft in dieser Höhe einen vollen Kreis parallel zum Horizont, ohne auf- oder unterzugehen — Mittepunkt des rund sechsmonatigen Polartags, der von der Tagundnachtgleiche im März bis zu der im September andauert. Am gegenüberliegenden Südpol herrscht zur exakt selben Zeit Polarnacht (siehe die Südpol-Szene)."},
    "obs-southpole-northsummer":{t:"Beobachtungspunkt: Südpol zur Sommersonnenwende der Nordhalbkugel",s:"Während am Nordpol zur Sommersonnenwende Polartag herrscht, ist am Südpol zur selben Zeit Polarnacht.",d:"Der Südpol verhält sich exakt spiegelbildlich zum Nordpol: Zur hier gezeigten Sommersonnenwende der Nordhalbkugel (21. Juni, Sonnendeklination +23,44°) führt dieselbe Deklination am Südpol zu einer Sonnenhöhe von −23,44° — die Sonne bleibt also ebenso konstant unter dem Horizont, wie sie am Nordpol konstant darüber bleibt. Diese Antisymmetrie ist eine direkte Folge der Erdachsneigung: Ist die Nordhalbkugel der Sonne zugeneigt, ist die Südhalbkugel zwangsläufig gleich stark abgeneigt. Die jeweiligen Polartag-/Polarnacht-Phasen von Nord- und Südpol laufen deshalb immer genau gegenläufig, mit sechs Monaten Versatz."},
    "obs-northpole-winter":{t:"Beobachtungspunkt: Nordpol zur Wintersonnenwende (Polarnacht)",s:"Winteranfang am Nordpol: Die Sonne bleibt für ein halbes Jahr vollständig unter dem Horizont.",d:"Zur Wintersonnenwende erreicht die Sonnendeklination ihren negativsten Wert (−23,44°) — am Nordpol bedeutet das die Mitte der monatelangen Polarnacht. Die Sonne steht konstant unter dem Horizont, es gibt in dieser Szene keinen Sonnenaufgang und keinen Sonnenuntergang zu beobachten, nur Dämmerung nahe dem Horizont in der Zeit um den astronomischen \"Mittag\", wenn die Sonne ihrem tiefsten Punkt am nächsten kommt. Die durchgehende Dunkelheit dauert am Pol selbst rund ein halbes Jahr, bis die Sonne zum nächsten Frühlingspunkt wieder über den Horizont steigt."}
  };
  var HELP_CATEGORY={
    seasons:{t:"Jahreszeiten",s:"Jahreszeiten entstehen durch die geneigte Erdachse, nicht durch wechselnden Sonnenabstand.",d:"Die Erdachse ist um 23,44° gegen die Bahnebene geneigt und behält diese Ausrichtung im Raum bei, während die Erde die Sonne umläuft. Dadurch ändert sich im Jahresverlauf der Einstrahlwinkel der Sonne auf die jeweilige Erdhälfte — das ist die alleinige Ursache der Jahreszeiten. Der Abstand Erde–Sonne schwankt zwar auch (Perihel im Januar, Aphel im Juli), spielt für die Jahreszeiten selbst aber nur eine untergeordnete Rolle."},
    polar:{t:"Polartag und Polarnacht",s:"Innerhalb der Polarkreise kann die Sonne tagelang gar nicht untergehen oder gar nicht aufgehen.",d:"Ab einer geografischen Breite von 66,56° (dem Polarkreis) kann die Sonnendeklination im Jahresverlauf betragsmäßig größer werden als 90° minus die geografische Breite. Dann bleibt die Sonne während der gesamten scheinbaren Tagesdrehung entweder ständig über dem Horizont (Mitternachtssonne, zum Sommer hin) oder ständig darunter (Polarnacht, zum Winter hin). Je näher man dem Pol kommt, desto länger dauern beide Phänomene, bis sie am Pol selbst je ein halbes Jahr umfassen."},
    eclipse:{t:"Finsternisse",s:"Sonnen- und Mondfinsternisse entstehen, wenn Neu- bzw. Vollmond nahe einem Mondknoten stattfinden.",d:"Weil die Mondbahn um 5,14° gegen die Ekliptik geneigt ist, reicht Neumond bzw. Vollmond allein normalerweise nicht für eine Finsternis — der Mond steht meist etwas ober- oder unterhalb der Sonnen- bzw. Erdschattenlinie. Nur wenn die entsprechende Mondphase gleichzeitig nahe einem der beiden Schnittpunkte von Mondbahn und Ekliptik (den Mondknoten) liegt, kommt es zur Finsternis."},
    moon:{t:"Mondphasen",s:"Die Mondphasen entstehen aus dem sich ändernden Winkel Sonne–Mond–Erde während des Mondumlaufs.",d:"Der Mond leuchtet nicht selbst, sondern reflektiert Sonnenlicht; von der Erde aus sehen wir stets nur den jeweils beleuchteten Teil, der uns zugewandt ist. Weil sich der Winkel zwischen Sonne, Mond und Erde durch den monatlichen Mondumlauf ständig ändert, durchläuft der sichtbare beleuchtete Anteil einen vollen Zyklus von Neumond über die Viertel bis zum Vollmond und zurück — der synodische Monat, im Mittel 29,53 Tage."},
    prec:{t:"Präzession der Erdachse",s:"Die Erdachse taumelt wie ein Kreisel und beschreibt in rund 25.800 Jahren einen vollen Kegel am Himmel.",d:"Die Anziehungskraft von Sonne und Mond auf den an den Polen leicht abgeplatteten Erdkörper erzeugt ein Drehmoment, das die Erdachse — ähnlich einem taumelnden Kreisel — langsam um den Pol der Ekliptik wandern lässt. Ein voller Umlauf dauert rund 25.800 Jahre. Dadurch ändert sich im Lauf der Jahrtausende, welcher Stern gerade in Polnähe steht (aktuell Polaris, einst Thuban, künftig Errai, Alderamin, Deneb und Wega), und die Tierkreiszeichen verschieben sich systematisch gegenüber den gleichnamigen Sternbildern."},
    planets:{t:"Planetenbeobachtung",s:"Planeten bewegen sich relativ zu den Sternen und zeigen je nach Sonnenabstand unterschiedliche Sichtbarkeitsfenster.",d:"Merkur und Venus, deren Bahnen innerhalb der Erdbahn liegen, entfernen sich von der Erde aus gesehen nie weit von der Sonne und sind daher nur in der Dämmerung als Morgen- oder Abendstern sichtbar, am besten nahe ihrer größten Elongation (größter scheinbarer Sonnenabstand). Die äußeren Planeten (Mars bis Neptun) sind dagegen zur Oppositionszeit am besten zu beobachten, wenn sie der Sonne genau gegenüberstehen, die ganze Nacht sichtbar sind und der Erde am nächsten stehen."},
    rotation:{t:"Tägliche Erdrotation",s:"Die scheinbare Drehung des Sternhimmels ist die Rotation der Erde um ihre eigene Achse.",d:"Von der Erdoberfläche aus erscheint der gesamte Sternhimmel, als würde er sich einmal pro Tag um den Himmelspol drehen — tatsächlich dreht sich die Erde selbst unter dem praktisch ruhenden Sternhimmel hindurch. Ein voller Umlauf relativ zu den Sternen (Sterntag) dauert 23 h 56 min, geringfügig kürzer als der gewöhnliche 24-Stunden-Tag."}
  };
  var HELP_CONST={t:"Sternbild-Ansicht",s:"Sternbilder sind zufällige, rein perspektivische Muster — die Sterne darin liegen in ganz unterschiedlichen Entfernungen.",d:"Ein Sternbild ist keine reale räumliche Gruppierung, sondern eine willkürliche, von Menschen erdachte Verbindung von Sternen, die von der Erde aus zufällig in einer ähnlichen Himmelsrichtung erscheinen — tatsächlich liegen sie oft Dutzende bis Tausende Lichtjahre unterschiedlich weit entfernt. Aus einem anderen Blickwinkel im Weltraum betrachtet, würde dieselbe Sterngruppe völlig anders aussehen. Die \"Kulmination\", auf die diese App beim Sprung einstellt, ist der Zeitpunkt, an dem ein Himmelskörper seine größte Höhe über dem Horizont erreicht — für einen Beobachter meist der günstigste Beobachtungszeitpunkt, weil der Blick dann am wenigsten durch dichte, unruhige und lichtverschmutzte horizontnahe Luftschichten geht."};
  var HELP_MW={t:"Milchstraßenzentrum",s:"Der Blick Richtung Schütze/Skorpion zeigt zum Zentrum unserer Galaxis, rund 26.000 Lichtjahre entfernt.",d:"Unsere Sonne liegt nicht im Zentrum der Milchstraße, sondern rund 26.000 Lichtjahre davon entfernt in einem äußeren Spiralarm. Blickt man Richtung Sternbild Schütze (nahe der Grenze zum Skorpion), schaut man direkt auf das galaktische Zentrum, in dem sich ein supermassereiches Schwarzes Loch (Sagittarius A*, rund 4 Millionen Sonnenmassen) befindet. Die als heller Streifen sichtbare Milchstraße ist dabei nichts anderes als der Blick von innen auf die flache Scheibe unserer eigenen Galaxie — die vielen einzelnen, mit bloßem Auge nicht auflösbaren Sterne verschmelzen zu diesem diffusen Lichtband."};

  const PLANET_HELP={
    merkur:{t:"Merkur",s:"Merkur bleibt am Himmel nahe bei der Sonne und ist meist nur in der Dämmerung zu sehen.",d:"Als innerer Planet zeigt Merkur Phasen. Seine scheinbare Größe und der beleuchtete Anteil ändern sich mit der Stellung zu Erde und Sonne. Der Planetensprung sucht eine günstige erreichbare Sichtbarkeit; eine völlig dunkle Nacht ist für Merkur häufig nicht möglich."},
    venus:{t:"Venus",s:"Venus erscheint als heller Morgen- oder Abendstern und zeigt im Fernrohr Phasen.",d:"Venus umkreist die Sonne innerhalb der Erdbahn. In Erdnähe erscheint ihre Scheibe groß, aber oft nur als schmale Sichel; auf der fernen Seite ihrer Bahn kleiner und stärker beleuchtet. Ihre dichte Wolkendecke verdeckt die Oberfläche. Der Sprung berücksichtigt ihre begrenzte Entfernung von der Sonne am Himmel."},
    mars:{t:"Mars",s:"Mars fällt durch seine rötliche Farbe auf. Seine scheinbare Größe hängt stark vom Abstand zur Erde ab.",d:"Die rote Färbung geht auf eisenoxidhaltigen Staub zurück. Günstige Beobachtungsbedingungen ergeben sich um die Opposition, wenn Mars der Sonne am Himmel gegenübersteht. Wegen der elliptischen Bahnen ist nicht jede Opposition gleich günstig. Die vergrößerte Ansicht dient zur Orientierung; erkennbare Details hängen in der Wirklichkeit auch von Teleskop und Luftunruhe ab."},
    jupiter:{t:"Jupiter",s:"Jupiter ist ein Gasriese mit Wolkenbändern und vier besonders auffälligen großen Monden.",d:"Io, Europa, Ganymed und Kallisto verändern ihre Stellung zu Jupiter fortlaufend. Die sichtbaren Bänder gehören zur Atmosphäre, nicht zu einer festen Oberfläche. Um die Opposition ist Jupiter besonders gut über längere Teile der Nacht beobachtbar. Die Hintergrundsterne helfen, seine Bewegung am Himmel zu verfolgen."},
    saturn:{t:"Saturn",s:"Saturn ist an seinem Ringsystem zu erkennen. Dessen scheinbare Öffnung verändert sich im Lauf seiner Sonnenumrundung.",d:"Die Ringe bestehen aus zahlreichen einzelnen Teilchen, überwiegend aus Wassereis. Je nach Blickwinkel von der Erde sehen wir sie weit geöffnet oder nahezu von der Kante. Die Planetensicht zeigt Saturn vergrößert; die tatsächliche Erkennbarkeit der Ringe hängt auch von der verwendeten Optik ab."},
    uranus:{t:"Uranus",s:"Uranus ist ein ferner Eisriese, der im Fernrohr als kleine bläulich-grüne Scheibe erscheint.",d:"Methan in seiner Atmosphäre absorbiert einen Teil des roten Lichts. Seine stark geneigte Rotationsachse führt zu ausgeprägten Jahreszeiten. Wegen seiner geringen scheinbaren Größe ist Uranus leicht mit einem Stern zu verwechseln; die Position vor den Gaia-Hintergrundsternen erleichtert die Zuordnung."},
    neptun:{t:"Neptun",s:"Neptun ist lichtschwach und benötigt zur Beobachtung optische Hilfsmittel.",d:"Der ferne Eisriese erscheint nur als sehr kleine bläuliche Scheibe. Seine Bewegung vor den Hintergrundsternen ist langsam. Beim Planetensprung helfen die Gaia-Sterne, das richtige Gesichtsfeld zu erkennen. Die starke Bildschirmvergrößerung entspricht nicht der Detailfülle, die ein beliebiges Teleskop liefern kann."}
  };
  function findHelpContent(){
    var id=window.__lastJumpId||"";
    // Das konkrete Sprungziel hat Vorrang vor standortabhängigen Erklärungen.
    if(id.startsWith("planet-")&&PLANET_HELP[id.slice(7)])return PLANET_HELP[id.slice(7)];
    var OBS_KEYS={"obs-equator-spring":1,"obs-equator-summer":1,"obs-tropic-spring":1,"obs-tropic-summer":1,"obs-arctic-spring":1,"obs-arctic-summer":1,"obs-northpole-spring":1,"obs-northpole-summer":1,"obs-southpole-northsummer":1,"obs-northpole-winter":1};
    if(OBS_KEYS[id])return HELP_ID[id];
    var didConst=typeof focusConstellation!=="undefined" && !!focusConstellation;
    if(!didConst && typeof lat==="number" && isFinite(lat)){
      var d=(typeof simDay==="number" && isFinite(simDay))?simDay:79;
      var isSummerish=(d>125 && d<220);
      if(Math.abs(lat)<0.5)return HELP_ID[isSummerish?"obs-equator-summer":"obs-equator-spring"];
      if(Math.abs(lat-23.44)<0.5)return HELP_ID[isSummerish?"obs-tropic-summer":"obs-tropic-spring"];
      if(Math.abs(lat-66.5622)<0.3)return HELP_ID[isSummerish?"obs-arctic-summer":"obs-arctic-spring"];
      if(Math.abs(lat-90)<0.5)return HELP_ID[isSummerish?"obs-northpole-summer":"obs-northpole-spring"];
      if(Math.abs(lat+90)<0.5)return HELP_ID["obs-southpole-northsummer"];
    }
    if(HELP_ID[id])return HELP_ID[id];
    if(id==="milky-way-center")return HELP_MW;
    if(/^(orion|ursa-major|cassiopeia|scorpius|widder|stier|zwillinge|loewe|jungfrau|schuetze)$/.test(id))return HELP_CONST;
    if(id==="sim-moon-phases")return HELP_CATEGORY.moon;
    if(id==="equator-night")return HELP_CATEGORY.rotation;
    if(/^planet-/.test(id)||id==="sim-planet-run")return HELP_CATEGORY.planets;
    if(id==="sim-polar-day")return HELP_CATEGORY.polar;
    if(/^obs-/.test(id))return HELP_CATEGORY.seasons;
    var key=typeof activeKey!=="undefined"?activeKey:null;
    try{ if(!key && typeof window.__didScene!=="undefined") key=null; }catch(e){}
    return null;
  }
  window.openDidacticHelp=function(){
    var c=findHelpContent();
    if(!c)c={t:"Erläuterung",s:"Für diese Ansicht liegt noch keine spezifische Erläuterung vor.",d:"Für diese Ansicht liegt noch keine detaillierte physikalische Erklärung vor. Bitte an anderer Stelle nach der gewünschten Erläuterung suchen, oder Rückmeldung geben, damit sie ergänzt werden kann."};
    var ov=document.getElementById('didactic-help-overlay');
    if(!ov){
      ov=document.createElement('div');
      ov.id='didactic-help-overlay';
      document.body.appendChild(ov);
    }
    ov.innerHTML='<div id="didactic-help-card">'+
      '<button id="didactic-help-close" type="button">✕</button>'+
      '<h3 id="didactic-help-title"></h3>'+
      '<p id="didactic-help-short"></p>'+
      '<button id="didactic-help-more" type="button">Weiterlesen ▸</button>'+
      '<p id="didactic-help-detail" style="display:none"></p>'+
      '</div>';
    document.getElementById('didactic-help-title').textContent=c.t;
    document.getElementById('didactic-help-short').textContent=c.s;
    document.getElementById('didactic-help-detail').textContent=c.d;
    if(!document.getElementById('didactic-help-overlay-style')){
      var css=document.createElement('style');
      css.id='didactic-help-overlay-style';
      css.textContent=`
        #didactic-help-overlay{position:fixed;inset:0;z-index:400;background:rgba(4,6,14,.72);display:flex;align-items:center;justify-content:center;padding:1.2rem;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
        #didactic-help-card{position:relative;max-width:520px;width:100%;max-height:80vh;overflow-y:auto;background:rgba(12,16,30,.96);border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:1.4rem 1.3rem 1.6rem;box-shadow:0 24px 60px rgba(0,0,0,.5);font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#eef0f7}
        #didactic-help-close{position:absolute;right:.7rem;top:.7rem;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#eef0f7;font-size:1rem;cursor:pointer}
        #didactic-help-title{margin:0 2.2rem .6rem 0;font-size:1.05rem;font-weight:750;color:#f6d98a}
        #didactic-help-short{margin:0 0 .9rem;font-size:.9rem;line-height:1.5;color:#dfe3ee}
        #didactic-help-more{background:rgba(246,217,138,.14);border:1px solid rgba(246,217,138,.4);color:#f6d98a;border-radius:999px;padding:.45rem .9rem;font-size:.82rem;font-weight:700;cursor:pointer}
        #didactic-help-detail{margin:.9rem 0 0;font-size:.86rem;line-height:1.6;color:#cfd4e2;white-space:pre-line}
      `;
      document.head.appendChild(css);
    }
    ov.style.display='flex';
    document.getElementById('didactic-help-close').onclick=function(){ov.style.display='none'};
    document.getElementById('didactic-help-more').onclick=function(){
      var det=document.getElementById('didactic-help-detail');
      var btn=document.getElementById('didactic-help-more');
      var open=det.style.display!=='none';
      det.style.display=open?'none':'block';
      btn.textContent=open?'Weiterlesen ▸':'Weniger anzeigen ▴';
    };
  };
  function stopDidacticRuns(){
    try{ if(typeof window.stopSolarYearSimulation==='function') window.stopSolarYearSimulation(); }catch(_){ }
    try{ if(typeof window.stopPrecessionRun100==='function') window.stopPrecessionRun100(); }catch(_){ }
    try{ if(typeof window.setYearPlay==='function') window.setYearPlay(false); }catch(_){ }
    try{ if(typeof setPaused==='function') setPaused(true); }catch(_){ }
  }
  window.returnToDidacticPage=function(){
    window.__closeEclipseNavigation?.();
    window.__viewModeUserChosen=false;
    stopDidacticRuns();
    try{ if(typeof window.leaveRealView==="function") window.leaveRealView(); }catch(_){ }
    try{ if(typeof focusConstellation!=='undefined') focusConstellation=null; }catch(_){ }
    try{ if(typeof window.didacticSimulationMode!=='undefined') window.didacticSimulationMode=null; }catch(_){ }
    try{ window.__v9PrecessionStatic=false; }catch(_){ }
    showDidacticBack(false);
    const wasPlanetView=!!window.__planetReturnBtnId;
    try{ if(typeof restorePlanetViewFlags==="function") restorePlanetViewFlags(); }catch(_){ }
    try{ if(typeof zoom!=='undefined'){ zoom=1; panX=0; panY=0; zoomedObj=null; if(typeof updateTouchMode==="function") updateTouchMode(); } }catch(_){ }
    if(wasPlanetView && typeof restorePlanetReturnScroll==="function"){
      restorePlanetReturnScroll();
    }else{
      const page=document.getElementById('page-jumps');
      const sc=document.getElementById('scroller');
      if(page&&sc){sc.scrollTop=page.offsetTop;}
      else if(page){page.scrollIntoView({behavior:'smooth',block:'start'});}
    }
    if(typeof window.scheduleDidacticSkyDraw==='function')window.scheduleDidacticSkyDraw('didactic-navigation');
  };

  if(typeof jumpScene==='function' && !window.__v9DidacticBackJumpWrap){
    const oldJump=jumpScene;
    window.__v9DidacticBackJumpWrap=true;
    jumpScene=function(id){
      const r=oldJump.apply(this,arguments);
      if(id && id!=='current') setTimeout(()=>showDidacticBack(true),180);
      else setTimeout(()=>showDidacticBack(false),60);
      return r;
    };
    window.jumpScene=jumpScene;
  }
  ['homeView','resetView','setNow'].forEach(name=>{
    const old=window[name] || (typeof globalThis[name]==='function'?globalThis[name]:null);
    if(old && !window['__v9DidacticBackClear_'+name]){
      window['__v9DidacticBackClear_'+name]=true;
      window[name]=globalThis[name]=function(){
        if(name==='homeView'||name==='setNow'){
          window.__closeEclipseNavigation?.();
          const chips=document.getElementById('didactic-chips');
          if(chips)chips.style.display='none';
        }
        showDidacticBack(false);return old.apply(this,arguments);
      };
    }
  });
  ensureDidacticBackButton();

  const BODY_SYMBOL_PREFIX=/^(☀|☾|☽|☿|♀|♂|♃|♄|♅|♆)\s*/;
  const TARGETS={
    polaris:{names:['Polaris','Polarstern','Polarstern (Polaris)'],label:'Polarstern',ra:2.53,de:89.26},
    errai:{names:['Errai','γ Cephei','Gamma Cephei'],label:'Errai',ra:23.6558,de:77.6323},
    alderamin:{names:['Alderamin','Aldemarin','α Cephei','Alpha Cephei'],label:'Alderamin',ra:21.3096,de:62.5856},
    vega:{names:['Wega','Vega','α Lyrae','Alpha Lyrae','Vega (α Lyrae)'],label:'Vega',ra:18.6156,de:38.7837},
    thuban:{names:['Thuban','α Draconis','Alpha Draconis'],label:'Thuban',ra:14.0732,de:64.3758},
    kochab:{names:['Kochab','β Ursae Minoris','Beta Ursae Minoris'],label:'Kochab',ra:14.8451,de:74.1555},
    deneb:{names:['Deneb','α Cygni','Alpha Cygni'],label:'Deneb',ra:20.6905,de:45.2803}
  };
  function inPrecessionView(){return window.didacticSimulationMode==='precession' || window.__v9PrecessionStatic===true;}
  function cleanText(t){return String(t==null?'':t).replace(BODY_SYMBOL_PREFIX,'').trim();}
  function targetForText(text){
    const t=cleanText(text);
    if(t==='N') return {names:['N'],label:'N'};
    for(const k in TARGETS){if(TARGETS[k].names.includes(t))return TARGETS[k];}
    return null;
  }
  function starForTarget(t){
    try{
      if(typeof STARS!=='undefined' && Array.isArray(STARS)){
        const found=STARS.find(s=>s && t.names.includes(s.n));
        if(found)return found;
      }
    }catch(_){ }
    return t;
  }
  function drawTargetLabel(t,dy){
    try{
      if(typeof g==='undefined'||typeof altazXY!=='function'||typeof precess!=='function'||typeof currentJD!=='function')return;
      const st=starForTarget(t);
      const jd=currentJD();
      const pc=precess(st.ra,st.de,jd);
      const R=(Math.min((cv&&cv.width)||W,(cv&&cv.height)||W)/2)*.94;
      const p=altazXY(pc.ra,pc.dec,R);
      if(!p||p.alt<-10)return;
      const z=(typeof zoom==='number'?zoom:1), px=(typeof PX==='number'?PX:1);
      const x=ORX+(typeof panX==='number'?panX:0)+z*p.x;
      const y=ORY+(typeof panY==='number'?panY:0)+z*p.y+(dy||-18)*px;
      if(x<-90*px||y<-90*px||x>((cv&&cv.width)||0)+190*px||y>((cv&&cv.height)||0)+90*px)return;
      g.save();
      g.font=(12*px*(window.userLabelScale||1)*Math.max(.85,Math.min(1,Math.min(window.innerWidth,window.innerHeight)/430)))+'px Inter, system-ui, sans-serif';
      g.textAlign='center';g.textBaseline='middle';
      g.fillStyle='rgba(235,246,255,.98)';
      g.fillText(t.label,x,y);
      g.restore();
    }catch(e){console.warn('Präzessionslabel konnte nicht gezeichnet werden',e);}
  }
  function drawPrecessionTargetLabels(){
    if(!inPrecessionView())return;
    drawTargetLabel(TARGETS.polaris,-20);
    drawTargetLabel(TARGETS.errai,-18);
    drawTargetLabel(TARGETS.alderamin,-18);
    drawTargetLabel(TARGETS.vega,-18);
  }
  if(window.__planetariumRender && !window.__v9PrecessionOnlyThreeLabelsWrap){
    window.__v9PrecessionOnlyThreeLabelsWrap=true;
    window.__planetariumRender.registerAroundDraw('precession-target-labels',function(context){
      if(!inPrecessionView() || typeof g==='undefined') return context.next(...context.args);
      const oldFill=g.fillText.bind(g), oldStroke=g.strokeText.bind(g);
      g.fillText=function(text,x,y,maxWidth){ if(window.__drawingZodiac===true) return oldFill(text,x,y,maxWidth); const t=targetForText(text); if(!t)return; return oldFill(t.label,x,y,maxWidth); };
      g.strokeText=function(text,x,y,maxWidth){ const t=targetForText(text); if(!t)return; return oldStroke(t.label,x,y,maxWidth); };
      try{return context.next(...context.args);} finally{g.fillText=oldFill;g.strokeText=oldStroke;var _pu2=window.__V9_UNIFY_LABELS;window.__V9_UNIFY_LABELS=false;try{drawPrecessionTargetLabels();}finally{window.__V9_UNIFY_LABELS=_pu2;}}
    });
  }
})();
