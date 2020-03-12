<?php
include "connect.php";
$query = "SELECT * FROM Aziende";
$stmt = mysqli_query($con,$query);

$result = [];
while ($riga = mysqli_fetch_array($stmt)) {
  array_push($result,array("ID"=>$riga["ID"], "Ragione_sociale"=>$riga["Ragione_sociale"], "Comune"=>$riga["Comune"],"Indirizzo"=>$riga["Indirizzo"], "Settore"=>$riga["Settore"]));
}
echo json_encode($result);
?>
