<?php


// Function

function createSelect(){

    $attributes = "ID,Ragione_sociale,Comune,Indirizzo,Settore";

  return $attributes;
}

function createQuery(){
  $q_attr = createSelect();
  // $field = $_POST["category"];
  // $equals_to = $_POST["query"];

  $rag_sociale = $_POST["ragione_sociale"];
  $comune = $_POST["comune"];
  $indirizzo = $_POST["indirizzo"];
  $settore = $_POST["settore"];

  $query = "SELECT ".$q_attr." FROM Aziende HAVING
  Ragione_sociale LIKE \"%".$rag_sociale."%\" AND
  Comune LIKE \"%".$comune."%\" AND
  Indirizzo LIKE \"%".$indirizzo."%\" AND
  Settore LIKE \"%".$settore."%\"";
  // $query = "SELECT ".$q_attr." FROM Aziende HAVING ".$field." LIKE \"%".$equals_to."%\"";

  return $query;
}

function headerTabella($header){

  $header = explode(",", $header);
  echo "<tr>";
  foreach ($header as $attribute) {
    echo "<td><b>$attribute</b></td>";
  }
  echo "</tr>";
}

include "connect.php";

// Main

$q_attr = createSelect();
$query = createQuery();

$stmt = $con->prepare( $query );
$stmt->execute();
$nRighe = $stmt->rowCount();

if ($nRighe > 0){
  headerTabella($q_attr);
  for ($i=0; $i < $nRighe; $i++) {
    $riga = $stmt->fetch(PDO::FETCH_NUM);

    echo "<tr>";
    foreach ($riga as $key => $value) {
      echo "<td>$value</td>";
    }

    echo "</tr>";
  }
}else{
  echo "Nessun elemento corrispondente alla ricerca";
}

?>
