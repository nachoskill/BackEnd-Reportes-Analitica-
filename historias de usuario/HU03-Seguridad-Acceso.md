# Seguridad de Acceso

**Como seguridad**, quiero que el acceso a los reportes sea restringido según roles para proteger la información del sistema.

---

## Criterios de Aceptación

### Criterio 1: Acceso solo a usuarios autorizados
- **Dado que** un usuario intenta acceder al módulo de reportes  
- **Cuando** no tiene un rol asignado con permisos  
- **Entonces** el sistema le muestra un mensaje de “Acceso denegado” y no permite visualizar información sensible

### Criterio 2: Visualización de reportes según rol
- **Dado que** un usuario inicia sesión en el sistema  
- **Cuando** accede al módulo de reportes  
- **Entonces** solo puede visualizar los reportes correspondientes a su rol


---

## Definition of Done
- Control de acceso implementado  
- Visualización restringida por rol   

---

**Política de seguridad / Autorización**
- Control de acceso basado en roles (admin).  
---

**Tamaño:** S  
**Riesgo:** Alto (gestion de roles y cuidado con permisos de usuario) 
