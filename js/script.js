//import from './metodos.js'


//Criando os canvas do jogador, do oponente e do tabuleiro central
const canvasTabuleiroJS = document.getElementById("canvasTabuleiro")
const canvasJogadorJS = document.getElementById("canvasJogador")
const canvasOponeteJS = document.getElementById("canvasOponente")


//   // Click and drag
// var rect1x = rec1y;
// var a = b;

// function mouseDown(){
//   a = document.getElementById("canvasTabuleiro").getBoundingClientRect().left;
//   b = document.getElementById("canvasTabuleiro").getBoundingClientRect().top;
//   rect1x = window.event.clientX - a;
//   rect1y = window.event.clientY - b;
// }

// function mouseUp(){
//   var rect2x = window.event.clientX - a;
//   var rect2y = window.event.clientY - b;

//   // var c=document.getElementById("canvasTabuleiro");
//   // var ctx=c.getContext("2d");
//   // ctx.fillStyle="#FF0000";
//   ctx.fillRect(rect1x, rect1y, rect2x - rect1x, rect2y - rect1y);
// }

class InterfaceCanvas {

  constructor(canvasJS,cadeiaDePecas){
    this.cadeiaDePecas = cadeiaDePecas
    this.canvasObj = canvasJS

    this.ctx = this.canvasObj.getContext("2d")
    this.l_canvasObj = this.canvasObj.width
    this.a_canvasObj = this.canvasObj.height
    this.centro_x = this.l_canvasObj/2
    this.centro_y = this.a_canvasObj/2
  }

  MostrarPecas(){
    if (this.cadeiaDePecas.arrayPecas[0]){
      this.MostrarCadaPeca(0)
    } else {
      alert("Cadeia vazia")
    }
  }

  MostrarCadaPeca(i=0){

    if (i < this.cadeiaDePecas.tamanho){
      let pecaImg = new Image()
      let pecaObj = this.cadeiaDePecas.arrayPecas[i]
      let img_x = pecaObj.x
      let img_y = pecaObj.y
      let numeroImg  = pecaObj.numero
      pecaImg.src = imagensPecas[numeroImg]
      let l_imgNoCanvas
      let a_imgNoCanvas
      let invert

      pecaImg.addEventListener("load",()=>{
        //Esse eventlistener junto com a funcao recursiva abaixo
        //garante que cada peca soh eh processada e mostrarda
        //apos a peca anterior

        this.ctx.save()
        this.ctx.translate(img_x,img_y)

        //Ajuste dos parametros caso a imagem seja vartical
        if(pecaObj.vertical){
          this.ctx.rotate(Math.PI/2)
          l_imgNoCanvas = pecaObj.alt
          a_imgNoCanvas = pecaObj.larg
        } else {
          l_imgNoCanvas = pecaObj.larg
          a_imgNoCanvas = pecaObj.alt
        }

        //Ajuste dos parametros caso a imagem seja invertida
        if(pecaObj.invertida) {
          this.ctx.scale(-1,1)
          invert = 1
        } else {
          invert = -1
        }

        //Desenho da imagem no canvas e reset dos parametros
        this.ctx.drawImage(pecaImg,
          invert*l_imgNoCanvas/2,-a_imgNoCanvas/2,
          -invert*l_imgNoCanvas,a_imgNoCanvas)
        this.ctx.translate(-img_x,-img_y)
        this.ctx.restore()

        //Recursividade da funcao
        this.MostrarCadaPeca(i+1)

      })
    }
  }

  LimpaCanvas(){

    let nova_largura = this.canvasObj.width*escala_canvas
    let nova_altura = this.canvasObj.height*escala_canvas
    let sobra_largura = nova_largura - this.l_canvasObj
    let sobra_altura = nova_altura - this.a_canvasObj

    this.ctx.translate(-sobra_largura/2,-sobra_altura/2)
    this.ctx.clearRect(0,0,nova_largura,nova_altura)
    this.ctx.translate(sobra_largura/2,sobra_altura/2)

  }

  AtualizaCanvas(){

    let numeroEscolhido = document.getElementById("pecaJogador").value
    let pontaEscolhida = document.getElementById("pontaJogador").value

    if(checarInput(pontaEscolhida,numeroEscolhido)=="erro"){
      return
    }

    this.LimpaCanvas()

    if(this.cadeiaDePecas.tamanho==0){
      this.cadeiaDePecas.PrimeiraPeca(numeroEscolhido,this.centro_x,this.centro_y)
    } else {
      this.cadeiaDePecas.AdicionaPeca(numeroEscolhido, pontaEscolhida)
      this.cadeiaDePecas.AjustaCadeia()
      this.LimpaCanvas()
      this.cadeiaDePecas.AtualizaCoordenadasNovaPeca(pontaEscolhida)
    }

    this.MostrarPecas()

  }

