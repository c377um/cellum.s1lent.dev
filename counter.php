<?php
// --- Besucherzähler mit IP-Limitierung (60s pro IP) ---
date_default_timezone_set('Europe/Berlin');

// Counter-Datei
$file = __DIR__ . "/counter.json";
if (!file_exists($file)) {
    $init = [
        "total" => 0,
        "day" => [],
        "week" => [],
        "month" => [],
        "ip" => []
    ];
    file_put_contents($file, json_encode($init));
}
$data = json_decode(file_get_contents($file), true);

// Hilfsfunktionen
function getClientIP() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Zeitbereiche
$day = date("Y-m-d");
$month = date("Y-m");
$week = date("o-W"); // ISO-Woche

// IP-Limitierung: 1 Zählung pro IP/Minute
$ip = getClientIP();
$now = time();
$limit = 60; // Sekunden

// IP-Daten bereinigen (älter als 2h löschen)
foreach ($data["ip"] as $k => $t) {
    if ($t < $now - 7200) unset($data["ip"][$k]);
}

$counted = false;
if (!isset($data["ip"][$ip]) || $data["ip"][$ip] < $now - $limit) {
    // Zählen
    $data["total"]++;
    $data["day"][$day] = ($data["day"][$day] ?? 0) + 1;
    $data["month"][$month] = ($data["month"][$month] ?? 0) + 1;
    $data["week"][$week] = ($data["week"][$week] ?? 0) + 1;
    $data["ip"][$ip] = $now;
    $counted = true;
}

// Nur die letzten 31 Tage/Wochen/12 Monate speichern (optional)
if(count($data["day"]) > 31) $data["day"] = array_slice($data["day"], -31, null, true);
if(count($data["week"]) > 12) $data["week"] = array_slice($data["week"], -12, null, true);
if(count($data["month"]) > 12) $data["month"] = array_slice($data["month"], -12, null, true);

// Speichern
file_put_contents($file, json_encode($data));

// Rückgabe für JS
header("Content-Type: application/json");
echo json_encode([
    "total" => $data["total"],
    "day" => $data["day"][$day],
    "week" => $data["week"][$week],
    "month" => $data["month"][$month],
    "justCounted" => $counted
]);