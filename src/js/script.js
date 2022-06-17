//import from './metodos.js'


//Criando os canvas do jogador, do oponente e do tabuleiro central
const canvasTabuleiroJS = document.getElementById("canvasTabuleiro")
const canvasJogadorJS = document.getElementById("canvasJogador")
const canvasOponeteJS = document.getElementById("canvasOponente")
const canvasCompraJS = document.getElementById("canvasCompra")

//Variaveis globais
const l_peca_original = 198
const a_peca_original = 100
const reducao = 2.5
let l_peca = l_peca_original/reducao
let a_peca = a_peca_original/reducao

//Lista de imagens das Pecas
let caminhoImagem = "./src/img/Pecas_A/"
//let caminhoImagem = "./src/img/Pecas_B/B_"
//let caminhoImagem = "./src/img/Pecas_C/C_"
//let caminhoImagem = "./src/img/Pecas_D/D_"
let extencaoImagem = ".png"
let imagensPecas = {}
for (let lado1 = 6; lado1 >= 0; lado1--) {
  for (let lado2 = lado1; lado2 >= 0; lado2--) {
    let valorChave = lado1.toString() + lado2.toString()
    let nomePeca = lado1.toString() + "_" + lado2.toString()
    imagensPecas[valorChave] = caminhoImagem + nomePeca + extencaoImagem
  }
}
imagensPecas['verso'] = caminhoImagem + 'verso' + extencaoImagem
imagensPecas['tabuleiro'] = caminhoImagem + 'tabuleiro' + extencaoImagem
//Conjunto de valores validos de pecas para usuario digitar
pecasValidas = Object.keys(imagensPecas)
nPecas = pecasValidas.length
for (var i = 0; i < nPecas; i++) {
  pecasValidas.push(pecasValidas[i].split("").reverse().join(""))
}


class InterfaceCanvas {

  constructor(canvasJS,cadeiaDePecas){
    this.cadeiaDePecas = cadeiaDePecas
    this.canvasObj = canvasJS

    this.ctx = this.canvasObj.getContext("2d")
    this.l_canvasObj = this.canvasObj.width
    this.a_canvasObj = this.canvasObj.height
    this.centro_x = this.l_canvasObj/2
    this.centro_y = this.a_canvasObj/2

    this.escala_canvas = 1
    this.semZoom = true
  }

  Iniciar(){
    this.ApresentaTabuleiro()
  }

  ApresentaTabuleiro(){
    let nova_largura = this.l_canvasObj*this.escala_canvas
    let nova_altura = this.a_canvasObj*this.escala_canvas

    let tabuleiroImg = new Image()
    tabuleiroImg.src = this.CarregarImagem('tabuleiro')
    
    this.ctx.save()
    this.ctx.translate(this.centro_x,this.centro_y)
    tabuleiroImg.addEventListener("load",()=>{
      this.ctx.drawImage(tabuleiroImg,
        -nova_largura/2,-nova_altura/2,
        nova_largura,nova_altura)
      this.ctx.restore()

      this.MostrarTodasPecas()
    })
  }

  CarregarImagem(numeroImg){
    return imagensPecas[numeroImg]
  }

  MostrarPecaNova(){
    let pecaImg = new Image()
    let pecaObj = this.cadeiaDePecas.novaPeca
    let numeroImg  = pecaObj.numero
    pecaImg.src = this.CarregarImagem(numeroImg)

    pecaImg.addEventListener("load",()=>{
      this.MostrarUmaPeca(pecaImg,pecaObj)
    })
  }

  MostrarUmaPeca(pecaImg,pecaObj){

    let img_x = pecaObj.x
    let img_y = pecaObj.y
    let l_imgNoCanvas
    let a_imgNoCanvas
    let invert

    //Salva os parametros do canvas
    this.ctx.save()
    //Muda a referencia do canvas para o meio da peca
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
  }

  MostrarTodasPecas(){
    if (this.cadeiaDePecas.arrayPecas[0]){ //Se cadeia nao vazia
      this.MostrarRecursivo(0)
    } //else {
      //alert("Cadeia vazia")
    //}
  }

