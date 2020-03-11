<?php
  $host = "localhost";
  $db_name = "test";
  $username = "root";
  $password = "";
  try {
      $con = mysqli_connect($host,$username,$password,$db_name);
  } catch (PDOException $exception) {
    echo "<script>console.log(".$exception->getMessage().");</script>";
  }
?>
