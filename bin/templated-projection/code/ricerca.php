<<<<<<< HEAD
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
=======
    <?php
      include "connect.php";
      $user = "student";
      switch ($user) {
        case 'student':
          $attributes = "ID,Tipologia,Ragione_sociale,Comune,Provincia,Indirizzo,CAP,Sito_Web,Settore";
          break;
        case 'tutor':
          $attributes = "*";
          break;
        default:
          echo "Utente errato";
          break;
      }
      $query = "SELECT $attributes from Aziende";
      $stmt = $con->prepare( $query );
      $stmt->execute();
      $nRighe = $stmt->rowCount();

      if ($nRighe > 0){
        echo "<table>";
        headerTabella($attributes);
        for ($i=0; $i < $nRighe; $i++) {
          $riga = $stmt->fetch(PDO::FETCH_NUM);
          //echo "<pre>";
          //var_dump($riga);
          //echo "</pre>";
          echo "<tr>";
          foreach ($riga as $key => $value) {
            echo "<td>$value</td>";
          }
          echo "</tr>";
        }
        echo "</table>";
      }else{
        echo "Nessuna voce trovata con la query.";
      }

      function headerTabella($header){
        if ($header != "*"){
          $header = explode(",",$header);
        }else{
          $header = ["ID","Tipologia","Ragione_sociale","Comune","Provincia","Indirizzo","CAP","Telefono","Email","Sito_Web","Dipendenti","Data_convenzione","Settore","Codice_ATECO","Descrizione"];
        }
        echo "<tr>";
        foreach ($header as $attribute) {
          echo "<td>$attribute</td>";
        }
        echo "</tr>";
      }
    ?>
>>>>>>> 1e8de3ba5c7c39f5aa7d014bfb54a44e6332d7a4
