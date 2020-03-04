<?php session_start(); ?>
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
					<a href="index.php" class="logo"><strong>Management PCTO</strong></a>
					<nav id="nav">
						<a href="index.php">Home</a>
						<a href="generic.html">Generic</a>
						<a href="elements.html">Elements</a>
					</nav>
					<a href="#navPanel" class="navPanelToggle"><span class="fa fa-bars"></span></a>
				</div>
			</header>

		<!-- header -->
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
						}else{
							echo "Errore durante la query";
						}
						echo("<h2>".$riga[2]."</h2>");
						echo("<p>".$riga[1]."</p>");
						?>
						<hr class="major"/>
						</header>
						<!-- body -->
						<div class="row uniform">
							<div name="contatti" class="4u 12u$(small)">
								<h3 align="center"><strong>Contatti</strong></h3>
								<h4><strong>Sito web: </strong><?php echo($riga[9]) ?></h4>
								<?php if (isset($_SESSION["user-type"])){
												if ($_SESSION["user-type"] != "S"){
													echo "<h4><strong>Numero di telefono: </font></strong>".$riga[7]."</h4>";
													echo "<h4><strong>Email: </strong>".$riga[8]."</h4>";
												}}?>
							</div>

							<div name="informazioni"class="4u 12u$(small)">
								<h3 align="center"><strong>Informazioni</strong></h3>
								<h4><strong>Numero di dipendenti: </strong><?php echo($riga[10]) ?></h4>
								<h4><strong>Settore: </strong><?php echo($riga[12]) ?></h4>
								<h4><strong>Descrizione: </strong><?php echo($riga[14]) ?></h4>
								<?php if (isset($_SESSION["user-type"])){
												if ($_SESSION["user-type"] != "S"){
													echo "<h4><strong>Data convenzione: </strong>".$riga[11]."</h4>";
													echo "<h4><strong>Codice ATECO: </strong>".$riga[13]."</h4>";
												}}?>
							</div>

							<div name="località" class="4u 12u$(small)">
								<h3 align="center"><strong>Dove trovarci</strong></h3>
									<iframe id="map" align="center" class="12u 12u$(small)" height="300" frameborder="0" style="border:0;"></iframe>
									<script type="text/javascript">
										document.getElementById("map").src = ("https://maps.google.com/maps?q=" + <?php
										echo "\"".str_replace(" ", "+", $riga[5])."\"";
										 ?>);
									</script>
									<h4><strong>Indirizzo: </strong><?php echo($riga[5]) ?></h4>
									<h4><strong>Comune: </strong><?php echo($riga[3]) ?></h4>
									<h4><strong>CAP: </strong><?php echo($riga[6]) ?></h4>
							</div>
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
			<?php
			//Funzioni
			function createQuery(){
			  $q_attr = "*";
				$IDazienda = $_COOKIE["IDazienda"];
			  $query = "SELECT ".$q_attr." FROM Aziende WHERE ID=".$IDazienda;
			  return $query;
			}?>
	</body>
</html>
