<!DOCTYPE HTML>
<!--
Projection by TEMPLATED
templated.co @templatedco
Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
-->

<html>

<head>
  <title>Risultati ricerca</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="assets/css/main.css" />
</head>
<body class="subpage">
  <script type="text/javascript">

  var lastInput = 0;

  function sendRequest(event) {
    let search = event.target.value + "%";
    console.log(search);
    let category = document.getElementById("category").value;

    let req = new XMLHttpRequest();
    let currentInput = Math.random();

    req.onreadystatechange = function() {
      if (lastInput == currentInput) {
        document.getElementById("resultTable").innerHTML = req.response;
      }
    }
    let sendData = new FormData();
    sendData.append("query", search);
    sendData.append("category", category);

    req.open('POST', './code/query.php', true);
    //let currentInput = Math.random();
    lastInput = currentInput;
    req.send(sendData);

  }
</script>

<!-- Header -->
<header id="header">
  <div class="inner">
    <a href="index.html" class="logo"><strong>Management PCTO</strong> by Andrea Liboni & Francesco Martino</a>
    <nav id="nav">
      <a href="index.html">Home</a>
      <a href="generic.html">Generic</a>
      <a href="elements.html">Elements</a>
    </nav>
    <a href="#navPanel" class="navPanelToggle"><span class="fa fa-bars"></span></a>
  </div>
</header>

<!-- body -->
<section id="three" class="wrapper">
  <div class="inner">
    <header class="align-center">
      <h2>Risultati ricerca</h2>
    </header>

    <!-- Research field -->

  </script>
  <form method="POST" name="searchField" id = "form">
    <div class="row uniform">
      <div class="9u 12u$(small)">
        <input type="text" name="query" id="query" onkeypress="sendRequest(event)" value="" />
      </div>
      <div class="3u 12u$(small)">
        <div class="select-wrapper">
          <select name="category" id="category">
            <option value="ID">- Category -</option>
            <option value="Tipologia">Tipologia</option>
            <option value="Ragione_sociale">Nome</option>
            <option value="Comune">Comune</option>
            <option value="Provincia">Provincia</option>
            <option value="Indirizzo">Indirizzo</option>
            <option value="CAP">CAP</option>
            <option value="Settore">Settore</option>
          </select>
        </div>
      </div>
    </div>
  </form>
  <div class="table-wrapper">
    <table class="alt" id="resultTable">
      <!-- <?php
      var_dump($_POST["query"], $_POST["category"]);
      session_start();
      $_SESSION["research"] = $_POST["query"];
      $_SESSION["field"] = $_POST["category"];
      include "code/query.php";

      ?> -->
    </table>
  </div>
</section>

<!-- Footer -->
<footer id="footer">
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
