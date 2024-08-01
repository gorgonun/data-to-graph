# Data2Graph
Continuação do Trabalho de conclusão do curso de Sistemas de Informação Json2Graph

## Makefile

Para facilitar a configuração do Docker Compose e possibilitar a correta comunicação entre os containers e o script, foi criado um Makefile na raiz do repositório com as configurações padrões para teste local, sendo elas possíveis de modificação por meio dos parâmetros.

As configurações são baseadas em variáveis de ambiente. Para garantir a separação das informações relevantes à aplicação, são criados diversos arquivos `.env` com as configurações que serão utilizadas. Para o MongoDB será criado o arquivo `.env.mongodb`, para o MongoExpress `.env.mongo_express`, para o Mongo Seed, `.env.mongo_seed`, para o Neo4J `.env.neo4j`. O arquivo na raiz são as configurações para o script de migração de dados.

### Parâmetros

- **profile**: O perfil escolhido para rodar os scripts de infraestrutura. As opções são `basic` e `full`.
- **clean**: Caso verdadeiro, irá apagar as configurações prévias nos arquivos de variáveis de ambiente e irá recriá-los conforme as configurações especificadas.
- **mongodb_root_username**: Nome de usuário do administrador do MongoDB. (padrão: `root`)
- **mongodb_root_password**: Senha do administrador do MongoDB. (padrão: `root`)
- **mongodb_database**: Nome do banco de dados. (padrão: `test`)
- **mongodb_collection**: Nome da coleção. (padrão: `nyt`)
- **mongodb_url**: URL de conexão com o MongoDB. (padrão: `mongodb://$(mongodb_root_username):$(mongodb_root_password)@mongodb:27017/$(mongodb_database)?authSource=admin`)
- **neo4j_user**: O nome de usuário do banco de dados Neo4j. (padrão: `neo4j`)
- **neo4j_password**: A senha do banco de dados Neo4j. (padrão: `neo4j`)

### Arquivo .env.mongodb

- **MONGO_INITDB_ROOT_USERNAME**: Nome de usuário root
- **MONGO_INITDB_ROOT_PASSWORD**: Senha de usuário root
- **MONGO_INITDB_DATABASE**: Database

### Arquivo .env.mongo_express

- **ME_CONFIG_MONGODB_URL**: URL de conexão do MongoDB
- **ME_CONFIG_MONGODB_ADMINUSERNAME**: Nome de usuário do administrador
- **ME_CONFIG_MONGODB_ADMINPASSWORD**: Senha do administrador

### Arquivo .env.neo4j

- **NEO4J_AUTH**: Usuário e senha do Neo4J
- **NEO4J_dbms_security_auth__minimum__password__length**: Configuração de tamanho mínimo da senha. Como essa configuração é para teste, não produção, então foi flexibilizado para tamanho 1 (mínimo).

### Arquivo .env.mongo_seed

- **MONGO_SEED_MONGODB_URL**: URL de conexão do MongoDB
- **MONGO_SEED_MONGODB_COLLECTION**: Coleção a ser populada

### Arquivo .env

- **MONGODB_DATA**: Pasta de dados do MongoDB
- **NEO4J_DATA**: Pasta de dados do Neo4J
- **MONGODB_URL**: URL de conexão do MongoDB
- **MONGODB_COLLECTION**: Coleção a ser testada
- **MONGODB_DATABASE**: Database
- **NEO4J_URL**: URL de conexão do Neo4J
- **NEO4J_USER**: Usuário do Neo4J
- **NEO4J_PASSWORD**: Senha do Neo4J

### Comandos

- **write_env_values**: Escreve os valores das variáveis de ambiente nos arquivos .env
- **setup_env_file**: Escreve os valores das variáveis de ambiente nos arquivos .env, apagando os arquivos .env antigos se `clean = true`
- **start_infra**: Inicia a infraestrutura com o Docker Compose com as configurações definidas.
- **stop_infra**: Para a infraestrutura com o Docker Compose.
- **run**: Inicia a execução do script de migração.

## Perfis

No Docker Compose estão configurados dois perfis de execução: `basic` e `full`. No perfil `basic` estão configurados os containers do MongoDB Seed, MongoDB e o Neo4J. No perfil `full` estão todos os containers do `basic`, com a adição do MongoExpress para facilitar a visualização e depuração dos dados disponibilizados no MongoDB.

### Perfil basic

O perfil `basic` tem a intenção de ser o básico para o teste local. Por conta disso apenas o essencial é configurado, sendo ele o banco de origem, destino e os dados para teste.

O MongoDB está disponível na porta 27017 e os seus dados são salvos na pasta local `data/mongodb`, assim permitindo a persistência mesmo depois do fim do container.

O MongoSeed utiliza de scripts para popular a instância do MongoDB. Para isso ele utiliza uma imagem do próprio MongoDB, que possui a interface de comando. Os exemplos estão disponíveis na pasta local `mongo-seed`, junto com o script bash para popular o banco.

O Admin do Neo4J está disponível na porta 7474, sendo a porta do Bolt a padrão 7687. Seus dados são salvos na pasta local `data/neo4j`, assim permitindo a persistência mesmo depois do fim do container.

### Perfil full

O perfil `full` tem a intenção de ser o necessário para depuração dos testes. Por conta disso foi disponibilizado o MongoExpress, já que por padrão a imagem do Mongo não possui interface web para administração.

O MongoExpress está disponível na porta 8081 e pode ser utilizado para visualizar o estado do banco, suas métricas e dados conforme o necessário.

