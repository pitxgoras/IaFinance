# Ì∫Ä IA Finance - Plataforma Financiera Inteligente

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Angular](https://img.shields.io/badge/Angular-17-red)
![Node](https://img.shields.io/badge/Node-18-green)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

## Ì≥ã Descripci√≥n
**IA Finance** es una plataforma de gesti√≥n financiera personal que integra **5 m√≥dulos innovadores basados en Inteligencia Artificial** para ayudarte a tomar mejores decisiones con tu dinero.

---

## ÌæØ M√≥dulos Principales

### 1Ô∏è‚É£ **DSE - Decision Simulation Engine**
Simulador financiero que te permite probar decisiones sin riesgo:
- Ì≥à Simular cambios en ingresos/gastos
- Ì≤∞ Proyectar ahorros y deudas
- ‚öñÔ∏è Evaluar niveles de riesgo
- Ì≥ä Visualizar impacto en tiempo real

### 2Ô∏è‚É£ **PFSE - Prescriptive Financial Strategy**
Estrategias personalizadas con IA:
- Ì¥ñ Recomendaciones basadas en tu comportamiento
- Ì≤° Consejos de ahorro e inversi√≥n
- ÌæØ Planes personalizados para pagar deudas

### 3Ô∏è‚É£ **IOIE - Income Opportunity Intelligence**
Descubre nuevas fuentes de ingresos:
- Ì≤º Oportunidades freelance
- Ì≥ö Recomendaciones basadas en tus habilidades
- Ì≥ä Match score con oportunidades reales

### 4Ô∏è‚É£ **EIF - Ecosystem Integration Fabric**
Conecta con servicios externos:
- Ìø¶ Integraci√≥n bancaria
- Ì¥ó APIs de servicios financieros
- Ì≥± Webhooks y sincronizaci√≥n

### 5Ô∏è‚É£ **CFIL - Conversational Financial Layer**
**Roman** - Tu asistente financiero virtual:
- Ì≤¨ Chat interactivo sobre finanzas
- Ì≥ö Educaci√≥n financiera
- Ì≤° Consejos personalizados

---

## Ìª†Ô∏è Tecnolog√≠as Utilizadas

### Frontend
| Tecnolog√≠a | Versi√≥n | Uso |
|------------|---------|-----|
| Angular | 17.3 | Framework principal |
| TypeScript | 5.2 | Lenguaje |
| HTML5/CSS3 | - | Estilos y estructura |
| Font Awesome | 6.4 | Iconos |
| Angular CDK | 17.3 | Drag & drop |

### Backend
| Tecnolog√≠a | Versi√≥n | Uso |
|------------|---------|-----|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Framework API |
| MySQL | 8.0 | Base de datos |
| JWT | - | Autenticaci√≥n |
| Bcrypt | - | Encriptaci√≥n |

---

## Ì≥¶ Instalaci√≥n

### Ì≥ã Requisitos Previos
- Node.js 18+
- MySQL 8.0
- Angular CLI 17 (`npm install -g @angular/cli`)

### Ì¥ß Pasos de Instalaci√≥n

```bash
# 1. Clonar el repositorio
git clone https://github.com/pitxgoras/IaFinance.git
cd IaFinance

# 2. Configurar Backend
cd backend
npm install
cp .env.example .env
# Edita .env con tus credenciales de MySQL

# 3. Configurar Base de Datos
mysql -u root -p < database/schema.sql

# 4. Configurar Frontend
cd ../frontend
npm install

# 5. Iniciar la aplicaci√≥n
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
ng serve --port 4202 --open