  MostrarRecursivo(i=0){

    if (i < this.cadeiaDePecas.tamanho){
      let pecaImg = new Image()
      let pecaObj = this.cadeiaDePecas.arrayPecas[i]
      let numeroImg  = pecaObj.numero
      pecaImg.src = this.CarregarImagem(numeroImg)

      //Esse eventlistener junto com a funcao recursiva abaixo
      //garante que cada peca soh eh processada e mostrarda
      //apos a peca anterior
      pecaImg.addEventListener("load",()=>{
        this.MostrarUmaPeca(pecaImg,pecaObj)
        //Recursividade da funcao
        this.MostrarRecursivo(i+1)

      })
    }
  }

  LimpaCanvas(){

    let nova_largura = this.canvasObj.width*this.escala_canvas
    let nova_altura = this.canvasObj.height*this.escala_canvas
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

    this.AdicionaPecaNoCanvas(pontaEscolhida,numeroEscolhido)

  }

  AdicionaPecaNoCanvas(pontaEscolhida,numeroEscolhido){
    if(this.cadeiaDePecas.tamanho==0){
      this.cadeiaDePecas.PrimeiraPeca(numeroEscolhido,this.centro_x,this.centro_y)
    } else {
      this.cadeiaDePecas.AdicionaPeca(numeroEscolhido, pontaEscolhida)
      this.cadeiaDePecas.AjustaCadeia()
      this.cadeiaDePecas.AtualizaCoordenadasNovaPeca(pontaEscolhida)
      this.VerificaZoom()
    }
    this.MostrarPecaNova()
  }

  Refresh(){
    this.LimpaCanvas()
    this.ApresentaTabuleiro()
  }

  ZoomOut(escala=.7){
    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    this.escala_canvas /= escala
    this.Refresh()
  }

  ZoomIn(escala=1.2){
    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    this.escala_canvas /= escala
    this.Refresh()
  }

  MoveUp(){
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].y+=20
    }
    this.Refresh()
  }

  MoveDown(){
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].y-=20
    }
    this.Refresh()
  }

  MoveLeft(){
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x+=20
    }
    this.Refresh()
  }

  MoveRight(){
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x-=20
    }
    this.Refresh()
  }

  VerificaZoom(){
    if(this.semZoom &&
      (this.cadeiaDePecas.ponta1.tamanho > 4 || this.cadeiaDePecas.ponta2.tamanho > 4)){
      this.ZoomOut()
      this.semZoom = false
    }
  }

}

//Classe principal usada para criar uma cadeia de pecas
class CadeiaDePecas {
  constructor(){
    this.arrayPecas = []
    this.tamanho = 0
    this.novaPeca
    this.pecaAnterior

    this.ponta1 = {
      valor: -1,
      tamanho: 0,
      sentidoHoriz: -1,
      sentidoVert: 0,
      curva: false
    }

    this.ponta2 = {
      valor: -1,
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
    this.PreencheNumeroDaPonta("ponta1")
    this.PreencheNumeroDaPonta("ponta2")
    this.tamanho = this.arrayPecas.length
  }

  AdicionaPeca(numero, ponta=1){
    this.novaPeca = new Peca(numero)

    if (ponta == 1){
      this.pecaAnterior = this.arrayPecas[0]
      this.arrayPecas.unshift(this.novaPeca)
      this.ponta1.tamanho ++
      // Verifica se peça se liga no tablueiro invertida ou não
      let pecaLado1 = this.novaPeca.numero.substring(0,1)
      if(pecaLado1==this.ponta1.valor){
        this.novaPeca.Inverter()
      }
      // Verifica o sentido em que a cadeia de peças está crescendo e ajuta a peça
      if(this.ponta1.sentidoVert != 0) this.novaPeca.Girar90graus()
      if(this.ponta1.sentidoHoriz == 1) this.novaPeca.Inverter()
      this.PreencheNumeroDaPonta("ponta1")
    } else if (ponta == 2){
      this.pecaAnterior = this.arrayPecas[this.tamanho-1]
      this.arrayPecas.push(this.novaPeca)
      this.ponta2.tamanho ++
      // Verifica se peça se liga no tablueiro invertida ou não
      let pecaLado2 = this.novaPeca.numero.substring(1,2)
      if(pecaLado2==this.ponta2.valor){
        this.novaPeca.Inverter()

      }
      // Verifica o sentido em que a cadeia de peças está crescendo e ajuta a peça
      if(this.ponta2.sentidoVert != 0) this.novaPeca.Girar90graus()
      if(this.ponta2.sentidoHoriz == -1) this.novaPeca.Inverter()
      this.PreencheNumeroDaPonta("ponta2")
    }

    this.tamanho = this.arrayPecas.length
  }

  PreencheNumeroDaPonta(ponta){
    if(this[ponta].sentidoVert + this[ponta].sentidoHoriz == 1){
      if(this.novaPeca.invertida){
        this[ponta].valor = this.novaPeca.numero.substring(0,1)
      } else {
        this[ponta].valor = this.novaPeca.numero.substring(1,2)
      }
    } else if(this[ponta].sentidoVert + this[ponta].sentidoHoriz == -1) {
      if(this.novaPeca.invertida){
        this[ponta].valor = this.novaPeca.numero.substring(1,2)
      } else {
        this[ponta].valor = this.novaPeca.numero.substring(0,1)
      }
    }
  }

  AjustaCadeia(){

    //Curva para cima se tem muitas pecas na esquerda.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 6 && this.ponta1.sentidoHoriz == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==false && this.pecaAnterior.vertical==false){
        this.ponta1.sentidoHoriz = 0
        this.ponta1.sentidoVert = -1
        this.ponta1.curva = true
      }
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
    }

