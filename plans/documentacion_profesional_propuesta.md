# Propuesta Profesional de Documentación - ZooCache

## Análisis de Mejores Prácticas

He estudiado las documentaciónes de referencia en la industria:
- **FastAPI**: Landing page con "友好" → "Features" → "Tutorial" → "Reference"
- **Pydantic**: Getting Started → Concepts → Performance → API
- **Django**: Tutorial → Topics → Ref → How-to
- **SQLAlchemy**: Orientation → Tutorial → Core → Dialects

### Patrones Comunes:

1. **Landing page minimalista** con demo visual de 10 segundos
2. **Tutorial en 5 minutos** que muestra el valor principal
3. **"I'm in a hurry"** → código copy-paste para empezar
4. **Navegación obvia**: What → How → Reference
5. **Search prominente**
6. **Version selector**

---

## Propuesta de Índice Profesional

```
zoocache.readthedocs.io/

├── 🌟 Home (Landing)
│   ├── Hero con demo visual
│   ├── ¿Qué problema resuelve? (en 2 líneas)
│   ├── Código "copia-y-pega" para empezar YA
│   ├── "Why ZooCache?" vs alternatives
│   └── Navigation clara
│
├── 🚀 Getting Started (Tutorial - 5 min)
│   ├── Instalación
│   ├── Configuración básica
│   ├── Tu primera función cacheada
│   ├── Invalidación básica
│   └── Siguiente: Elige tu camino
│
├── 📖 Tutorials (Aprendizaje profundo)
│   ├── 01-caching-functions-basics/
│   ├── 02-semantic-invalidation/
│   ├── 03-distributed-cache/
│   ├── 04-fastapi-integration/
│   ├── 05-django-integration/
│   └── 06-cli-usage/
│
├── 🔌 Integrations (Guías por framework)
│   ├── FastAPI/
│   │   ├── Quick Start
│   │   ├── Response Caching
│   │   ├── Dependency Injection
│   │   └── Advanced
│   ├── Django/
│   │   ├── Quick Start
│   │   ├── Model Caching
│   │   ├── Serializer Caching
│   │   └── Signals
│   └── Litestar/
│
├── ⚙️ Configuration (Referencia de config)
│   ├── Installation Extras
│   ├── Storage Backends/
│   │   ├── In-Memory
│   │   ├── Redis
│   │   └── LMDB
│   ├── Bus & Distributed
│   ├── Serialization
│   └── Telemetry/
│
├── 💡 Concepts (Explicaciones)
│   ├── Why Semantic Invalidation?
│   ├── PrefixTrie Deep Dive
│   ├── Causal Consistency (HLC)
│   ├── SingleFlight Pattern
│   └── Architecture Overview
│
├── 🛠️ How-to Guides (Recetas)
│   ├── Cache Database Queries
│   ├── Invalidate by Pattern
│   ├── Set TTL
│   ├── Monitor with Prometheus
│   ├── Handle Cache Misses
│   └── Configure Multiple Namespaces
│
└── 📚 Reference (API completa)
    ├── Python API/
    │   ├── zoocache.configure()
    │   ├── @cacheable
    │   ├── invalidate()
    │   ├── add_deps()
    │   └── ...
    ├── CLI Reference
    ├── Configuration Options
    ├── Error Codes
    └── Changelog
```

---

## Estructura del README.md Propuesto

```markdown
# ZooCache 🚀

[Logo con tagline]

## TL;DR (para los impacientes)
```python
uv add zoocache

from zoocache import cacheable, invalidate

@cacheable(deps=lambda uid: [f"user:{uid}"])
def get_user(uid):
    return db.fetch(uid)  # Se ejecuta 1 vez

get_user(1)  # DB
get_user(1)  # Cache - instantáneo

