<!DOCTYPE HTML>
<!--
	Projection by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
-->
<html>
	<head>
		<title>Azienda</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="assets/css/main.css" />
	</head>
	<body class="subpage">

		<!-- Header -->
			<header id="header">
				<div class="inner">
					<a href="index.html" class="logo"><strong>Management PCTO</strong></a>
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
						<?php
						include "code/connect.php";
						$query = createQuery();
						$stmt = $con->prepare( $query );
						$stmt->execute();
						$nRighe = $stmt->rowCount();

						if ($nRighe = 1){
							$riga = $stmt->fetch(PDO::FETCH_NUM);
							echo("<h2>".$riga[2]."</h2>");
							var_dump($riga);
						}else{
							echo "Errore durante la query";
						}
						?>
					</header>
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
			<?php
			//Funzioni
			function createQuery(){
			  $q_attr = "*";
				$IDazienda = $_COOKIE["IDazienda"];
			  $query = "SELECT ".$q_attr." FROM Aziende WHERE ID=".$IDazienda;
			  return $query;
			}
			?>

	</body>
</html>
