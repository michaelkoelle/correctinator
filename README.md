# Correctinator [![CircleCI](https://circleci.com/gh/koellemichael/correctinator/tree/master.svg?style=svg)](https://circleci.com/gh/koellemichael/correctinator/tree/master)

Ein Korrekturprogramm ([Download](#download)) mit Media Viewer für Uni2Work Bewertungsdateien.
![alt text](https://i.imgur.com/RHtnqcW.png "Correctinator")


## Workflow
1. **Abgaben öffnen** - Es können mehrere Abgaben (komplettes Abgabenverzeichnis) oder nur eine einzelne Abgabe (Ordner einer einzelnen Abgabe) geöffnet werden.
2. **Abgaben initialisieren** - Falls das Kommentarfeld von einer oder mehreren Abgaben noch nicht initialisiert wurde, wird man aufgefordert dies zu tun. Nachtäglich kann dies mit der Funktion "Kommentarfeld initialisieren" gemacht werden. Die Initialisierung erfordert ein gewisses Aufgabenschema, das im Abschnitt [Initialisierung des Kommentarfelds](#initialisierung-des-kommentarfelds) definiert wird.
3. **Korrigieren** - Die Bewertung wird automatisch aus der Summe der Bewertung der Unteraufgaben berechnet. Zusätzlich können Anmerkungen zu den Aufgaben in das jeweilige Kommentarfeld der Aufgabe geschrieben werden. Für allgemeine Kommentare gibt es ein separates Kommentarfeld am Ende jeder Abgabe (hier werden auch die [Automatischen Kommentare](#automatischer-kommentar) eingefügt). Solange der Status der Abgabe auf "*TODO*" gesetzt ist, wird die Bewertung nicht in der Datei gespeichert (sie ist natürlich implizit vorhanden, da die Bewertungen der Unteraufgaben zu jeder Zeit gespeichert werden). Erst wenn der Status auf "*FINISHED*" gesetzt wird, wird die Bewertung gespeichert. Der Status "*FINISHED*" wird gesetzt, sobald "Speichern/Nächste Abgabe" gedrückt, oder explitzit der Status gesetzt wird.
4. **Markieren** - Es besteht die Möglichkeit, Abgaben zu markieren und eine Notiz hinzuzufügen. Markierte Abgaben muss man dann explizit über das Menü auf den Status "*FINISHED*" setzen, um sie abzuschließen.
5. **Zippen** - Sobald alle Abgaben den Status "*FINISHED*" erreicht haben, wird der Nutzer gefragt, ob die Abgaben komprimiert werden sollen. Alternativ lässt sich der Dialog mit der Funktion "Als Zip exportieren" starten.



## Initialisierung des Kommentarfelds
Für die Vewendung des Programms ist die Initialisierung des Kommentarfelds nötig. Es muss ein Schema der Aufgaben angegeben werden.
Unteraufgaben werden mit Tabs eingerückt. Das Schema der Aufgaben im Kommentarfeld ist wie folgt:

\<**Aufgabenname**> [**:**|**)**] \<**Erreichte Punktzahl**>/\<**Maximale Punktzahl**>

Beispiel:

![alt text](https://i.imgur.com/dKLKDPT.png "Beispiel Initialisierung")

## Einstellungen
- **Autosave**: Automatisches Speichern nach jeder Aktion.
- **Cycle Files**: Im [Media Viewer](#media-viewer) wird nach der letzten Datei wieder die erste Datei einer Abgabe angezeigt.
- **Automatisches Hochscrollen**: Scrollt automatisch zur ersten Aufgabe hoch, nachdem man die Abgabe wechselt. Bezieht sich auf den Aufgabenbereich.
- **Automatischer Kommentar**: Bei Änderung der Bewertung bzw. nach dem Wechseln der Abgabe (momentan nur Button "Nächste Abgabe") wird zur Abgabe ein vordefinierter Kommentar, abhängig von der erreichten Punktzahl, hinzugefügt. Weitere Informationen im Abschnitt [Automatischer Kommentar](#automatischer-kommentar).
- **Verbose**: Zeigt nach dem Öffnen von Abgaben eine Zusammenfassung des Imports an.

## Media Viewer
- **PDF Viewer**: Es wird eine Beta Version der Open-Scource Library PDF.js verwendet. Es kann also zu Darstellungfehlern kommen. Wenn man sich nicht sicher ist, sollte die Datei über die "Ordner öffnen" Funktion in einem anderen Viewer geöffnet werden. Bei großen PDF-Dateien und PDF-Dateien, die Bilder enthalten, kommt es zu etwas längeren Ladezeiten (je nach Leistung des PCs).
- **Image Viewer**: Man kann zoomen und das Bild per Drag and Drop verschieben. Und es gibt Touchpad Support für Mac :)
- **Text Viewer**: Das Encoding wird nicht immer erkannt. Es gibt kein Text-Highlighting. Aus irgendeinem Grund gibt es einen Zeilenumbruch, wenn der Text länger ist als der Viewer.

## Automatische Korrektur von Single Choice Aufgaben
Single Choice Aufgaben können automatisch korrigiert werden. Dazu muss die Lösung der Aufgabe in einer separaten .txt Datei abgegeben werden und folgendem Format entsprechen:<br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**><br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**><br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**><br>
...<br>
<br>
Über den Menüpunkt "Automatische Korrektur" wird die Aufgabe ausgewählt, die Lösung eingegeben und die Korrektur durchgeführt.
Änhlich wie die Abgabe der Studenten muss auch die Lösung ein bestimmtes Format haben:<br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**> \<**Bemerkung**><br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**> \<**Bemerkung**><br>
\<**Aufgabenname**>[**)**|**:**] \<**Lösung**> \<**Bemerkung**><br>
...<br>
<br>
**Ein Beispiel**:
![alt text](https://i.imgur.com/SUV77Cw.png "Beispiel Automatische Korrektur")

Die Bemerkung wird dem Studenten bei einer inkorrekten Antwort als Kommentar eingefügt.

## Automatischer Kommentar
Mit dieser Funktion können abhängig von der erreichten Punktzahl automatische Kommentare zur Abgabe hinzugefügt werden. Man kann Kommentare über den Menüpunkt "Automatischer Kommentar Einstellungen" definieren. Die Kommentare sollten jedoch nur einmal definiert werden. Beim Import von älteren Abgaben und einer veränderten Definition kann es zu doppelten Kommentaren kommen, da das Programm keinen Verlauf der bisherigen Kommentardefinitionen speichert.

# Download
[Releases (Win, Mac & Linux)](https://github.com/koellemichael/correctinator/releases)