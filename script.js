(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'login.html';
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const tabelaBody = document.getElementById('tabelaPresosBody');
    const tabelaFooter = document.getElementById('tabelaFooter');
    const contadorRegistros = document.getElementById('contadorRegistros');
    const paginacaoContainer = document.getElementById('paginacaoContainer');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    const filtros = {
        nome: document.getElementById('filtroNome'),
        local: document.getElementById('filtroLocal'),
        cor: document.getElementById('filtroCor'),
        regime: document.getElementById('filtroRegime'),
        dataInicio: document.getElementById('filtroDataInicio'),
        dataFim: document.getElementById('filtroDataFim'),
    };
    const modal = document.getElementById('modal');
    const form = document.getElementById('cadastroForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnAdicionarNovo = document.getElementById('btnAdicionarNovo');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const presoIdInput = document.getElementById('presoId');
    const toastContainer = document.getElementById('toastContainer');
    const btnLogout = document.getElementById('btnLogout');
    const userNameSpan = document.getElementById('userName');
    const btnExcluirSelecionados = document.getElementById('btnExcluirSelecionados');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const btnGerarPDF = document.getElementById('btnGerarPDF');
    const adminPanel = document.getElementById('adminPanel');
    const adminLink = document.getElementById('adminLink');
    const userTableBody = document.getElementById('userTableBody');
    const themeToggleButton = document.getElementById('theme-toggle');
    const loader = document.getElementById('loader');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com';
    const TOKEN = localStorage.getItem('authToken');
    let todosPresos = []; 
    let idsSelecionados = [];
    let currentPage = 1;
    const rowsPerPage = 15;
    const dataAtual = new Date();

    const showLoader = () => loader.classList.remove('hidden');
    const hideLoader = () => loader.classList.add('hidden');

    const calcularDiasPreso = (data) => data ? Math.max(0, Math.ceil((dataAtual - new Date(data)) / (1000 * 60 * 60 * 24))) : 0;
    const getStatusCor = (dias) => (dias <= 30) ? 'Amarelo' : (dias <= 90) ? 'Laranja' : 'Vermelho';

    const fetchApi = async (endpoint, options = {}) => {
        showLoader();
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            };
            const config = { ...options, headers: { ...headers, ...options.headers }};
            const response = await fetch(`${API_URL}${endpoint}`, config);
            
            if (response.status === 401 || response.status === 403) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.error === 'Acesso negado. Requer permissão de administrador.') {
                    showToast(errorData.error, 'error');
                    return null;
                }
                localStorage.clear();
                window.location.href = 'login.html';
                throw new Error('Token inválido ou expirado.');
            }
            if (response.status === 204) return null;
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.error || 'Ocorreu um erro.');
            return responseData;
        } finally {
            hideLoader();
        }
    };

    const buscarDados = async () => {
        try {
            todosPresos = await fetchApi('/api/presos');
            aplicarFiltros();
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    };
    
    const openModal = (isEdit = false, preso = null) => {
        form.reset();
        presoIdInput.value = '';
        modalTitle.textContent = isEdit ? 'Editar Cliente' : 'Adicionar Novo Cliente';
        if (isEdit && preso) {
            presoIdInput.value = preso.id;
            Object.keys(preso).forEach(key => {
                const input = form.querySelector(`[name=${key}]`);
                if (input) {
                    if (input.type === 'date' && preso[key]) {
                        input.value = new Date(preso[key]).toISOString().split('T')[0];
                    } else {
                        input.value = preso[key];
                    }
                }
            });
        }
        modal.classList.remove('hidden');
    };
    const closeModal = () => modal.classList.add('hidden');

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${"success" === type ? "check-circle" : "exclamation-circle"}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };
    
    const renderizarTabela = (lista = todosPresos) => {
        tabelaBody.innerHTML = '';
        tabelaFooter.classList.add('hidden');

        if (lista.length === 0) {
            tabelaFooter.classList.remove('hidden');
            contadorRegistros.innerHTML = `<i class="fas fa-list-ul"></i> 0 registros`;
            paginacaoContainer.innerHTML = '';
            return;
        }

        const start = (currentPage - 1) * rowsPerPage;
        const paginatedItems = lista.slice(start, start + rowsPerPage);

        paginatedItems.forEach(preso => {
            const diasPreso = calcularDiasPreso(preso.quando_prendeu);
            const statusCor = getStatusCor(diasPreso).toLowerCase();
            const isChecked = idsSelecionados.includes(preso.id);
            const tr = document.createElement('tr');
            if (isChecked) tr.classList.add('selecionada');

            tr.innerHTML = `
                <td data-label="" class="checkbox-cell"><input type="checkbox" class="preso-checkbox" value="${preso.id}" ${isChecked ? 'checked' : ''}></td>
                <td data-label="Nome / Processo" class="nome-processo-cell">
                    ${preso.nome}
                    <span class="numero-processo">Proc: ${preso.numero_processo || 'N/A'}</span>
                </td>
                <td data-label="Dias Preso">${diasPreso}</td>
                <td data-label="Unidade">${preso.unidade_prisional}</td>
                <td data-label="Data da Prisão">${new Date(preso.quando_prendeu).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td data-label="Status"><span class="status-dot alerta-${statusCor}" title="${statusCor.charAt(0).toUpperCase() + statusCor.slice(1)}"></span></td>
                <td data-label="Regime">${preso.regime_provavel}</td>
                <td data-label="Primário?">${preso.reu_primario}</td>
                <td data-label="Ações" class="acoes-cell">
                    <button onclick="prepararEdicao(${preso.id})" title="Editar"><i class="fas fa-edit"></i></button>
                    <button onclick="excluirPreso(${preso.id})" title="Excluir"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tabelaBody.appendChild(tr);
        });

        document.querySelectorAll('.preso-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const id = parseInt(e.target.value);
                const tr = e.target.closest('tr');
                if (e.target.checked) {
                    if (!idsSelecionados.includes(id)) idsSelecionados.push(id);
                    tr.classList.add('selecionada');
                } else {
                    idsSelecionados = idsSelecionados.filter(selId => selId !== id);
                    tr.classList.remove('selecionada');
                }
                atualizarInterfaceExclusao();
            });
        });
        
        contadorRegistros.innerHTML = `<i class="fas fa-list-ul"></i> Mostrando ${paginatedItems.length} de ${lista.length} registros`;
        setupPaginacao(lista);
        atualizarInterfaceExclusao();
    };

    const setupPaginacao = (items) => {
        paginacaoContainer.innerHTML = "";
        const pageCount = Math.ceil(items.length / rowsPerPage);
        if (pageCount <= 1) return;
        const createButton = (text, page, isDisabled = false, isActive = false) => {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
            if (isActive) btn.classList.add('active');
            btn.innerHTML = text;
            btn.disabled = isDisabled;
            btn.addEventListener('click', () => {
                currentPage = page;
                renderizarTabela(aplicarFiltros(false));
            });
            return btn;
        };
        paginacaoContainer.appendChild(createButton('<i class="fas fa-angle-left"></i>', currentPage - 1, currentPage === 1));
        for (let i = 1; i <= pageCount; i++) {
            paginacaoContainer.appendChild(createButton(i, i, false, i === currentPage));
        }
        paginacaoContainer.appendChild(createButton('<i class="fas fa-angle-right"></i>', currentPage + 1, currentPage === pageCount));
    };

    const aplicarFiltros = (resetPage = true) => {
        if(resetPage) currentPage = 1;
        let presosFiltrados = [...todosPresos];
        const termoBusca = filtros.nome.value.toLowerCase();
        if (termoBusca) {
            presosFiltrados = presosFiltrados.filter(p => 
                p.nome.toLowerCase().includes(termoBusca) ||
                (p.numero_processo && p.numero_processo.toLowerCase().includes(termoBusca))
            );
        }
        if (filtros.local.value) presosFiltrados = presosFiltrados.filter(p => p.unidade_prisional === filtros.local.value);
        if (filtros.regime.value) presosFiltrados = presosFiltrados.filter(p => p.regime_provavel === filtros.regime.value);
        if (filtros.cor.value) presosFiltrados = presosFiltrados.filter(p => getStatusCor(calcularDiasPreso(p.quando_prendeu)) === filtros.cor.value);
        if (filtros.dataInicio.value) presosFiltrados = presosFiltrados.filter(p => new Date(p.quando_prendeu) >= new Date(filtros.dataInicio.value));
        if (filtros.dataFim.value) presosFiltrados = presosFiltrados.filter(p => new Date(p.quando_prendeu) <= new Date(filtros.dataFim.value));
        renderizarTabela(presosFiltrados);
        return presosFiltrados;
    };

    const atualizarInterfaceExclusao = () => {
        const btnText = btnExcluirSelecionados.querySelector('i').nextSibling;
        if (idsSelecionados.length > 0) {
            btnExcluirSelecionados.classList.remove('hidden');
            btnText.textContent = ` Excluir ${idsSelecionados.length}`;
        } else {
            btnExcluirSelecionados.classList.add('hidden');
        }
        const todosVisiveisNaPagina = document.querySelectorAll('.preso-checkbox');
        const todosMarcados = todosVisiveisNaPagina.length > 0 && Array.from(todosVisiveisNaPagina).every(cb => cb.checked);
        selectAllCheckbox.checked = todosMarcados;
    };

    const gerarPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dadosFiltrados = aplicarFiltros(false);
        const corpoTabela = dadosFiltrados.map(p => [
            p.nome,
            p.numero_processo || 'N/A',
            calcularDiasPreso(p.quando_prendeu),
            p.unidade_prisional,
            new Date(p.quando_prendeu).toLocaleDateString('pt-BR'),
            p.regime_provavel,
        ]);
        const cabecalhoTabela = ["Nome", "Nº Processo", "Dias Preso", "Unidade", "Data Prisão", "Regime Provável"];
        doc.setFontSize(18);
        doc.text("Relatório de Clientes", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 29);
        doc.autoTable({
            head: [cabecalhoTabela],
            body: corpoTabela,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [0, 95, 115] },
        });
        doc.save(`relatorio_clientes_${new Date().getTime()}.pdf`);
    };
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = presoIdInput.value;
        const dadosForm = new FormData(form);
        const dadosPreso = Object.fromEntries(dadosForm.entries());
        if (!id) delete dadosPreso.id;
        if (!dadosPreso.ultima_revisao) delete dadosPreso.ultima_revisao;
        if (!dadosPreso.numero_processo) delete dadosPreso.numero_processo;

        try {
            const endpoint = id ? `/api/presos/${id}` : '/api/presos';
            const method = id ? 'PUT' : 'POST';
            await fetchApi(endpoint, { method, body: JSON.stringify(dadosPreso) });
            showToast(id ? 'Registro atualizado com sucesso!' : 'Novo cliente cadastrado com sucesso!');
            closeModal();
            buscarDados();
        } catch (error) {
            console.error(error);
            showToast(error.message, 'error');
        }
    });

    window.prepararEdicao = (id) => {
        const preso = todosPresos.find(p => p.id === id);
        if (preso) openModal(true, preso);
    };
    
    window.excluirPreso = async (id) => {
        if (confirm('Tem certeza que deseja excluir permanentemente este registro?')) {
            try {
                await fetchApi(`/api/presos/${id}`, { method: 'DELETE' });
                showToast('Registro excluído.', 'error');
                buscarDados();
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        }
    };
    
    btnExcluirSelecionados.addEventListener('click', async () => {
        if (idsSelecionados.length === 0) return;
        if (confirm(`Tem certeza que deseja excluir permanentemente os ${idsSelecionados.length} registros selecionados?`)) {
            try {
                await fetchApi('/api/presos', { method: 'DELETE', body: JSON.stringify({ ids: idsSelecionados }) });
                showToast(`${idsSelecionados.length} registros excluídos com sucesso.`, 'error');
                idsSelecionados = [];
                buscarDados();
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        }
    });

    selectAllCheckbox.addEventListener('click', () => {
        const checkboxesVisiveis = document.querySelectorAll('.preso-checkbox');
        const isChecked = selectAllCheckbox.checked;
        idsSelecionados = [];
        checkboxesVisiveis.forEach(checkbox => {
            checkbox.checked = isChecked;
            const id = parseInt(checkbox.value);
            const tr = checkbox.closest('tr');
            if(isChecked) {
                idsSelecionados.push(id);
                tr.classList.add('selecionada');
            } else {
                tr.classList.remove('selecionada');
            }
        });
        atualizarInterfaceExclusao();
    });

    const configurarLogout = () => {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    };

    const exibirInfoUsuario = () => {
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }
        const userData = JSON.parse(userDataString);
        userNameSpan.textContent = `Olá, ${userData.full_name || userData.email}`;
        return userData;
    };
    
    const setupAdminFeatures = (userData) => {
        if (userData && userData.role === 'admin') {
            adminLink.classList.remove('hidden');
            adminLink.addEventListener('click', async () => {
                const isHidden = adminPanel.classList.toggle('hidden');
                if(!isHidden) await carregarPainelAdmin();
            });
        }
    };

    const carregarPainelAdmin = async () => {
        const users = await fetchApi('/api/admin/users');
        if(users) {
            renderizarTabelaUsuarios(users);
        }
    };

    const renderizarTabelaUsuarios = (users) => {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.full_name || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.status}</td>
                <td>${user.role}</td>
                <td>
                    ${user.status === 'pending' ? `<button class="btn btn-sm btn-success btn-approve" data-userid="${user.id}">Aprovar</button>` : '—'}
                </td>
            `;
            userTableBody.appendChild(tr);
        });

        document.querySelectorAll('.btn-approve').forEach(button => {
            button.addEventListener('click', async (e) => {
                const userId = e.target.dataset.userid;
                try {
                    await fetchApi(`/api/admin/users/${userId}/approve`, { method: 'PATCH' });
                    showToast('Usuário aprovado com sucesso!');
                    carregarPainelAdmin();
                } catch (error) {
                    showToast(error.message, 'error');
                }
            });
        });
    };

    const setupTheme = () => {
        const userTheme = localStorage.getItem('theme');
        const icon = themeToggleButton.querySelector('i');
        if (userTheme === 'dark') {
            document.body.classList.add('dark-mode');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            document.body.classList.remove('dark-mode');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    };

    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        setupTheme();
    };

    const setupScrollToTop = () => {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.remove('hidden');
            } else {
                scrollTopBtn.classList.add('hidden');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };
    
    if (TOKEN) {
        setupTheme();
        const currentUser = exibirInfoUsuario();
        configurarLogout();
        buscarDados();
        setupAdminFeatures(currentUser);
        setupScrollToTop();
        btnAdicionarNovo.addEventListener("click", () => openModal());
        closeModalBtn.addEventListener("click", closeModal);
        btnCancelarModal.addEventListener("click", closeModal);
        modal.addEventListener("click", e => { if (e.target === modal) closeModal() });
        btnLimparFiltros.addEventListener("click", () => { Object.values(filtros).forEach(f => f.value = ""); aplicarFiltros() });
        Object.values(filtros).forEach(f => f.addEventListener("input", () => aplicarFiltros()));
        btnGerarPDF.addEventListener('click', gerarPDF);
        themeToggleButton.addEventListener('click', toggleTheme);
    }
});