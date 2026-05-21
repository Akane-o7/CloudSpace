// ====================================================
// CLOUDSPACE - MOTOR LÓGICO PRINCIPAL
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ JS CARGADO: Sistema completo CloudSpace.");

    const renderIcons = () => { try { if (typeof feather !== 'undefined') feather.replace(); } catch (e) {} };
    renderIcons();

    // SELECTORES GLOBALES
    const viewLanding = document.getElementById('view-landing');
    const viewRegister = document.getElementById('view-register');
    const viewLogin = document.getElementById('view-login');
    const viewApp = document.getElementById('view-app');
    const viewAdmin = document.getElementById('view-admin');
    
    const btnLandingLogin = document.getElementById('btn-landing-login');
    const btnLandingRegister = document.getElementById('btn-landing-register');
    const linkToRegister = document.getElementById('link-to-register');
    const linkToLogin = document.getElementById('link-to-login');
    const btnLoginBack = document.getElementById('btn-login-back');
    const btnRegisterBack = document.getElementById('btn-register-back');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resLogin = document.getElementById('resultado-login');
    const resRegistro = document.getElementById('resultado-registro');

    const listaArchivos = document.getElementById('lista-archivos');
    const gridRecientes = document.getElementById('grid-recientes');
    const resUpload = document.getElementById('resultado-upload');

    const inputSearch = document.getElementById('input-search');
    const searchResults = document.getElementById('search-results');
    const btnAvatarUser = document.getElementById('btn-avatar-user');
    const dropdownPerfil = document.getElementById('dropdown-perfil');
    const btnLogout = document.getElementById('btn-logout');

    const btnArchivo = document.getElementById('btn-archivo');
    const btnNota = document.getElementById('btn-nota');
    const btnCamara = document.getElementById('btn-camara');
    const btnAudioAction = document.getElementById('btn-audio-action');
    const btnNuevo = document.getElementById('btn-nuevo');

    const modalDeleteFile = document.getElementById('modal-delete-file');
    const btnConfirmDeleteFile = document.getElementById('btn-confirm-delete-file');
    const btnCancelDeleteFile = document.getElementById('btn-cancel-delete-file');
    const textoDeleteFile = document.getElementById('texto-delete-file');
    const btnEliminarArchivos = document.getElementById('btn-eliminar-archivos');

    const modalNota = document.getElementById('modal-nota');
    const editorNota = document.getElementById('nota-contenido');
    const inputTituloNota = document.getElementById('nota-titulo');
    const btnCerrarNota = document.getElementById('btn-cerrar-nota');
    const btnGuardarNota = document.getElementById('btn-guardar-nota');
    const btnDescargarNota = document.getElementById('btn-descargar-nota'); 

    const modalEmail = document.getElementById('modal-email');
    const editorEmail = document.getElementById('email-contenido');
    const btnCerrarEmail = document.getElementById('btn-cerrar-email');
    const btnEnviarEmail = document.getElementById('btn-enviar-email');

    const btnCambiarPass = document.getElementById('btn-cambiar-pass');
    const passActual = document.getElementById('perfil-pass-actual');
    const passNueva = document.getElementById('perfil-pass-nueva');
    const passConfirmar = document.getElementById('perfil-pass-confirmar');
    const resPass = document.getElementById('resultado-pass');

    const inputImagen = document.getElementById('input-imagen');
    const inputAudio = document.getElementById('input-audio');

    const widgetAlmacenamiento = document.getElementById('widget-almacenamiento');
    const modalAlmacenamiento = document.getElementById('modal-almacenamiento');
    const btnCerrarAlmacenamiento = document.getElementById('btn-cerrar-almacenamiento');

    // NAVEGACIÓN AUTH
    if (btnLandingLogin) btnLandingLogin.onclick = () => { viewLanding.classList.add('hidden'); viewLogin.classList.remove('hidden'); };
    if (btnLandingRegister) btnLandingRegister.onclick = () => { viewLanding.classList.add('hidden'); viewRegister.classList.remove('hidden'); };
    if (linkToRegister) linkToRegister.onclick = (e) => { e.preventDefault(); viewLogin.classList.add('hidden'); viewRegister.classList.remove('hidden'); };
    if (linkToLogin) linkToLogin.onclick = (e) => { e.preventDefault(); viewRegister.classList.add('hidden'); viewLogin.classList.remove('hidden'); };
    if (btnLoginBack) btnLoginBack.onclick = (e) => { e.preventDefault(); if(resLogin) resLogin.innerText = ''; loginForm.reset(); viewLogin.classList.add('hidden'); viewLanding.classList.remove('hidden'); };
    if (btnRegisterBack) btnRegisterBack.onclick = (e) => { e.preventDefault(); if(resRegistro) resRegistro.innerText = ''; registerForm.reset(); viewRegister.classList.add('hidden'); viewLanding.classList.remove('hidden'); };

    // LECTURA DE ARCHIVOS
    window.descargarArchivo = (id) => window.location.href = `/api/archivos/descargar?id=${id}`;
    window.manejarClickArchivo = (archivo) => {
        if (archivo.nombre.toLowerCase().endsWith('.txt')) {
            fetch(`/api/archivos/descargar?id=${archivo.id}`)
                .then(res => res.text())
                .then(texto => {
                    if(inputTituloNota) inputTituloNota.value = archivo.nombre;
                    if(editorNota) editorNota.innerHTML = texto;
                    if(btnGuardarNota) btnGuardarNota.dataset.editId = archivo.id;
                    if(btnDescargarNota) btnDescargarNota.classList.remove('hidden');
                    if(modalNota) modalNota.classList.remove('hidden');
                }).catch(() => alert("Error al leer el archivo de texto."));
        } else { descargarArchivo(archivo.id); }
    };

    // BÚSQUEDA
    if (inputSearch && searchResults) {
        inputSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length === 0) { searchResults.classList.add('hidden'); return; }
            fetch("/api/archivos/listar").then(res => res.json()).then(archivos => {
                const filtrados = archivos.filter(f => f.nombre.toLowerCase().includes(query));
                if (filtrados.length > 0) {
                    searchResults.innerHTML = '';
                    filtrados.forEach(f => {
                        const item = document.createElement('button'); item.className = 'search-result-item';
                        let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'music' : 'file');
                        item.innerHTML = `<i data-feather="${icon}" class="icon-small"></i><div class="search-result-info"><span class="search-result-name">${f.nombre}</span><span class="text-small">${formatBytes(f.tamano || f.size || 0)}</span></div>`;
                        item.onclick = () => { manejarClickArchivo({id: f.id, nombre: f.nombre}); searchResults.classList.add('hidden'); inputSearch.value = ''; };
                        searchResults.appendChild(item);
                    });
                    searchResults.classList.remove('hidden'); renderIcons();
                } else {
                    searchResults.innerHTML = '<div class="search-result-item"><span class="text-small">No se encontraron archivos</span></div>'; searchResults.classList.remove('hidden');
                }
            });
        });
        document.addEventListener('click', (e) => { if (!searchResults.contains(e.target) && e.target !== inputSearch) searchResults.classList.add('hidden'); });
    }

    // REGISTRO
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const correo = document.getElementById('registerEmail').value;
            const pass = document.getElementById('registerPassword').value;
            const passConfirm = document.getElementById('registerPasswordConfirm').value;
            if (pass !== passConfirm) {
                resRegistro.innerHTML = '<span class="text-danger">Las contraseñas no coinciden.</span>'; setTimeout(() => resRegistro.innerHTML = '', 4000); return;
            }
            const btnSubmit = registerForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML; btnSubmit.innerHTML = "<i data-feather='loader' class='icon-small spin'></i>"; btnSubmit.disabled = true; renderIcons();
            fetch("/api/registro", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correo: correo, password: pass }) })
            .then(res => res.json()).then(data => {
                if(data.status === "success") {
                    resRegistro.innerHTML = `<span class="badge-success">${data.mensaje}</span>`;
                    setTimeout(() => { registerForm.reset(); resRegistro.innerHTML = ''; viewRegister.classList.add('hidden'); viewLogin.classList.remove('hidden'); }, 2000);
                } else { resRegistro.innerHTML = `<span class="text-danger">${data.mensaje}</span>`; }
            }).catch(() => resRegistro.innerHTML = '<span class="text-danger">Error conectando al servidor.</span>').finally(() => { btnSubmit.innerHTML = originalText; btnSubmit.disabled = false; renderIcons(); });
        });
    }

    // LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            const correo = document.getElementById('loginEmail').value;
            const pass = document.getElementById('loginPassword').value;
            fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correo, password: pass }) })
            .then(res => res.json()).then(data => {
                if(data.status === "success") {
                    viewLogin.classList.add('hidden');
                    if (correo === "admin@cloudspace.com") {
                        viewAdmin.classList.remove('hidden');
                        cargarDashboardAdmin(); // <--- ESTO ES LO QUE ARRANCA EL PANEL ADMIN
                    } else {
                        configurarInterfazUsuario(correo); refrescarAlmacenamientoGlobal(); cargarRecientes(); cargarMiUnidad(); viewApp.classList.remove('hidden');
                    }
                    renderIcons();
                } else { 
                    if(resLogin) {
                        if (data.mensaje === "PENDIENTE") { resLogin.innerText = 'Cuenta pendiente de activación'; } else { resLogin.innerText = 'Credenciales incorrectas'; }
                        setTimeout(() => resLogin.innerText = '', 4000);
                    }
                }
            }).catch(err => console.error("Error login:", err));
        });
    }

    function configurarInterfazUsuario(correo) {
        let nombre = correo.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        let iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        if (btnAvatarUser) btnAvatarUser.innerText = iniciales;
        const pAvatar = document.getElementById('perfil-avatar-large'); if (pAvatar) pAvatar.innerText = iniciales;
        const pNombre = document.getElementById('perfil-nombre'); if (pNombre) pNombre.value = nombre;
        const pEmail = document.getElementById('perfil-email'); if (pEmail) pEmail.value = correo;
    }

    if (btnAvatarUser && dropdownPerfil) {
        btnAvatarUser.onclick = (e) => { e.stopPropagation(); dropdownPerfil.classList.toggle('hidden'); };
        document.addEventListener('click', (e) => { if (!dropdownPerfil.contains(e.target) && !btnAvatarUser.contains(e.target)) dropdownPerfil.classList.add('hidden'); });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            if (dropdownPerfil) dropdownPerfil.classList.add('hidden');
            if (viewApp) viewApp.classList.add('hidden');
            if (viewAdmin) viewAdmin.classList.add('hidden');
            if (viewLogin) viewLogin.classList.remove('hidden'); 
            if (loginForm) loginForm.reset();
        });
    }

    if (btnCambiarPass) {
        btnCambiarPass.onclick = () => {
            const actual = passActual.value, nueva = passNueva.value, confirmar = passConfirmar.value;
            if (!actual || !nueva || !confirmar) { resPass.innerHTML = '<span class="text-danger">Rellena todos los campos.</span>'; setTimeout(() => resPass.innerHTML = '', 4000); return; }
            if (nueva !== confirmar) { resPass.innerHTML = '<span class="text-danger">Contraseñas nuevas no coinciden.</span>'; setTimeout(() => resPass.innerHTML = '', 4000); return; }
            const originalText = btnCambiarPass.innerHTML; btnCambiarPass.innerHTML = "<i data-feather='loader' class='icon-small spin'></i> <span class='ml-small'>Actualizando...</span>"; btnCambiarPass.disabled = true; renderIcons();
            fetch("/api/usuarios/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actual: actual, nueva: nueva }) })
            .then(res => res.json()).then(data => {
                if(data.status === "success") { resPass.innerHTML = `<span class="badge-success" style="padding: 0.5rem 1rem;">${data.mensaje}</span>`; passActual.value = ''; passNueva.value = ''; passConfirmar.value = ''; } 
                else { resPass.innerHTML = `<span class="text-danger">${data.mensaje}</span>`; }
            }).catch(() => resPass.innerHTML = '<span class="text-danger">Error de conexión.</span>').finally(() => { btnCambiarPass.innerHTML = originalText; btnCambiarPass.disabled = false; renderIcons(); setTimeout(() => resPass.innerHTML = '', 4000); });
        };
    }

    // NAVEGACIÓN INTERNA
    document.querySelectorAll('[data-target], [data-admin-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target') || link.getAttribute('data-admin-target');
            const sectionClass = link.hasAttribute('data-admin-target') ? '.admin-section' : '.app-view-section';
            document.querySelectorAll(sectionClass).forEach(s => s.classList.add('hidden'));
            const targetElement = document.getElementById(targetId); if(targetElement) targetElement.classList.remove('hidden');
            const menu = link.closest('.nav-menu');
            if(menu) { menu.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); link.classList.add('active'); }
            if (targetId === 'view-inicio') { cargarRecientes(); cargarMiUnidad(); }
            if (targetId === 'admin-inicio') cargarDashboardAdmin();
            if (dropdownPerfil) dropdownPerfil.classList.add('hidden');
            renderIcons();
        });
    });

    function cargarRecientes() {
        if (!gridRecientes) return;
        fetch("/api/archivos/listar").then(res => res.json()).then(archivos => {
            gridRecientes.innerHTML = '';
            if (archivos.length === 0) { gridRecientes.innerHTML = '<p class="text-small text-muted col-span-full">Aún no hay archivos recientes.</p>'; return; }
            const ultimos = archivos.slice(0, 4).reverse();
            ultimos.forEach(f => {
                const card = document.createElement('div'); card.className = 'file-card-recent';
                let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'mic' : 'file-text');
                card.innerHTML = `<div class="file-preview"><i data-feather="${icon}"></i></div><div class="file-info-recent"><span class="file-name-recent" title="${f.nombre}">${f.nombre}</span><span class="file-date">${f.fecha || "Hace un momento"}</span></div>`;
                card.onclick = () => manejarClickArchivo({id: f.id, nombre: f.nombre});
                gridRecientes.appendChild(card);
            });
            renderIcons();
        });
    }

    function cargarMiUnidad() {
        if (!listaArchivos) return;
        listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">Cargando unidad...</td></tr>';
        if(btnEliminarArchivos) btnEliminarArchivos.classList.add('hidden');
        fetch("/api/archivos/listar").then(res => res.json()).then(archivos => {
            listaArchivos.innerHTML = ''; calcularAlmacenamiento(archivos);
            if (archivos.length === 0) { listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">No hay archivos en tu cuenta.</td></tr>'; return; }
            archivos.forEach(f => {
                const tr = document.createElement('tr');
                let icon = f.tipo?.includes('image') ? 'image' : (f.tipo?.includes('audio') ? 'music' : 'file');
                const encName = encodeURIComponent(f.nombre); 
                tr.innerHTML = `<td><input type="checkbox" class="file-check" value="${f.id}"></td><td><div class="file-list-name-container"><div class="file-list-icon"><i data-feather="${icon}"></i></div><span class="file-name" title="${f.nombre}">${f.nombre}</span></div></td><td class="text-muted text-small">${f.fecha || "Hace un momento"}</td><td class="text-muted text-small">${formatBytes(f.tamano || f.size || (2 * 1024 * 1024))}</td><td><button class="btn-icon" onclick="manejarClickArchivo({id: ${f.id}, nombre: decodeURIComponent('${encName}')})" title="Abrir / Descargar"><i data-feather="download" class="text-primary"></i></button></td>`;
                listaArchivos.appendChild(tr);
            });
            document.querySelectorAll('.file-check').forEach(chk => { chk.onchange = () => { const sel = document.querySelectorAll('.file-check:checked').length; if(btnEliminarArchivos) btnEliminarArchivos.classList.toggle('hidden', sel === 0); }; });
            renderIcons();
        });
    }

    function calcularAlmacenamiento(archivos) {
        let sDocs = 0, sImgs = 0, sOtros = 0; const QUOTA = 150 * 1024 * 1024;
        archivos.forEach(f => {
            let b = f.tamano || f.size || (2 * 1024 * 1024); 
            if (f.tipo?.includes('image')) sImgs += b;
            else if (f.tipo?.includes('pdf') || f.tipo?.includes('document') || f.tipo?.includes('text') || f.tipo?.includes('msword')) sDocs += b;
            else sOtros += b;
        });
        actualizarBarras(sDocs, sImgs, sOtros, QUOTA);
    }

    function refrescarAlmacenamientoGlobal() { fetch("/api/archivos/listar").then(res => res.json()).then(arch => calcularAlmacenamiento(arch)); }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 MB'; const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function actualizarBarras(docs, imgs, otros, cuota) {
        const total = docs + imgs + otros;
        const mDocs = document.getElementById('modal-text-docs'), mImgs = document.getElementById('modal-text-imgs'), mOtros = document.getElementById('modal-text-otros'), mTotal = document.getElementById('modal-text-total-usage');
        const bmD = document.getElementById('modal-bar-docs'), bmI = document.getElementById('modal-bar-imgs'), bmO = document.getElementById('modal-bar-otros');
        const elDocs = document.getElementById('text-docs'), elImgs = document.getElementById('text-imgs'), elOtros = document.getElementById('text-otros'), elTotal = document.getElementById('text-total-usage'), elSidebar = document.getElementById('sidebar-text-total');
        const bD = document.getElementById('bar-docs'), bI = document.getElementById('bar-imgs'), bO = document.getElementById('bar-otros'), bS = document.getElementById('sidebar-bar-total');
        
        const txt = (val) => formatBytes(val); const pct = (val) => Math.min((val / cuota) * 100, 100) + '%';
        
        if(elDocs) elDocs.innerText = txt(docs); if(elImgs) elImgs.innerText = txt(imgs); if(elOtros) elOtros.innerText = txt(otros);
        if(elTotal) elTotal.innerText = `Total utilizado: ${txt(total)} de 150 MB`; if(elSidebar) elSidebar.innerText = `${txt(total)} de 150 MB`;
        if(bD) bD.style.width = pct(docs); if(bI) bI.style.width = pct(imgs); if(bO) bO.style.width = pct(otros); if(bS) bS.style.width = pct(total);
        
        if(mDocs) mDocs.innerText = txt(docs); if(mImgs) mImgs.innerText = txt(imgs); if(mOtros) mOtros.innerText = txt(otros);
        if(mTotal) mTotal.innerText = `Total utilizado: ${txt(total)} de 150 MB`;
        if(bmD) bmD.style.width = pct(docs); if(bmI) bmI.style.width = pct(imgs); if(bmO) bmO.style.width = pct(otros);
    }

    if (widgetAlmacenamiento && modalAlmacenamiento) widgetAlmacenamiento.onclick = () => modalAlmacenamiento.classList.remove('hidden');
    if (btnCerrarAlmacenamiento && modalAlmacenamiento) btnCerrarAlmacenamiento.onclick = () => modalAlmacenamiento.classList.add('hidden');

    // SUBIDAS Y BORRADOS (USUARIO)
    if (btnEliminarArchivos) {
        btnEliminarArchivos.onclick = () => {
            const checks = document.querySelectorAll('.file-check:checked');
            const ids = Array.from(checks).map(c => parseInt(c.value));
            if (ids.length > 0) {
                textoDeleteFile.innerText = `¿Seguro que deseas eliminar ${ids.length} archivo(s)?`;
                modalDeleteFile.classList.remove('hidden');
                btnConfirmDeleteFile.onclick = () => {
                    modalDeleteFile.classList.add('hidden');
                    if (listaArchivos) listaArchivos.innerHTML = '<tr><td colspan="5" class="text-small text-muted text-center">Eliminando...</td></tr>';
                    fetch("/api/archivos/eliminar", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ids) }).then(() => { cargarMiUnidad(); cargarRecientes(); });
                };
            }
        };
    }
    if (btnCancelDeleteFile) btnCancelDeleteFile.onclick = () => modalDeleteFile.classList.add('hidden');

    function procesarSubidaFinal(archivos) {
        const fd = new FormData(); for (let i = 0; i < archivos.length; i++) fd.append("archivo", archivos[i]);
        if (resUpload) resUpload.innerHTML = "<span class='text-small'>Subiendo archivos...</span>";
        fetch("/SubirArchivoController", { method: "POST", body: fd }).then(res => res.json()).then(data => {
            if (resUpload) { resUpload.innerHTML = `<span class="${data.status === 'success' ? 'badge-success' : 'text-danger'}">${data.mensaje}</span>`; setTimeout(() => resUpload.innerHTML = "", 4000); }
            if (data.status === 'success') { refrescarAlmacenamientoGlobal(); cargarRecientes(); cargarMiUnidad();} renderIcons();
        });
    }
    const vincularSubida = (btn, inp) => { if (btn && inp) { btn.onclick = () => inp.click(); inp.onchange = (e) => { if (e.target.files.length > 0) procesarSubidaFinal(e.target.files); }; } };
    vincularSubida(btnCamara, inputImagen); vincularSubida(btnAudioAction, inputAudio);
    if (btnArchivo) btnArchivo.onclick = () => { const i = document.createElement('input'); i.type = 'file'; i.multiple = true; i.onchange = (e) => { if (e.target.files.length > 0) procesarSubidaFinal(e.target.files); }; i.click(); };

    if (btnNota) btnNota.onclick = () => { if(inputTituloNota) inputTituloNota.value = ''; if(editorNota) editorNota.innerHTML = ''; if(btnGuardarNota) delete btnGuardarNota.dataset.editId; if(btnDescargarNota) btnDescargarNota.classList.add('hidden'); if(modalNota) modalNota.classList.remove('hidden'); };
    if (btnCerrarNota) btnCerrarNota.onclick = () => modalNota.classList.add('hidden');
    window.formatearTexto = (comando) => { document.execCommand(comando, false, null); if(editorNota) editorNota.focus(); };
    window.insertarEnlace = () => { const url = prompt('URL del enlace:'); if(url) document.execCommand('createLink', false, url); if (editorNota) editorNota.focus(); };
    if (btnGuardarNota) {
        btnGuardarNota.onclick = () => {
            const contenido = editorNota.innerHTML.trim(); if (!contenido) return alert("La nota no puede estar vacía.");
            let titulo = inputTituloNota.value.trim() || "Nota_Rapida"; if (!titulo.endsWith(".txt")) titulo += ".txt";
            const editId = btnGuardarNota.dataset.editId;
            if (editId) {
                const originalText = btnGuardarNota.innerHTML; btnGuardarNota.innerHTML = "<i data-feather='loader' class='icon-small spin'></i>"; btnGuardarNota.disabled = true;
                fetch("/api/notas/editar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId.toString(), titulo: titulo, contenido: contenido }) }).then(res => res.json()).then(data => { if(data.status === 'success') { modalNota.classList.add('hidden'); refrescarAlmacenamientoGlobal(); cargarMiUnidad(); cargarRecientes(); } else { alert(data.mensaje); } }).finally(() => { btnGuardarNota.innerHTML = originalText; btnGuardarNota.disabled = false; renderIcons(); });
            } else { const blob = new Blob([contenido], { type: 'text/plain' }); procesarSubidaFinal([new File([blob], titulo, { type: 'text/plain' })]); modalNota.classList.add('hidden'); }
        };
    }
    if (btnDescargarNota) btnDescargarNota.onclick = () => { const editId = btnGuardarNota.dataset.editId; if (editId) descargarArchivo(editId); };

    if (btnNuevo) btnNuevo.onclick = () => { document.getElementById('email-para').value = ''; document.getElementById('email-asunto').value = ''; if(editorEmail) editorEmail.innerHTML = ''; if(modalEmail) modalEmail.classList.remove('hidden'); };
    if (btnCerrarEmail) btnCerrarEmail.onclick = () => modalEmail.classList.add('hidden');
    window.formatearCorreo = (comando) => { document.execCommand(comando, false, null); if(editorEmail) editorEmail.focus(); };
    if (btnEnviarEmail) {
        btnEnviarEmail.onclick = () => {
            const p = document.getElementById('email-para').value.trim(), a = document.getElementById('email-asunto').value.trim(); if (!p || !a) return alert("Rellena destinatario y asunto.");
            const originalText = btnEnviarEmail.innerHTML; btnEnviarEmail.innerHTML = "<i data-feather='loader' class='icon-small spin'></i> <span class='ml-small'>Enviando...</span>"; renderIcons(); btnEnviarEmail.disabled = true;
            fetch("/api/email/enviar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ para: p, asunto: a, cuerpo: editorEmail.innerHTML }) }).then(res => res.json()).then(d => { alert(d.mensaje); modalEmail.classList.add('hidden'); }).finally(() => { btnEnviarEmail.innerHTML = originalText; btnEnviarEmail.disabled = false; renderIcons(); });
        };
    }

    // ====================================================
    // PANEL DE ADMINISTRADOR UNIFICADO
    // ====================================================
    const btnAdminLogout = document.getElementById('btn-admin-logout');
    if (btnAdminLogout) {
        btnAdminLogout.addEventListener('click', (e) => {
            e.preventDefault(); e.stopPropagation();
            viewAdmin.classList.add('hidden');
            viewLogin.classList.remove('hidden');
            if (loginForm) loginForm.reset();
        });
    }

    window.cargarDashboardAdmin = () => {
        fetch("/api/archivos/listar").then(res => res.json()).then(archivos => {
            let totalBytes = 0; archivos.forEach(f => totalBytes += (f.tamano || f.size || (2 * 1024 * 1024)));
            const LIMIT_BYTES = 600 * 1024 * 1024; 
            const txtGlobal = document.getElementById('admin-metric-storage');
            const barGlobal = document.getElementById('admin-bar-storage');
            if (txtGlobal) txtGlobal.innerText = `${formatBytes(totalBytes)} / 600 MB`;
            if (barGlobal) barGlobal.style.width = Math.min((totalBytes / LIMIT_BYTES) * 100, 100) + '%';
        });

        fetch("/api/admin/usuarios").then(res => res.json()).then(usuarios => {
            const tbody = document.getElementById('lista-usuarios-admin');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            let activos = 0, pendientes = 0;

            usuarios.forEach(u => {
                let estado = u.estado || 'Pendiente';
                let almacenamiento = 0; 
                if (estado === 'Activo') activos++; else pendientes++;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="admin-user-check" value="${u.correo}"></td>
                    <td>${u.correo}</td>
                    <td><span class="badge ${estado === 'Activo' ? 'badge-success' : 'badge-pending'}">${estado}</span></td>
                    <td>${formatBytes(almacenamiento)}</td>
                    <td>
                        <div class="action-group-small">
                            ${estado === 'Pendiente' ? `<button class="btn-icon text-success btn-aprobar-single" data-correo="${u.correo}" title="Aprobar Usuario"><i data-feather="check-circle"></i></button>` : '<div style="width:1.75rem;"></div>'}
                            <button class="btn-icon text-danger btn-borrar-single" data-correo="${u.correo}" title="Eliminar Usuario"><i data-feather="trash-2"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById('admin-metric-activos').innerText = activos;
            document.getElementById('admin-metric-pendientes').innerText = pendientes;
            
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

            if (chkAll) chkAll.onchange = (e) => { checks.forEach(c => c.checked = e.target.checked); actualizarBotonesAdmin(); };
            checks.forEach(c => c.onchange = actualizarBotonesAdmin);

            const ejecutarAccionUsuarios = (metodo, correosArray) => {
                fetch("/api/admin/usuarios/acciones", {
                    method: metodo, headers: { "Content-Type": "application/json" }, body: JSON.stringify(correosArray)
                }).then(() => { if(chkAll) chkAll.checked = false; cargarDashboardAdmin(); });
            };

            if (btnAprobar) btnAprobar.onclick = () => {
                const correos = Array.from(document.querySelectorAll('.admin-user-check:checked')).map(c => c.value);
                ejecutarAccionUsuarios("PUT", correos);
            };
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
                    modalDelete.classList.add('hidden'); ejecutarAccionUsuarios("DELETE", correos);
                };
            };

            if (btnEliminar) btnEliminar.onclick = () => {
                const correos = Array.from(document.querySelectorAll('.admin-user-check:checked')).map(c => c.value);
                prepararEliminacion(correos);
            };
            document.querySelectorAll('.btn-borrar-single').forEach(btn => {
                btn.onclick = () => prepararEliminacion([btn.getAttribute('data-correo')]);
            });

            renderIcons();
        });
    };
});