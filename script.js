document.addEventListener('DOMContentLoaded', () => {
    // Referências do DOM
    const form = document.getElementById('cadastroForm');
    const tabelaBody = document.getElementById('tabelaPresosBody');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
    const presoIdInput = document.getElementById('presoId');
    const contadorRegistros = document.getElementById('contadorRegistros');
    const paginacaoContainer = document.getElementById('paginacaoContainer'); // Novo
    const filtros = {
        nome: document.getElementById('filtroNome'),
        local: document.getElementById('filtroLocal'),
        cor: document.getElementById('filtroCor'),
        regime: document.getElementById('filtroRegime'),
        dataInicio: document.getElementById('filtroDataInicio'),
        dataFim: document.getElementById('filtroDataFim'),
    };
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');

    // Data atual para cálculo consistente
    const dataAtual = new Date();

    // Estado da aplicação
    let presos = JSON.parse(localStorage.getItem('presosEryca')) || [];
    let currentPage = 1;
    const rowsPerPage = 15; // Define quantos registros por página

    const salvarPresos = () => {
        localStorage.setItem('presosEryca', JSON.stringify(presos));
    };

    const calcularDiasPreso = (dataPrisao) => {
        if (!dataPrisao) return 0;
        const dataInicio = new Date(dataPrisao);
        const diff = dataAtual.getTime() - dataInicio.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    
    const getStatusCor = (diasPreso) => {
        if (diasPreso <= 30) return 'Amarelo';
        if (diasPreso <= 90) return 'Laranja';
        return 'Vermelho';
    };

    const resetarFormulario = () => {
        form.reset();
        presoIdInput.value = '';
        btnSalvar.textContent = 'Salvar Registro';
        btnCancelarEdicao.classList.add('hidden');
        document.querySelector('h2').textContent = 'Cadastrar Novo Preso';
    };

    // FUNÇÃO ATUALIZADA PARA LIDAR COM A PAGINAÇÃO
    const renderizarTabela = (lista = presos) => {
        tabelaBody.innerHTML = '';
        
        // Corta a lista para exibir apenas os itens da página atual
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedItems = lista.slice(start, end);

        paginatedItems.forEach(preso => {
            const diasPreso = calcularDiasPreso(preso.quandoPrendeu);
            const statusCor = getStatusCor(diasPreso);
            const classeCor = `alerta-${statusCor.toLowerCase()}`;

            const tr = document.createElement('tr');
            tr.className = classeCor;
            tr.innerHTML = `
                <td><span class="status-dot" title="${statusCor}"></span></td>
                <td>${preso.nome}</td>
                <td>${diasPreso}</td>
                <td>${preso.unidadePrisional}</td>
                <td>${new Date(preso.quandoPrendeu).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>${preso.regimeProvavel}</td>
                <td>${preso.reuPrimario}</td>
                <td>${preso.ultimaRevisao ? new Date(preso.ultimaRevisao).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</td>
                <td>
                    <button class="btn-acao btn-editar" onclick="prepararEdicao('${preso.id}')">Editar</button>
                    <button class="btn-acao btn-excluir" onclick="excluirPreso('${preso.id}')">Excluir</button>
                </td>
            `;
            tabelaBody.appendChild(tr);
        });
        
        contadorRegistros.textContent = `Mostrando ${paginatedItems.length} de ${lista.length} registros. Página ${currentPage}.`;
        setupPaginacao(lista); // Chama a função que cria os botões
    };

    // NOVA FUNÇÃO PARA CRIAR OS BOTÕES DE PAGINAÇÃO
    const setupPaginacao = (items) => {
        paginacaoContainer.innerHTML = "";
        const pageCount = Math.ceil(items.length / rowsPerPage);

        if (pageCount <= 1) return; // Não mostra paginação se só tem 1 página

        // Botão "Anterior"
        const prevButton = document.createElement('button');
        prevButton.classList.add('page-btn');
        prevButton.innerText = 'Anterior';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderizarTabela(aplicarFiltros(false));
            }
        });
        paginacaoContainer.appendChild(prevButton);

        // Botões de Página
        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.classList.add('page-btn');
            btn.innerText = i;
            if (i === currentPage) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                currentPage = i;
                renderizarTabela(aplicarFiltros(false));
            });
            paginacaoContainer.appendChild(btn);
        }

        // Botão "Próxima"
        const nextButton = document.createElement('button');
        nextButton.classList.add('page-btn');
        nextButton.innerText = 'Próxima';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderizarTabela(aplicarFiltros(false));
            }
        });
        paginacaoContainer.appendChild(nextButton);
    };
    
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

        if (id) { // Editando
            const index = presos.findIndex(p => p.id === id);
            if (index > -1) {
                presos[index] = { ...presos[index], ...dadosPreso };
            }
        } else { // Cadastrando
            dadosPreso.id = 'preso-' + Date.now();
            presos.unshift(dadosPreso); // Adiciona no início da lista
        }

        salvarPresos();
        resetarFormulario();
        aplicarFiltros();
    });

    btnCancelarEdicao.addEventListener('click', resetarFormulario);
    
    window.prepararEdicao = (id) => {
        const preso = presos.find(p => p.id === id);
        if (preso) {
            presoIdInput.value = preso.id;
            document.getElementById('nome').value = preso.nome;
            document.getElementById('unidadePrisional').value = preso.unidadePrisional;
            document.getElementById('quandoPrendeu').value = preso.quandoPrendeu;
            document.getElementById('ultimaRevisao').value = preso.ultimaRevisao;
            document.getElementById('reuPrimario').value = preso.reuPrimario;
            document.getElementById('regimeProvavel').value = preso.regimeProvavel;
            document.getElementById('observacao').value = preso.observacao;

            btnSalvar.textContent = 'Atualizar Registro';
            btnCancelarEdicao.classList.remove('hidden');
            document.querySelector('h2').textContent = 'Editando Registro';
            window.scrollTo(0, 0);
        }
    };
    
    window.excluirPreso = (id) => {
        if (confirm(`Tem certeza que deseja excluir o registro deste preso?`)) {
            presos = presos.filter(p => p.id !== id);
            salvarPresos();
            aplicarFiltros();
        }
    };

    // FUNÇÃO DE FILTRO ATUALIZADA
    const aplicarFiltros = (resetPage = true) => {
        if(resetPage) currentPage = 1; // Reseta para a página 1 ao aplicar um novo filtro

        let presosFiltrados = [...presos];
        
        // ... (lógica de filtragem permanece a mesma) ...
        const nomeTermo = filtros.nome.value.toLowerCase();
        if (nomeTermo) {
            presosFiltrados = presosFiltrados.filter(p => p.nome.toLowerCase().includes(nomeTermo));
        }
        if (filtros.local.value) {
            presosFiltrados = presosFiltrados.filter(p => p.unidadePrisional === filtros.local.value);
        }
        if (filtros.regime.value) {
            presosFiltrados = presosFiltrados.filter(p => p.regimeProvavel === filtros.regime.value);
        }
        if (filtros.cor.value) {
            presosFiltrados = presosFiltrados.filter(p => {
                const diasPreso = calcularDiasPreso(p.quandoPrendeu);
                return getStatusCor(diasPreso) === filtros.cor.value;
            });
        }
        const dataInicio = filtros.dataInicio.value;
        const dataFim = filtros.dataFim.value;
        if (dataInicio) {
            presosFiltrados = presosFiltrados.filter(p => p.quandoPrendeu >= dataInicio);
        }
        if (dataFim) {
            presosFiltrados = presosFiltrados.filter(p => p.quandoPrendeu <= dataFim);
        }
        
        renderizarTabela(presosFiltrados);
        return presosFiltrados; // Retorna para uso interno
    };

    Object.values(filtros).forEach(filtro => {
        filtro.addEventListener('input', () => aplicarFiltros());
        filtro.addEventListener('change', () => aplicarFiltros());
    });

    btnLimparFiltros.addEventListener('click', () => {
        Object.values(filtros).forEach(filtro => filtro.value = '');
        aplicarFiltros();
    });

    // Renderização inicial
    aplicarFiltros();
});