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
						<script type="text/javascript" src="http://maps.google.com/maps/api/js?key=AIzaSyDxTFRgq0uC3CFsqvUHHnTa4KEn1BxE6r0"></script>
						<script type="text/javascript">
							var geoCode = new google.maps.Geocoder();
							geoCode.geocode({'address': "via monte tesoro 55"}, function (result, status){
								if (error == google.maps.GeocoderStatus.OK){
									console.log("OK!");
									var options = {center:result[0].geomtry.location};
									var map = new google.maps.Map(document.getgetElementById("map"), options);
								}
							});
						</script>
						<?php
						include "code/connect.php";
						$query = createQuery();
						$stmt = $con->prepare( $query );
						$stmt->execute();
						$nRighe = $stmt->rowCount();

						if ($nRighe = 1){
							$riga = $stmt->fetch(PDO::FETCH_NUM);
						}else{
							echo "Errore durante la query";
						}
						echo("<h2>".$riga[2]."</h2>");
						echo("<p>".$riga[1]."</p>")
						?>
						<hr class="major"/>
						<div class="row uniform">
							<div name="contatti" class="4u 12u">
								<h3><strong>Contatti</strong></h3>
								<h4 align="left"><strong>Numero di telefono: </strong><?php echo($riga[7]) ?></h4>
								<h4 align="left"><strong>Email: </strong><?php echo($riga[8]) ?></h4>
								<h4 align="left"><strong>Sito web: </strong><?php echo($riga[9]) ?></h4>
							</div>
							<div name="informazioni"class="4u 12u">
								<h3><strong>Informazioni</strong></h3>
								<h4><strong>Numero di dipendenti: </strong><?php echo($riga[10]) ?></h4>
								<h4><strong>Data convenzione: </strong><?php echo($riga[11]) ?></h4>
								<h4><strong>Settore: </strong><?php echo($riga[12]) ?></h4>
								<h4><strong>Codice ATECO: </strong><?php echo($riga[13]) ?></h4>
								<h4><strong>Descrizione: </strong><?php echo($riga[14]) ?></h4>
							</div>
							<div name="località" class="4u 12u">
								<h3>Dove trovarci</h3>
								<div id="map"></div>
							</div>
						</div>
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
