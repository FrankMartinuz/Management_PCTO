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
  <!-- CODE -->
<script src="assets/js/jquery.min.js"></script>
<script type="text/javascript">

//FristLoad
$(document).ready(function (){
  $.ajax({
    url: "code/query.php",
    type: "get",
    dataType: "json",
    success: function(response){
      var len = response.length
      var table = "<thead><tr><td><strong>ID</strong></td><td><strong>Nome</strong></td><td><strong>Comune</strong></td><td><strong>Indirizzo</strong></td><td><strong>Settore</strong></td></tr></thead>"
      for (var i=0; i < len; i++){
        table += "<tr onclick=\"newPage(" + response[i].ID + ")\">\n"
        table += "<td>" + response[i].ID + "</td>\n"
        table += "<td>" + response[i].Ragione_sociale + "</td>\n"
        table += "<td>" + response[i].Comune + "</td>\n"
        table += "<td>" + response[i].Indirizzo + "</td>\n"
        table += "<td>" + response[i].Settore + "</td>\n"
        table += "</tr>\n"
      }
      console.log(table)
      $("#resultTable").append(table)
    }
  })
})

function ricerca(event){
  console.log(event)
  switch (event.target.id) {
    case "ragione_sociale":
      console.log("ciao")
      //ricerca =  ""
      break;
    default:

  }
}

  function newPage(ID){
    document.cookie = ("IDazienda=" + ID);
    location.href= "azienda.php";
  }

</script>

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

<!-- body -->
<section id="three" class="wrapper">
  <div class="inner">
    <header class="align-center">
      <h2>Risultati ricerca</h2>
    </header>

    <!-- Research field -->

  </script>
  <form method="POST" name="searchField" id="form" onsubmit="return false;">
    <div class="row uniform">
      <div class="3u 12u$(small)" align="center">
        <h2>Nome</h2>
        <input type="text" id="ragione_sociale" onkeypress="ricerca(event)" placeholder="Nome"/>
      </div>
      <div class="3u 12u$(small)" align="center">
        <h2>Comune</h2>
        <input type="text" id="comune" onkeypress="sendQuery(event)" placeholder="Comune"/>
      </div>
      <div class="3u 12u$(small)" align="center">
        <h2>Indirizzo</h2>
        <input type="text" id="indirizzo" onkeypress="sendQuery(event)" placeholder="Indirizzo"/>
      </div>
      <div class="3u 12u$(small)" align="center">
        <h2>Settore</h2>
        <input type="text" id="settore" onkeypress="sendQuery(event)" placeholder="Settore"/>
      </div>
    </div>
  </form>
  <div class="table-wrapper">
    <table class="alt" id="resultTable">
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
