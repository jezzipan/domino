//Getting the canvas
const tabuleiro = document.getElementById("canvasTabuleiro")
const ctx = tabuleiro.getContext("2d")

//Global variables
const l_tabuleiro = tabuleiro.width
const a_tabuleiro = tabuleiro.height
const centro_x = l_tabuleiro/2
const centro_y = a_tabuleiro/2
let l_peca_original = 198
let a_peca_original = 100
let escala_canvas = 1
const reduc = 3

//Lista de imagens das Pecas
let caminhoImagem = "Imagens/Pecas_teste/"
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

  PrimeiraPeca(numero){
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

    if(this.semZoom &&
      (this.ponta1.tamanho > 4 || this.ponta2.tamanho > 4)){
      zoomOut()
      this.semZoom = false
    }

    //Curva para cima se tem muitas pecas na esquerda.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 5 && this.ponta1.sentidoHoriz == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==false && this.pecaAnterior.vertical==false){
        this.ponta1.sentidoHoriz = 0
        this.ponta1.sentidoVert = -1
        this.ponta1.curva = true
      } else {
        zoomOut(0.9)
      }
    }

    //Curva para baixo se tem muitas pecas na direita
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta2.tamanho  > 5 && this.ponta2.sentidoHoriz == 1 && this.ponta2.curva == false){
      if (this.novaPeca.vertical==false && this.pecaAnterior.vertical==false){
        //curva para baixo
        this.ponta2.sentidoHoriz = 0
        this.ponta2.sentidoVert = 1
        this.ponta2.curva = true
      } else {
        zoomOut(0.9)
      }
    }

    //Curva para direita se chegar perto do lado de cima do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 8 && this.ponta1.sentidoVert == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta1.sentidoHoriz = 1
        this.ponta1.sentidoVert = 0
        this.ponta1.curva = true
      } else {
        zoomOut(0.9)
      }
    }

    //Curva para esquerda se chegar perto do parte de baixo do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta2.tamanho > 8 && this.ponta2.sentidoVert == 1 && this.ponta2.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta2.sentidoHoriz = -1
        this.ponta2.sentidoVert = 0
        this.ponta2.curva = true
      } else {
        zoomOut(0.9)
      }
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

  MostrarCadeia(){
    if (this.arrayPecas[0]){
      mostrarPecas(this.arrayPecas,this.tamanho,0)
    } else {
      alert("Cadeia vazia")
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
    this.larg = l_peca_original/reduc
    this.alt = a_peca_original/reduc

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

function mostrarPecas(arrayPecas,tamanho,i){

  if (i < tamanho){
    let pecaImg = new Image()
    let pecaObj = arrayPecas[i]
    let img_x = pecaObj.x
    let img_y = pecaObj.y
    let numeroImg  = pecaObj.numero
    pecaImg.src = imagensPecas[numeroImg]
    let l_imgNpCanvas
    let a_imgNoCanvas
    let invert


    pecaImg.addEventListener("load",()=>{
      //Esse eventlistener junto com a funcao recursiva abaixo
      //garante que cada peca soh eh processada e mostrarda
      //apos a peca anterior

      ctx.save()
      ctx.translate(img_x,img_y)

      if(pecaObj.vertical){
        ctx.rotate(Math.PI/2)
        l_imgNpCanvas = pecaObj.alt
        a_imgNoCanvas = pecaObj.larg
      } else {
        l_imgNpCanvas = pecaObj.larg
        a_imgNoCanvas = pecaObj.alt
      }

      if(pecaObj.invertida) {
        ctx.scale(-1,1)
        invert = 1
      } else {
        invert = -1
      }

      ctx.drawImage(pecaImg,
        invert*l_imgNpCanvas/2,-a_imgNoCanvas/2,
        -invert*l_imgNpCanvas,a_imgNoCanvas)
      ctx.translate(-img_x,-img_y)
      ctx.restore()

      mostrarPecas(arrayPecas,tamanho,i+1)
      //recursividade da funcao

    })
  }

}

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

let cadeiaPecas = new CadeiaDePecas()

function atualizaTabuleiro(){

  let numeroEscolhido = document.getElementById("pecaJogador").value
  let pontaEscolhida = document.getElementById("pontaJogador").value

  if(checarInput(pontaEscolhida,numeroEscolhido)=="erro"){
    return
  }

  limpaCanvas()

  if(cadeiaPecas.tamanho==0){
    cadeiaPecas.PrimeiraPeca(numeroEscolhido)
  } else {
    cadeiaPecas.AdicionaPeca(numeroEscolhido, pontaEscolhida)
    cadeiaPecas.AjustaCadeia()
    limpaCanvas()
    cadeiaPecas.AtualizaCoordenadasNovaPeca(pontaEscolhida)
  }

  cadeiaPecas.MostrarCadeia()

}

function zoomOut(escala=.8){

  ctx.translate(centro_x,centro_y)
  ctx.scale(escala,escala)
  ctx.translate(-centro_x,-centro_y)
  escala_canvas /= escala

}

function limpaCanvas(){

  let nova_largura = tabuleiro.width*escala_canvas
  let nova_altura = tabuleiro.height*escala_canvas
  let sobra_largura = nova_largura - l_tabuleiro
  let sobra_altura = nova_altura - a_tabuleiro

  ctx.translate(-sobra_largura/2,-sobra_altura/2)
  ctx.clearRect(0,0,nova_largura,nova_altura)
  ctx.translate(sobra_largura/2,sobra_altura/2)

}
