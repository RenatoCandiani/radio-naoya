/**
 * Termos de Uso e Política de Privacidade do Rádio Naoya.
 *
 * Escritos para a realidade real do serviço: mantido por UMA pessoa física,
 * desenvolvedor independente, sem empresa. Nada aqui promete o que o serviço
 * não faz — sem garantia de disponibilidade, sem suporte 24h, sem SLA.
 *
 * Isto NÃO é assessoria jurídica. Serve como base honesta; para cobrar de
 * cliente com contrato, vale um advogado revisar.
 */

const WHATSAPP = '5511960758318';
const WHATSAPP_VISIVEL = '(11) 96075-8318';
const EMAIL = 'naoyaradio@gmail.com';
const ATUALIZADO = '28 de setembro de 2026';

function Cabecalho({ titulo, onVoltar }) {
  return (
    <div className="legal-topo">
      <button className="legal-voltar" onClick={onVoltar}>← Voltar ao site</button>
      <h1>{titulo}</h1>
      <p className="legal-data">Atualizado em {ATUALIZADO}</p>
    </div>
  );
}

function Aviso() {
  return (
    <div className="legal-aviso">
      <strong>Quem mantém o Rádio Naoya</strong>
      <p>
        O Rádio Naoya é desenvolvido e mantido por uma pessoa física, de forma
        independente. Não é uma empresa e não tem CNPJ. Isso não muda os seus
        direitos como consumidor, mas é importante que você saiba com quem está
        falando antes de assinar qualquer coisa.
      </p>
      <p>
        Qualquer dúvida, pedido ou reclamação:{' '}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
          WhatsApp {WHATSAPP_VISIVEL}
        </a>{' '}
        ou <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
      </p>
    </div>
  );
}