    //Curva para direita se chegar perto do lado de cima do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta1.tamanho > 9 && this.ponta1.sentidoVert == -1 && this.ponta1.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta1.sentidoHoriz = 1
        this.ponta1.sentidoVert = 0
        this.ponta1.curva = true
      }
    }

    //Curva para esquerda se chegar perto do parte de baixo do canvas.
    //Se houver pecas transversais, nao curva e reduz o zoom.
    if(this.ponta2.tamanho > 9 && this.ponta2.sentidoVert == 1 && this.ponta2.curva == false){
      if (this.novaPeca.vertical==true && this.pecaAnterior.vertical==true){
        this.ponta2.sentidoHoriz = -1
        this.ponta2.sentidoVert = 0
        this.ponta2.curva = true
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

}

class Peca {
  constructor(numero){
    this.x = 0
    this.y = 0
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

class CadeiaDePecasJogador extends CadeiaDePecas {

  PrimeiraPeca(numero,centro_x,centro_y){
    super.PrimeiraPeca(numero,centro_x,centro_y)
    if(!this.novaPeca.vertical){
      this.novaPeca.Girar90graus()
    }
    if(this.novaPeca.invertida){
      this.novaPeca.Inverter()
    }
  }

  AdicionaPeca(numero, ponta=2){
    super.AdicionaPeca(numero,ponta)
    if(!this.novaPeca.vertical){
      this.novaPeca.Girar90graus()
    }
    if(this.novaPeca.invertida){
      this.novaPeca.Inverter()
    }
  }

  RemovePeca(peca){
    let indice = this.arrayPecas.indexOf(peca)
    var pecaRemovida
    if (indice > -1){
      pecaRemovida = this.arrayPecas.splice(indice,1)[0]
    }
    this.tamanho = this.arrayPecas.length
    return pecaRemovida.numero
  }

}

class InterfaceCanvasJogador extends InterfaceCanvas {

  constructor(canvasJS,cadeiaDePecas,uiTabuleiro){
    super(canvasJS,cadeiaDePecas)
    this.uiTabuleiro = uiTabuleiro

    this.x_retangAzul = this.l_canvasObj/4
    this.y_retangAzul = this.a_canvasObj*0.3
    this.alt_retangAzul = this.l_canvasObj/2
    this.lar_retangAzul = l_peca*0.8

    this.DesenhaRetanguloAzul()
  }

  DesenhaRetanguloAzul(){
    this.ctx.fillStyle="#0e3659"
    this.ctx.fillRect(this.x_retangAzul,this.y_retangAzul,
    this.alt_retangAzul,this.lar_retangAzul)
  }

  AdicionaPecaNoCanvas(pontaEscolhida,numeroEscolhido){
    if(this.cadeiaDePecas.tamanho==0){
      this.cadeiaDePecas.PrimeiraPeca(numeroEscolhido,this.centro_x,this.centro_y)
    } else {
      this.cadeiaDePecas.AdicionaPeca(numeroEscolhido, pontaEscolhida)
      this.cadeiaDePecas.AtualizaCoordenadasNovaPeca(pontaEscolhida)
    }
    this.Refresh()
  }

  AtualizaCanvas(){

    let numeroEscolhido = document.getElementById("pecaJogador").value
    let pontaEscolhida = 2

    if(checarInput(pontaEscolhida,numeroEscolhido)=="erro"){
      return
    }

    this.AdicionaPecaNoCanvas(pontaEscolhida,numeroEscolhido)

  }

  Refresh(){
    this.CentralizaPecasNoCanvas()
    this.LimpaCanvas()
    this.DesenhaRetanguloAzul()
    this.MostrarTodasPecas()
    this.LimparBotoesDasPecas(".BotaoNaPeca")
    this.TornarPecasResponsivas()
  }

  CentralizaPecasNoCanvas(){
    let deslocX = this.cadeiaDePecas.arrayPecas[0].larg/2 * (this.cadeiaDePecas.tamanho - 1)
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x = this.centro_x - deslocX
      deslocX -= this.cadeiaDePecas.arrayPecas[i].larg
    }
  }

  AvaliaPecaNoTabuleiro(nroPeca){
    let tabPonta1 = this.uiTabuleiro.cadeiaDePecas.ponta1.valor
    let tabPonta2 = this.uiTabuleiro.cadeiaDePecas.ponta2.valor

    if(tabPonta1 == -1) {  //Caso o tabuleiro esteja vazio
      return 1
    }

    let pecalado1 = nroPeca.substring(0,1)
    let pecalado2 = nroPeca.substring(1,2)

    let ponta1valida = (pecalado1==tabPonta1 || pecalado2==tabPonta1)
    let ponta2valida = (pecalado1==tabPonta2 || pecalado2==tabPonta2)

    if (ponta1valida && !ponta2valida) {
      return 1
    } else if (!ponta1valida && ponta2valida) {
      return 2
    } else if (ponta1valida && ponta2valida) {
      return 3
    } else {
      return 0
    }
  }

  TornarPecasResponsivas(){
    //Adiciona um botao sobre cada peca para que ela seja
    //responsiva ao click do mouse
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){

      let peca = this.cadeiaDePecas.arrayPecas[i]
      let button = this.CriarBotaoNaPeca(peca.x, peca.y, peca.larg, "BotaoNaPeca")

      button.onclick = function(){
        let nroPeca = peca.numero
        let avaliacao = this.AvaliaPecaNoTabuleiro(nroPeca)

        if (avaliacao == 0) {
          return
        } else if (avaliacao == 1 || avaliacao == 2) {
          let nroPecaRemovida = this.cadeiaDePecas.RemovePeca(peca)
          this.uiTabuleiro.AdicionaPecaNoCanvas(avaliacao,nroPeca)
          document.body.removeChild(button)
          if(this.cadeiaDePecas.tamanho){
            this.Refresh()
          } else {
            this.LimpaCanvas()
            this.DesenhaRetanguloAzul()
          }
        } else if (avaliacao == 3) {
          alert("Falta implementar lógica para quando peça entra nos duas pontas")
        }

      }.bind(this)

    }

  }

  CriarBotaoNaPeca(x, y, alturaPeca, classeBotao) {
    //Cria um botao na posicao indicada
    let areaCanvas = this.canvasObj.getBoundingClientRect()
    let areaBody = document.body.getBoundingClientRect()
    var btn = document.createElement("button");
    document.body.appendChild(btn);
    btn.style.position = "absolute";
    btn.style.left = (x + areaCanvas.left - alturaPeca/2) + "px";
    btn.style.top = (y + areaCanvas.top - areaBody.top - alturaPeca + 8.5) + "px";
    btn.style.background = "none";
    btn.style.border ="dotted";
    btn.style.width = a_peca + "px";
    btn.style.height = l_peca + "px";
    btn.classList.add(classeBotao)
    return btn;
  }

  LimparBotoesDasPecas(classeBotao){
    let botoes = document.querySelectorAll(classeBotao)
    botoes.forEach(function(botao) {
      botao.remove();
    });
  }

}

class InterfaceCanvasOponente extends InterfaceCanvasJogador {

  CarregarImagem(numeroImg){
    return imagensPecas['verso']
  }

  Refresh(){
    this.CentralizaPecasNoCanvas()
    this.LimpaCanvas()
    this.DesenhaRetanguloAzul()
    this.MostrarTodasPecas()
  }

}

class InterfaceCanvasCompra extends InterfaceCanvas {

  constructor(canvasJS,cadeiaDePecas,uiJogador){
    super(canvasJS,cadeiaDePecas)
    this.uiJogador = uiJogador
  }

  CarregarImagem(numeroImg){
    return imagensPecas['verso']
  }

  IniciaPilhaDeCompra(){
    this.cadeiaDePecas.PrimeiraPeca('23',this.centro_x,this.centro_y)
    for(let i=0; i<7; i++){
      this.cadeiaDePecas.AdicionaPeca('23', 1)
      this.cadeiaDePecas.AtualizaCoordenadasNovaPeca(1)
    }
  }

  MostrarCanvas(){
    this.canvasObj.style.zIndex = "6"
    this.canvasObj.style.background = "#0e3659"
    this.canvasObj.style.border = "1px solid #000"
    this.Refresh()
  }

  EscondeCanvas(){
    this.canvasObj.style.zIndex = "0"
    this.canvasObj.style.background = "transparent"
    this.canvasObj.style.border = "transparent"
    this.LimpaCanvas()
  }

  Refresh(){
    this.CentralizaPecasNoCanvas()
    this.LimpaCanvas()
    this.MostrarTodasPecas()
    this.LimparBotoesDasPecas()
    this.TornarPecasResponsivas()
  }

  CentralizaPecasNoCanvas(){
    let deslocX = this.cadeiaDePecas.arrayPecas[0].larg/2 * (this.cadeiaDePecas.tamanho - 1)
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x = this.centro_x - deslocX
      deslocX -= this.cadeiaDePecas.arrayPecas[i].larg
    }
  }

  TornarPecasResponsivas(){
    //Adiciona um botao sobre cada peca para que ela seja
    //responsiva ao click do mouse
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){

      let peca = this.cadeiaDePecas.arrayPecas[i]
      let button = this.CriarBotaoNaPeca(peca.x, peca.y, peca.larg, "BotaoNaPecaCompra")

      button.onclick = function(){
        let nroPecaRemovida = this.cadeiaDePecas.RemovePeca(peca)
        this.uiJogador.AdicionaPecaNoCanvas(1,nroPecaRemovida)
        document.body.removeChild(button)
        this.LimparBotoesDasPecas(".BotaoNaPecaCompra")
        this.EscondeCanvas()
      }.bind(this)

    }

  }

  CriarBotaoNaPeca(x, y, alturaPeca, classeBotao) {
    //Cria um botao na posicao indicada
    let areaCanvas = this.canvasObj.getBoundingClientRect()
    let areaBody = document.body.getBoundingClientRect()
    var btn = document.createElement("button");
    document.body.appendChild(btn);
    btn.style.position = "absolute";
    btn.style.left = (x + areaCanvas.left - alturaPeca/2) + "px";
    btn.style.top = (y + areaCanvas.top - areaBody.top - alturaPeca + 8.5) + "px";
    btn.style.background = "none";
    btn.style.border ="dotted";
    btn.style.width = a_peca + "px";
    btn.style.height = l_peca + "px";
    btn.style.zIndex="6";
    btn.classList.add(classeBotao)
    return btn;
  }

  LimparBotoesDasPecas(classeBotao){
    let botoes = document.querySelectorAll(classeBotao)
    botoes.forEach(function(botao) {
      botao.remove();
    });
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

let pecasTabuleiro = new CadeiaDePecas()
let pecasJogador = new CadeiaDePecasJogador()
let pecasOponente = new CadeiaDePecasJogador()
let pecasCompra = new CadeiaDePecasJogador()
let uiTabuleiro = new InterfaceCanvas(canvasTabuleiroJS,pecasTabuleiro)
let uiJogador = new InterfaceCanvasJogador(canvasJogadorJS,pecasJogador,uiTabuleiro)
let uiOponente = new InterfaceCanvasOponente(canvasOponeteJS,pecasOponente,uiTabuleiro)
let uiCompra = new InterfaceCanvasCompra(canvasCompra,pecasCompra,uiJogador)
uiCompra.IniciaPilhaDeCompra()
uiTabuleiro.Iniciar()


const botaoCor = document.getElementById("botaoCor");

botaoCor.addEventListener("click", function onClick(event){
  const box = document.getElementById("canvasTabuleiro");
  box.style.backgroundColor = "coral";
});


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