  ZoomOut(escala=.8){

    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    escala_canvas /= escala

  }

  ZoomIn(escala=1.2){

    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    escala_canvas *= escala

  }

  Refresh(){
    this.LimpaCanvas()
    this.cadeiaDePecas.AjustaCadeia()
    this.MostrarPecas()
  }

  MoveUp(){
  // shift everything to the left:
    var imageData = this.ctx.getImageData(1, 0, this.ctx.canvas.width-1, this.ctx.canvas.height);
    this.ctx.putImageData(imageData, 0, 0);
    // now clear the right-most pixels:
    this.ctx.clearRect(this.ctx.canvas.width-1, 0, 1, this.ctx.canvas.height);
  }

}

//Variaveis globais
const l_peca_original = 198
const a_peca_original = 100
const reducao = 3
let l_peca = l_peca_original/reducao
let a_peca = a_peca_original/reducao
let escala_canvas = 1

//Lista de imagens das Pecas
let caminhoImagem = "Imagens/Pecas_teste/"
//let caminhoImagem = "Imagens/Pecas_B/B_"
//let caminhoImagem = "Imagens/Pecas_C/C_"
//let caminhoImagem = "Imagens/Pecas_D/D_"
let extencaoImagem = ".png"
let imagensPecas = {}
for (let lado1 = 6; lado1 >= 0; lado1--) {
  for (let lado2 = lado1; lado2 >= 0; lado2--) {
    let valorChave = lado1.toString() + lado2.toString()
    let nomePeca = lado1.toString() + "_" + lado2.toString()
    imagensPecas[valorChave] = caminhoImagem + nomePeca + extencaoImagem
  }
}
//Conjunto de valores validos de pecas para usuario digitar
pecasValidas = Object.keys(imagensPecas)
nPecas = pecasValidas.length
for (var i = 0; i < nPecas; i++) {
  pecasValidas.push(pecasValidas[i].split("").reverse().join(""))
}

//Classe principal usada para criar uma cadeia de pecas
class CadeiaDePecas {
  constructor(){
    this.arrayPecas = []
    this.tamanho = 0
    this.semZoom = true
    this.novaPeca
    this.pecaAnterior

    this.ponta1 = {
      valor: 0,
      tamanho: 0,
      sentidoHoriz: -1,
      sentidoVert: 0,
      curva: false
    }

    this.ponta2 = {
      valor: 0,
      tamanho: 0,
      sentidoHoriz: 1,
      sentidoVert: 0,
      curva: false
    }
  }

  PrimeiraPeca(numero,centro_x,centro_y){
    this.novaPeca = new Peca(numero)
    this.arrayPecas.push(this.novaPeca)
    this.novaPeca.x = centro_x
    this.novaPeca.y = centro_y
    this.tamanho = this.arrayPecas.length
  }

  AdicionaPeca(numero, ponta=1){
    this.novaPeca = new Peca(numero)

    if (ponta == 1){
      this.pecaAnterior = this.arrayPecas[0]
      this.arrayPecas.unshift(this.novaPeca)
      this.ponta1.tamanho ++
      if(this.ponta1.sentidoVert != 0) this.novaPeca.Girar90graus()
      if(this.ponta1.sentidoHoriz == 1) this.novaPeca.Inverter()
    } else if (ponta == 2){
      this.pecaAnterior = this.arrayPecas[this.tamanho-1]
      this.arrayPecas.push(this.novaPeca)
      this.ponta2.tamanho ++
      if(this.ponta2.sentidoVert != 0) this.novaPeca.Girar90graus()
      if(this.ponta2.sentidoHoriz == -1) this.novaPeca.Inverter()
    }

    this.tamanho = this.arrayPecas.length
  }