export function Termos({ onVoltar }) {
  return (
    <div className="legal-pagina">
      <Cabecalho titulo="Termos de Uso" onVoltar={onVoltar} />
      <Aviso />

      <h2>1. O que é o serviço</h2>
      <p>
        O Rádio Naoya cria e hospeda um site para a sua rádio. Você cadastra a
        emissora, e o site fica disponível num endereço próprio dentro do
        radionaoya.com.br. Pelo painel você edita logo, cores, programação,
        locutores, notícias, patrocinadores e o endereço da sua transmissão.
      </p>
      <p>
        O Rádio Naoya <strong>não transmite</strong> o áudio da sua rádio. O site
        apenas aponta para o servidor de streaming que já é seu. Se esse servidor
        sair do ar, o player do site fica sem som, e isso não é um problema do
        site.
      </p>

      <h2>2. Sua conta</h2>
      <ul>
        <li>Você precisa de um e-mail válido e uma senha para criar a conta.</li>
        <li>A senha é sua responsabilidade. Não compartilhe.</li>
        <li>
          O endereço da sua rádio (o "slug", por exemplo
          radionaoya.com.br/?radio=suaradio) <strong>não pode ser trocado</strong>{' '}
          depois de criado, porque isso quebraria todos os links já
          compartilhados com seus ouvintes. O nome que aparece na tela você pode
          mudar quando quiser.
        </li>
        <li>
          Cada rádio tem um dono. Quem criou a conta é quem edita. Se a rádio
          trocar de responsável, fale com o suporte para transferir.
        </li>
      </ul>

      <h2>3. O conteúdo é seu, e a responsabilidade também</h2>
      <p>
        Tudo que você publica é seu: logo, fotos, textos, notícias, programação e
        o áudio que você transmite. Você continua dono disso, e nos dá apenas a
        permissão necessária para exibir esse material no site da sua rádio.
      </p>
      <p>
        Por isso, você é responsável por ter o direito de usar o que publica.
        Isso vale especialmente para:
      </p>
      <ul>
        <li>
          <strong>Fotos de pessoas.</strong> Se publica a foto de um locutor, é
          porque ele autorizou.
        </li>
        <li>
          <strong>Música e áudio.</strong> Direitos autorais e pagamentos ao
          ECAD, ou a quem for devido, são da sua rádio. O Rádio Naoya não
          participa disso.
        </li>
        <li>
          <strong>Notícias.</strong> Texto copiado de outro veículo sem
          autorização é problema seu, não nosso.
        </li>
      </ul>
      <p>
        Não é permitido usar o serviço para conteúdo ilegal, discurso de ódio,
        conteúdo sexual, fraude, ou para se passar por outra emissora.
      </p>

      <h2>4. Planos e pagamento</h2>
      <ul>
        <li>
          <strong>Grátis:</strong> R$ 0. O site funciona, com uma marca d'água
          do Rádio Naoya e sem personalizar cores e fontes.
        </li>
        <li>
          <strong>Básico:</strong> R$ 49 por mês. Tira a marca d'água, libera
          cores, fontes, envio de imagens e domínio próprio.
        </li>
        <li>
          <strong>Premium:</strong> R$ 99 por mês. Tudo do Básico, mais banners
          de publicidade para você vender, e prioridade no suporte.
        </li>
      </ul>
      <p>
        A cobrança é mensal, processada pelo Stripe. Os dados do seu cartão são
        tratados pelo Stripe e não passam pelos nossos servidores.
      </p>
      <p>
        <strong>Cancelamento:</strong> a qualquer momento, sem multa e sem
        fidelidade. Ao cancelar, você continua com o plano pago até o fim do
        período já pago, e depois a rádio volta para o plano grátis. O site não é
        apagado.
      </p>
      <p>
        <strong>Arrependimento:</strong> se você assinou e desistiu em até 7
        dias, tem direito a devolução integral, conforme o artigo 49 do Código
        de Defesa do Consumidor. Basta pedir pelo WhatsApp ou por{' '}
        <a href={`mailto:${EMAIL}`}>e-mail</a>.
      </p>
      <p>
        Se um dia os preços mudarem, quem já é assinante é avisado com pelo menos
        30 dias de antecedência, e pode cancelar antes de a mudança valer.
      </p>

      <h2>5. O que este serviço não promete</h2>
      <p>
        Aqui vale ser direto, porque promessa que não se cumpre é pior que
        promessa que não se faz:
      </p>
      <ul>
        <li>
          <strong>Não há garantia de disponibilidade.</strong> O serviço depende
          de empresas de infraestrutura (Vercel e Supabase). Pode haver
          instabilidade e manutenção. Não existe SLA nem compensação por site
          fora do ar.
        </li>
        <li>
          <strong>O suporte é de uma pessoa só.</strong> A resposta vem assim
          que possível, não em prazo garantido. Não há atendimento 24 horas.
        </li>
        <li>
          <strong>Não garantimos audiência, visitas ou resultado comercial.</strong>
        </li>
        <li>
          <strong>Faça as suas próprias cópias.</strong> Tentamos preservar tudo,
          mas o painel sobrescreve o que você salva, e não existe histórico de
          versões. Guarde por fora a logo, as fotos e os textos importantes.
        </li>
      </ul>

      <h2>6. Encerramento</h2>
      <p>
        Você pode encerrar a conta quando quiser, e pedir a exclusão dos seus
        dados. Peça por <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, que deixa
        registro, ou pelo{' '}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
          WhatsApp do suporte
        </a>.
      </p>
      <p>
        Podemos suspender uma conta que descumpra estes termos, especialmente nos
        casos de conteúdo ilegal ou que prejudique outros usuários. Quando for
        possível, avisamos antes.
      </p>
      <p>
        Se o Rádio Naoya for descontinuado, os usuários serão avisados com pelo
        menos 30 dias de antecedência, com tempo para baixar seu conteúdo, e as
        assinaturas ativas serão canceladas sem cobrança nova.
      </p>

      <h2>7. Mudanças nestes termos</h2>
      <p>
        Estes termos podem mudar. Se a mudança for relevante, avisamos pelo
        e-mail cadastrado ou por aviso no painel. A data no topo desta página
        mostra a última atualização.
      </p>

      <h2>8. Lei aplicável</h2>
      <p>
        Vale a lei brasileira, incluindo o Código de Defesa do Consumidor, o
        Marco Civil da Internet e a Lei Geral de Proteção de Dados.
      </p>

      <div className="legal-rodape-nota">
        Dúvida sobre qualquer ponto acima? Pergunte pelo{' '}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>{' '}
        ou por <a href={`mailto:${EMAIL}`}>e-mail</a>.
        É melhor perguntar antes de assinar.
      </div>
    </div>
  );
}

