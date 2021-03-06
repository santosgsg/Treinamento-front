angular.module("hackaton-stefanini").controller("PessoaIncluirAlterarController", 
PessoaIncluirAlterarController)
.directive("selectNgFiles", function() {
    return {
        require: "ngModel",
        link: function postLink(scope,elem,attrs,ngModel) {
        elem.on("change", function(e) {            
            var files = elem[0].files;
            ngModel.$setViewValue(files);

            var reader = new FileReader();
            reader.onload = (function() {
                return function(e) {
                var binaryData = e.target.result;
                
                var base64String = window.btoa(binaryData);
                vm.preImagem = base64String;
                document.getElementById("preview").src = 'data:image/png;base64,' + base64String;
                };
            })(files[0]);
            
            reader.readAsBinaryString(files[0]);
                });
            }
        }
    });
PessoaIncluirAlterarController.$inject = [
    "$rootScope",
    "$scope",
    "$location",
    "$q",
    "$filter",
    "$routeParams",
    "HackatonStefaniniService"];

function PessoaIncluirAlterarController(
    $rootScope,
    $scope,
    $location,
    $q,
    $filter,
    $routeParams,
    HackatonStefaniniService) {

    // document.getElementById('files').addEventListener('change', openFiles, false);

    // function openFiles(evt){
    //     var files = evt.target.files;
    
    //     for (var i = 0, len = files.length; i < len; i++) {
    //         var file = files[i];
    
    //         var reader = new FileReader();
    
    //         reader.onload = (function(f) {
    //             return function(e) {
    //                 // Here you can use `e.target.result` or `this.result`
    //                 // and `f.name`.
    //             };
    //         })(file);
            
    //         reader.readAsText(file);
    //     }
    // }

    // vm.processFiles = function(evt){
    //     console.log('Chamou: ', evt);
    //     var file = evt.target.files[0];
    //     var fileReader = new FileReader();
    //         fileReader.onload = function (event) {
    //         var uri = event.target.result;
    //             vm.base64String = window.btoa(uri);
    //         };
    //         fileReader.readAsDataURL(file);
    //   };
    

    /**ATRIBUTOS DA TELA */
    vm = this;
    vm.preImagem = '';
    vm.pessoa = {
        id: null,
        nome: "",
        email: "",
        dataNascimento: null,
        imagem: {
            nome: "",
            tipo: "",
            base64: ""
        },
        enderecos: [],
        perfils: [],
        situacao: false
    };
    
    vm.enderecoDefault = {
        id: null,
        idPessoa: null,
        cep: "",
        uf: "",
        localidade: "", 
        bairro: "",
        logradouro: "",
        complemento: ""
    };
    
    vm.modalCep ={
        invalid: false,
        successfulQuery: false
    }

    vm.inputImageArray = []

    vm.listarPerfilSelecionado = []

    vm.urlEndereco = "http://localhost:8080/treinamento/api/enderecos/";
    vm.urlPerfil = "http://localhost:8080/treinamento/api/perfil/";
    vm.urlPessoa = "http://localhost:8080/treinamento/api/pessoas/";

    /**METODOS DE INICIALIZACAO */
    vm.init = function () {

        vm.tituloTela = "Cadastrar Pessoa";
        vm.acao = "Cadastrar";

        vm.tituloModal = "Cadastrar Endereço"
        vm.acaoModal = "Cadastrar"

        /**Recuperar a lista de perfil */
        vm.listar(vm.urlPerfil).then(
            function (response) {
                if (response !== undefined) {
                    
                    vm.listaPerfil = response;
                    if ($routeParams.idPessoa) {
                        vm.tituloTela = "Editar Pessoa";
                        vm.acao = "Editar";

                        vm.recuperarObjetoPorIDURL($routeParams.idPessoa, vm.urlPessoa).then(
                            function (pessoaRetorno) {
                                if (pessoaRetorno !== undefined) {
                                    vm.pessoa = pessoaRetorno;
                                    vm.pessoa.dataNascimento = vm.formataDataTela(pessoaRetorno.dataNascimento);
                                    vm.listarPerfilSelecionado = vm.pessoa.perfils;
                                    vm.enderecos = vm.pessoa.enderecos;
                                    
                                    if(vm.pessoa.imagem) {
                                        
                                        vm.inputImageArray.push({ "name": vm.pessoa.imagem.nome});
                                        document.getElementById("preview").src = 'data:image/png;base64,' + vm.pessoa.imagem.base64;
                                    } else {
                                        vm.pessoa.imagem = {nome: "", tipo: "", base64: ""}
                                    }
                                }
                            }
                        );
                    }
                }
            }
        );
    };

    /**METODOS DE TELA */
    vm.cancelar = function () {
        vm.retornarTelaListagem();
    };

    vm.retornarTelaListagem = function () {
        $location.path("listarPessoas");
    };

    vm.adicionarPerfil = function() {                                        
        angular.forEach(vm.listaPerfil, function (perfilValue, perfilValuekey){
            if(pessoaPerfilValue.id == vm.perfil){
                perfilValue.nome = pessoaPerfilValue.nome + ' (SELECIONADO)';
                return;
            }
        });
    }

    vm.abrirModal = function (endereco) {        
        vm.enderecoModal = angular.copy(vm.enderecoDefault);

        if (endereco !== undefined){
            vm.enderecoModal = endereco;

            if (vm.pessoa.enderecos.length === 0)
            vm.pessoa.enderecos.push(vm.enderecoModal);
        }
        $("#modalEndereco").modal();
    };

    vm.limparTela = function () {
        $("#modalEndereco").modal("toggle");
        vm.endereco = undefined;
    };

    vm.adicionarEndereco = function () {
        vm.pessoa.enderecos.push(vm.enderecoModal);
        
        $("#modalEndereco").modal("toggle");
    };

    vm.incluir = function () {
        vm.pessoa.dataNascimento = vm.formataDataJava(vm.pessoa.dataNascimento);
        if(vm.inputImageArray != 0){
            console.log(vm.inputImageArray);
            vm.pessoa.imagem.nome = vm.inputImageArray[0].name;
            vm.pessoa.imagem.tipo = vm.inputImageArray[0].type;
            vm.pessoa.imagem.base64 = vm.preImagem;
        }
        var objetoDados = angular.copy(vm.pessoa);
        // var listaEndereco = [];
        // angular.forEach(objetoDados.enderecos, function (value, key) {
        //     listaEndereco.push(angular.copy(value));
        // });

        // objetoDados.enderecos = listaEndereco;
        if (vm.perfil){

            var isNovoPerfil = true;
            
            angular.forEach(objetoDados.perfils, function (value, key) {
                if (value.id === vm.perfil.id) {
                    isNovoPerfil = false;
                }
            });
            
            objetoDados.perfils.push(vm.perfil);
        }
        if (vm.acao == "Cadastrar") {
            
            vm.salvar(vm.urlPessoa, objetoDados).then(
                function (pessoaRetorno) {
                    vm.retornarTelaListagem();
                });
        } else if (vm.acao == "Editar") {
            vm.alterar(vm.urlPessoa, objetoDados).then(
                function (pessoaRetorno) {
                    vm.retornarTelaListagem();
                });
        }
    };

    vm.remover = function (objeto, tipo) {

        var url = vm.urlPessoa + objeto.id;
        if (tipo === "ENDERECO")
            url = vm.urlEndereco + objeto.id;

        vm.excluir(url).then(
            function (ojetoRetorno) {
                vm.retornarTelaListagem();
            });
    };

    /**METODOS DE SERVICO */
    vm.recuperarObjetoPorIDURL = function (id, url) {

        var deferred = $q.defer();
        HackatonStefaniniService.listarId(url + id).then(
            function (response) {
                if (response.data !== undefined)
                    deferred.resolve(response.data);
                else
                    deferred.resolve(enderecoDefault);
            }
        );
        return deferred.promise;
    };

    vm.listar = function (url) {

        var deferred = $q.defer();
        HackatonStefaniniService.listar(url).then(
            function (response) {
                if (response.data !== undefined) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.salvar = function (url, objeto) {

        var deferred = $q.defer();
        var obj = JSON.stringify(objeto);
        HackatonStefaniniService.incluir(url, obj).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.alterar = function (url, objeto) {

        var deferred = $q.defer();
        var obj = JSON.stringify(objeto);
        HackatonStefaniniService.alterar(url, obj).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    vm.excluir = function (url, objeto) {

        var deferred = $q.defer();
        HackatonStefaniniService.excluir(url).then(
            function (response) {
                if (response.status == 200) {
                    deferred.resolve(response.data);
                }
            }
        );
        return deferred.promise;
    }

    /**METODOS AUXILIARES */
    vm.formataDataJava = function (data) {
        let dia = data.slice(0, 2);
        let mes = data.slice(2, 4); 
        let ano = data.slice(4, 8);
        
        return new Date(ano, mes - 1 , dia);
    };

    vm.formataDataTela = function (data) {
        var ano = data.slice(0, 4);
        var mes = data.slice(5, 7);
        var dia = data.slice(8, 10);

        return dia + mes + ano;
    }

    vm.buscarCEP = function (){
        let cep = vm.enderecoModal.cep;
        const validacep = /^[0-9]{8}$/;
        
        if(validacep.test(cep)) {
            
            HackatonStefaniniService.buscarCEP(vm.urlEndereco + 'buscarCep/' + cep).then(function (res) {
                if (res.status == 200) {
                    
                    vm.modalCep.successfulQuery = true;
                    vm.modalCep.invalid = false;
                    vm.enderecoModal.uf = angular.copy(res.data.uf);
                    vm.enderecoModal.bairro = angular.copy(res.data.bairro);
                    vm.enderecoModal.localidade = angular.copy(res.data.localidade);
                    vm.enderecoModal.logradouro = angular.copy(res.data.logradouro);
                }
            });
        } else {
            vm.modalCep.invalid = true;
            vm.modalCep.successfulQuery = false;
        }
    }

    vm.listaUF = [
        { "id": "RO", "desc": "RO" },
        { "id": "AC", "desc": "AC" },
        { "id": "AM", "desc": "AM" },
        { "id": "RR", "desc": "RR" },
        { "id": "PA", "desc": "PA" },
        { "id": "AP", "desc": "AP" },
        { "id": "TO", "desc": "TO" },
        { "id": "MA", "desc": "MA" },
        { "id": "PI", "desc": "PI" },
        { "id": "CE", "desc": "CE" },
        { "id": "RN", "desc": "RN" },
        { "id": "PB", "desc": "PB" },
        { "id": "PE", "desc": "PE" },
        { "id": "AL", "desc": "AL" },
        { "id": "SE", "desc": "SE" },
        { "id": "BA", "desc": "BA" },
        { "id": "MG", "desc": "MG" },
        { "id": "ES", "desc": "ES" },
        { "id": "RJ", "desc": "RJ" },
        { "id": "SP", "desc": "SP" },
        { "id": "PR", "desc": "PR" },
        { "id": "SC", "desc": "SC" },
        { "id": "RS", "desc": "RS" },
        { "id": "MS", "desc": "MS" },
        { "id": "MT", "desc": "MT" },
        { "id": "GO", "desc": "GO" },
        { "id": "DF", "desc": "DF" }
    ];

}
