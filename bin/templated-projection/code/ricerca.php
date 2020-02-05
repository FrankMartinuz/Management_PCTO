<?php

function checkType(){
  session_start();
  if (isset($_SESSION["user_type"])) {
    if ($_SESSION["user_type"] == "Studente") {
      return "S";
    } else {
      return "T";
    }
  } else {
    return "T";
  }
}

include "connect.php";

$user_type = checkType();

$ric = $_REQUEST["string"];
if ($user_type == "S") {
  $query = "SELECT Tipologia,Ragione_sociale,Comune,Provincia,Indirizzo,CAP,Sito_Web,Settore from Aziende";
}else {
  $query = "SELECT * from Aziende";
}

$stmt = $con->prepare( $query );
$stmt->execute(array("%$ric%"));
$nRighe = $stmt->rowCount();

if ($nRighe > 0){
  echo "<table border='1'>";
  headerTabella();
  for ($i=0; $i < $nRighe; $i++) {
    $riga = $stmt->fetch(PDO::FETCH_NUM);


    echo "<tr>";
    echo "<td>".($i + 1)."</td>";
    foreach ($riga as $key => $value) {
      echo "<td>$value</td>";
    }

    echo "</tr>";
  }
  echo "</table>";
}else{
  echo "Nessuna traccia musicale chiamata $ric è presente nell'elenco";
}

function headerTabella(){
  echo "<tr>";
  echo "<td>N</td>";
  echo "<td>IdArtist</td>";
  echo "<td>Name</td>";
  echo "</tr>";
}
?>
