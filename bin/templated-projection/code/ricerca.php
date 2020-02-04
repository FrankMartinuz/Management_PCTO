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
