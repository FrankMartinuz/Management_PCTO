<?php
  $host = "localhost";
  $db_name = "test";
  $username = "root";
  $password = "";
  $con = mysqli_connect($host,$username,$password,$db_name);
  try {

  } catch (PDOException $exception) {
    echo "<script>console.log(".$exception->getMessage().");</script>";
  }
?>
