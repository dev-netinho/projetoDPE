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
    const API_URL = 'https://painel-advocacia-api-netinho.onrender.com/api'; // O endereço do nosso back-end!
    let todosPresos = []; // Array para guardar todos os registros do banco
    let currentPage = 1;
    const rowsPerPage = 15;
    const dataAtual = new Date();

    // --- FUNÇÕES DE LÓGICA DE NEGÓCIO (CÁLCULOS) ---
    const calcularDiasPreso = (data) => data ? Math.max(0, Math.ceil((dataAtual - new Date(data)) / (1000 * 60 * 60 * 24))) : 0;
    const getStatusCor = (dias) => (dias <= 30) ? 'Amarelo' : (dias <= 90) ? 'Laranja' : 'Vermelho';

    // --- LÓGICA DE INTERAÇÃO COM API ---
    const buscarDados = async () => {
        try {
            const response = await fetch(`${API_URL}/presos`);
            if (!response.ok) throw new Error('Erro ao buscar dados da API');
            todosPresos = await response.json();
            aplicarFiltros();
        } catch (error) {
            console.error(error);
            showToast('Falha ao carregar dados. Verifique se o servidor back-end está rodando.', 'error');
        }
    };

    // --- LÓGICA DO MODAL ---
    const openModal = (isEdit = false, preso = null) => {
        form.reset();
        if (isEdit && preso) {
            modalTitle.textContent = 'Editar Registro';
            // Preenche os campos do formulário com os dados do preso
            // O 'id' e os outros campos serão preenchidos pelo seu 'name' correspondente
            Object.keys(preso).forEach(key => {
                const input = form.querySelector(`[name=${key}]`);
                if (input) input.value = preso[key];
            });
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
    const renderizarTabela = (lista = todosPresos) => {
        tabelaBody.innerHTML = '';
        const start = (currentPage - 1) * rowsPerPage;
        const paginatedItems = lista.slice(start, start + rowsPerPage);
        paginatedItems.forEach(preso => {
            const diasPreso = calcularDiasPreso(preso.quando_prendeu);
            const statusCor = getStatusCor(diasPreso).toLowerCase();
            tabelaBody.innerHTML += `
                <tr>
                    <td><span class="status-dot alerta-${statusCor}" title="${statusCor.charAt(0).toUpperCase() + statusCor.slice(1)}"></span></td>
                    <td>${preso.nome}</td>
                    <td>${diasPreso}</td>
                    <td>${preso.unidade_prisional}</td>
                    <td>${new Date(preso.quando_prendeu).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td>${preso.regime_provavel}</td>
                    <td>${preso.reu_primario}</td>
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

    // --- CRUD E FILTROS COM API ---
    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = presoIdInput.value;
    const dadosForm = new FormData(form);
    const dadosPreso = Object.fromEntries(dadosForm.entries());
    
    // --- LINHA DE CORREÇÃO ADICIONADA AQUI ---
    // Se não há um 'id' (ou seja, estamos criando um novo preso),
    // removemos a propriedade 'id' para que o banco de dados a gere automaticamente.
    if (!id) {
        delete dadosPreso.id;
    }
    
    // Remove valores vazios para não enviar 'null' para campos opcionais como data de revisão
    if (!dadosPreso.ultima_revisao) delete dadosPreso.ultima_revisao;
    
    try {
        let response;
        let url = `${API_URL}/presos`;
        let method = 'POST';

        if (id) {
            url = `${API_URL}/presos/${id}`;
            method = 'PUT';
        }
        
        response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosPreso)
        });
        
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Falha ao salvar registro.');
        }
        
        showToast(id ? 'Registro atualizado com sucesso!' : 'Novo preso cadastrado com sucesso!');
        closeModal();
        buscarDados(); // Recarrega os dados do banco
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
                const response = await fetch(`${API_URL}/presos/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir registro.');
                showToast('Registro excluído.', 'error');
                buscarDados();
            } catch (error) {
                console.error(error);
                showToast(error.message, 'error');
            }
        }
    };
    
    const aplicarFiltros = (resetPage = true) => {
        if(resetPage) currentPage = 1;
        let presosFiltrados = [...todosPresos];
        
        const nomeTermo = filtros.nome.value.toLowerCase();
        if (nomeTermo) presosFiltrados = presosFiltrados.filter(p => p.nome.toLowerCase().includes(nomeTermo));
        if (filtros.local.value) presosFiltrados = presosFiltrados.filter(p => p.unidade_prisional === filtros.local.value);
        if (filtros.regime.value) presosFiltrados = presosFiltrados.filter(p => p.regime_provavel === filtros.regime.value);
        if (filtros.cor.value) presosFiltrados = presosFiltrados.filter(p => getStatusCor(calcularDiasPreso(p.quando_prendeu)) === filtros.cor.value);
        if (filtros.dataInicio.value) presosFiltrados = presosFiltrados.filter(p => p.quando_prendeu >= filtros.dataInicio.value);
        if (filtros.dataFim.value) presosFiltrados = presosFiltrados.filter(p => p.quando_prendeu <= filtros.dataFim.value);

        renderizarTabela(presosFiltrados);
        return presosFiltrados;
    };
    Object.values(filtros).forEach(f => f.addEventListener('input', () => aplicarFiltros()));
    btnLimparFiltros.addEventListener('click', () => {
        Object.values(filtros).forEach(f => f.value = '');
        aplicarFiltros();
    });

    // --- INICIALIZAÇÃO ---
    buscarDados(); // A mágica começa aqui!
});