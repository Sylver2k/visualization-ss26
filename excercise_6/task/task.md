# Visualisierung eines gewichteten Graphen mit einem Visualisierungsframework

In der zweiten Übung mit einem Visualisierungsframework geht es darum, einen gewichteten Graphen zu visualisieren. Entsprechend der Gewichte sollen die Kanten des Graphen in ihrer Linienstärke variiert werden. Die Größe der Knoten soll die Anzahl der bestehenden Verbindungen codieren.

Benutzen Sie folgenden <u>Datensatz</u>. Es handelt sich um ein soziales Netzwerk, das aus der Bibel abgeleitet wurde: "_The data describes a list of all of the names that appear together in a given verse of the Old and New Testaments of the King James Version of the Bible. The weight indicates how many times each name pair occurs throughout the Bible_". Der Datensatz umfasst 8714 Einträge.

_Tipp:_ Während der Programmierung dieser Aufgabe sollten Sie mit einem kleineren Datensatz arbeiten. Entweder kürzen Sie den großen Datensatz, oder arbeiten Sie mit diesem <u>kleinen Datensatz</u> (Achtung: die Gewichte sind hier anders normiert).

Die Daten liegen als Textdatei mit drei Tab-separierten Einträgen pro Zeile vor:

```text
Root Name    Associated Name    Association Weight
Aaron        Abihu              8
Aaron        Benjamin           1
Aaron        David              1
Aaron        Eleazar            11
usw.
```

Die ersten 4 oben abgebildeten Datensätze sehen in GrapML z.B. <u>so aus</u>.

Implementieren Sie mit Hilfe eines geeigneten Visualisierungsframeworks eine Applikation, die solche Datensätze visualisiert. Unterstützen Sie dabei folgende Features:

- Das Programm soll das oben angegebene Textformat öffnen können.
  - Ggf. müssen Sie einen geeigneten Konverter für die Daten schreiben.
  - Falls Sie _prefuse_ benutzen: Sie können eine entsprechende von `prefuse.data.io.AbstractGraphReader` abgeleitete Klasse implementieren oder die Konvertierung nach GraphML von Hand implementieren, je nach dem, was Ihnen einfacher fällt.

- Die Visualisierung soll den Graphen mit einem _Force Directed Layout_ visualisieren. (In _prefuse:_ `prefuse.action.layout.graph.ForceDirectedLayout`)

- Knoten (Nodes) sollen den Personennamen als Label tragen. Die Größe des Knotens soll sich nach der Anzahl der vorhandenen Verbindungen (Edges) zu anderen Knoten richten. Je mehr Verbindungen, desto größer der Knoten.

- Verbindungen (Edges) sollen sich in ihrer Liniendicke nach dem in den Daten angegebenen Gewicht richten.

- Eine Suchfunktion soll nach Personennamen suchen können und die entsprechenden Knoten dann in geeigneter Weise markieren. (In _prefuse:_ `ColorAnimator`)

- Den Graphen soll man zoomen und verschieben können, einzelne Knoten mit der Maus anfassen und bewegen können.

Zusatz (optional):

- Versuchen Sie das Gewicht der einzelnen Verbindungen mit der Federkonstante des Force Directed Layout zu modellieren, so dass stärker gebundene Personen näher beieinander liegen.
