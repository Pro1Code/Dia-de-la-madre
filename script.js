(function() {
  // =============================================
  // 🔧 VARIABLES DE AJUSTE MANUAL (MODIFICA ESTAS)
  // =============================================
  
  const NUMERO_DE_PARTES = 6;
  
  // 🎯 AJUSTE DE POSICIÓN DEL TEXTO EN LA RULETA
  const AJUSTE_POSICION = {
    distanciaDesdeCentro: 0.60,
    tamanoFuente: 44,
    paddingFondo: 10,
    transparenciaFondo: 0.85
  };
  
  // 🎨 COLORES ESTILO HELLO KITTY
  const COLORES_BASE = [
    "#FFB6C1", "#FFC0CB", "#FFE4E1", "#FF69B4",
    "#FF85C0", "#FFA0C8", "#FFD1DC", "#FFE4F0"
  ];
  
  // =============================================
  // 📝 TEXTOS PERSONALIZABLES PARA CADA NÚMERO
  // =============================================
  const MENSAJES_POR_NUMERO = {
    1: "¡Gaseosa Coca Cola en lata! 💖\nCama de Miguel Ángel.",
    2: "¡Pulseras Coloridas!        🌸\nTina en cuarto de Bruno.",
    3: "¡Anillos Edición Limitada!  ⭐\nLavadora.",
    4: "¡Collar dorado!             🌺\nParlante.",
    5: "???                         🎀\nRopero de Miguel Ángel.",
    6: "¡Arete Premium!             💝\nJuego frío-caliente."
  };
  
  const MENSAJE_POR_DEFECTO = "¡Feliz Día de la Madre! 🎉\nEres la mejor mamá del mundo.";

  // =============================================
  // NO MODIFICAR DE AQUÍ PARA ABAJO
  // =============================================

  function obtenerTextosDesdeHTML() {
    const listaElement = document.getElementById('lista-textos');
    if (!listaElement) return ["1", "2", "3", "4", "5", "6"];
    
    const items = listaElement.querySelectorAll('li');
    const textos = [];
    items.forEach(li => {
      let texto = li.innerText.trim();
      if (texto === '') texto = '?';
      textos.push(texto);
    });
    
    while (textos.length < NUMERO_DE_PARTES) {
      textos.push(`${textos.length + 1}`);
    }
    
    return textos.slice(0, NUMERO_DE_PARTES);
  }

  const TEXTOS_RULETA = obtenerTextosDesdeHTML();

  function obtenerColores(cantidad) {
    const colores = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(COLORES_BASE[i % COLORES_BASE.length]);
    }
    return colores;
  }

  const canvas = document.getElementById('ruletaCanvas');
  const ctx = canvas.getContext('2d');
  const resultadoSpan = document.getElementById('resultadoTexto');
  const girarBtn = document.getElementById('girarBtn');

  let anguloInicial = 0;
  let animacionActiva = false;
  let velocidadActual = 0;
  const decrementoVelocidad = 0.985;
  let frameId = null;
  
  const ANGULO_TOTAL = Math.PI * 2;
  const anguloPorParte = ANGULO_TOTAL / NUMERO_DE_PARTES;

  // =============================================
  //  CREAR VENTANA MODAL FLOTANTE
  // =============================================
  function crearVentanaModal() {
    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modal-ganador');
    if (modalAnterior) modalAnterior.remove();
    
    // Crear overlay (fondo oscuro)
    const overlay = document.createElement('div');
    overlay.id = 'modal-ganador';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(5px);
    `;
    
    // Crear ventana modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: linear-gradient(180deg, #FFF5FA 0%, #FFE4F0 100%);
      border-radius: 30px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 40px rgba(255, 20, 147, 0.4),
                  0 0 0 5px #FFB6C1,
                  0 0 0 10px #FFC0CB;
      animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
    `;
    
    // Contenedor del contenido
    const contenido = document.createElement('div');
    contenido.id = 'modal-contenido';
    modal.appendChild(contenido);
    
    // Botón de cerrar
    const botonCerrar = document.createElement('button');
    botonCerrar.innerHTML = '✕';
    botonCerrar.style.cssText = `
      position: absolute;
      top: 15px;
      right: 20px;
      background: #FF69B4;
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 8px rgba(255, 20, 147, 0.3);
    `;
    botonCerrar.onmouseover = () => {
      botonCerrar.style.background = '#FF1493';
      botonCerrar.style.transform = 'scale(1.1)';
    };
    botonCerrar.onmouseout = () => {
      botonCerrar.style.background = '#FF69B4';
      botonCerrar.style.transform = 'scale(1)';
    };
    botonCerrar.onclick = () => overlay.remove();
    modal.appendChild(botonCerrar);
    
    overlay.appendChild(modal);
    
    // Cerrar al hacer clic fuera del modal
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
    
    document.body.appendChild(overlay);
    
    return contenido;
  }

  // Agregar estilos de animación
  const estilosModal = document.createElement('style');
  estilosModal.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { 
        transform: scale(0.5) translateY(-50px);
        opacity: 0;
      }
      to { 
        transform: scale(1) translateY(0);
        opacity: 1;
      }
    }
    @keyframes bouncePista {
      from { transform: translateY(0); }
      to { transform: translateY(-8px); }
    }
  `;
  document.head.appendChild(estilosModal);

  // =============================================
  //  MOSTRAR VENTANA CON EL RESULTADO
  // =============================================
  function mostrarVentanaGanador(numero) {
    const contenidoModal = crearVentanaModal();
    
    // Título con el número ganador
    const titulo = document.createElement('div');
    titulo.style.cssText = `
      font-size: 2.5rem;
      font-weight: bold;
      color: #FF1493;
      margin-bottom: 10px;
      text-shadow: 2px 2px 0 #FFB6C1;
      animation: bouncePista 0.6s ease infinite alternate;
    `;
    titulo.textContent = `🎀 ${numero} 🎀`;
    contenidoModal.appendChild(titulo);
    
    // Línea separadora decorativa 1
    const separador1 = document.createElement('div');
    separador1.style.cssText = `
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FFB6C1, #FF69B4, #FFB6C1, transparent);
      margin: 10px auto;
      border-radius: 10px;
    `;
    contenidoModal.appendChild(separador1);
    
    // Palabra "Pista" con diseño especial
    const pistaContainer = document.createElement('div');
    pistaContainer.style.cssText = `
      background: linear-gradient(135deg, #FF69B4, #FF1493);
      color: white;
      font-size: 1.8rem;
      font-weight: bold;
      padding: 8px 30px;
      border-radius: 50px;
      display: inline-block;
      margin: 10px auto;
      letter-spacing: 3px;
      box-shadow: 0 8px 15px rgba(255, 20, 147, 0.4);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
      animation: bouncePista 0.8s ease infinite alternate;
      border: 2px solid #FFB6C1;
    `;
    pistaContainer.textContent = '💡 Pista 💡';
    contenidoModal.appendChild(pistaContainer);
    
    // Línea separadora decorativa 2
    const separador2 = document.createElement('div');
    separador2.style.cssText = `
      width: 60%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FFB6C1, #FF69B4, #FFB6C1, transparent);
      margin: 10px auto 15px;
      border-radius: 10px;
    `;
    contenidoModal.appendChild(separador2);
    
    // Obtener el mensaje correspondiente al número
    const numeroInt = parseInt(numero);
    const mensajeCompleto = MENSAJES_POR_NUMERO[numeroInt] || MENSAJE_POR_DEFECTO;
    
    // Dividir el mensaje en líneas
    const lineas = mensajeCompleto.split('\n');
    
    // Crear contenedor para el mensaje
    const mensajeContainer = document.createElement('div');
    mensajeContainer.style.cssText = `
      background: rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      padding: 20px;
      margin: 15px 0;
      border: 2px solid #FFB6C1;
    `;
    
    // Agregar cada línea del mensaje
    lineas.forEach((linea, index) => {
      const parrafo = document.createElement('p');
      parrafo.textContent = linea;
      parrafo.style.cssText = `
        font-size: 1.3rem;
        color: #8B0045;
        margin: 10px 0;
        font-weight: ${index === 0 ? 'bold' : 'normal'};
        line-height: 1.5;
      `;
      mensajeContainer.appendChild(parrafo);
    });
    
    contenidoModal.appendChild(mensajeContainer);
    
    // Botón para cerrar
    const botonAceptar = document.createElement('button');
    botonAceptar.textContent = '🎀 ¡Gracias! 🎀';
    botonAceptar.style.cssText = `
      background: linear-gradient(180deg, #FF69B4 0%, #FF1493 100%);
      color: white;
      border: 3px solid #FFB6C1;
      padding: 12px 30px;
      border-radius: 50px;
      font-size: 1.3rem;
      font-weight: bold;
      cursor: pointer;
      margin-top: 15px;
      transition: all 0.2s;
      box-shadow: 0 8px 15px rgba(255, 20, 147, 0.4);
    `;
    botonAceptar.onmouseover = () => {
      botonAceptar.style.transform = 'scale(1.05)';
      botonAceptar.style.boxShadow = '0 12px 20px rgba(255, 20, 147, 0.6)';
    };
    botonAceptar.onmouseout = () => {
      botonAceptar.style.transform = 'scale(1)';
      botonAceptar.style.boxShadow = '0 8px 15px rgba(255, 20, 147, 0.4)';
    };
    botonAceptar.onclick = () => {
      const modal = document.getElementById('modal-ganador');
      if (modal) modal.remove();
    };
    contenidoModal.appendChild(botonAceptar);
  }

  function dibujarHelloKitty(x, y, tamano) {
    const escala = tamano / 40;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(escala, escala);
    
    // Cara
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Orejas
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#FF69B4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-10, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, -10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Moño
    ctx.fillStyle = "#FF1493";
    ctx.beginPath();
    ctx.ellipse(12, -12, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(12, -12, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Ojos
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(-5, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Nariz
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.ellipse(0, 3, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Bigotes
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-8, 4);
    ctx.lineTo(-16, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 6);
    ctx.lineTo(-16, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 8);
    ctx.lineTo(-16, 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(16, 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 6);
    ctx.lineTo(16, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, 8);
    ctx.lineTo(16, 10);
    ctx.stroke();
    
    ctx.restore();
  }

  function dibujarRuleta(anguloRotacion = anguloInicial) {
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;
    const radio = Math.min(centroX, centroY) * 0.80;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = "#FFF5FA";
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 20, 0, ANGULO_TOTAL);
    ctx.fill();
    
    // Bordes decorativos
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 15, 0, ANGULO_TOTAL);
    ctx.strokeStyle = "#FF1493";
    ctx.lineWidth = 6;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 8, 0, ANGULO_TOTAL);
    ctx.strokeStyle = "#FFB6C1";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio, 0, ANGULO_TOTAL);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    const coloresSegmento = obtenerColores(NUMERO_DE_PARTES);
    
    for (let i = 0; i < NUMERO_DE_PARTES; i++) {
      const anguloInicio = i * anguloPorParte + anguloRotacion;
      const anguloFin = anguloInicio + anguloPorParte;
      
      ctx.beginPath();
      ctx.moveTo(centroX, centroY);
      ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
      ctx.closePath();
      ctx.fillStyle = coloresSegmento[i];
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      const anguloMedio = anguloInicio + anguloPorParte / 2;
      const distancia = radio * AJUSTE_POSICION.distanciaDesdeCentro;
      const xTexto = centroX + Math.cos(anguloMedio) * distancia;
      const yTexto = centroY + Math.sin(anguloMedio) * distancia;
      
      const texto = TEXTOS_RULETA[i] || (i + 1).toString();
      
      ctx.font = `bold ${AJUSTE_POSICION.tamanoFuente}px 'Arial', 'Helvetica', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const medidas = ctx.measureText(texto);
      const anchoTexto = medidas.width;
      const altoTexto = AJUSTE_POSICION.tamanoFuente;
      const padding = AJUSTE_POSICION.paddingFondo;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${AJUSTE_POSICION.transparenciaFondo})`;
      ctx.strokeStyle = "#FF69B4";
      ctx.lineWidth = 2;
      
      const xRect = xTexto - anchoTexto/2 - padding;
      const yRect = yTexto - altoTexto/2 - padding;
      const anchoRect = anchoTexto + padding * 2;
      const altoRect = altoTexto + padding * 2;
      
      ctx.beginPath();
      ctx.roundRect(xRect, yRect, anchoRect, altoRect, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = "#FF1493";
      ctx.fillText(texto, xTexto, yTexto);
    }
    
    // Hello Kitty centro
    dibujarHelloKitty(centroX, centroY, 55);
    
    // Decoración alrededor
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI * 2) / 16;
      const xDeco = centroX + Math.cos(ang) * (radio + 26);
      const yDeco = centroY + Math.sin(ang) * (radio + 26);
      
      ctx.font = '16px "Segoe UI Emoji"';
      ctx.fillStyle = '#FF1493';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      if (i % 2 === 0) {
        ctx.fillText('🎀', xDeco, yDeco);
      } else {
        ctx.fillText('🌸', xDeco, yDeco);
      }
    }
    
    anguloInicial = anguloRotacion;
  }

  function obtenerIndiceGanador(angulo) {
    const anguloFlecha = -Math.PI / 2;
    let anguloRelativo = (anguloFlecha - angulo) % ANGULO_TOTAL;
    if (anguloRelativo < 0) anguloRelativo += ANGULO_TOTAL;
    return Math.floor(anguloRelativo / anguloPorParte) % NUMERO_DE_PARTES;
  }

  function mostrarResultado(indice) {
    if (indice >= 0 && indice < TEXTOS_RULETA.length) {
      const numeroGanador = TEXTOS_RULETA[indice];
      resultadoSpan.textContent = `🎀 ${numeroGanador} 🎀`;
      
      // Mostrar ventana modal con el número ganador
      setTimeout(() => {
        mostrarVentanaGanador(numeroGanador);
      }, 500);
    }
  }

  function animarGiro() {
    if (!animacionActiva) return;
    velocidadActual *= decrementoVelocidad;
    anguloInicial = (anguloInicial + velocidadActual) % ANGULO_TOTAL;
    dibujarRuleta(anguloInicial);
    
    if (Math.abs(velocidadActual) < 0.002) {
      detenerAnimacion();
      const indiceGanador = obtenerIndiceGanador(anguloInicial);
      mostrarResultado(indiceGanador);
      girarBtn.disabled = false;
    } else {
      frameId = requestAnimationFrame(animarGiro);
    }
  }

  function detenerAnimacion() {
    animacionActiva = false;
    if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
    girarBtn.disabled = false;
  }

  function iniciarGiro() {
    if (animacionActiva) detenerAnimacion();
    velocidadActual = 0.55 + Math.random() * 0.9;
    if (Math.random() < 0.5) velocidadActual *= -1;
    animacionActiva = true;
    girarBtn.disabled = true;
    resultadoSpan.textContent = "🎀 Girando... 🎀";
    frameId = requestAnimationFrame(animarGiro);
  }

  // Polyfill roundRect
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + w - r.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      ctx.lineTo(x + w, y + h - r.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
      ctx.lineTo(x + r.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
    };
  }

  function inicializar() {
    dibujarRuleta(anguloInicial);
    mostrarResultado(obtenerIndiceGanador(anguloInicial));
    girarBtn.addEventListener('click', iniciarGiro);
    console.log("🎀 Ruleta Hello Kitty lista!");
    console.log("📝 Mensajes personalizables en MENSAJES_POR_NUMERO");
  }

  inicializar();
  window.addEventListener('resize', () => dibujarRuleta(anguloInicial));

})();