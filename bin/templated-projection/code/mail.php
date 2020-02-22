<?php

// var_dump($_POST);

$name = $_POST["name"];
$class = $_POST["classe"];
$email = $_POST["email"];
$message = $_POST["message"];

$message = str_replace("\n.", "\n..", $message);
// $message = wordwrap($message, 70);

$subject = "Info PCTO - $name  $class";
$body = date("d-m-Y") . "\n\n" . $message;
$body = $body . "\n\nPuò contattarmi a questa mail: $email";
$body = $body . "\n\n$name  $class";

mail("francescomartino498@gmail.com", $subject, $body, "From: $email");
header("Location: index.php");

 ?>
