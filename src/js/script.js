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

    this.limiteEsquerda = 0
    this.limiteDireita = this.l_canvasObj
    this.limiteSuperior = 0
    this.limiteInferior = this.a_canvasObj

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

    let nova_largura = this.l_canvasObj*this.escala_canvas
    let nova_altura = this.a_canvasObj*this.escala_canvas
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
      this.cadeiaDePecas.AtualizaPosicaoLimiteCadeia()
      this.VerificaZoom()
    }
    this.MostrarPecaNova()
  }

  Refresh(){
    this.LimpaCanvas()
    this.ApresentaTabuleiro()
  }

  AjustarLimitesPlotagem(){
    let ajusteHorizontal = this.l_canvasObj*(this.escala_canvas -1)/2
    let ajusteVertical = this.a_canvasObj*(this.escala_canvas -1)/2
    this.limiteEsquerda = 0 - ajusteHorizontal
    this.limiteDireita = this.l_canvasObj + ajusteHorizontal
    this.limiteSuperior = 0 - ajusteVertical
    this.limiteInferior = this.a_canvasObj + ajusteVertical
  }

  ZoomOut(escala=.7){
    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    this.escala_canvas /= escala
    this.AjustarLimitesPlotagem()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  ZoomIn(escala=1.2){
    this.ctx.translate(this.centro_x,this.centro_y)
    this.ctx.scale(escala,escala)
    this.ctx.translate(-this.centro_x,-this.centro_y)
    this.escala_canvas /= escala
    this.AjustarLimitesPlotagem()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  MoveUp(){
    let incrementoY = 30*this.escala_canvas
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].y += incrementoY
    }
    this.cadeiaDePecas. AtualizaPosicaoLimiteCadeia()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  MoveDown(){
    let incrementoY = -30*this.escala_canvas
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].y += incrementoY
    }
    this.cadeiaDePecas. AtualizaPosicaoLimiteCadeia()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  MoveLeft(){
    let incrementoX = 30*this.escala_canvas
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x += incrementoX
    }
    this.cadeiaDePecas. AtualizaPosicaoLimiteCadeia()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  MoveRight(){
    let incrementoX = -30*this.escala_canvas
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){
      this.cadeiaDePecas.arrayPecas[i].x += incrementoX
    }
    this.cadeiaDePecas. AtualizaPosicaoLimiteCadeia()
    this.AtualizarBotoesDasPontas()
    this.Refresh()
  }

  VerificaZoom(){
    if(this.semZoom &&
      (this.cadeiaDePecas.ponta1.tamanho > 4 || this.cadeiaDePecas.ponta2.tamanho > 4)){
      this.ZoomOut()
      this.semZoom = false
    }
  }

  CriarBotaoNaPeca(peca, classeBotao, ressaltarPeca=false,deslocHoriz=0) {
    //Cria um botao na posicao indicada
    var btn = document.createElement("button")
    document.body.appendChild(btn);
    btn.style.background = "none";
    btn.style.border ="1px dotted";
    btn.style.zIndex="4";
    btn.classList.add(classeBotao)

    this.PosicionarBotaoNaPeca(peca,btn,ressaltarPeca,deslocHoriz)

    return btn;
  }

  PosicionarBotaoNaPeca(peca,btn,ressaltarPeca,deslocHoriz=0){
    btn.disabled = false
    if(ressaltarPeca){btn.style.boxShadow = deslocHoriz + " 0 40px #ffff00"}

    let areaCanvas = this.canvasObj.getBoundingClientRect()
    let areaBody = document.body.getBoundingClientRect()
    let escala = this.escala_canvas

    let centroCanvas_x = areaBody.left + this.l_canvasObj/2
    let centroCanvas_y = areaBody.top + this.a_canvasObj/2
    let x = peca.x
    let y = peca.y
    x = (x-centroCanvas_x)/escala + centroCanvas_x
    y = (y-centroCanvas_y)/escala + centroCanvas_y
    let xPlot = (x + areaCanvas.left - areaBody.left - peca.larg/escala/2 + 8/escala)
    let yPlot = (y + areaCanvas.top - areaBody.top - peca.alt/escala/2 + 8.5/escala)

    btn.style.position = "absolute";
    btn.style.left = xPlot + "px";
    btn.style.top = yPlot + "px";
    btn.style.width = peca.larg/escala + "px";
    btn.style.height = peca.alt/escala + "px";

    //Desabilita o botao caso a peça saia dos limites do canvas
    if( (peca.x - peca.larg/2) < this.limiteEsquerda ||
        (peca.x + peca.larg/2) > this.limiteDireita ||
        (peca.y - peca.alt/2) < this.limiteSuperior ||
        (peca.y + peca.alt/2) > this.limiteInferior ){
          console.log("entrou aqui")
          btn.disabled = true
          btn.style.boxShadow = "none"
        }

  }

  LimparBotoesDasPecas(classeBotao){
    let botoes = document.querySelectorAll(classeBotao)
    botoes.forEach(function(botao) {
      botao.remove();
    });
  }

  CriarBotaoPonta1(){
    let pecaPt1 = this.cadeiaDePecas.arrayPecas[0]
    let deslocHorizPt1 = 0
    if(this.cadeiaDePecas.tamanho<5){
      deslocHorizPt1 = "-20px"
    }
    let btnPt1 = this.CriarBotaoNaPeca(pecaPt1,"BotaoEscolha", true, deslocHorizPt1)
    return btnPt1
  }

  CriarBotaoPonta2(){
    let pecaPt2 = this.cadeiaDePecas.arrayPecas[this.cadeiaDePecas.tamanho-1]
    let deslocHorizPt2 = 0
    if(this.cadeiaDePecas.tamanho<5){
      deslocHorizPt2 = "20px"
    }
    let btnPt2 = this.CriarBotaoNaPeca(pecaPt2,"BotaoEscolha", true, deslocHorizPt2)
    return btnPt2
  }

  AtualizarBotoesDasPontas(){
    let botoes = document.querySelectorAll(".BotaoEscolha")
    if (botoes.length > 0){
      let pecaPt1 = this.cadeiaDePecas.arrayPecas[0]
      let pecaPt2 = this.cadeiaDePecas.arrayPecas[this.cadeiaDePecas.tamanho-1]

      let deslocHorizPt1 = 0
      let deslocHorizPt2 = 0
      if(this.cadeiaDePecas.tamanho<5){
        deslocHorizPt1 = "-20px"
        deslocHorizPt2 = "20px"
      }

      this.PosicionarBotaoNaPeca(pecaPt1,botoes[0],true,deslocHorizPt1)
      this.PosicionarBotaoNaPeca(pecaPt2,botoes[1],true,deslocHorizPt2)
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

    this.minX = this.novaPeca.x - this.novaPeca.larg/2
    this.maxX = this.novaPeca.x + this.novaPeca.larg/2
    this.minY = this.novaPeca.y - this.novaPeca.alt/2
    this.maxY = this.novaPeca.y + this.novaPeca.alt/2
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

  AtualizaPosicaoLimiteCadeia(){
    if(this.tamanho>0){
      let pecaBase = this.arrayPecas[0]
      this.minX = this.arrayPecas[0].x - pecaBase.larg/2
      this.maxX = this.arrayPecas[0].x + pecaBase.larg/2
      this.minY = this.arrayPecas[0].y - pecaBase.alt/2
      this.maxY = this.arrayPecas[0].y + pecaBase.alt/2
      this.arrayPecas.forEach(function(peca){
        if (peca.x + peca.larg/2 > this.maxX) {this.maxX = peca.x + peca.larg/2}
        if (peca.x - peca.larg/2 < this.minX) {this.minX = peca.x - peca.larg/2}
        if (peca.y + peca.alt/2 > this.maxY) {this.maxY = peca.y + peca.alt/2}
        if (peca.y - peca.alt/2 < this.minY) {this.minY = peca.y - peca.alt/2}
      }.bind(this));
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

    if(tabPonta1 == -1) {
    //Caso o tabuleiro esteja vazio
      return 1
    }

    if(uiTabuleiro.cadeiaDePecas.tamanho==1 && tabPonta1==tabPonta2){
    //Caso haja apenas 1 peça no tabuleiro com 2 lados iguais
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

  AdicionaPecaNoTabuleiro(pontaEscolhida,peca){
    let nroPecaRemovida = this.cadeiaDePecas.RemovePeca(peca)
    this.uiTabuleiro.AdicionaPecaNoCanvas(pontaEscolhida,nroPecaRemovida)
    if(this.cadeiaDePecas.tamanho){
      this.Refresh()
    } else {
      this.LimpaCanvas()
      this.DesenhaRetanguloAzul()
    }
  }

  TornarPecasResponsivas(){
    //Adiciona um botao sobre cada peca para que ela seja
    //responsiva ao click do mouse
    for(let i=0; i < this.cadeiaDePecas.tamanho; i++){

      let peca = this.cadeiaDePecas.arrayPecas[i]
      let button = this.CriarBotaoNaPeca(peca, "BotaoNaPeca")

      button.onclick = function(){
        let nroPeca = peca.numero
        let avaliacao = this.AvaliaPecaNoTabuleiro(nroPeca)

        if (avaliacao == 0) {
          return
        } else if (avaliacao == 3) {
          //alert("Falta implementar lógica para quando peça entra nas duas pontas")

          this.LimparBotoesDasPecas(".BotaoNaPeca")
          alert("Escolha uma das pontas para adicionar a peça")

          let botaoPt1 = this.uiTabuleiro.CriarBotaoPonta1()
          let botaoPt2 = this.uiTabuleiro.CriarBotaoPonta2()

          botaoPt1.onclick = function(){
            this.uiTabuleiro.LimparBotoesDasPecas(".BotaoEscolha")
            avaliacao = 1
            //document.body.removeChild(button)
            this.AdicionaPecaNoTabuleiro(avaliacao,peca)
            this.TornarPecasResponsivas()
          }.bind(this)

          botaoPt2.onclick = function(){
            this.uiTabuleiro.LimparBotoesDasPecas(".BotaoEscolha")
            avaliacao = 2
            //document.body.removeChild(button)
            this.AdicionaPecaNoTabuleiro(avaliacao,peca)
            this.TornarPecasResponsivas()
          }.bind(this)

        } else if (avaliacao==1 || avaliacao==2){
          document.body.removeChild(button)
          this.AdicionaPecaNoTabuleiro(avaliacao,peca)
        }
      }.bind(this)

    }

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
      let button = this.CriarBotaoNaPeca(peca, "BotaoNaPecaCompra")

      button.onclick = function(){
        let nroPecaRemovida = this.cadeiaDePecas.RemovePeca(peca)
        this.uiJogador.AdicionaPecaNoCanvas(1,nroPecaRemovida)
        document.body.removeChild(button)
        this.LimparBotoesDasPecas(".BotaoNaPecaCompra")
        this.EscondeCanvas()
      }.bind(this)

    }

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


//Relógio

var seconds = 0;
var minutes = 0;
var hours = 0;

var intervalTime = 1000;

var viewerSeconds = 0;
var viewerMinutes = 0;
var viewerHours = 0;

const starterBtn = document.querySelector("#start");
const stopBtn = document.querySelector("#stop");
const resetBtn = document.querySelector("#reset");
const stopwatchDisplay = document.querySelector("#timer");
const tensBtn = document.querySelector("#tens");

function countUp() {
  seconds++;
  
  if (seconds / 60 === 1) {
    seconds = 0;
    minutes++;
    
    if (minutes / 60 === 1) {
      minutes = 0;
      hours++;
    }
  } 
    
  
   if (seconds < 10) {
    viewerSeconds = "0" + seconds.toString();
  } else {
    viewerSeconds = seconds;
  }
  
  if (minutes < 10) {
    viewerMinutes = "0" + minutes.toString();
  } else {
    viewerMinutes = minutes;
  }
  
  if (hours < 10) {
    viewerHours = "0" + hours.toString();
  } else {
    viewerHours = hours;
  }
  
  
 stopwatchDisplay.innerHTML = viewerHours + ":" + viewerMinutes + ":" + viewerSeconds;
  
}


starterBtn.onclick = () => {
  console.log("start click");
  interval = window.setInterval(countUp, intervalTime);
  starterBtn.innerHTML  = "";
  starterBtn.style.backgroundColor = "#000000";  
}


stopBtn.onclick = () => {
 console.log("stop click"); 
  window.clearInterval(interval);
  starterBtn.innerHTML = "start";
  starterBtn.style.backgroundColor = "#5800FF";
}

resetBtn.onclick = () => {
  console.log("reset click");
  window.clearInterval(interval);
  seconds = 0;
  minutes = 0;
  
  stopwatchDisplay.innerHTML = "00:00";
  
  starterBtn.innerHTML = "start";
  starterBtn.style.backgroundColor = "#5800FF";

}