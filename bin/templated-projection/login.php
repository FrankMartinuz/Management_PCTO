<?php
session_start();
if (isset($_SESSION["user-type"])) {
  session_destroy();
  header("Location: index.php");
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
      <a href="index.php" class="logo"><strong>Management PCTO</strong></a>
      <nav id="nav">
        <a href="index.php">Home</a>
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
      <form action="sessionInit.php" method="post" align="center">
        <div align="center" class="12u 12u$">
          <h3>Inserire <strong>utente</strong> o <strong>Email</strong> di Spaggiari</h3>
          <input id="textLogin" type="text" name="user"  placeholder="User"/>
        </div><br>
        <div align="center" class="12u 12u$">
          <h3>Inserire la <strong>password</strong> di Spaggiari</h3>
          <input id="textLogin" type="password" name="password" placeholder="Password" />
        </div>
        <br><br>
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
