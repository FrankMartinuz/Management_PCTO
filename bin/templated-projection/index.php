<!DOCTYPE HTML>
<!--
	Projection by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
-->
<html>
	<head>
		<title>Management PCTO</title>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="stylesheet" href="assets/css/main.css" />
	</head>
	<body>

		<!-- Header -->
			<header id="header">
				<div class="inner">

					<a href="#" class="logo"><img src="images/logo1.png" align="left" width="150" height="80"></a>
					<!-- <a href="index.php"><strong>Management PCTO</strong></a> -->
					<nav id="nav">
						<a href="index.php">Home</a>
						<?php
							session_start();
							if (isset($_SESSION["user-type"])) {
								echo "<a href=\"code\logout.php\">Logout</a>";
							}else {
								echo "<a href=\"login.php\">Login</a>";
							}
						 ?>
						<a href="elements.html">Elements</a>
					</nav>
					<a href="#navPanel" class="navPanelToggle"><span class="fa fa-bars"></span></a>
				</div>
			</header>

		<!-- Banner -->
			<section id="banner">
				<div class="inner">
					<header>
						<h1>Welcome to Management PCTO</h1>
					</header>

					<div class="flex ">
						<div onclick="window.location='ricerca.php';">
							<!-- <span class="icon fa-car"></span> -->
							<span><img src="images/studente.png" width="100" height="100"></span>
							<h3>Studente</h3>
							<p>Visualizza le aziende registrate</p>
						</div>

						<div onclick="window.location='generic.html';">
							<!-- <span class="icon fa-camera"></span> -->
							<span><img src="images/tutor.png" width="100" height="100"></span>
							<h3>Tutor</h3>
							<p>Prenota una azienda per uno studente</p>
						</div>
					</div>
				</div>
			</section>
					<!--<footer>
						<a href="#" class="button">Get Started</a>
					</footer>-->

		<!-- Three -->
			<section id="three" class="wrapper align-center">
				<div class="inner">
					<div class="flex flex-2">
						<article>
							<div class="image round">
								<img src="images/pic02.jpg" alt="Pic 02" />
							</div>
							<header>
								<h3>Crediti:<br/>Chi siamo</h3>
							</header>
							<p>Siamo due alunni di quinta di informatica,<br/>e abbiamo intrapreso questo progetto accompagnati<br/>dal professor De Carli e dalla professoressa Nadia Dallago</p>
							<footer>
								<a href="elements.html" class="button">Scopri di più</a>
							</footer>
						</article>
					</div>
				</div>
			</section>

		<!-- Footer -->
			<footer id="footer">

				<div class="inner">

					<h3>Contatta direttamente Valenza</h3>

					<form action="code/mail.php" method="post">

						<div class="field half first">
							<label for="name">Nome</label>
							<input name="name" id="name" type="text" placeholder="Name"
							value="<?php if (isset($_SESSION["user-name"])) {echo $_SESSION["user-name"] . " " . $_SESSION["user-surname"] . "\"";}?>"
							readonly = "readonly"
							>
						</div>
						<div class="field half">
							<label for="classe">Classe</label>
							<input name="classe" id="classe" type="text" placeholder="Classe"
							value="<?php if (isset($_SESSION["user-class"])) {echo $_SESSION["user-class"];}?>"

							>
						</div>
						<div class="field">
							<label for="email">Email</label>
							<input name="email" id="email" type="email" placeholder="Email">
						</div>
						<div class="field">
							<label for="message">Messaggio</label>
							<textarea name="message" id="message" rows="6" placeholder="Message"></textarea>
						</div>
						<?php
							if (!isset($_SESSION["user-name"])) {
							echo "<h4 align = \"center\">Per usare questa funzione effettua il <a href=\"login.php\">login</a></h4>";
							}
						?>

						<ul class="actions">
							<li><input value="Invia messaggio" class="button alt" type="submit"
								<?php
								if (!isset($_SESSION["user-name"])) {
									echo "disabled";
								}
								 ?>></li>
						</ul>
					</form>

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
