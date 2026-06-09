# Visualisierung mit Hilfe eines Visualisierungsframeworks

Ziel der Übung ist es, einen ersten Einstieg in ein Visualisierungsframework (z.B. das [prefuse](http://prefuse.org/) Toolkit oder [D3.js](https://d3js.org/)) zu bekommen und eine einfache Visualisierung mit _Interaction_ (Suche) und _Animation_ zu implementieren.

Ausgangspunkt dieser Übung ist der gleiche Datensatz wie aus der <u>3. Übung (Visualisierung Datensatz Teil 1)</u>. Zusätzlich gibt es einen <u>ähnlichen Datensatz</u> mit deutschen Bezeichnungen und Umrechnungen, wie in der <u>3. Übung (Visualisierung Datensatz Teil 1)</u> beschrieben.

Implementieren Sie mit Hilfe von [prefuse](http://prefuse.org/) (oder mit einem anderen äquivalenten Visualisierungsframework) eine Applikation, die die oben angegebenen Datensätze in einem _Scatterplot_ visualisiert. Unterstützen Sie dabei folgende Features:

- Zu Beginn des Programms soll der Benutzer über einen Dateidialog die Datendatei auswählen können. Das bedeutet, dass Ihre Anwendung mit jedem Datensatz umgehen können soll, der aus Tab-separierten Werten besteht, wobei die erste Zeile die Namen der Werte enthält.

- Es sollen zur Visualisierung 4 graphische Eigenschaften verwendet werden:
  - Position x
  - Position y
  - Farbe
  - Form

  Verwenden Sie Auswahl-Boxen, die es dem Benutzer erlauben, die Zuordnung der Datenattribute zu den graphischen Eigenschaften vorzunehmen.

- Verwenden Sie eine geeignete Anzeige (z.B. den ToolTipControl von [prefuse](http://prefuse.org/)), um Detailinformationen über die Daten als Tooltip darzustellen.

- _Optional:_ Implementieren Sie eine Suchfunktion mit folgenden Eigenschaften:
  - Wählbarkeit der zu durchsuchenden Datenattribute
  - Visualisierung der gefundenen Objekte durch eine sinnvolle Veränderung der Farbe der Glyphen. Die Farbveränderung soll durch einen ColorAnimator animiert werden (Überblenden der Farben bei Veränderung des Suchergebnisses).

Hinweise zur Verwendung von [prefuse](http://prefuse.org/):

- Eine kurze Einführung in [prefuse](http://prefuse.org/) wird in der Veranstaltung gegeben. <u>Hier sind die entsprechenden Folien.</u>

- Die in der [prefuse](http://prefuse.org/) Distribution enthaltenen <u>Beispielprogramme</u> sind sehr hilfreich. Es empfiehlt sich, in das ein oder andere Beispiel zu schauen.

- Die [prefuse](http://prefuse.org/) Distribution enthält kein JAR. Diese können aber über die beiliegende Ant-Datei erstellt werden. Hier finden Sie <u>prefuse.jar</u>, wie ich es auf einem Mac OS X 10.5 mit Java 1.6.0 erzeugt habe.

- Die Umsetzung dieser Aufgabe mit einem anderen Visualisierungs-Toolkit ist erlaubt, wenn das Ergebnis die geforderten Features implementiert.