invalidate("user:1")  # invalidate todo lo relacionado con user:1
```

## Por qué ZooCache?

| Feature | ZooCache | Redis | Dogpile |
|---------|----------|-------|---------|
| Invalidación semántica | ✅ Trie | ❌ | ❌ |
| Consistencia causal | ✅ HLC | ❌ | ❌ |
| Anti-avalanche | ✅ Native | ❌ | ✅ |
| Rust-powered | ✅ | ❌ | ❌ |

[Demo visual / Benchmarks]

## Instalación

```bash
uv add zoocache
# o
pip install zoocache
```

## Quick Start

[5 ejemplos progresivos, cada uno construye sobre el anterior]

### 1. Caching básico
[...]

### 2. Invalidación
[...]

### 3. Dependencias jerárquicas
[...]

### 4. Con tu framework favorito
[...]

### 5. Distribuido
[...]

## ¿Necesitas ayuda?

- 📖 [Documentación completa](docs/)
- 💬 [Discord Community]
- 🐛 [Issue Tracker]

## ¿Quién usa ZooCache?

[Logos de empresas]
```

---

## Estructura del Landing (docs/index.md) Propuesto

```markdown
# ZooCache 🐾

[Hero section con animación]

## El problema

[Explicación visual: TTL causa stale data]

## La solución

[Demo de código: invalidación instantánea]

## ¿Qué es ZooCache?

Librería de caching de alto rendimiento con núcleo en Rust, diseñada para aplicaciones donde la consistencia de datos y el rendimiento de lectura son críticos.

### Características clave

- 🧠 **Invalidación Semántica**: Invalida grupos de datos relacionados con una sola llamada
- ⚡ **Rendimiento Rust**: Latencia ultra-baja y concurrencia segura
- 🛡️ **Consistencia Causal**: HLC asegura consistencia en sistemas distribuidos
- 🚫 **Anti-Avalanche**: Protege tu DB de spikes de tráfico

## Empieza en 30 segundos

```python
from zoocache import cacheable, invalidate

@cacheable(deps=lambda uid: [f"user:{uid}"])
def get_user(uid):
    return db.fetch(uid)
```

[Botón: Empezar Tutorial →]

## Elige tu camino

```{card}
**Soy nuevo en ZooCache**

Empieza con el tutorial de iniciación
→ [Getting Started](setup.md)
```

```{card}
**Uso FastAPI**

Integración lista para usar con FastAPI
→ [FastAPI Guide](fastapi.md)
```

```{card}
**Uso Django**

Caching transparente para Django ORM
→ [Django Guide](django.md)
```

```{card}
**Quiero entender los conceptos**

Arquitectura y decisiones de diseño
→ [Concepts](concepts.md)
```

## Comparativa

[Tabla de features vs otras libs]

## Código abierto

[GitHub stars, contributors, etc.]
```

---

## Estructura del Quick Start (docs/setup.md) Propuesto

```markdown
# 🚀 Primeros Pasos

## Instalación

```bash
uv add zoocache
# o
pip install zoocache
```

## Configuración

⚠️ **Importante**: ZooCache debe configurarse antes de usarse.

```python
from zoocache import configure

# Básico: modo en memoria
configure()

# Con Redis: almacenamiento persistente
configure(storage_url="redis://localhost: Tu6379")

# Completo: almacenamiento + bus distribuido
configure(
    storage_url="redis://localhost:6379",
    bus_url="redis://localhost:6379",
    prefix="myapp",  # Namespace
    default_ttl=3600,  # 1 hora
)
```

### Opciones de storage

| Storage | Uso | Persistencia |
|---------|-----|--------------|
| Memory | Dev, testing | ❌ |
| Redis | Producción | ✅ |
| LMDB | Alto rendimiento local | ✅ |

[→ Ver más opciones de storage](configuration/storage.md)

---

## Tu primera función cacheada

```python
from zoocache import cacheable, invalidate
import time

@cacheable(deps=lambda uid: [f"user:{uid}"])
def get_user(uid):
    print(f"📥Fetching user {uid} from DB...")
    time.sleep(0.1)  # Simula DB call
    return {"id": uid, "name": f"User {uid}"}

# Primera llamada - ejecuta la función
user = get_user(1)
# 📥Fetching user 1 from DB...

# Segunda llamada - devuelve cache
user = get_user(1)
# (instantáneo, sin print)