  AjustaCadeia(){

    // if(this.semZoom &&
    //   (this.ponta1.tamanho > 4 || this.ponta2.tamanho > 4)){
    //   zoomOut()
    //   this.semZoom = false
    // }

    //Curva para cima se tem muitas pecas na esquerda.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 6 && this.ponta1.sentidoHoriz == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==false && this.pecaAnterior.vertical==false){
        this.ponta1.sentidoHoriz = 0
        this.ponta1.sentidoVert = -1
        this.ponta1.curva = true
      }
      // else {
      //   zoomOut(0.9)
      // }
    }

    //Curva para baixo se tem muitas pecas na direita
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta2.tamanho  > 6 && this.ponta2.sentidoHoriz == 1 && this.ponta2.curva == false){
      if (this.novaPeca.vertical==false && this.pecaAnterior.vertical==false){
        //curva para baixo
        this.ponta2.sentidoHoriz = 0
        this.ponta2.sentidoVert = 1
        this.ponta2.curva = true
      }
      // else {
      //   zoomOut(0.9)
      // }
    }

    //Curva para direita se chegar perto do lado de cima do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 9 && this.ponta1.sentidoVert == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta1.sentidoHoriz = 1
        this.ponta1.sentidoVert = 0
        this.ponta1.curva = true
      }
      // else {
      //   zoomOut(0.9)
      // }
    }

    //Curva para esquerda se chegar perto do parte de baixo do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta2.tamanho > 9 && this.ponta2.sentidoVert == 1 && this.ponta2.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta2.sentidoHoriz = -1
        this.ponta2.sentidoVert = 0
        this.ponta2.curva = true
      }
      // else {
      //   zoomOut(0.9)
      // }
    }

  }


  AtualizaCoordenadasNovaPeca(ponta=1){
    let sentidoHoriz
    let sentidoVert
    let curva
    let deslocX
    let deslocY

    if (ponta == 1){
      sentidoHoriz = this.ponta1.sentidoHoriz
      sentidoVert = this.ponta1.sentidoVert
      curva = this.ponta1.curva
    } else if (ponta == 2){
      sentidoHoriz = this.ponta2.sentidoHoriz
      sentidoVert = this.ponta2.sentidoVert
      curva = this.ponta2.curva
    }

    if(sentidoHoriz != 0 && curva == false){    //adiciona na esquerda ou direita
      deslocX = this.pecaAnterior.larg/2 +this.novaPeca.larg/2
      deslocY = 0
    } else if(sentidoVert !=0 && curva == false){    //adiciona acima ou abaixo
      deslocX = 0
      deslocY = this.pecaAnterior.alt/2 +this.novaPeca.alt/2
    } else if(sentidoVert !=0 && curva == true){   //curva para cima ou para baixo
      this.novaPeca.Girar90graus()
      deslocX = this.pecaAnterior.larg/4
      deslocY = this.pecaAnterior.alt/2 +this.novaPeca.alt/2
      sentidoHoriz = sentidoVert
    } else if(sentidoHoriz !=0 && curva == true){   //curva para direita ou para esquerda
      this.novaPeca.Girar90graus()
      this.novaPeca.Inverter()
      deslocX = this.pecaAnterior.larg/2 + this.novaPeca.larg/2
      deslocY = this.pecaAnterior.alt/4
      sentidoVert = -sentidoHoriz
    }

    this.novaPeca.x = this.pecaAnterior.x + deslocX*sentidoHoriz
    this.novaPeca.y = this.pecaAnterior.y + deslocY*sentidoVert

    if (this.ponta1.curva){
      this.ponta1.curva = false
    } else if(this.ponta2.curva){
      this.ponta2.curva = false
    }

  }

}

class Peca {
  constructor(numero){
    this.numero = numero
    this.vertical = false
    this.invertida = false
    this.lado1 = parseInt(numero.charAt(0))
    this.lado2 = parseInt(numero.charAt(1))
    this.larg = l_peca
    this.alt = a_peca

    if(this.lado1 == this.lado2){
      this.vertical = true
      let placeholder = this.larg
      this.larg = this.alt
      this.alt = placeholder
    }

    if(this.lado1 < this.lado2){
      this.invertida = true
      this.numero = this.numero.split("").reverse().join("")
    }
  }

  Girar90graus(){
    this.vertical = !this.vertical
    let placeholder = this.larg
    this.larg = this.alt
    this.alt = placeholder
  }

  Inverter(){
    this.invertida = !this.invertida
  }

}

let pecasTabuleiro = new CadeiaDePecas()
let pecasJogador = new CadeiaDePecas()
let pecasOponente = new CadeiaDePecas()
let uiTabuleiro = new InterfaceCanvas(canvasTabuleiroJS,pecasTabuleiro)
let uiJogador = new InterfaceCanvas(canvasJogadorJS,pecasJogador)
let uiOponente = new InterfaceCanvas(canvasOponeteJS,pecasOponente)

function checarInput(pontaEscolhida,numeroEscolhido){
  if(pontaEscolhida!=1 && pontaEscolhida!=2){
    alert("Ponta inválida - Escolha '1' ou '2'")
    return "erro"
  }

  if(!pecasValidas.includes(numeroEscolhido)){
    alert("Numero de peca invalido")
    return "erro"
  }
}



// function moveDown(){

// }

// function moveLeft(){
// // shift everything to the left:
// var imageData = context.getImageData(1, 0, context.canvas.width-1, context.canvas.height);
// context.putImageData(imageData, 0, 0);
// // now clear the right-most pixels:
// context.clearRect(context.canvas.width-1, 0, 1, context.canvas.height);
// }

// function moveRight(){

// }

const botaoCor = document.getElementById("botaoCor");

botaoCor.addEventListener("click", function onClick(event){
  const box = document.getElementById("canvasTabuleiro");
  box.style.backgroundColor = "coral";
});