export function Privacidade({ onVoltar }) {
  return (
    <div className="legal-pagina">
      <Cabecalho titulo="Política de Privacidade" onVoltar={onVoltar} />
      <Aviso />

      <h2>1. Resumo em uma frase</h2>
      <p>
        Coletamos o mínimo para o site da sua rádio funcionar: seu e-mail, o
        conteúdo que você publica e uma contagem de visitas. Não vendemos nada
        disso para ninguém.
      </p>

      <h2>2. O que coletamos</h2>
      <p><strong>Quando você cria a conta:</strong></p>
      <ul>
        <li>E-mail, para identificar a conta e recuperar a senha.</li>
        <li>
          Senha, guardada de forma criptografada pelo serviço de autenticação.
          Nem eu consigo ver a sua senha.
        </li>
      </ul>
      <p><strong>O que você publica:</strong></p>
      <ul>
        <li>
          Nome da rádio, frequência, história, WhatsApp de contato, endereço da
          transmissão, programação, locutores, notícias, patrocinadores e
          imagens que você envia.
        </li>
        <li>
          Atenção: isso é <strong>público</strong>. Qualquer pessoa que abrir o
          site da sua rádio vê esse conteúdo. Não publique o que você não quer
          que seja visto.
        </li>
      </ul>
      <p><strong>Uso do site:</strong></p>
      <ul>
        <li>
          Uma contagem de quantas vezes a página da sua rádio foi aberta, que
          você vê no painel. É um número somado, sem identificar visitante.
        </li>
        <li>
          Não usamos cookie de propaganda, não rastreamos você por outros sites
          e não há Google Analytics, Meta Pixel ou coisa parecida.
        </li>
      </ul>
      <p><strong>Se você assinar um plano pago:</strong></p>
      <ul>
        <li>
          O pagamento é processado pelo Stripe. Os dados do cartão são digitados
          na tela do Stripe e não passam pelos nossos servidores. Guardamos
          apenas um código de identificação da assinatura, para saber que o seu
          plano está ativo.
        </li>
      </ul>

      <h2>3. Com quem os dados são compartilhados</h2>
      <p>
        Não vendemos e não alugamos dados. O serviço usa três empresas de
        infraestrutura, sem as quais ele não funciona:
      </p>
      <ul>
        <li><strong>Supabase</strong> — banco de dados, login e armazenamento das imagens.</li>
        <li><strong>Vercel</strong> — hospedagem do site.</li>
        <li><strong>Stripe</strong> — processamento dos pagamentos.</li>
      </ul>
      <p>
        Essas empresas têm servidores fora do Brasil, ou seja, os seus dados
        trafegam e são guardados no exterior. A LGPD permite isso, e estamos
        informando de forma clara, como ela exige.
      </p>
      <p>
        Também podemos compartilhar dados se uma autoridade determinar
        judicialmente.
      </p>

      <h2>4. Por quanto tempo guardamos</h2>
      <ul>
        <li>Enquanto a sua conta existir.</li>
        <li>
          Se você pedir exclusão, apagamos a conta, o conteúdo e as imagens em
          até 30 dias.
        </li>
        <li>
          Registros de pagamento podem ser guardados por mais tempo, quando a lei
          fiscal exigir.
        </li>
      </ul>

      <h2>5. Seus direitos</h2>
      <p>Pela LGPD, você pode a qualquer momento:</p>
      <ul>
        <li>Saber quais dados seus existem aqui;</li>
        <li>Corrigir dado errado ou incompleto;</li>
        <li>Pedir uma cópia do seu conteúdo;</li>
        <li>Pedir a exclusão da conta e dos dados;</li>
        <li>Retirar o consentimento, o que encerra o uso do serviço.</li>
      </ul>
      <p>
        Para exercer qualquer um deles, é só pedir por{' '}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>, que deixa registro, ou pelo{' '}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
          WhatsApp {WHATSAPP_VISIVEL}
        </a>. A resposta vem em até 15 dias.
      </p>

      <h2>6. Segurança</h2>
      <p>O que é feito para proteger os dados:</p>
      <ul>
        <li>Todo o site roda em HTTPS, com o tráfego criptografado.</li>
        <li>Senhas nunca são guardadas em texto legível.</li>
        <li>
          Cada dono só consegue editar a própria rádio, controlado no banco de
          dados e não apenas na tela.
        </li>
      </ul>
      <p>
        Mesmo assim, nenhum sistema é totalmente imune. Se acontecer um incidente
        que ponha seus dados em risco, você será avisado.
      </p>

      <h2>7. Menores de idade</h2>
      <p>
        O serviço é destinado a quem tem 18 anos ou mais, ou a menor com
        autorização do responsável, já que envolve assinatura e pagamento.
      </p>

      <h2>8. Mudanças nesta política</h2>
      <p>
        Se mudar algo relevante, avisamos pelo e-mail cadastrado ou por aviso no
        painel. A data no topo mostra a última atualização.
      </p>

      <div className="legal-rodape-nota">
        Quer saber exatamente que dados seus estão guardados? Pergunte pelo{' '}
        <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp</a>{' '}
        ou por <a href={`mailto:${EMAIL}`}>e-mail</a> que eu te mando.
      </div>
    </div>
  );
}
