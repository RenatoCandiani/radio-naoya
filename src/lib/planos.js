/**
 * Definição dos planos e suas features.
 */

export const PLANOS = {
  free: {
    nome: 'Grátis',
    preco: 0,
    features: {
      marcaDagua: true,        // Mostra "Feito com Rádio Naoya"
      coresCustom: false,      // Não pode mudar cores
      fontesCustom: false,     // Não pode mudar fontes
      uploadImagens: false,    // Sem upload (usa URLs externas)
      dominioCustom: false,    // Só subdomínio da plataforma
      bannersPremium: false,   // Sem banners de monetização
      suportePrioritario: false,
      noticiasIlimitadas: true,
      programacaoIlimitada: true,
      locutoresIlimitados: true,
    },
  },
  basic: {
    nome: 'Básico',
    preco: 49,
    features: {
      marcaDagua: false,
      coresCustom: true,
      fontesCustom: true,
      uploadImagens: true,
      dominioCustom: true,
      bannersPremium: false,
      suportePrioritario: false,
      noticiasIlimitadas: true,
      programacaoIlimitada: true,
      locutoresIlimitados: true,
    },
  },
  premium: {
    nome: 'Premium',
    preco: 99,
    features: {
      marcaDagua: false,
      coresCustom: true,
      fontesCustom: true,
      uploadImagens: true,
      dominioCustom: true,
      bannersPremium: true,
      suportePrioritario: true,
      noticiasIlimitadas: true,
      programacaoIlimitada: true,
      locutoresIlimitados: true,
    },
  },
};

/**
 * Verifica se uma feature está disponível pro plano dado.
 */
export function temFeature(plano, feature) {
  const config = PLANOS[plano] || PLANOS.free;
  return config.features[feature] ?? false;
}

/**
 * Retorna o nome do plano mínimo necessário pra uma feature.
 */
export function planoNecessario(feature) {
  if (PLANOS.free.features[feature]) return 'free';
  if (PLANOS.basic.features[feature]) return 'basic';
  return 'premium';
}
