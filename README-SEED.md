# ADEZO OS 2.0 — INSTRUKCJA URUCHOMIENIA SEED-REAL-DATA.SQL

Niniejsza instrukcja krok po kroku opisuje, jak zasiać bazę danych Supabase realnymi danymi handlowymi dla systemu **ADEZO OS 2.0 (BUILD 006)**.

---

## 🚀 Instrukcja Krok po Kroku

### Krok 1: Otwórz plik ze strukturą danych
Otwórz w swoim edytorze lub skopiuj zawartość pliku:
`supabase/seed-real-data.sql`

Plik ten zawiera kompletną strukturę:
- **3 Handlowców** (CEO, Magda K, Magda B)
- **4 Główne Modele Domów** (Tirana, Astana, Chaga, Waleta)
- **10 Realistycznych Leadów** (z różnymi źródłami, statusami i temperaturami)
- **8 Ofert** (ze szczegółami finansowymi, marżą oraz datami)
- **6 Follow-upów** (powiązanych zadań do wykonania na rano i kolejne dni)

---

### Krok 2: Przejdź do Supabase Dashboard
1. Zaloguj się na swoje konto na stronie: [https://supabase.com/dashboard](https://supabase.com)
2. Wybierz swój projekt: **adezo-os-2** (lub aktualnie używany projekt produkcyjny).

---

### Krok 3: Otwórz SQL Editor
1. Na pasku bocznym po lewej stronie znajdź i kliknij ikonę **SQL Editor** (oznaczoną symbolem terminala `_>`).
2. Kliknij przycisk **"+ New query"** (Nowe zapytanie) u góry ekranu, aby utworzyć czysty arkusz roboczy.

---

### Krok 4: Skopiuj i wklej kod SQL
1. Skopiuj cały kod znajdujący się w pliku `supabase/seed-real-data.sql`.
2. Wklej skopiowany kod w edytorze Supabase SQL.

---

### Krok 5: Uruchom skrypt
1. Kliknij zielony przycisk **"Run"** w prawym dolnym rogu edytora (lub użyj skrótu klawiszowego `Ctrl + Enter` / `Cmd + Enter`).
2. W dolnej konsoli powinieneś zobaczyć komunikat: `Success. No rows returned` (lub informację o pomyślnym wykonaniu zapytania).

---

## 🎯 Co to zmieni w Twoim systemie?
Po odświeżeniu aplikacji na porcie `3002`:
- Na **Dashboardzie CEO** zobaczysz realną wartość lejka, zamknięte sprzedaże, wskaźniki i wykresy kołowe/słupkowe.
- Pojawią się aktywne dane w modułach **Leady**, **Oferty** oraz **Followupy**.
- Zakładka **Wyciek Pieniędzy** zacznie precyzyjnie kategoryzować zagrożone szanse sprzedażowe i stare oferty.
- W zakładce **Słowniki** zobaczysz pełną listę handlowców oraz modelów domów z możliwością ich szybkiej aktywacji/dezaktywacji.
