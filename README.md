# Ballón dulces Klhoe - Sistema de Facturación y Gestión Comercial

Sistema web integral de facturación, control de inventario y gestión de clientes para **Ballón dulces Klhoe** (*"Detalles que marcan la diferencia en tu fiesta"*).

---

## 🌟 Características Principales

- **Generador de Facturas, Notas de Entrega y Presupuestos**:
  - Formato oficial en **Tamaño Carta Horizontal (Letter Landscape)** ajustado estrictamente a **1 sola página**.
  - Diseño duplicado: **Lado Izquierdo (ORIGINAL)** y **Lado Derecho (COPIA)** con línea punteada central y tijera para corte.
  - Conversión de divisas con **Tasa Oficial BCV** en tiempo real y cálculo de totales en USD ($) y Bolívares (Bs.).
  - Desglose detallado de IVA (16% para Facturas/Presupuestos, 0% para Notas de Entrega).

- **Módulo de Reportes e Historial**:
  - Vista completa de facturas emitidas, pagadas, abonadas y pendientes.
  - Previsualización e **impresión directa en formato carta horizontal** con 1 clic.
  - Exportación de reportes a **Excel (.xlsx)** y sincronización con **Google Sheets**.
  - Búsqueda y filtrado dinámico por fecha, cliente, tipo de documento o estado.

- **Gestión de Inventario y Clientes**:
  - Catálogo de productos con precios en USD y conversión automática a Bs.
  - Directorio de clientes con cédula/RIF, teléfono y dirección.
  - Persistencia de datos segura con **Firebase Firestore**.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS con fuentes especializadas (Cinzel, Great Vibes)
- **Iconografía**: Lucide React
- **Base de Datos**: Firebase Firestore
- **Exportación**: SheetJS (XLSX)

---

## 🚀 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd ballon-dulces-klhoe
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   El sistema se abrirá en `http://localhost:3000` (o el puerto configurado).

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📄 Créditos y Licencia

- **Negocio**: Ballón dulces Klhoe (RIF: V-26136645-0)
- **Desarrollo**: Lcdo. Josmar Puerta
