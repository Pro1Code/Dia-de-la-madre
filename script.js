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
    1: "¡Eres la mamá más increíble del mundo! 💖\nGracias por todo tu amor y dedicación.",
    2: "¡Hoy es tu día especial! 🌸\nDisfruta cada momento, te lo mereces.",
    3: "¡Mamá, eres mi estrella favorita! ⭐\nSiempre iluminas mi camino.",
    4: "¡La mejor mamá del universo! 🌺\nTu amor es el regalo más preciado.",
    5: "¡Eres única e irrepetible! 🎀\nNadie cocina y mima como tú.",
    6: "¡Gracias por ser mi mamá! 💝\nEres mi ejemplo a seguir, te amo."
  };
  
  const MENSAJE_POR_DEFECTO = "¡Feliz Día de la Madre! 🎉\nEres la mejor mamá del mundo.";
  
  // Mensaje cuando solo queda un número
  const MENSAJE_GANADOR_FINAL = "🎉 ¡FELICIDADES MAMÁ! 🎉\n\n¡Este es tu regalo especial!\nTe amamos con todo nuestro corazón 💖\n\n¡Eres la mejor mamá del mundo! 🌸";

  // =============================================
  // NO MODIFICAR DE AQUÍ PARA ABAJO
  // =============================================

  // Array para mantener los textos activos
  let textosActivos = [];

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

  // Inicializar textos activos
  function inicializarTextos() {
    textosActivos = obtenerTextosDesdeHTML();
  }

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
  
  function getAnguloTotal() {
    return Math.PI * 2;
  }
  
  function getAnguloPorParte() {
    return getAnguloTotal() / textosActivos.length;
  }

  // =============================================
  //  CREAR VENTANA MODAL FLOTANTE
  // =============================================
  function crearVentanaModal(numero, onClose) {
    // Eliminar modal anterior si existe
    const modalAnterior = document.getElementById('modal-ganador');
    if (modalAnterior) modalAnterior.remove();
    
    // Verificar si es el último número
    const esUltimoNumero = textosActivos.length <= 1;
    
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
    
    // Solo mostrar botón de cerrar si NO es el último número
    if (!esUltimoNumero) {
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
      botonCerrar.onclick = () => {
        overlay.remove();
        if (onClose) onClose();
      };
      modal.appendChild(botonCerrar);
    }
    
    overlay.appendChild(modal);
    
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
    @keyframes celebracion {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(estilosModal);

  // =============================================
  //  MOSTRAR VENTANA CON EL RESULTADO
  // =============================================
  function mostrarVentanaGanador(numero, onClose) {
    const esUltimoNumero = textosActivos.length <= 1;
    const contenidoModal = crearVentanaModal(numero, onClose);
    
    if (esUltimoNumero) {
      // Ventana especial para el ganador final
      const tituloFinal = document.createElement('div');
      tituloFinal.style.cssText = `
        font-size: 3rem;
        font-weight: bold;
        color: #FF1493;
        margin-bottom: 15px;
        text-shadow: 2px 2px 0 #FFB6C1;
        animation: celebracion 1s ease infinite;
      `;
      tituloFinal.textContent = `🎀 ${numero} 🎀`;
      contenidoModal.appendChild(tituloFinal);
      
      const coronita = document.createElement('div');
      coronita.style.cssText = `
        font-size: 4rem;
        margin: 10px 0;
        animation: bouncePista 0.6s ease infinite alternate;
      `;
      coronita.textContent = '👑';
      contenidoModal.appendChild(coronita);
      
      const mensajeFinal = document.createElement('div');
      mensajeFinal.style.cssText = `
        background: rgba(255, 255, 255, 0.9);
        border-radius: 20px;
        padding: 20px;
        margin: 15px 0;
        border: 3px solid #FF69B4;
        font-size: 1.4rem;
        color: #8B0045;
        line-height: 1.8;
        white-space: pre-line;
        font-weight: 500;
      `;
      mensajeFinal.textContent = MENSAJE_GANADOR_FINAL;
      contenidoModal.appendChild(mensajeFinal);
      
      // Botón de reiniciar
      const botonReiniciar = document.createElement('button');
      botonReiniciar.textContent = '🎀 ¡Jugar de nuevo! 🎀';
      botonReiniciar.style.cssText = `
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
      botonReiniciar.onmouseover = () => {
        botonReiniciar.style.transform = 'scale(1.05)';
        botonReiniciar.style.boxShadow = '0 12px 20px rgba(255, 20, 147, 0.6)';
      };
      botonReiniciar.onmouseout = () => {
        botonReiniciar.style.transform = 'scale(1)';
        botonReiniciar.style.boxShadow = '0 8px 15px rgba(255, 20, 147, 0.4)';
      };
      botonReiniciar.onclick = () => {
        const modal = document.getElementById('modal-ganador');
        if (modal) modal.remove();
        reiniciarJuego();
      };
      contenidoModal.appendChild(botonReiniciar);
      
      // Deshabilitar botón de girar
      girarBtn.disabled = true;
      girarBtn.style.opacity = '0.5';
      girarBtn.style.cursor = 'not-allowed';
      resultadoSpan.textContent = `🏆 ¡${numero} GANADOR! 🏆`;
      
    } else {
      // Ventana normal
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
      
      // Contador de números restantes
      const contador = document.createElement('div');
      contador.style.cssText = `
        font-size: 1rem;
        color: #FF69B4;
        margin: 8px 0;
        font-weight: bold;
      `;
      contador.textContent = `🎯 Quedan ${textosActivos.length - 1} números por descubrir`;
      contenidoModal.appendChild(contador);
      
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
      
      // Botón para cerrar y eliminar número
      const botonEliminar = document.createElement('button');
      botonEliminar.textContent = '🎀 ¡Eliminar número! 🎀';
      botonEliminar.style.cssText = `
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
      botonEliminar.onmouseover = () => {
        botonEliminar.style.transform = 'scale(1.05)';
        botonEliminar.style.boxShadow = '0 12px 20px rgba(255, 20, 147, 0.6)';
      };
      botonEliminar.onmouseout = () => {
        botonEliminar.style.transform = 'scale(1)';
        botonEliminar.style.boxShadow = '0 8px 15px rgba(255, 20, 147, 0.4)';
      };
      botonEliminar.onclick = () => {
        const modal = document.getElementById('modal-ganador');
        if (modal) modal.remove();
        if (onClose) onClose();
      };
      contenidoModal.appendChild(botonEliminar);
    }
  }

  // =============================================
  //  ELIMINAR NÚMERO DE LA RULETA
  // =============================================
  function eliminarNumero(numero) {
    const index = textosActivos.indexOf(numero.toString());
    if (index > -1) {
      textosActivos.splice(index, 1);
      console.log(`🗑️ Número ${numero} eliminado. Quedan: ${textosActivos.length} números`);
      
      // Redibujar ruleta con los números restantes
      dibujarRuleta(anguloInicial);
      
      // Actualizar resultado
      if (textosActivos.length > 0) {
        const indiceInicial = obtenerIndiceGanador(anguloInicial);
        if (indiceInicial >= 0 && indiceInicial < textosActivos.length) {
          resultadoSpan.textContent = `🎀 ${textosActivos[indiceInicial]} 🎀`;
        }
      }
      
      // Si solo queda un número, mostrar ventana final automáticamente
      if (textosActivos.length === 1) {
        setTimeout(() => {
          mostrarVentanaGanador(textosActivos[0], null);
        }, 500);
      }
    }
  }

  // =============================================
  //  REINICIAR JUEGO
  // =============================================
  function reiniciarJuego() {
    inicializarTextos();
    anguloInicial = 0;
    velocidadActual = 0;
    animacionActiva = false;
    
    // Reactivar botón
    girarBtn.disabled = false;
    girarBtn.style.opacity = '1';
    girarBtn.style.cursor = 'pointer';
    
    // Redibujar
    dibujarRuleta(anguloInicial);
    resultadoSpan.textContent = `🎀 ${textosActivos[0]} 🎀`;
    
    console.log("🔄 Juego reiniciado!");
    console.log("📝 Números activos:", textosActivos);
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
    const numPartesActual = textosActivos.length;
    
    if (numPartesActual === 0) return;
    
    const anguloPorParteActual = getAnguloTotal() / numPartesActual;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo
    ctx.fillStyle = "#FFF5FA";
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 20, 0, getAnguloTotal());
    ctx.fill();
    
    // Bordes decorativos
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 15, 0, getAnguloTotal());
    ctx.strokeStyle = "#FF1493";
    ctx.lineWidth = 6;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio + 8, 0, getAnguloTotal());
    ctx.strokeStyle = "#FFB6C1";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio, 0, getAnguloTotal());
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    const coloresSegmento = obtenerColores(numPartesActual);
    
    // Dibujar segmentos
    for (let i = 0; i < numPartesActual; i++) {
      const anguloInicio = i * anguloPorParteActual + anguloRotacion;
      const anguloFin = anguloInicio + anguloPorParteActual;
      
      // Sector coloreado
      ctx.beginPath();
      ctx.moveTo(centroX, centroY);
      ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
      ctx.closePath();
      ctx.fillStyle = coloresSegmento[i];
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // TEXTO CENTRADO EN EL SEGMENTO
      const anguloMedio = anguloInicio + anguloPorParteActual / 2;
      const distancia = radio * AJUSTE_POSICION.distanciaDesdeCentro;
      const xTexto = centroX + Math.cos(anguloMedio) * distancia;
      const yTexto = centroY + Math.sin(anguloMedio) * distancia;
      
      const texto = textosActivos[i] || (i + 1).toString();
      
      // Aumentar tamaño de fuente cuando hay menos números
      let tamanoFuente = AJUSTE_POSICION.tamanoFuente;
      if (numPartesActual <= 3) tamanoFuente = 52;
      if (numPartesActual === 2) tamanoFuente = 60;
      if (numPartesActual === 1) tamanoFuente = 70;
      
      ctx.font = `bold ${tamanoFuente}px 'Arial', 'Helvetica', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const medidas = ctx.measureText(texto);
      const anchoTexto = medidas.width;
      const altoTexto = tamanoFuente;
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
    
    // Hello Kitty centro (más pequeña si hay pocos números)
    const tamanoKitty = numPartesActual <= 2 ? 45 : 55;
    dibujarHelloKitty(centroX, centroY, tamanoKitty);
    
    // Decoración alrededor
    const numDecoraciones = numPartesActual <= 2 ? 12 : 16;
    for (let i = 0; i < numDecoraciones; i++) {
      const ang = (i * Math.PI * 2) / numDecoraciones;
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
    if (textosActivos.length === 0) return -1;
    
    const anguloFlecha = -Math.PI / 2;
    const anguloPorParteActual = getAnguloTotal() / textosActivos.length;
    
    let anguloRelativo = (anguloFlecha - angulo) % getAnguloTotal();
    if (anguloRelativo < 0) anguloRelativo += getAnguloTotal();
    
    const indice = Math.floor(anguloRelativo / anguloPorParteActual) % textosActivos.length;
    return indice;
  }

  function mostrarResultado(indice) {
    if (indice >= 0 && indice < textosActivos.length) {
      const numeroGanador = textosActivos[indice];
      resultadoSpan.textContent = `🎀 ${numeroGanador} 🎀`;
      
      // Mostrar ventana modal con el número ganador
      setTimeout(() => {
        mostrarVentanaGanador(numeroGanador, () => {
          eliminarNumero(numeroGanador);
        });
      }, 500);
    }
  }

  function animarGiro() {
    if (!animacionActiva) return;
    velocidadActual *= decrementoVelocidad;
    anguloInicial = (anguloInicial + velocidadActual) % getAnguloTotal();
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
    if (textosActivos.length === 0) return;
    if (animacionActiva) detenerAnimacion();
    
    velocidadActual = 0.55 + Math.random() * 0.9;
    if (Math.random() < 0.5) velocidadActual *= -1;
    
    animacionActiva = true;
    girarBtn.disabled = true;
    resultadoSpan.textContent = "🎀 Girando... 🎀";
    
    // Cerrar modal si existe
    const modalAbierto = document.getElementById('modal-ganador');
    if (modalAbierto) modalAbierto.remove();
    
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
    inicializarTextos();
    dibujarRuleta(anguloInicial);
    const indiceInicial = obtenerIndiceGanador(anguloInicial);
    if (indiceInicial >= 0 && indiceInicial < textosActivos.length) {
      resultadoSpan.textContent = `🎀 ${textosActivos[indiceInicial]} 🎀`;
    }
    girarBtn.addEventListener('click', iniciarGiro);
    console.log("🎀 Ruleta Hello Kitty lista!");
    console.log("📝 Números activos:", textosActivos);
    console.log("💡 Cierra el modal para eliminar el número");
  }

  inicializar();
  window.addEventListener('resize', () => {
    if (textosActivos.length > 0) {
      dibujarRuleta(anguloInicial);
    }
  });

})();
