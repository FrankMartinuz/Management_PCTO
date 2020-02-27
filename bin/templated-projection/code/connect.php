<?php
  $host = "remotemysql.com";
  $db_name = "V1h7DQxhnB";
  $username = "V1h7DQxhnB";
  $password = "k36A91EtFI";
  $con = new PDO("mysql:host=$host;dbname=$db_name",$username, $password);
  try {
    $con = new PDO("mysql:host=$host;dbname=$db_name",$username, $password);
  } catch (PDOException $exception) {
    echo "<script>console.log(".$exception->getMessage().");</script>";
  }
?>
