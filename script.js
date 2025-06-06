document.addEventListener('DOMContentLoaded', () => {
    // --- REFERÊNCIAS DO DOM ---
    const tabelaBody = document.getElementById('tabelaPresosBody');
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
    
    // Modal
    const modal = document.getElementById('modal');
    const form = document.getElementById('cadastroForm');
    const modalTitle = document.getElementById('modalTitle');
    const btnAdicionarNovo = document.getElementById('btnAdicionarNovo');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    const presoIdInput = document.getElementById('presoId');
    const toastContainer = document.getElementById('toastContainer');

    // --- ESTADO DA APLICAÇÃO ---
    let presos = JSON.parse(localStorage.getItem('presosEryca')) || [];
    let currentPage = 1;
    const rowsPerPage = 15; // Define quantos registros por página
    const dataAtual = new Date();

    // --- FUNÇÕES DE LÓGICA DE NEGÓCIO ---
    const salvarPresos = () => localStorage.setItem('presosEryca', JSON.stringify(presos));
    const calcularDiasPreso = (data) => data ? Math.max(0, Math.ceil((dataAtual - new Date(data)) / (1000 * 60 * 60 * 24))) : 0;
    const getStatusCor = (dias) => (dias <= 30) ? 'Amarelo' : (dias <= 90) ? 'Laranja' : 'Vermelho';

    // --- LÓGICA DO MODAL ---
    const openModal = (isEdit = false, preso = null) => {
        form.reset();
        if (isEdit && preso) {
            modalTitle.textContent = 'Editar Registro';
            presoIdInput.value = preso.id;
            document.getElementById('nome').value = preso.nome;
            document.getElementById('unidadePrisional').value = preso.unidadePrisional;
            document.getElementById('quandoPrendeu').value = preso.quandoPrendeu;
            document.getElementById('ultimaRevisao').value = preso.ultimaRevisao;
            document.getElementById('reuPrimario').value = preso.reuPrimario;
            document.getElementById('regimeProvavel').value = preso.regimeProvavel;
            document.getElementById('observacao').value = preso.observacao;
        } else {
            modalTitle.textContent = 'Adicionar Novo Preso';
            presoIdInput.value = '';
        }
        modal.classList.remove('hidden');
    };

    const closeModal = () => modal.classList.add('hidden');

    btnAdicionarNovo.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    btnCancelarModal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- LÓGICA DE NOTIFICAÇÕES (TOASTS) ---
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };
    
    // --- RENDERIZAÇÃO E PAGINAÇÃO ---
    const renderizarTabela = (lista = presos) => {
        tabelaBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const paginatedItems = lista.slice(start, start + rowsPerPage);

        paginatedItems.forEach(preso => {
            const diasPreso = calcularDiasPreso(preso.quandoPrendeu);
            const statusCor = getStatusCor(diasPreso).toLowerCase();
            tabelaBody.innerHTML += `
                <tr>
                    <td><span class="status-dot alerta-${statusCor}" title="${statusCor.charAt(0).toUpperCase() + statusCor.slice(1)}"></span></td>
                    <td>${preso.nome}</td>
                    <td>${diasPreso}</td>
                    <td>${preso.unidadePrisional}</td>
                    <td>${new Date(preso.quandoPrendeu).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td>${preso.regimeProvavel}</td>
                    <td>${preso.reuPrimario}</td>
                    <td class="acoes-cell">
                        <button onclick="prepararEdicao('${preso.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                        <button onclick="excluirPreso('${preso.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        contadorRegistros.innerHTML = `<i class="fas fa-list-ul"></i> Mostrando ${paginatedItems.length} de ${lista.length} registros`;
        setupPaginacao(lista);
    };

    const setupPaginacao = (items) => {
        paginacaoContainer.innerHTML = "";
        const pageCount = Math.ceil(items.length / rowsPerPage);
        if (pageCount <= 1) return;

        const createButton = (text, page, isDisabled = false) => {
            const btn = document.createElement('button');
            btn.className = 'page-btn';
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
            const btn = createButton(i, i);
            if (i === currentPage) btn.classList.add('active');
            paginacaoContainer.appendChild(btn);
        }
        
        paginacaoContainer.appendChild(createButton('<i class="fas fa-angle-right"></i>', currentPage + 1, currentPage === pageCount));
    };

    // --- CRUD E FILTROS ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = presoIdInput.value;
        const dadosPreso = {
            nome: document.getElementById('nome').value.trim(),
            unidadePrisional: document.getElementById('unidadePrisional').value,
            quandoPrendeu: document.getElementById('quandoPrendeu').value,
            ultimaRevisao: document.getElementById('ultimaRevisao').value,
            reuPrimario: document.getElementById('reuPrimario').value,
            regimeProvavel: document.getElementById('regimeProvavel').value,
            observacao: document.getElementById('observacao').value.trim()
        };

        if (id) {
            const index = presos.findIndex(p => p.id === id);
            if (index > -1) presos[index] = { ...presos[index], ...dadosPreso };
            showToast('Registro atualizado com sucesso!');
        } else {
            dadosPreso.id = 'preso-' + Date.now();
            presos.unshift(dadosPreso); // Adiciona no início da lista
            showToast('Novo preso cadastrado com sucesso!');
        }
        salvarPresos();
        closeModal();
        aplicarFiltros();
    });

    window.prepararEdicao = (id) => {
        const preso = presos.find(p => p.id === id);
        if (preso) openModal(true, preso);
    };
    
    window.excluirPreso = (id) => {
        if (confirm('Tem certeza que deseja excluir permanentemente este registro?')) {
            presos = presos.filter(p => p.id !== id);
            salvarPresos();
            showToast('Registro excluído.', 'error');
            aplicarFiltros();
        }
    };
    
    const aplicarFiltros = (resetPage = true) => {
        if(resetPage) currentPage = 1;
        let presosFiltrados = [...presos];
        
        const nomeTermo = filtros.nome.value.toLowerCase();
        if (nomeTermo) presosFiltrados = presosFiltrados.filter(p => p.nome.toLowerCase().includes(nomeTermo));
        if (filtros.local.value) presosFiltrados = presosFiltrados.filter(p => p.unidadePrisional === filtros.local.value);
        if (filtros.regime.value) presosFiltrados = presosFiltrados.filter(p => p.regimeProvavel === filtros.regime.value);
        if (filtros.cor.value) presosFiltrados = presosFiltrados.filter(p => getStatusCor(calcularDiasPreso(p.quandoPrendeu)) === filtros.cor.value);
        if (filtros.dataInicio.value) presosFiltrados = presosFiltrados.filter(p => p.quandoPrendeu >= filtros.dataInicio.value);
        if (filtros.dataFim.value) presosFiltrados = presosFiltrados.filter(p => p.quandoPrendeu <= filtros.dataFim.value);

        renderizarTabela(presosFiltrados);
        return presosFiltrados; // Retorna para uso interno
    };

    Object.values(filtros).forEach(f => {
        f.addEventListener('input', () => aplicarFiltros());
        f.addEventListener('change', () => aplicarFiltros());
    });
    
    btnLimparFiltros.addEventListener('click', () => {
        Object.values(filtros).forEach(f => f.value = '');
        aplicarFiltros();
    });

    // --- INICIALIZAÇÃO ---
    aplicarFiltros();
});