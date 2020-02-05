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
