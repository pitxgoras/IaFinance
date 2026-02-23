import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ← IMPORTAR

@Component({
  selector: 'app-cfil',
  templateUrl: './cfil.component.html',
  styleUrls: ['./cfil.component.css']
})
export class CfilComponent implements OnInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  
  userInitial = 'U';
  userName = 'Usuario';
  userEmail = '';
  userMessage = '';
  isTyping = false;
  
  // Historial de mensajes
  messages: Array<{
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
  }> = [];

  // Temas sugeridos
  suggestedTopics = [
    { name: 'Inversiones', icon: '📈', question: '¿Cómo empezar a invertir?' },
    { name: 'Ahorro', icon: '💰', question: 'Consejos para ahorrar dinero' },
    { name: 'Deudas', icon: '💳', question: 'Cómo pagar mis deudas rápido' },
    { name: 'Presupuesto', icon: '📊', question: 'Cómo hacer un presupuesto mensual' },
    { name: 'Jubilación', icon: '👴', question: 'Planificación para la jubilación' },
    { name: 'Educación Financiera', icon: '📚', question: 'Educación financiera básica' },
    { name: 'Criptomonedas', icon: '₿', question: 'Invertir en criptomonedas' },
    { name: 'Bienes Raíces', icon: '🏠', question: 'Invertir en bienes raíces' },
    { name: 'Fondo de Emergencia', icon: '🚨', question: 'Qué es un fondo de emergencia' },
    { name: 'Impuestos', icon: '🧾', question: 'Cómo pagar menos impuestos' }
  ];

  // Preguntas rápidas para el sidebar
  quickQuestions = [
    { text: '📈 ¿Cómo empezar a invertir?', question: '¿Cómo empezar a invertir?' },
    { text: '💰 Consejos de ahorro', question: 'Consejos para ahorrar dinero' },
    { text: '🚨 Fondo de emergencia', question: '¿Qué es un fondo de emergencia?' },
    { text: '💳 Pagar deudas', question: 'Cómo pagar mis deudas rápido' },
    { text: '📊 Presupuesto mensual', question: 'Cómo hacer un presupuesto mensual' },
    { text: '👴 Planificar jubilación', question: 'Planificación para la jubilación' },
    { text: '₿ Invertir en crypto', question: 'Invertir en criptomonedas' },
    { text: '🏠 Bienes raíces', question: 'Invertir en bienes raíces' },
    { text: '🧾 Reducir impuestos', question: 'Cómo pagar menos impuestos' },
    { text: '📚 Educación financiera', question: 'Educación financiera básica' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService // ← AGREGAR
  ) {}

  ngOnInit() {
    // Obtener datos del usuario real
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        // Usar el método getUserFullName que ya existe en AuthService
        this.userName = this.authService.getUserFullName(user);
        this.userEmail = user.email || '';
        this.userInitial = this.authService.getUserInitial 
          ? this.authService.getUserInitial(user) 
          : (user.first_name ? user.first_name.charAt(0).toUpperCase() : 
             user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U');
      }
    });
    
    this.addBotMessage(this.getWelcomeMessage());
  }

  // ===== MENSAJE DE BIENVENIDA MEJORADO =====
  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    let saludo = '';
    
    if (hour < 12) saludo = '¡Buenos días';
    else if (hour < 18) saludo = '¡Buenas tardes';
    else saludo = '¡Buenas noches';
    
    return `${saludo}! Soy ${this.getRandomName()}, tu asesor financiero personal. 🤖

Estoy aquí para ayudarte con:

✅ **Inversiones**: Acciones, fondos, ETFs, criptomonedas
✅ **Ahorro**: Técnicas de ahorro, fondos de emergencia
✅ **Deudas**: Estrategias de pago, consolidación
✅ **Presupuestos**: Regla 50/30/20, control de gastos
✅ **Jubilación**: Planes de retiro, pensiones
✅ **Educación financiera**: Conceptos básicos y avanzados

¿En qué tema financiero te gustaría que te ayude hoy?`;
  }

  getRandomName(): string {
    const names = ['Roman', 'Finanzas Pro', 'Asesor Financiero', 'Tu Experto'];
    return names[Math.floor(Math.random() * names.length)];
  }

  // ===== ENVIAR MENSAJE =====
  sendMessage() {
    if (!this.userMessage.trim()) return;

    const message = this.userMessage;
    this.addUserMessage(message);
    this.userMessage = '';
    this.isTyping = true;

    setTimeout(() => {
      this.isTyping = false;
      const response = this.generateResponse(message);
      this.addBotMessage(response);
    }, 1500);
  }

  // ===== GENERADOR DE RESPUESTAS MEJORADO =====
  generateResponse(message: string): string {
    const lowerMsg = message.toLowerCase();

    // SALUDOS
    if (this.matchesAny(lowerMsg, ['hola', 'buenos', 'buenas', 'hey', 'saludos'])) {
      return this.getRandomGreeting();
    }

    // DESPEDIDAS
    if (this.matchesAny(lowerMsg, ['adiós', 'adios', 'chao', 'bye', 'hasta luego', 'nos vemos'])) {
      return this.getRandomFarewell();
    }

    // AGRADECIMIENTOS
    if (this.matchesAny(lowerMsg, ['gracias', 'thank', 'thanks', 'agradecido'])) {
      return this.getRandomThanks();
    }

    // PREGUNTAS SOBRE EL ASISTENTE
    if (this.matchesAny(lowerMsg, ['quién eres', 'que eres', 'como te llamas', 'tu nombre'])) {
      return this.getRandomAboutMe();
    }

    // ===== TEMAS PRINCIPALES =====

    // INVERSIONES
    if (this.matchesAny(lowerMsg, ['invertir', 'inversión', 'acciones', 'bolsa', 'etf', 'fondo'])) {
      return this.getInvestmentResponse(lowerMsg);
    }

    // AHORRO
    if (this.matchesAny(lowerMsg, ['ahorrar', 'ahorro', 'guardar dinero', 'fondo de emergencia'])) {
      return this.getSavingResponse(lowerMsg);
    }

    // DEUDAS
    if (this.matchesAny(lowerMsg, ['deuda', 'préstamo', 'credito', 'tarjeta', 'prestamo'])) {
      return this.getDebtResponse(lowerMsg);
    }

    // PRESUPUESTO
    if (this.matchesAny(lowerMsg, ['presupuesto', 'gastos', 'ingresos', 'mensual', 'regla 50/30/20'])) {
      return this.getBudgetResponse(lowerMsg);
    }

    // JUBILACIÓN
    if (this.matchesAny(lowerMsg, ['jubilación', 'retiro', 'pensión', 'afp', 'jubilacion'])) {
      return this.getRetirementResponse(lowerMsg);
    }

    // EDUCACIÓN FINANCIERA
    if (this.matchesAny(lowerMsg, ['educación', 'aprender', 'curso', 'libro', 'conocimiento'])) {
      return this.getEducationResponse(lowerMsg);
    }

    // CRIPTOMONEDAS
    if (this.matchesAny(lowerMsg, ['cripto', 'bitcoin', 'ethereum', 'crypto', 'btc', 'eth'])) {
      return this.getCryptoResponse(lowerMsg);
    }

    // BIENES RAÍCES
    if (this.matchesAny(lowerMsg, ['bienes', 'raíces', 'inmuebles', 'propiedad', 'casa', 'departamento'])) {
      return this.getRealEstateResponse(lowerMsg);
    }

    // IMPUESTOS
    if (this.matchesAny(lowerMsg, ['impuesto', 'renta', 'declaración', 'sunat', 'sii', 'sat'])) {
      return this.getTaxResponse(lowerMsg);
    }

    // RESPUESTA POR DEFECTO
    return this.getRandomDefaultResponse();
  }

  // ===== FUNCIÓN AUXILIAR PARA MATCH =====
  matchesAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  // ===== SALUDOS ALEATORIOS =====
  getRandomGreeting(): string {
    const greetings = [
      '¡Hola! ¿En qué puedo ayudarte hoy?',
      '¡Qué gusto verte! ¿Tienes alguna duda financiera?',
      '¡Hola! Estoy aquí para responder todas tus preguntas sobre finanzas.',
      '¡Bienvenido! Cuéntame, ¿qué tema financiero te interesa hoy?',
      '¡Hola! Recuerda que la educación financiera es la clave del éxito. ¿En qué te ayudo?'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // ===== DESPEDIDAS ALEATORIAS =====
  getRandomFarewell(): string {
    const farewells = [
      '¡Hasta luego! Recuerda ahorrar e invertir para tu futuro. 😊',
      '¡Nos vemos! Si tienes más dudas, aquí estaré.',
      '¡Adiós! Que tengas un excelente día financiero.',
      '¡Chao! No olvides la regla 50/30/20 para tus finanzas.',
      '¡Hasta pronto! Sigue aprendiendo sobre finanzas, es la mejor inversión.'
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  // ===== AGRADECIMIENTOS =====
  getRandomThanks(): string {
    const thanks = [
      '¡De nada! Para eso estoy. 😊',
      '¡Un placer ayudarte! ¿Necesitas algo más?',
      '¡Me alegra ser de ayuda! Recuerda que la educación financiera es continua.',
      '¡Gracias a ti por confiar en mí! ¿Alguna otra pregunta?',
      '¡Siempre a la orden! No dudes en consultarme cuando quieras.'
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }

  // ===== SOBRE MÍ =====
  getRandomAboutMe(): string {
    const about = [
      'Soy Roman, tu asistente financiero personal. Estoy aquí para ayudarte con inversiones, ahorro, deudas, presupuestos y más.',
      'Me llamo Roman y soy un asesor financiero virtual. Mi misión es ayudarte a tomar mejores decisiones con tu dinero.',
      'Soy Roman, tu experto en finanzas. Puedo responder preguntas sobre ahorro, inversión, jubilación y educación financiera.',
      'Roman, para servirte. Especialista en finanzas personales y educación financiera. ¿En qué te ayudo hoy?'
    ];
    return about[Math.floor(Math.random() * about.length)];
  }

  // ===== RESPUESTAS DE INVERSIÓN =====
  getInvestmentResponse(msg: string): string {
    const responses = [
      `**Para empezar a invertir, sigue estos pasos:** 📈

1️⃣ **Define tu perfil de riesgo**: Conservador, moderado o agresivo
2️⃣ **Establece objetivos**: ¿Corto, mediano o largo plazo?
3️⃣ **Elige instrumentos**: Acciones, bonos, ETFs, fondos mutuos
4️⃣ **Diversifica**: No pongas todos los huevos en la misma canasta
5️⃣ **Comienza con montos pequeños**: Puedes empezar desde S/100

**Recomendación para principiantes:** ETFs o fondos indexados que siguen al mercado (S&P 500, por ejemplo).

¿Quieres que te explique algún tipo de inversión en particular?`,
      
      `**Tipos de inversiones según tu perfil:** 🔍

🔹 **Conservador**: Bonos del gobierno, depósitos a plazo, fondos de renta fija
🔹 **Moderado**: ETFs, fondos balanceados, acciones de empresas estables
🔹 **Agresivo**: Acciones de crecimiento, criptomonedas, bienes raíces

**Dato importante:** El interés compuesto es tu mejor aliado. Invertir S/500 mensuales durante 30 años puede convertirse en más de S/1,000,000.`,
      
      `**¿Acciones, ETFs o fondos mutuos?** 🤔

📊 **Acciones**: Compras partes de una empresa. Alto riesgo, alto retorno.
📈 **ETFs**: Canasta de acciones que sigue a un índice. Riesgo moderado.
📁 **Fondos mutuos**: Administrados por expertos. Diversificación automática.

**Para principiantes, recomiendo ETFs** por su bajo costo y diversificación.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE AHORRO =====
  getSavingResponse(msg: string): string {
    const responses = [
      `**Regla 50/30/20 para ahorrar efectivamente:** 💰

✅ **50% Necesidades**: Vivienda, comida, servicios, transporte
✅ **30% Deseos**: Entretenimiento, viajes, compras no esenciales
✅ **20% Ahorro e Inversión**: Fondo de emergencia + inversiones

**Consejo:** Automatiza tus ahorros. Programa una transferencia automática el día que recibes tu sueldo.`,
      
      `**Técnicas de ahorro comprobadas:** 🔥

1️⃣ **Método de los sobres**: Distribuye tu efectivo en sobres por categoría
2️⃣ **Ahorro invisible**: Redondea tus compras y ahorra la diferencia
3️⃣ **Desafío de las 52 semanas**: Ahorra S/1 la primera semana, S/2 la segunda...
4️⃣ **Regla de las 24 horas**: Espera 24 horas antes de compras impulsivas

**Resultado:** Puedes ahorrar hasta un 30% más con estas técnicas.`,
      
      `**Fondo de emergencia: tu salvavidas financiero** 🚨

❓ **¿Qué es?** Dinero guardado para imprevistos (pérdida de empleo, emergencia médica, reparaciones)

💰 **¿Cuánto ahorrar?** 3 a 6 meses de tus gastos mensuales

🏦 **¿Dónde guardarlo?** En una cuenta separada, de fácil acceso pero que no uses para gastos diarios

**Ejemplo:** Si gastas S/2,000 al mes, necesitas entre S/6,000 y S/12,000 de fondo de emergencia.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE DEUDAS =====
  getDebtResponse(msg: string): string {
    const responses = [
      `**Métodos para pagar deudas:** 🎯

⚡ **Método Bola de Nieve**: Paga las deudas más pequeñas primero (ganas motivación)
🔥 **Método Avalancha**: Paga las deudas con mayor interés primero (ahorras más dinero)

**Recomendación:** Usa Bola de Nieve si necesitas motivación, Avalancha si quieres optimizar intereses.`,
      
      `**Estrategias para salir de deudas:** 📉

1️⃣ **Consolidación**: Une todas tus deudas en un solo préstamo con menor interés
2️⃣ **Negociación**: Llama a tus acreedores y pide mejores condiciones
3️⃣ **Transferencia de saldo**: Traslada deudas a tarjetas con 0% interés
4️⃣ **Paga más del mínimo**: Aunque sea S/20 extra, acelera el pago

**Importante:** Mientras pagas, no acumules nuevas deudas.`,
      
      `**¿Tarjeta de crédito: aliada o enemiga?** 💳

**Enemiga si:** Pagas solo el mínimo, haces compras impulsivas, usas más del 30% de tu línea

**Aliada si:** Pagas el total cada mes, usas los beneficios (puntos, millas), aprovechas promociones

**Consejo de oro:** Usa tu tarjeta como si fuera débito. Si no tienes el efectivo, no lo compres.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE PRESUPUESTO =====
  getBudgetResponse(msg: string): string {
    const responses = [
      `**Cómo hacer un presupuesto mensual en 5 pasos:** 📊

1️⃣ **Registra tus ingresos**: Sueldo, freelance, rentas
2️⃣ **Lista tus gastos fijos**: Alquiler, servicios, deudas
3️⃣ **Identifica gastos variables**: Comida, transporte, ocio
4️⃣ **Aplica la regla 50/30/20**
5️⃣ **Revisa y ajusta** cada mes

**Herramientas:** Puedes usar Excel, Google Sheets o apps como Fintonic.`,
      
      `**Gastos hormiga: el enemigo invisible** 🐜

¿Sabías que pequeños gastos diarios pueden sumar S/500 al mes?

☕ Café diario: S/8 x 30 = S/240
🥤 Gaseosa en la calle: S/3 x 20 = S/60
🍟 Snacks: S/5 x 15 = S/75
🚕 Taxis innecesarios: S/10 x 12 = S/120

**Total: S/495 mensuales = S/5,940 al año!**`,
      
      `**Aplicaciones para controlar tus gastos:** 📱

✅ **Fintonic**: Análisis automático de gastos
✅ **Money Manager**: Control manual de ingresos/gastos
✅ **Wallet**: Presupuestos por categorías
✅ **YNAB**: Método "You Need A Budget" (inglés)

**Recomendación:** Prueba varias y quédate con la que más se adapte a ti.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE JUBILACIÓN =====
  getRetirementResponse(msg: string): string {
    const responses = [
      `**Planifica tu jubilación desde hoy:** 👴

⏰ **Empieza ahora**: El interés compuesto es mágico
💰 **Aporta voluntariamente**: A tu AFP o fondo de pensiones
📈 **Invierte a largo plazo**: Acciones, ETFs, bienes raíces

**Ejemplo:** Si empiezas a los 25 años con S/200 mensuales, a los 65 tendrías S/500,000 (con 8% anual).`,
      
      `**Sistema de pensiones en Perú:** 🇵🇪

**AFP**: Administradoras de Fondos de Pensiones (obligatorio)
**APV**: Ahorro Previsional Voluntario (aporte extra)
**PPK**: Por mis hijos (iniciativa del gobierno)

**Recomendación:** Haz aportes voluntarios a tu AFP (APV) para aumentar tu pensión.`,
      
      `**Calcula tu pensión futura:** 🧮

Fórmula simple: (Ahorro total) x (tasa de retiro seguro) = Pensión anual

**Ejemplo:** Si tienes S/300,000 ahorrados y retiras 4% anual:
S/300,000 x 0.04 = S/12,000 al año = S/1,000 al mes

**Objetivo recomendado:** Tener 25 veces tus gastos anuales ahorrados.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE EDUCACIÓN FINANCIERA =====
  getEducationResponse(msg: string): string {
    const responses = [
      `**Libros esenciales de finanzas personales:** 📚

1️⃣ "Padre Rico, Padre Pobre" - Robert Kiyosaki
2️⃣ "El hombre más rico de Babilonia" - George Clason
3️⃣ "Tu dinero o tu vida" - Vicki Robin
4️⃣ "Inversión a largo plazo" - Benjamin Graham
5️⃣ "La psicología del dinero" - Morgan Housel

**Bonus:** Todos disponibles en español.`,
      
      `**Canales de YouTube recomendados:** 🎥

📺 **Educación Financiera**: Conceptos básicos
📺 **Finanzas para todos**: Inversiones para principiantes
📺 **Valor Agregado**: Análisis económico
📺 **Gurus Blog**: Finanzas personales en Perú

**Tip:** Dedica 30 minutos diarios a aprender sobre finanzas.`,
      
      `**Conceptos financieros básicos:** 🧠

💰 **Interés compuesto**: Interés sobre interés (tu dinero crece exponencialmente)
📈 **Diversificación**: No invertir todo en un solo lugar
🛡️ **Fondo de emergencia**: 3-6 meses de gastos
💳 **Tasa de interés**: Costo del dinero (lo que pagas por pedir prestado)
🏦 **Inflación**: Pérdida de poder adquisitivo`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE CRIPTOMONEDAS =====
  getCryptoResponse(msg: string): string {
    const responses = [
      `**Criptomonedas para principiantes:** ₿

🔹 **Bitcoin (BTC)**: La primera y más conocida
🔹 **Ethereum (ETH)**: Plataforma para aplicaciones descentralizadas
🔹 **Stablecoins**: USDT, USDC (atadas al dólar, menos volatilidad)

**Riesgo:** Las criptomonedas son extremadamente volátiles. Invierte solo lo que estés dispuesto a perder.`,
      
      `**Cómo empezar en criptomonedas:** 🚀

1️⃣ **Elige un exchange**: Binance, Coinbase, Buenbit, Bitso
2️⃣ **Verifica tu identidad**: KYC obligatorio
3️⃣ **Deposita fondos**: Puedes comprar con tarjeta o transferencia
4️⃣ **Compra tu primera crypto**: Empieza con montos pequeños
5️⃣ **Guárdalas seguras**: Usa una wallet (Trust Wallet, Metamask)

**Recomendación:** 70% Bitcoin, 30% Ethereum para empezar.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE BIENES RAÍCES =====
  getRealEstateResponse(msg: string): string {
    const responses = [
      `**Invertir en bienes raíces sin ser millonario:** 🏠

✅ **Fondos de inversión inmobiliaria (FIBRAs)**: Compras "pedazos" de propiedades
✅ **Crowdfunding inmobiliario**: Inviertes junto con otros en proyectos
✅ **Airbnb**: Alquila una habitación o propiedad
✅ **Compra para alquilar**: Busca propiedades que se paguen solas`,
      
      `**Ventajas de invertir en inmuebles:** 🏢

📈 **Valorización**: Las propiedades tienden a aumentar de valor
💰 **Renta pasiva**: Ingresos mensuales por alquiler
🛡️ **Seguridad**: Activo tangible (a diferencia de acciones)
📊 **Apalancamiento**: Puedes comprar con préstamo bancario`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS DE IMPUESTOS =====
  getTaxResponse(msg: string): string {
    const responses = [
      `**Consejos para pagar menos impuestos (legalmente):** 🧾

✅ **Aporta a tu AFP**: Deducible de impuestos
✅ **Gastos médicos**: Guarda tus facturas (deducibles)
✅ **Donaciones**: A organizaciones reconocidas
✅ **Educación**: Cursos y capacitaciones relacionados a tu trabajo

**Importante:** Consulta con un contador para tu caso específico.`,
      
      `**Declaración de impuestos para principiantes:** 📋

1️⃣ **Junta todos tus comprobantes**: Facturas, recibos
2️⃣ **Calcula tus ingresos anuales**: Sueldo + freelance + rentas
3️⃣ **Identifica gastos deducibles**: Salud, educación, donaciones
4️⃣ **Usa la plataforma de SUNAT**: Declara en línea
5️⃣ **Paga antes de la fecha límite**: Evita multas`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== RESPUESTAS POR DEFECTO =====
  getRandomDefaultResponse(): string {
    const responses = [
      `Entiendo tu pregunta. ¿Podrías ser más específico sobre el tema financiero que te interesa? Puedo ayudarte con:

🔹 **Inversiones** (acciones, ETFs, criptomonedas)
🔹 **Ahorro** (técnicas, fondo de emergencia)
🔹 **Deudas** (cómo pagarlas rápido)
🔹 **Presupuestos** (regla 50/30/20)
🔹 **Jubilación** (planificación, AFP)
🔹 **Educación financiera** (conceptos básicos)

¿Sobre cuál de estos temas te gustaría profundizar?`,
      
      `No estoy seguro de haber entendido. ¿Podrías reformular tu pregunta? Recuerda que soy especialista en:

📈 Inversiones
💰 Ahorro
💳 Deudas
📊 Presupuestos
👴 Jubilación
📚 Educación financiera`,
      
      `Para poder ayudarte mejor, necesito que me cuentes más específicamente qué necesitas. ¿Es sobre inversiones, ahorro, deudas, presupuestos o jubilación?`,
      
      `¡Claro! Pero necesito un poco más de detalle. ¿Podrías darme más información sobre tu situación financiera o la duda específica que tienes?`,
      
      `Recuerda que mi especialidad son las finanzas personales. Si tu pregunta es sobre otro tema, puedo intentar ayudarte o redirigirte. ¿Qué necesitas saber exactamente?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ===== MÉTODOS AUXILIARES =====
  addUserMessage(text: string) {
    this.messages.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  addBotMessage(text: string) {
    this.messages.push({
      sender: 'bot',
      text: text,
      timestamp: new Date()
    });
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  quickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  clearChat() {
    this.messages = [];
    this.addBotMessage(this.getWelcomeMessage());
  }

  getTimeString(date: Date): string {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}