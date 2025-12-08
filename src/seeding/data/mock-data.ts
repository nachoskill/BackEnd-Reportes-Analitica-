// Generadores de datos ficticios para el seeding
// No usa faker para evitar dependencias adicionales

export class MockDataGenerator {
    // Nombres chilenos comunes
    private static nombres = [
        'Juan', 'María', 'Pedro', 'Ana', 'Carlos', 'Sofía', 'Diego', 'Valentina',
        'Mateo', 'Isabella', 'Sebastián', 'Camila', 'Benjamín', 'Martina', 'Lucas',
        'Florencia', 'Joaquín', 'Emilia', 'Agustín', 'Catalina'
    ];

    private static apellidos = [
        'González', 'Rodríguez', 'Pérez', 'Fernández', 'López', 'Martínez', 'Sánchez',
        'García', 'Muñoz', 'Rojas', 'Díaz', 'Torres', 'Flores', 'Espinoza', 'Silva',
        'Contreras', 'Sepúlveda', 'Valenzuela', 'Castillo', 'Morales'
    ];

    // Regiones de Chile
    static regiones = [
        'Metropolitana', 'Valparaíso', 'Biobío', 'Araucanía', 'Maule',
        'Los Lagos', 'Antofagasta', 'Coquimbo', "O'Higgins", 'Ñuble',
        'Los Ríos', 'Tarapacá', 'Atacama', 'Arica y Parinacota', 'Aysén', 'Magallanes'
    ];

    // Productos típicos
    static productos = [
        'Laptop HP 15"', 'Mouse Logitech', 'Teclado Mecánico', 'Monitor Samsung 24"',
        'Auriculares Sony', 'Webcam Logitech', 'Silla Gamer', 'Escritorio Minimalista',
        'Lámpara LED', 'Mousepad XXL', 'Micrófono USB', 'Soporte Monitor',
        'Cable HDMI', 'Hub USB-C', 'Disco SSD 1TB', 'RAM DDR4 16GB',
        'Tarjeta Gráfica', 'Procesador Intel', 'Placa Madre', 'Fuente Poder',
        'Gabinete RGB', 'Cooler CPU', 'Pasta Térmica', 'Ventilador PC',
        'Adaptador WiFi', 'Switch Ethernet', 'Router WiFi 6', 'Impresora HP',
        'Scanner Epson', 'Tablet Samsung'
    ];

    // Generar ID único
    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generar nombre completo
    static generateNombre(): string {
        const nombre = this.nombres[Math.floor(Math.random() * this.nombres.length)];
        const apellido1 = this.apellidos[Math.floor(Math.random() * this.apellidos.length)];
        const apellido2 = this.apellidos[Math.floor(Math.random() * this.apellidos.length)];
        return `${nombre} ${apellido1} ${apellido2}`;
    }

    // Generar email
    static generateEmail(nombre: string): string {
        const cleanName = nombre.toLowerCase().replace(/\s+/g, '.');
        const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
        const domain = domains[Math.floor(Math.random() * domains.length)];
        return `${cleanName}@${domain}`;
    }

    // Generar fecha aleatoria en un rango
    static randomDate(start: Date, end: Date): Date {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    // Generar número aleatorio en rango
    static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generar precio aleatorio
    static randomPrice(min: number = 10000, max: number = 500000): number {
        return Math.floor(Math.random() * (max - min + 1) / 1000) * 1000; // Redondear a miles
    }

    // Seleccionar elemento aleatorio de array
    static randomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    // Generar producto aleatorio
    static randomProducto(): string {
        return this.randomElement(this.productos);
    }

    // Generar región aleatoria
    static randomRegion(): string {
        return this.randomElement(this.regiones);
    }
}
