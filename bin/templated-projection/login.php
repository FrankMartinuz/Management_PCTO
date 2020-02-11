<?php
if (isset($_POST["utente"]) &&
isset($_POST["password"])){

  $password = $_REQUEST["password"];
  $utente= $_REQUEST["utente"];
  // chiamo il webservice
  $url = "https://web.spaggiari.eu/services/ws/wsExtAuth.php?wsdl";
  $client = new SoapClient( $url );
  $result = $client->__soapCall("wsExtAuth..ckAuth",    array(
    'cid' =>"VRIT0007",
    'login' =>$utente,
    'password' => $password));
    /*il webservice restituisce 3 array, il primo [0] contiene eventuali errori,
    il secondo [1] la descrizione degli errori ed
    infine il terzo [2] se i primi due sono vuoti conterrà le informazioni dell'account (dati di esempio):
    */
    if(!empty($result[0])){
      //no login - restituito codice errore (il dettaglio dell'errore è nel secondo array $result[1] ma noi lo ignoriamo per un più generico messaggio predefinito di joomla)
      print("errore !!<br>");
      print($result[1]);

    }
    else
    {

      $info=$result[2];			//echo $result;
      var_dump($info);
      print("<br>");
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
  <title>Login</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="assets/css/main.css" />
</head>
<body class="subpage">
  <!-- Header -->
  <header id="header">
    <div class="inner">
      <a href="index.html" class="logo"><strong>Managemnt PCTO</strong></a>
      <nav id="nav">
        <a href="index.html">Home</a>
        <a href="generic.html">Generic</a>
        <a href="elements.html">Elements</a>
      </nav>
      <a href="#navPanel" class="navPanelToggle"><span class="fa fa-bars"></span></a>
    </div>
  </header>

  <!-- Body -->
  <section id="three" class="wrapper">
    <div class="inner">
      <header class="align-center">
        <h2>Login</h2>
        <p>Immettere qui le credenziali</p>
      </header>
      <hr class="major"/>
      <!-- form -->
      <form action="index.html" method="post" align="center">
        <div align="center" class="12u 12u$">
          <h3>Inserire l'indirizzo <strong>Email</strong> di Spaggiari</h3>
          <input type="email" name="demo-name" id="demo-name" value="" placeholder="email" />
        </div>
        <div align="center" class="12u 12u$">
          <h3>Inserire la <strong>password</strong> di Spaggiari</h3>
          <input type="password" name="demo-email" id="demo-email" value="" placeholder="password" />
        </div>
        <input class="button" type="submit" name="Submit" value="LOGIN">
      </form>
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
