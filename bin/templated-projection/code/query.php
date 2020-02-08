<?php


// Function

function createSelect(){

    $attributes = "ID,Ragione_sociale,Comune,Indirizzo,Settore";

  return $attributes;
}

function createQuery(){
  $q_attr = createSelect();
  $field = $_POST["category"];
  $equals_to = $_POST["query"];
  $query = "SELECT ".$q_attr." FROM Aziende HAVING ".$field." LIKE \"%".$equals_to."%\"";

  return $query;
}

function headerTabella($header){
  if ($header != "*"){
    $header = explode(",",$header);
  }else{
    $header = ["ID","Tipologia","Ragione_sociale","Comune","Provincia","Indirizzo","CAP","Telefono","Email","Sito_Web","Dipendenti","Data_convenzione","Settore","Codice_ATECO","Descrizione"];
  }
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
