// ====================================================
// CLOUDSPACE - MOTOR LÓGICO PRINCIPAL
// ====================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ JS CARGADO: Sistema completo CloudSpace.");

    // ====================================================
    // 1. FUNCIONES GLOBALES DE UTILIDAD
    // ====================================================
    const renderIcons = () => { try { if (typeof feather !== 'undefined') feather.replace(); } catch (e) {} };
    renderIcons();

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 MB';
        const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const toggleCargaBoton = (botonId, cargando, textoOriginal) => {
        const btn = document.getElementById(botonId);
        if (!btn) return;
        btn.disabled = cargando;
        btn.innerHTML = cargando ? "<i data-feather='loader' class='icon-small spin'></i>" : textoOriginal;
        renderIcons();
    };

    // Función para cambiar de vistas principales
    const mostrarVista = (vistaId) => {
        ['view-landing', 'view-login', 'view-register', 'view-app', 'view-admin'].forEach(v => {
            const el = document.getElementById(v);
            if (el) el.classList.add('hidden');
        });
        const vistaSeleccionada = document.getElementById(vistaId);
        if (vistaSeleccionada) vistaSeleccionada.classList.remove('hidden');
        renderIcons();
    };

    // ====================================================
    // 2. NAVEGACIÓN Y MENÚS
    // ====================================================
    // Botones de Landing y Formularios
    document.getElementById('btn-landing-login')?.addEventListener('click', () => mostrarVista('view-login'));
    document.getElementById('btn-landing-register')?.addEventListener('click', () => mostrarVista('view-register'));
    document.getElementById('link-to-register')?.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('view-register'); });
    document.getElementById('link-to-login')?.addEventListener('click', (e) => { e.preventDefault(); mostrarVista('view-login'); });
    
    document.getElementById('btn-login-back')?.addEventListener('click', (e) => { 
        e.preventDefault(); document.getElementById('loginForm')?.reset(); mostrarVista('view-landing'); 
    });
    document.getElementById('btn-register-back')?.addEventListener('click', (e) => { 
        e.preventDefault(); document.getElementById('registerForm')?.reset(); mostrarVista('view-landing'); 
    });

    // Pestañas (Tabs) dentro de la app
    document.querySelectorAll('[data-target], [data-admin-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target') || link.getAttribute('data-admin-target');
            const selectorClass = link.hasAttribute('data-admin-target') ? '.admin-section' : '.app-view-section';
            
            document.querySelectorAll(selectorClass).forEach(s => s.classList.add('hidden'));
            const targetElement = document.getElementById(targetId);
            if(targetElement) targetElement.classList.remove('hidden');
            
            const menu = link.closest('.nav-menu');
            if (menu) { 
                menu.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); 
                link.classList.add('active'); 
            }
            
            if (targetId === 'view-inicio') { cargarRecientes(); cargarMiUnidad(); }
            if (targetId === 'admin-inicio') window.cargarDashboardAdmin();
            
            const dropdown = document.getElementById('dropdown-perfil');
            if (dropdown) dropdown.classList.add('hidden');
            renderIcons();
        });
    });

    // ====================================================
    // 3. AUTENTICACIÓN Y PERFIL DE USUARIO
    // ====================================================
    document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('registerEmail').value;
        const pass = document.getElementById('registerPassword').value;
        const passConfirm = document.getElementById('registerPasswordConfirm').value;
        const resRegistro = document.getElementById('resultado-registro');

        if (pass !== passConfirm) {
            resRegistro.innerHTML = '<span class="text-danger">Las contraseñas no coinciden.</span>'; 
            setTimeout(() => resRegistro.innerHTML = '', 4000); 
            return;
        }
        
        const btnSubmit = document.querySelector('#registerForm button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        toggleCargaBoton(btnSubmit.id, true, originalText);

        try {
            const response = await fetch("/api/registro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: correo, password: pass })
            });
            const data = await response.json();

            if (data.status === "success") {
                resRegistro.innerHTML = `<span class="badge-success">${data.mensaje}</span>`;
                setTimeout(() => { document.getElementById('registerForm').reset(); resRegistro.innerHTML = ''; mostrarVista('view-login'); }, 2000);
            } else {
                resRegistro.innerHTML = `<span class="text-danger">${data.mensaje}</span>`;
            }
        } catch (error) {
            resRegistro.innerHTML = '<span class="text-danger">Error conectando al servidor.</span>';
        } finally {
            toggleCargaBoton(btnSubmit.id, false, originalText);
        }
    });

    document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const correo = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        const resLogin = document.getElementById('resultado-login');

        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: correo, password: pass })
            });
            const data = await response.json();

            if (data.status === "success") {
                if (correo === "admin@cloudspace.com") {
                    mostrarVista('view-admin');
                    window.cargarDashboardAdmin(); 
                } else {
                    configurarInterfazUsuario(correo); 
                    refrescarAlmacenamientoGlobal(); 
                    cargarRecientes(); 
                    cargarMiUnidad(); 
                    mostrarVista('view-app');
                }
            } else { 
                if (resLogin) {
                    resLogin.innerText = data.mensaje === "PENDIENTE" ? 'Cuenta pendiente de activación' : 'Credenciales incorrectas';
                    setTimeout(() => resLogin.innerText = '', 4000);
                }
            }
        } catch (error) {
            console.error("Error login:", error);
        }
    });

    const configurarInterfazUsuario = (correo) => {
        let nombre = correo.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const btnAvatar = document.getElementById('btn-avatar-user');
        if (btnAvatar) btnAvatar.innerText = iniciales;
        
        const pAvatar = document.getElementById('perfil-avatar-large');
        if (pAvatar) pAvatar.innerText = iniciales;
        
        const pNombre = document.getElementById('perfil-nombre');
        if (pNombre) pNombre.value = nombre;
        
        const pEmail = document.getElementById('perfil-email');
        if (pEmail) pEmail.value = correo;
    };

    // Avatar y Logout
    document.getElementById('btn-avatar-user')?.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        document.getElementById('dropdown-perfil')?.classList.toggle('hidden'); 
    });
    
    document.addEventListener('click', (e) => { 
        const dropdown = document.getElementById('dropdown-perfil');
        const btnAvatar = document.getElementById('btn-avatar-user');
        if (dropdown && !dropdown.contains(e.target) && !btnAvatar?.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    const cerrarSesion = (e) => {
        e.preventDefault(); e.stopPropagation();
        document.getElementById('dropdown-perfil')?.classList.add('hidden');
        document.getElementById('loginForm')?.reset();
        mostrarVista('view-login');
    };
    
    document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);
    document.getElementById('btn-admin-logout')?.addEventListener('click', cerrarSesion);

    // Cambio de contraseña
    document.getElementById('btn-cambiar-pass')?.addEventListener('click', async () => {
        const actual = document.getElementById('perfil-pass-actual').value;
        const nueva = document.getElementById('perfil-pass-nueva').value;
        const confirmar = document.getElementById('perfil-pass-confirmar').value;
        const resPass = document.getElementById('resultado-pass');

        if (!actual || !nueva || !confirmar) { resPass.innerHTML = '<span class="text-danger">Rellena todos los campos.</span>'; setTimeout(() => resPass.innerHTML = '', 4000); return; }
        if (nueva !== confirmar) { resPass.innerHTML = '<span class="text-danger">Contraseñas nuevas no coinciden.</span>'; setTimeout(() => resPass.innerHTML = '', 4000); return; }
        
        const originalText = document.getElementById('btn-cambiar-pass').innerHTML;
        toggleCargaBoton('btn-cambiar-pass', true, originalText);
        
        try {
            const response = await fetch("/api/usuarios/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actual: actual, nueva: nueva })
            });
            const data = await response.json();
            
            if (data.status === "success") { 
                resPass.innerHTML = `<span class="badge-success" style="padding: 0.5rem 1rem;">${data.mensaje}</span>`; 
                document.getElementById('perfil-pass-actual').value = ''; 
                document.getElementById('perfil-pass-nueva').value = ''; 
                document.getElementById('perfil-pass-confirmar').value = ''; 
            } else { 
                resPass.innerHTML = `<span class="text-danger">${data.mensaje}</span>`; 
            }
        } catch (error) {
            resPass.innerHTML = '<span class="text-danger">Error de conexión.</span>';
        } finally {
            toggleCargaBoton('btn-cambiar-pass', false, originalText);
            setTimeout(() => resPass.innerHTML = '', 4000);
        }
    });

    // ====================================================
    // 4. SISTEMA DE ARCHIVOS (Listado, Subida, Buscador)
    // ====================================================
    window.descargarArchivo = (id) => window.location.href = `/api/archivos/descargar?id=${id}`;
    
    window.manejarClickArchivo = async (archivo) => {
        if (!archivo.nombre.toLowerCase().endsWith('.txt')) {
            window.descargarArchivo(archivo.id);
            return;
        }
        
        try {
            const res = await fetch(`/api/archivos/descargar?id=${archivo.id}`);
            const texto = await res.text();
            
            const inputTitulo = document.getElementById('nota-titulo');
            if (inputTitulo) inputTitulo.value = archivo.nombre;
            
            const editorNota = document.getElementById('nota-contenido');
            if (editorNota) editorNota.innerHTML = texto;
            
            const btnGuardar = document.getElementById('btn-guardar-nota');
            if (btnGuardar) btnGuardar.dataset.editId = archivo.id;
            
            document.getElementById('btn-descargar-nota')?.classList.remove('hidden');
            document.getElementById('modal-nota')?.classList.remove('hidden');
        } catch(e) { 
            alert("Error al leer el archivo de texto."); 
        }
    };

    // Buscador
    document.getElementById('input-search')?.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase().trim();
        const searchResults = document.getElementById('search-results');
        
        if (query.length === 0) { searchResults.classList.add('hidden'); return; }
        
        try {
            const response = await fetch("/api/archivos/listar");
            const archivos = await response.json();
            const filtrados = archivos.filter(f => f.nombre.toLowerCase().includes(query));
            
            if (filtrados.length > 0) {
                searchResults.innerHTML = '';
                filtrados.forEach(f => {
                    const item = document.createElement('button'); 
                    item.className = 'search-result-item';
                    let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'music' : 'file');
                    item.innerHTML = `<i data-feather="${icon}" class="icon-small"></i><div class="search-result-info"><span class="search-result-name">${f.nombre}</span><span class="text-small">${formatBytes(f.tamano || f.size || 0)}</span></div>`;
                    
                    item.onclick = () => { 
                        window.manejarClickArchivo({id: f.id, nombre: f.nombre}); 
                        searchResults.classList.add('hidden'); 
                        document.getElementById('input-search').value = ''; 
                    };
                    searchResults.appendChild(item);
                });
                searchResults.classList.remove('hidden'); 
                renderIcons();
            } else {
                searchResults.innerHTML = '<div class="search-result-item"><span class="text-small">No se encontraron archivos</span></div>'; 
                searchResults.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error buscando archivos", error);
        }
    });

    // Funciones de carga de tablas
    const cargarRecientes = async () => {
        const gridRecientes = document.getElementById('grid-recientes');
        if (!gridRecientes) return;
        
        try {
            const response = await fetch("/api/archivos/listar");
            const archivos = await response.json();
            gridRecientes.innerHTML = '';
            
            if (archivos.length === 0) { 
                gridRecientes.innerHTML = '<p class="text-small text-muted col-span-full">Aún no hay archivos recientes.</p>'; 
                return; 
            }
            
            const ultimos = archivos.slice(0, 4).reverse();
            ultimos.forEach(f => {
                const card = document.createElement('div'); card.className = 'file-card-recent';
                let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'mic' : 'file-text');
                card.innerHTML = `<div class="file-preview"><i data-feather="${icon}"></i></div><div class="file-info-recent"><span class="file-name-recent" title="${f.nombre}">${f.nombre}</span><span class="file-date">${f.fecha || "Hace un momento"}</span></div>`;
                card.onclick = () => window.manejarClickArchivo({id: f.id, nombre: f.nombre});
                gridRecientes.appendChild(card);
            });
            renderIcons();
        } catch(e) { console.error("Error al cargar recientes", e); }
    };

    const cargarMiUnidad = async () => {
        const listaArchivos = document.getElementById('lista-archivos');
        const btnEliminarArchivos = document.getElementById('btn-eliminar-archivos');
        
        if (!listaArchivos) return;
        listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">Cargando unidad...</td></tr>';
        if (btnEliminarArchivos) btnEliminarArchivos.classList.add('hidden');
        
        try {
            const response = await fetch("/api/archivos/listar");
            const archivos = await response.json();
            
            listaArchivos.innerHTML = ''; 
            calcularAlmacenamiento(archivos);
            
            if (archivos.length === 0) { 
                listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">No hay archivos en tu cuenta.</td></tr>'; 
                return; 
            }
            
            archivos.forEach(f => {
                const tr = document.createElement('tr');
                let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'music' : 'file');
                const encName = encodeURIComponent(f.nombre); 
                tr.innerHTML = `<td><input type="checkbox" class="file-check" value="${f.id}"></td><td><div class="file-list-name-container"><div class="file-list-icon"><i data-feather="${icon}"></i></div><span class="file-name" title="${f.nombre}">${f.nombre}</span></div></td><td class="text-muted text-small">${f.fecha || "Hace un momento"}</td><td class="text-muted text-small">${formatBytes(f.tamano || f.size || (2 * 1024 * 1024))}</td><td><button class="btn-icon" onclick="manejarClickArchivo({id: ${f.id}, nombre: decodeURIComponent('${encName}')})" title="Abrir / Descargar"><i data-feather="download" class="text-primary"></i></button></td>`;
                listaArchivos.appendChild(tr);
            });
            
            document.querySelectorAll('.file-check').forEach(chk => { 
                chk.addEventListener('change', () => { 
                    const sel = document.querySelectorAll('.file-check:checked').length; 
                    if(btnEliminarArchivos) btnEliminarArchivos.classList.toggle('hidden', sel === 0); 
                }); 
            });
            renderIcons();
        } catch (error) { console.error("Error al cargar Mi Unidad", error); }
    };

    // Almacenamiento
    const calcularAlmacenamiento = (archivos) => {
        let docs = 0, imgs = 0, otros = 0; 
        const cuota = 150 * 1024 * 1024;
        
        archivos.forEach(f => {
            let b = f.tamano || f.size || (2 * 1024 * 1024); 
            if (f.tipo?.includes('image')) imgs += b;
            else if (f.tipo?.includes('pdf') || f.tipo?.includes('document') || f.tipo?.includes('text') || f.tipo?.includes('msword')) docs += b;
            else otros += b;
        });
        
        const total = docs + imgs + otros;
        const pct = (val) => Math.min((val / cuota) * 100, 100) + '%';
        
        const actualizarTextos = (ids, valor) => ids.forEach(id => { const el = document.getElementById(id); if (el) el.innerText = valor; });
        const actualizarBarras = (ids, valorCSS) => ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.width = valorCSS; });

        actualizarTextos(['text-docs', 'modal-text-docs'], formatBytes(docs));
        actualizarTextos(['text-imgs', 'modal-text-imgs'], formatBytes(imgs));
        actualizarTextos(['text-otros', 'modal-text-otros'], formatBytes(otros));
        actualizarTextos(['text-total-usage', 'modal-text-total-usage', 'sidebar-text-total'], `Total utilizado: ${formatBytes(total)} de 150 MB`);

        actualizarBarras(['bar-docs', 'modal-bar-docs'], pct(docs));
        actualizarBarras(['bar-imgs', 'modal-bar-imgs'], pct(imgs));
        actualizarBarras(['bar-otros', 'modal-bar-otros'], pct(otros));
        actualizarBarras(['sidebar-bar-total'], pct(total));
    };

    const refrescarAlmacenamientoGlobal = async () => {
        const res = await fetch("/api/archivos/listar");
        const archivos = await res.json();
        calcularAlmacenamiento(archivos);
    };

    document.getElementById('widget-almacenamiento')?.addEventListener('click', () => document.getElementById('modal-almacenamiento')?.classList.remove('hidden'));
    document.getElementById('btn-cerrar-almacenamiento')?.addEventListener('click', () => document.getElementById('modal-almacenamiento')?.classList.add('hidden'));

    // Subida de Archivos (FormData Multi-Part)
    const procesarSubidaFinal = async (archivos) => {
        const fd = new FormData(); 
        for (let i = 0; i < archivos.length; i++) fd.append("archivo", archivos[i]);
        
        const resUpload = document.getElementById('resultado-upload');
        if (resUpload) resUpload.innerHTML = "<span class='text-small'>Subiendo archivos...</span>";
        
        try {
            const response = await fetch("/SubirArchivoController", {
                method: "POST",
                body: fd 
            });
            const data = await response.json();
            
            if (resUpload) { 
                resUpload.innerHTML = `<span class="${data.status === 'success' ? 'badge-success' : 'text-danger'}">${data.mensaje}</span>`; 
                setTimeout(() => resUpload.innerHTML = "", 4000); 
            }
            if (data.status === 'success') { 
                refrescarAlmacenamientoGlobal(); 
                cargarRecientes(); 
                cargarMiUnidad();
            }
            renderIcons();
        } catch(error) {
            console.error("Error subiendo archivos", error);
        }
    };

    const vincularSubida = (btnId, inputId) => {
        const btn = document.getElementById(btnId);
        const inp = document.getElementById(inputId);
        if (btn && inp) { 
            btn.addEventListener('click', () => inp.click()); 
            inp.addEventListener('change', (e) => { if (e.target.files.length > 0) procesarSubidaFinal(e.target.files); }); 
        }
    };
    
    vincularSubida('btn-camara', 'input-imagen'); 
    vincularSubida('btn-audio-action', 'input-audio');
    
    document.getElementById('btn-archivo')?.addEventListener('click', () => { 
        const i = document.createElement('input'); 
        i.type = 'file'; i.multiple = true; 
        i.onchange = (e) => { if (e.target.files.length > 0) procesarSubidaFinal(e.target.files); }; 
        i.click(); 
    });

    // Eliminar Archivos
    document.getElementById('btn-eliminar-archivos')?.addEventListener('click', () => {
        const checks = document.querySelectorAll('.file-check:checked');
        const ids = Array.from(checks).map(c => parseInt(c.value));
        
        if (ids.length > 0) {
            document.getElementById('texto-delete-file').innerText = `¿Seguro que deseas eliminar ${ids.length} archivo(s)?`;
            document.getElementById('modal-delete-file').classList.remove('hidden');
            
            document.getElementById('btn-confirm-delete-file').onclick = async () => {
                document.getElementById('modal-delete-file').classList.add('hidden');
                const listaArchivos = document.getElementById('lista-archivos');
                if (listaArchivos) listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">Eliminando...</td></tr>';
                
                await fetch("/api/archivos/eliminar", { 
                    method: "DELETE", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify(ids) 
                });
                cargarMiUnidad(); 
                cargarRecientes();
            };
        }
    });
    document.getElementById('btn-cancel-delete-file')?.addEventListener('click', () => document.getElementById('modal-delete-file').classList.add('hidden'));

    // ====================================================
    // 5. EDITOR DE NOTAS (WYSIWYG)
    // ====================================================
    document.getElementById('btn-nota')?.addEventListener('click', () => { 
        const inputTitulo = document.getElementById('nota-titulo');
        if(inputTitulo) inputTitulo.value = ''; 
        
        const editor = document.getElementById('nota-contenido');
        if(editor) editor.innerHTML = ''; 
        
        const btnGuardar = document.getElementById('btn-guardar-nota');
        if(btnGuardar) delete btnGuardar.dataset.editId; 
        
        document.getElementById('btn-descargar-nota')?.classList.add('hidden'); 
        document.getElementById('modal-nota')?.classList.remove('hidden'); 
    });
    
    document.getElementById('btn-cerrar-nota')?.addEventListener('click', () => document.getElementById('modal-nota')?.classList.add('hidden'));
    
    window.formatearTexto = (comando) => { document.execCommand(comando, false, null); document.getElementById('nota-contenido')?.focus(); };
    window.insertarEnlace = () => { const url = prompt('URL del enlace:'); if(url) document.execCommand('createLink', false, url); document.getElementById('nota-contenido')?.focus(); };
    
    document.getElementById('btn-guardar-nota')?.addEventListener('click', async () => {
        const editorNota = document.getElementById('nota-contenido');
        const contenido = editorNota?.innerHTML.trim(); 
        if (!contenido) return alert("La nota no puede estar vacía.");
        
        const inputTitulo = document.getElementById('nota-titulo');
        let titulo = inputTitulo?.value.trim() || "Nota_Rapida"; 
        if (!titulo.endsWith(".txt")) titulo += ".txt";
        
        const btnGuardar = document.getElementById('btn-guardar-nota');
        const editId = btnGuardar.dataset.editId;
        
        if (editId) {
            const originalText = btnGuardar.innerHTML; 
            toggleCargaBoton(btnGuardar.id, true, originalText);
            
            try {
                const response = await fetch("/api/notas/editar", { 
                    method: "POST", 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify({ id: editId.toString(), titulo: titulo, contenido: contenido }) 
                });
                const data = await response.json();
                
                if(data.status === 'success') { 
                    document.getElementById('modal-nota')?.classList.add('hidden'); 
                    refrescarAlmacenamientoGlobal(); cargarMiUnidad(); cargarRecientes(); 
                } else { 
                    alert(data.mensaje); 
                }
            } catch(e) { console.error("Error guardando nota", e); } 
            finally { toggleCargaBoton(btnGuardar.id, false, originalText); }
            
        } else { 
            const blob = new Blob([contenido], { type: 'text/plain' }); 
            procesarSubidaFinal([new File([blob], titulo, { type: 'text/plain' })]); 
            document.getElementById('modal-nota')?.classList.add('hidden'); 
        }
    });

    document.getElementById('btn-descargar-nota')?.addEventListener('click', () => { 
        const editId = document.getElementById('btn-guardar-nota')?.dataset.editId; 
        if (editId) window.descargarArchivo(editId); 
    });

    // ====================================================
    // 6. ENVÍO DE CORREOS (SMTP MULTIPART)
    // ====================================================
    document.getElementById('btn-nuevo')?.addEventListener('click', () => { 
        const para = document.getElementById('email-para'); if(para) para.value = ''; 
        const asunto = document.getElementById('email-asunto'); if(asunto) asunto.value = ''; 
        const contenido = document.getElementById('email-contenido'); if(contenido) contenido.innerHTML = ''; 
        
        const adjuntoLocal = document.getElementById('email-adjunto-local'); if(adjuntoLocal) adjuntoLocal.value = '';
        
        const labelAdjunto = document.getElementById('email-adjunto-name');
        if(labelAdjunto) { labelAdjunto.innerText = ''; labelAdjunto.classList.add('hidden'); }
        
        document.getElementById('modal-email')?.classList.remove('hidden'); 
    });
    
    document.getElementById('btn-cerrar-email')?.addEventListener('click', () => document.getElementById('modal-email')?.classList.add('hidden'));
    window.formatearCorreo = (comando) => { document.execCommand(comando, false, null); document.getElementById('email-contenido')?.focus(); };

    document.getElementById('btn-attach-local')?.addEventListener('click', () => document.getElementById('email-adjunto-local')?.click());
    
    document.getElementById('email-adjunto-local')?.addEventListener('change', (e) => {
        const labelAdjunto = document.getElementById('email-adjunto-name');
        if(e.target.files.length > 0) {
            labelAdjunto.innerText = e.target.files[0].name;
            labelAdjunto.classList.remove('hidden');
        } else {
            labelAdjunto.classList.add('hidden');
        }
    });

    document.getElementById('btn-enviar-email')?.addEventListener('click', async () => {
        const p = document.getElementById('email-para')?.value.trim();
        const a = document.getElementById('email-asunto')?.value.trim(); 
        if (!p || !a) return alert("Rellena destinatario y asunto.");

        const fd = new FormData();
        fd.append("para", p);
        fd.append("asunto", a);
        
        const editorEmail = document.getElementById('email-contenido');
        fd.append("cuerpo", editorEmail?.innerHTML || '');
        
        const inputAdjunto = document.getElementById('email-adjunto-local');
        if (inputAdjunto && inputAdjunto.files.length > 0) {
            fd.append("adjunto", inputAdjunto.files[0]);
        }

        const btnEnviar = document.getElementById('btn-enviar-email');
        const originalText = btnEnviar.innerHTML; 
        toggleCargaBoton(btnEnviar.id, true, originalText);

        try {
            const response = await fetch("/api/email/enviar", { 
                method: "POST", 
                body: fd // FormData no lleva cabeceras JSON
            });
            const data = await response.json();
            
            alert(data.mensaje); 
            if (data.status === 'success') document.getElementById('modal-email')?.classList.add('hidden'); 
        } catch (error) {
            alert("Error conectando con el servidor de correo.");
        } finally { 
            toggleCargaBoton(btnEnviar.id, false, originalText); 
        }
    });

    // ====================================================
    // 7. PANEL DE ADMINISTRADOR
    // ====================================================
    window.cargarDashboardAdmin = async () => {
        try {
            const resArchivos = await fetch("/api/archivos/listar");
            const archivos = await resArchivos.json();
            let totalBytes = 0; 
            archivos.forEach(f => totalBytes += (f.tamano || f.size || (2 * 1024 * 1024)));
            
            const LIMIT_BYTES = 600 * 1024 * 1024; 
            const txtGlobal = document.getElementById('admin-metric-storage');
            const barGlobal = document.getElementById('admin-bar-storage');
            
            if (txtGlobal) txtGlobal.innerText = `${formatBytes(totalBytes)} / 600 MB`;
            if (barGlobal) barGlobal.style.width = Math.min((totalBytes / LIMIT_BYTES) * 100, 100) + '%';

            const resUsuarios = await fetch("/api/admin/usuarios");
            const usuarios = await resUsuarios.json();
            
            const tbody = document.getElementById('lista-usuarios-admin');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            let activos = 0, pendientes = 0;

            usuarios.forEach(u => {
                let estado = u.estado || 'Pendiente';
                if (estado === 'Activo') activos++; else pendientes++;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="admin-user-check" value="${u.correo}"></td>
                    <td>${u.correo}</td>
                    <td><span class="badge ${estado === 'Activo' ? 'badge-success' : 'badge-pending'}">${estado}</span></td>
                    <td>0 MB</td>
                    <td>
                        <div class="action-group-small">
                            ${estado === 'Pendiente' ? `<button class="btn-icon text-success btn-aprobar-single" data-correo="${u.correo}" title="Aprobar Usuario"><i data-feather="check-circle"></i></button>` : '<div style="width:1.75rem;"></div>'}
                            <button class="btn-icon text-danger btn-borrar-single" data-correo="${u.correo}" title="Eliminar Usuario"><i data-feather="trash-2"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            const metricActivos = document.getElementById('admin-metric-activos');
            if(metricActivos) metricActivos.innerText = activos;
            
            const metricPendientes = document.getElementById('admin-metric-pendientes');
            if(metricPendientes) metricPendientes.innerText = pendientes;
            
            // Lógica de checks y botones de admin
            const chkAll = document.getElementById('admin-check-all');
            const checks = document.querySelectorAll('.admin-user-check');
            const btnAprobar = document.getElementById('btn-admin-aprobar');
            const btnEliminar = document.getElementById('btn-admin-eliminar');

            const actualizarBotonesAdmin = () => {
                const seleccionados = document.querySelectorAll('.admin-user-check:checked');
                let mostrarAprobar = false;
                seleccionados.forEach(chk => {
                    const row = chk.closest('tr');
                    if(row && row.innerHTML.includes('Pendiente')) mostrarAprobar = true;
                });
                if(btnAprobar) btnAprobar.classList.toggle('hidden', !mostrarAprobar);
                if(btnEliminar) btnEliminar.classList.toggle('hidden', seleccionados.length === 0);
            };

            if (chkAll) {
                chkAll.addEventListener('change', (e) => { 
                    checks.forEach(c => c.checked = e.target.checked); 
                    actualizarBotonesAdmin(); 
                });
            }
            checks.forEach(c => c.addEventListener('change', actualizarBotonesAdmin));

            const ejecutarAccionUsuarios = async (metodo, correosArray) => {
                await fetch("/api/admin/usuarios/acciones", {
                    method: metodo, 
                    headers: { "Content-Type": "application/json" }, 
                    body: JSON.stringify(correosArray)
                });
                if(chkAll) chkAll.checked = false; 
                window.cargarDashboardAdmin();
            };

            if (btnAprobar) {
                btnAprobar.onclick = () => {
                    const correos = Array.from(document.querySelectorAll('.admin-user-check:checked')).map(c => c.value);
                    ejecutarAccionUsuarios("PUT", correos);
                };
            }
            
            document.querySelectorAll('.btn-aprobar-single').forEach(btn => {
                btn.onclick = () => ejecutarAccionUsuarios("PUT", [btn.getAttribute('data-correo')]);
            });

            const prepararEliminacion = (correos) => {
                const modalDelete = document.getElementById('modal-delete');
                const textoModal = modalDelete.querySelector('.text-small');
                textoModal.innerText = `¿Seguro que deseas eliminar ${correos.length === 1 ? 'este usuario' : 'estos ' + correos.length + ' usuarios'}? Se borrarán sus datos permanentemente.`;
                modalDelete.classList.remove('hidden');
                
                document.getElementById('btn-cancel-delete').onclick = () => modalDelete.classList.add('hidden');
                document.getElementById('btn-confirm-delete').onclick = () => {
                    modalDelete.classList.add('hidden'); 
                    ejecutarAccionUsuarios("DELETE", correos);
                };
            };

            if (btnEliminar) {
                btnEliminar.onclick = () => {
                    const correos = Array.from(document.querySelectorAll('.admin-user-check:checked')).map(c => c.value);
                    prepararEliminacion(correos);
                };
            }
            document.querySelectorAll('.btn-borrar-single').forEach(btn => {
                btn.onclick = () => prepararEliminacion([btn.getAttribute('data-correo')]);
            });

            renderIcons();
        } catch (error) {
            console.error("Error cargando panel de admin", error);
        }
    };
});