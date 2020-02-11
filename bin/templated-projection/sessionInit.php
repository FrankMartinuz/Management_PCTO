<?php

  session_start();

  if (empty($_POST)) {
    header("Location: login.php");
    exit;
  } else {

    if ($_POST["username"] == "Admin" and $_POST["password"] == "Admin") {
      $_SESSION["user"] = $_POST["username"];
    }else {
      header("Location: login.html");
      exit;
    }

  }

  header("Location: index.php");
  exit;
 ?>

 <?php

 if (isset($_POST["user"]) &&
 isset($_POST["password"])){

   $password = $_REQUEST["password"];
   $utente= $_REQUEST["user"];
   // chiamo il webservice
   $url = "https://web.spaggiari.eu/services/ws/wsExtAuth.php?wsdl";
   $client = new SoapClient( $url );
   $result = $client->__soapCall("wsExtAuth..ckAuth",    array(
     'cid' =>"VRIT0007",
     'login' =>$utente,
     'password' => $password));

     echo "<pre>";
     var_dump($result[2]);
     echo "</pre>";

     if (empty($result[0]) && empty($result[1])) {
       session_start();
       $result = (array) $result[2];
       $_SESSION["user-type"] = $result["account_type"];

     }else {

       echo '<script type="text/javascript">';
 echo ' alert("DATI ERRATI")';  //not showing an alert box.
 echo '</script>';

     }

   }

   ?>
