//Variabili
var jsonTabella
var lenJson
//Variabili per la ricerca
var ragione_sociale = ""
var comune = ""
var indirizzo = ""
var settore = ""
var table

//FristLoad
$(document).ready(function (){
  $.ajax({
    url: "code/query.php",
    type: "get",
    dataType: "json",
    success: function(response){
      lenJson = response.length
      jsonTabella = response
      table = "<thead><tr><td><strong>ID</strong></td><td><strong>Nome</strong></td><td><strong>Comune</strong></td><td><strong>Indirizzo</strong></td><td><strong>Settore</strong></td></tr></thead>"
      for (var i=0; i < lenJson; i++){
        table += addAziendaTable(i)
      }
      $("#resultTable").append(table)
    }
  })
})

function addAziendaTable(i){
  var str
  str += "<tr onclick=\"newPage(" + jsonTabella[i].ID + ")\">\n"
  str += "<td>" + jsonTabella[i].ID + "</td>\n"
  str += "<td>" + jsonTabella[i].Ragione_sociale + "</td>\n"
  str += "<td>" + jsonTabella[i].Comune + "</td>\n"
  str += "<td>" + jsonTabella[i].Indirizzo + "</td>\n"
  str += "<td>" + jsonTabella[i].Settore + "</td>\n"
  str += "</tr>\n"
  return str
}

function printRicerca(aziende){
  if (aziende.length > 0){
    table = "<thead><tr><td><strong>ID</strong></td><td><strong>Nome</strong></td><td><strong>Comune</strong></td><td><strong>Indirizzo</strong></td><td><strong>Settore</strong></td></tr></thead>"
    for (var i=0; i<aziende.length;i++){
      var idToFind = aziende[i]
      for (var j=0; j<lenJson; j++){
        if (idToFind == jsonTabella[j].ID){
          table += addAziendaTable(j)
          break
        }
      }
    }
  }else{
    table = "<h3 align=\"center\">Nessun risultato trovato</h3>"
  }
  $("#resultTable").html(table)
}

function ricerca(){
  //jsonTabella = il json con dentro tutte le aziende
  //ricRagione_sociale = contiene il nome dell'azienda
  //ragione_sociale = contiene la stringa da cercare per la ragione sociale

  var find = []
  ragione_sociale = ragione_sociale.toUpperCase()
  comune = comune.toUpperCase()
  indirizzo = indirizzo.toUpperCase()
  settore = settore.toUpperCase()

  for (var i=0; i < lenJson; i++){
    if (jsonTabella[i].Ragione_sociale.includes(ragione_sociale) && jsonTabella[i].Comune.includes(comune) && jsonTabella[i].Indirizzo.includes(indirizzo) && jsonTabella[i].Settore.includes(settore)){
      find.push(jsonTabella[i].ID)
    }
  }
  console.log(find.length)
  printRicerca(find)
}

function inputRicerca(event){
  if (event.key != "Enter"){
    switch (event.target.id) {
      case "ragione_sociale":
        ragione_sociale = document.getElementById("ragione_sociale").value + event.key
        ricerca()
        break;
      case "comune":
        comune = document.getElementById("comune").value + event.key
        ricerca()
        break;
      case "indirizzo":
        indirizzo = document.getElementById("indirizzo").value + event.key
        ricerca()
        break;
      case "settore":
        settore = document.getElementById("settore").value + event.key
        ricerca()
        break;
      default:
    }
  }
}

addEventListener('keydown', function(event){
  if (event.key == "Backspace"){
    switch (event.target.id) {
      case "ragione_sociale":
        ragione_sociale = levaultimo(ragione_sociale)
        ricerca()
        break;
      case "comune":
        comune = levaultimo(comune)
        ricerca()
      case "indirizzo":
        indirizzo = levaultimo(indirizzo)
        ricerca()
      case "settore":
        settore = levaultimo(settore)
        ricerca()
      default:

    }
  }
})

function levaultimo(str){
        len = str.length;
        str = str.substring(0,len-1);
        return str;
}

function newPage(ID){
  document.cookie = ("IDazienda=" + ID);
  location.href= "azienda.php";
}
