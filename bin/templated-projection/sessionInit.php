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

     if (empty($result[0]) && empty($result[1])) {
       session_start();
       $result = (array) $result[2];
       $_SESSION["user-type"] = $result["account_type"];

       header("Location: index.php");

     }else {

       header("Location: login.php");

     }

   }

   ?>
