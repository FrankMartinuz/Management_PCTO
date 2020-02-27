<?php
// Function
function createQuery(){
  $q_attr = "ID,Ragione_sociale,Comune,Indirizzo,Settore";
  $rag_sociale = $_POST["ragione_sociale"];
  $comune = $_POST["comune"];
  $indirizzo = $_POST["indirizzo"];
  $settore = $_POST["settore"];

  $query = "SELECT ".$q_attr." FROM Aziende HAVING
  Ragione_sociale LIKE \"%".$rag_sociale."%\" AND
  Comune LIKE \"%".$comune."%\" AND
  Indirizzo LIKE \"%".$indirizzo."%\" AND
  Settore LIKE \"%".$settore."%\"";

  return $query;
}

function headerTabella($header){

  $header = explode(",", $header);
  echo "<thead>";
  foreach ($header as $attribute) {
    echo "<td><b>$attribute</b></td>";
  }
  echo "</thead>";
}

// Main

include "connect.php";
$q_attr = "ID,Ragione_sociale,Comune,Indirizzo,Settore";
$query = createQuery();
$stmt = $con->prepare( $query );
$stmt->execute();
$nRighe = $stmt->rowCount();

if ($nRighe > 0){
  headerTabella($q_attr);
  echo "<tbody>";
  for ($i=0; $i < $nRighe; $i++) {
    $riga = $stmt->fetch(PDO::FETCH_NUM);

    echo "<tr onclick=newPage(".$riga[0].")>";
    foreach ($riga as $key => $value) {
      echo "<td>$value</td>";
    }
    echo "</tr>";
  }
  echo "</tbody>";
}else{
  echo "Nessun elemento corrispondente alla ricerca";
}

?>