print(f"✅ User cached: {user}")
```

---

## Invalidación

### Invalidación básica

```python
# Cuando los datos cambian, invalida la cache
def update_user(uid, data):
    db.save(uid, data)
    invalidate(f"user:{uid}")  # Invalida TODA la cache relacionada con user:1
```

### Invalidación jerárquica

```python
# Estructura de dependencias
@cacheable(deps=lambda pid: [f"product:{pid}"])
def get_product(pid):
    return db.get_product(pid)

@cacheable(deps=lambda pid: [f"product:{pid}:reviews"])
def get_reviews(pid):
    return db.get_reviews(pid)

# Invalida producto Y sus reviews
invalidate("product:42")

# Invalida solo reviews
invalidate("product:42:reviews")
```

[→ Profundizar en invalidación semántica](concepts.md)

---

## Siguiente paso: Elige tu camino

````{card}
```{grid-item-card} 🔌 FastAPI
:link: fastapi.md
Caching para endpoints FastAPI con `@cache_endpoint`
```
````

````{card}
```{grid-item-card} 🌐 Django
:link: django.md
Integración transparente con Django ORM
```
````

````{card}
```{grid-item-card} ⚙️ Configuración
:link: configuration/index.md
Personaliza storage, TTL, serialización
```
````

````{card}
```{grid-item-card} 🧠 Conceptos
:link: concepts.md
Entiende cómo funciona internamente
```
````
```

---

## Docs Integrations Propuestas (ejemplo FastAPI)

```markdown
# FastAPI Integration

## ¿Por qué usar ZooCache con FastAPI?

- ✅ caching de respuestas automático
- ✅ Serialización Pydantic transparente
- ✅ Anti-avalanche nativo
- ✅ Invalidación semántica
- ✅ Consistencia distribuida

## Instalación

```bash
uv add "zoocache[fastapi]"
```

## Uso básico

```python
from fastapi import FastAPI
from zoocache.contrib.fastapi import cache_endpoint

app = FastAPI()

@app.get("/users/{user_id}")
@cache_endpoint(deps=lambda user_id: [f"user:{user_id}"])
async def get_user(user_id: int):
    # Tu lógica aquí
    return await db.get_user(user_id)
```

## Ejemplo completo

[Ejecutable con FastAPI, dependencias, invalidación]

## Configuración avanzada

[Opciones de cache_endpoint]

## Dependencias con FastAPI

[Cómo usar Depends()]

## Casos de uso comunes

- [ ] Caching de queries a BD
- [ ] Caching de respuestas externas
- [ ] Invalidación basada en eventos
```

---

## Resumen de Archivos a Crear/Modificar

### README.md
- [ ] Nuevo diseño con TL;DR
- [ ] Quick Start de 5 ejemplos progresivos
- [ ] Tabla comparativa

### docs/index.md (Landing)
- [ ] Hero con demo
- [ ] Selector de camino claro
- [ ]快速 start copy-paste

### docs/setup.md
- [ ] Agregar configure() al inicio
- [ ] Storage options table
- [ ] Ejemplos progresivos
- [ ] "Elige tu camino" al final

### docs/tutorials/
- [ ] 01-caching-basics.md
- [ ] 02-invalidation.md
- [ ] 03-distributed.md
- [ ] 04-frameworks/

### docs/fastapi.md
- [ ] Por qué usar (beneficios)
- [ ] Ejemplo completo ejecutable
- [ ] Casos de uso comunes

### docs/django.md
- [ ] Expandir con ejemplos completos
- [ ] Más detail en signals
- [ ] Casos de uso

### docs/reference/api.md
- [ ] Docstrings completos en código O
- [ ] Generación automática con mkdocstrings

### mkdocs.yml
- [ ] Nueva estructura de navegación
- [ ] Mejores plugins
- [ ] Versioning

---

## Métricas de Éxito

- [ ] Usuario nuevo puede usar la lib en < 3 minutos
- [ ] 80% de usuarios encuentran lo que buscan en < 3 clicks
- [ ] Zero enlaces rotos
- [ ] API reference 100% documentada
- [ ] Cada feature tiene ejemplo ejecutable
- [ ] Search retorna resultados relevantes
