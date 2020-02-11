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
  <!DOCTYPE HTML>
  <!--
  Projection by TEMPLATED
  templated.co @templatedco
  Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
-->
<html>
<head>
  <title>Generic - Projection by TEMPLATED</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="assets/css/main.css" />
</head>
<body class="subpage">

  <!-- Header -->
  <header id="header">
    <div class="inner">
      <a href="index.html" class="logo"><strong>Projection</strong> by TEMPLATED</a>
      <nav id="nav">
        <a href="index.html">Home</a>
        <a href="generic.html">Generic</a>
        <a href="elements.html">Elements</a>
      </nav>
      <a href="#navPanel" class="navPanelToggle"><span class="fa fa-bars"></span></a>
    </div>
  </header>

  <section id="three" class="wrapper">

    <div class="inner">
      <header class="align-center">
        <h2>Login</h2>
        <p>Immettere qui le credenziali</p>
      </header>
<div class="align-center">

</div>
  <form class="login" action="login.php" method="post">
    <div class="6u 12u$(xsmall)">
      <input type="text" name="user" id="user" value="" placeholder="User" />
    </div>
    <div class="6u$ 12u$(xsmall)">
      <input type="password" name="password" id="password" value="" placeholder="Password" />
    </div>
    <input class="button" type="submit" name="Submit" value="LOGIN">
  </form>
  </div>
</div>

  </section>
  <!-- Footer -->
  <footer id="footer">
    <div class="inner">

      <div class="copyright">
        &copy; Untitled. Design: <a href="https://templated.co">TEMPLATED</a>. Images: <a href="https://unsplash.com">Unsplash</a>.
      </div>

    </div>
  </footer>

  <!-- Scripts -->
  <script src="assets/js/jquery.min.js"></script>
  <script src="assets/js/skel.min.js"></script>
  <script src="assets/js/util.js"></script>
  <script src="assets/js/main.js"></script>

</body>
</html>
