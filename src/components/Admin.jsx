import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { temFeature, planoNecessario } from '../lib/planos';
import { UpgradeBadge } from './UpgradeBadge';
import {
  NOTICIAS as DEFAULT_NOTICIAS,
  PROGRAMACAO as DEFAULT_PROGRAMACAO,
  PATROCINADORES as DEFAULT_PATROCINADORES,
  BANNERS_PREMIUM as DEFAULT_BANNERS,
} from '../data/config';

const DIAS_LABEL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ============================================================
// Hook para carregar dados da rádio do Supabase
// ============================================================
export function useAdminData(fallbackNoticias, fallbackProgramacao, fallbackPatrocinadores, fallbackBanner) {
  return {
    noticias: fallbackNoticias || [],
    programacao: fallbackProgramacao || {},
    patrocinadores: fallbackPatrocinadores || [],
    banner: fallbackBanner || [],
  };
}

// ============================================================
// PAINEL ADMIN COM AUTENTICAÇÃO REAL
// ============================================================
export function Admin({ onClose, radioSlug, plano = 'free' }) {
  const { user, loading: authLoading, signIn, signUp, signOut, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');

  // Admin state
  const [aba, setAba] = useState('dashboard');
  const [salvo, setSalvo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [radioId, setRadioId] = useState(null);

  // Dados editáveis
  const [noticias, setNoticias] = useState([]);
  const [programacao, setProgramacao] = useState({});
  const [patrocinadores, setPatrocinadores] = useState([]);
  const [locutores, setLocutores] = useState([]);
  const [planosComerciais, setPlanosComerciais] = useState([]);
  const [banners, setBanners] = useState([]);
  const [radioInfo, setRadioInfo] = useState({});
  const [diaSel, setDiaSel] = useState(new Date().getDay());

  // Carrega dados da rádio quando logado
  useEffect(() => {
    if (!user) return;
    loadRadioData();
  }, [user]);

  async function loadRadioData() {
    const slug = radioSlug || 'maraja';

    // Busca rádio
    const { data: radio } = await supabase
      .from('radios')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!radio) return;
    setRadioId(radio.id);
    setRadioInfo(radio);

    // Se a rádio não tem owner, vincula ao usuário logado
    if (!radio.owner_id && user) {
      await supabase.from('radios').update({ owner_id: user.id }).eq('id', radio.id);
    }

    // Carrega programação
    const { data: prog } = await supabase
      .from('programacao')
      .select('*')
      .eq('radio_id', radio.id)
      .order('ordem');

    if (prog) {
      const grouped = {};
      prog.forEach((p) => {
        if (!grouped[p.dia_semana]) grouped[p.dia_semana] = [];
        grouped[p.dia_semana].push({ id: p.id, time: p.horario, show: p.programa, locutor: p.locutor });
      });
      setProgramacao(grouped);
    }

    // Carrega locutores
    const { data: locs } = await supabase
      .from('locutores')
      .select('*')
      .eq('radio_id', radio.id);
    if (locs) setLocutores(locs);

    // Carrega notícias
    const { data: nots } = await supabase
      .from('noticias')
      .select('*')
      .eq('radio_id', radio.id)
      .order('created_at', { ascending: false });
    if (nots) setNoticias(nots);

    // Carrega patrocinadores
    const { data: pats } = await supabase
      .from('patrocinadores')
      .select('*')
      .eq('radio_id', radio.id)
      .order('ordem');
    if (pats) setPatrocinadores(pats);

    // Carrega planos comerciais
    const { data: plComerciais } = await supabase
      .from('planos_comerciais')
      .select('*')
      .eq('radio_id', radio.id)
      .order('ordem');
    if (plComerciais) setPlanosComerciais(plComerciais);

    // Carrega banners
    const { data: bans } = await supabase
      .from('banners')
      .select('*')
      .eq('radio_id', radio.id)
      .order('ordem');
    if (bans) setBanners(bans);
  }

  // ---- Login ----
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMsg('');

    if (isSignUp) {
      const u = await signUp(email, senha);
      if (u) setLoginMsg('Conta criada! Verifique seu email para confirmar.');
    } else {
      await signIn(email, senha);
    }
    setLoginLoading(false);
  };

  // ---- Salvar tudo ----
  const handleSalvar = async () => {
    if (!radioId) return;
    setSaving(true);

    try {
      // Salva info da rádio
      await supabase.from('radios').update({
        nome: radioInfo.nome,
        frequencia: radioInfo.frequencia,
        whatsapp: radioInfo.whatsapp,
        historia: radioInfo.historia,
        logo_url: radioInfo.logo_url,
        tema: radioInfo.tema,
        updated_at: new Date().toISOString(),
      }).eq('id', radioId);

      // Salva programação — deleta e reinsere
      await supabase.from('programacao').delete().eq('radio_id', radioId);
      const progInserts = [];
      Object.entries(programacao).forEach(([dia, items]) => {
        items.forEach((item, idx) => {
          progInserts.push({
            radio_id: radioId,
            dia_semana: parseInt(dia),
            horario: item.time,
            programa: item.show,
            locutor: item.locutor || '',
            ordem: idx,
          });
        });
      });
      if (progInserts.length > 0) {
        await supabase.from('programacao').insert(progInserts);
      }

      // Salva notícias — deleta e reinsere
      await supabase.from('noticias').delete().eq('radio_id', radioId);
      if (noticias.length > 0) {
        await supabase.from('noticias').insert(
          noticias.map((n) => ({
            radio_id: radioId,
            titulo: n.titulo,
            resumo: n.resumo || '',
            img_url: n.img_url || n.img || '',
            destaque: !!n.destaque,
          }))
        );
      }

      // Salva patrocinadores — deleta e reinsere
      await supabase.from('patrocinadores').delete().eq('radio_id', radioId);
      if (patrocinadores.length > 0) {
        await supabase.from('patrocinadores').insert(
          patrocinadores.map((p, idx) => ({
            radio_id: radioId,
            nome: p.nome,
            slogan: p.slogan || '',
            cor: p.cor || '#1565C0',
            href: p.href || '#',
            emoji: p.emoji || '⭐',
            ordem: idx,
          }))
        );
      }

      // Salva locutores — deleta e reinsere
      await supabase.from('locutores').delete().eq('radio_id', radioId);
      if (locutores.length > 0) {
        await supabase.from('locutores').insert(
          locutores.map((l) => ({
            radio_id: radioId,
            nome: l.nome,
            funcao: l.funcao || '',
            programas: l.programas || [],
            descricao: l.descricao || '',
            foto_url: l.foto_url || '',
          }))
        );
      }

      // Salva planos comerciais — deleta e reinsere
      await supabase.from('planos_comerciais').delete().eq('radio_id', radioId);
      if (planosComerciais.length > 0) {
        await supabase.from('planos_comerciais').insert(
          planosComerciais.map((p, idx) => ({
            radio_id: radioId,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: p.preco,
            itens: p.itens || [],
            destaque: !!p.destaque,
            ordem: idx,
          }))
        );
      }

      // Salva banners — deleta e reinsere
      await supabase.from('banners').delete().eq('radio_id', radioId);
      if (banners.length > 0) {
        await supabase.from('banners').insert(
          banners.map((b, idx) => ({
            radio_id: radioId,
            titulo: b.titulo,
            subtitulo: b.subtitulo || '',
            cta: b.cta || '',
            href: b.href || '#',
            cor: b.cor || '#1565C0',
            cor_texto: b.cor_texto || '#ffffff',
            tag: b.tag || '',
            imagem_url: b.imagem_url || '',
            ordem: idx,
          }))
        );
      }

      setSalvo(true);
      setTimeout(() => setSalvo(false), 2500);
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- Upload de imagem ----
  const uploadImage = async (file, folder = 'general') => {
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}/${folder}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert('Erro no upload: ' + error.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // ---- Notícias helpers ----
  const updateNoticia = (idx, campo, valor) => {
    const arr = [...noticias];
    arr[idx] = { ...arr[idx], [campo]: valor };
    setNoticias(arr);
  };
  const addNoticia = () => setNoticias([...noticias, { titulo: '', resumo: '', img_url: '', destaque: false }]);
  const removeNoticia = (idx) => setNoticias(noticias.filter((_, i) => i !== idx));

  // ---- Programação helpers ----
  const updateProg = (dia, idx, campo, valor) => {
    const dia_arr = [...(programacao[dia] || [])];
    dia_arr[idx] = { ...dia_arr[idx], [campo]: valor };
    setProgramacao({ ...programacao, [dia]: dia_arr });
  };
  const addProg = (dia) => {
    const arr = [...(programacao[dia] || [])];
    arr.push({ time: '00:00 – 00:00', show: '', locutor: '' });
    setProgramacao({ ...programacao, [dia]: arr });
  };
  const removeProg = (dia, idx) => {
    const arr = (programacao[dia] || []).filter((_, i) => i !== idx);
    setProgramacao({ ...programacao, [dia]: arr });
  };

  // ---- Patrocinadores helpers ----
  const updatePat = (idx, campo, valor) => {
    const arr = [...patrocinadores];
    arr[idx] = { ...arr[idx], [campo]: valor };
    setPatrocinadores(arr);
  };
  const addPat = () => setPatrocinadores([...patrocinadores, { nome: '', slogan: '', cor: '#1565C0', href: '#', emoji: '⭐' }]);
  const removePat = (idx) => setPatrocinadores(patrocinadores.filter((_, i) => i !== idx));

  // ---- Locutores helpers ----
  const updateLocutor = (idx, campo, valor) => {
    const arr = [...locutores];
    arr[idx] = { ...arr[idx], [campo]: valor };
    setLocutores(arr);
  };
  const addLocutor = () => setLocutores([...locutores, { nome: '', funcao: '', programas: [], descricao: '', foto_url: '' }]);
  const removeLocutor = (idx) => setLocutores(locutores.filter((_, i) => i !== idx));

  const handleLocutorFoto = async (idx, file) => {
    const url = await uploadImage(file, 'locutores');
    if (url) updateLocutor(idx, 'foto_url', url);
  };

  // ============================================================
  // TELA DE LOGIN
  // ============================================================
  if (authLoading) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <button className="admin-close" onClick={onClose} aria-label="Fechar">✕</button>
          <div className="admin-login-logo">📻</div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-overlay">
        <div className="admin-login">
          <button className="admin-close" onClick={onClose} aria-label="Fechar">✕</button>
          <div className="admin-login-logo">🎙️</div>
          <h2>Painel Admin</h2>
          <p>{isSignUp ? 'Criar conta' : 'Entrar com email e senha'}</p>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              autoFocus
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`admin-input${authError ? ' erro' : ''}`}
              required
              minLength={6}
            />
            {authError && <span className="admin-erro">{authError}</span>}
            {loginMsg && <span className="admin-msg-success">{loginMsg}</span>}
            <button type="submit" className="admin-btn-primario" disabled={loginLoading}>
              {loginLoading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>
          <button
            className="admin-btn-link"
            onClick={() => { setIsSignUp(!isSignUp); setLoginMsg(''); }}
          >
            {isSignUp ? 'Já tenho conta → Entrar' : 'Criar conta nova'}
          </button>
          {!isSignUp && (
            <button
              className="admin-btn-link"
              style={{ marginTop: 4, fontSize: '0.78rem', color: '#888' }}
              onClick={async () => {
                if (!email) { setLoginMsg('Digite seu email primeiro.'); return; }
                const { error } = await supabase.auth.resetPasswordForEmail(email);
                if (error) { setLoginMsg(error.message); }
                else { setLoginMsg('Email de recuperação enviado! Verifique sua caixa de entrada.'); }
              }}
            >
              Esqueci minha senha
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // PAINEL PRINCIPAL
  // ============================================================
  return (
    <div className="admin-overlay">
      <div className="admin-panel">

        {/* Header */}
        <div className="admin-header">
          <div className="admin-header-info">
            <span className="admin-header-icon">🎙️</span>
            <div>
              <strong>Painel Admin</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="admin-header-actions">
            <button
              className={`admin-btn-salvar${salvo ? ' salvo' : ''}`}
              onClick={handleSalvar}
              disabled={saving}
            >
              {salvo ? '✓ Salvo!' : saving ? 'Salvando...' : '💾 Salvar'}
            </button>
            <button className="admin-btn-logout" onClick={signOut} title="Sair">
              🚪
            </button>
            <button className="admin-close" onClick={onClose} aria-label="Fechar">✕</button>
          </div>
        </div>

        {/* Abas */}
        <div className="admin-abas-wrapper">
          <button className="admin-abas-arrow admin-abas-arrow-left" onClick={() => { document.querySelector('.admin-abas').scrollBy({ left: -120, behavior: 'smooth' }); }}>‹</button>
          <div className="admin-abas">
            {[
              { id: 'dashboard',      label: '📊 Dashboard' },
              { id: 'aparencia',      label: '🎨 Aparência' },
              { id: 'noticias',       label: '📰 Notícias' },
              { id: 'programacao',    label: '🕐 Programação' },
              { id: 'locutores',      label: '🎙️ Locutores' },
              { id: 'historia',       label: '📖 História' },
              { id: 'patrocinadores', label: '✨ Patrocinadores' },
              { id: 'comercial',      label: '💼 Comercial' },
              ...(plano === 'premium' ? [{ id: 'banners', label: '🖼️ Banners' }] : []),
            ].map((a) => (
              <button
                key={a.id}
                className={`admin-aba${aba === a.id ? ' ativa' : ''}`}
                onClick={() => setAba(a.id)}
              >
                {a.label}
              </button>
            ))}
          </div>
          <button className="admin-abas-arrow admin-abas-arrow-right" onClick={() => { document.querySelector('.admin-abas').scrollBy({ left: 120, behavior: 'smooth' }); }}>›</button>
        </div>

        {/* Conteúdo */}
        <div className="admin-conteudo">

          {/* ===== DASHBOARD ===== */}
          {aba === 'dashboard' && (
            <div>
              <div className="admin-secao-header">
                <h3>Dashboard</h3>
              </div>

              {/* Cards de stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                <div className="admin-card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--cor-primaria)' }}>
                    {radioInfo.views ?? 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, marginTop: 4 }}>VISUALIZAÇÕES</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--cor-primaria)', textTransform: 'capitalize' }}>
                    {plano}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, marginTop: 4 }}>PLANO ATUAL</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cor-primaria)' }}>
                    {radioInfo.created_at ? new Date(radioInfo.created_at).toLocaleDateString('pt-BR') : '—'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 600, marginTop: 4 }}>CRIADO EM</div>
                </div>
              </div>

              {/* Upgrade de plano */}
              {plano !== 'premium' && (
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)', color: '#fff', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>🚀 Fazer upgrade</h4>
                  <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: 16 }}>
                    {plano === 'free'
                      ? 'Libere cores, fontes, upload e remova a marca d\'água.'
                      : 'Libere banners de monetização e suporte prioritário.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    {plano === 'free' && (
                      <button
                        className="landing-plano-btn"
                        style={{ background: '#fff', color: '#1565C0', width: 'auto', padding: '10px 20px' }}
                        onClick={async () => {
                          const res = await fetch('/api/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plano: 'basic', radioSlug: radioSlug, email: user?.email }),
                          });
                          const data = await res.json();
                          if (data.url) window.location.href = data.url;
                          else alert(data.error || 'Erro ao criar checkout');
                        }}
                      >
                        Básico — R$49/mês
                      </button>
                    )}
                    <button
                      className="landing-plano-btn"
                      style={{ background: plano === 'free' ? 'rgba(255,255,255,0.2)' : '#fff', color: plano === 'free' ? '#fff' : '#1565C0', width: 'auto', padding: '10px 20px', border: '1px solid rgba(255,255,255,0.4)' }}
                      onClick={async () => {
                        const res = await fetch('/api/checkout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ plano: 'premium', radioSlug: radioSlug, email: user?.email }),
                        });
                        const data = await res.json();
                        if (data.url) window.location.href = data.url;
                        else alert(data.error || 'Erro ao criar checkout');
                      }}
                    >
                      Premium — R$99/mês
                    </button>
                  </div>
                </div>
              )}

              {/* Info da rádio */}
              <div className="admin-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>📻 Informações da Rádio</h4>

                {/* Logo */}
                <label className="admin-field-label">Logo da Rádio</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                  {radioInfo.logo_url ? (
                    <img src={radioInfo.logo_url} alt="Logo" style={{ height: 50, borderRadius: 8 }} />
                  ) : (
                    <div style={{ height: 50, width: 50, background: '#eee', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '0.75rem' }}>Sem logo</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                    <input
                      className="admin-input"
                      value={radioInfo.logo_url || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, logo_url: e.target.value })}
                      placeholder="URL da logo ou faça upload →"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <label className="admin-btn-upload">
                      📁
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const url = await uploadImage(file, 'logos');
                          if (url) setRadioInfo({ ...radioInfo, logo_url: url });
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="admin-prog-row">
                  <div style={{ flex: 2 }}>
                    <label className="admin-field-label">Nome</label>
                    <input
                      className="admin-input"
                      value={radioInfo.nome || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, nome: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Frequência</label>
                    <input
                      className="admin-input"
                      value={radioInfo.frequencia || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, frequencia: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-prog-row">
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">WhatsApp</label>
                    <input
                      className="admin-input"
                      value={radioInfo.whatsapp || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, whatsapp: e.target.value })}
                      placeholder="5511999999999"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">URL dos Metadados</label>
                    <input
                      className="admin-input"
                      value={radioInfo.metadados_url || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, metadados_url: e.target.value })}
                      placeholder="URL da API de streaming"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== HISTÓRIA ===== */}
          {aba === 'historia' && (
            <div>
              <div className="admin-secao-header">
                <h3>Nossa História</h3>
              </div>
              <div className="admin-card">
                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: 14, lineHeight: 1.5 }}>
                  Este texto aparece na aba "Nossa História" do seu site. Conte quando a rádio surgiu,
                  a região que atende e o que ela representa para os ouvintes.
                </p>
                <label className="admin-field-label">Texto da história</label>
                <textarea
                  className="admin-input admin-textarea"
                  value={radioInfo.historia || ''}
                  onChange={(e) => setRadioInfo({ ...radioInfo, historia: e.target.value })}
                  rows={12}
                  placeholder="Ex: A Rádio Exemplo FM está no ar desde 1985, levando informação e cultura para toda a região..."
                />
                <p style={{ fontSize: '0.78rem', color: '#aaa', marginTop: 4 }}>
                  {(radioInfo.historia || '').length} caracteres
                </p>
              </div>
            </div>
          )}

          {/* ===== APARÊNCIA ===== */}
          {aba === 'aparencia' && (
            <div>
              <div className="admin-secao-header">
                <h3>Aparência</h3>
              </div>

              {!temFeature(plano, 'coresCustom') && (
                <UpgradeBadge planoNecessario={planoNecessario('coresCustom')} />
              )}

              {/* Cores */}
              <div className={`admin-card${!temFeature(plano, 'coresCustom') ? ' admin-feature-locked' : ''}`}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>🎨 Cores</h4>
                <div className="admin-prog-row">
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Primária</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={(radioInfo.tema?.corPrimaria) || '#1565C0'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corPrimaria: e.target.value } })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="admin-input" value={(radioInfo.tema?.corPrimaria) || '#1565C0'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corPrimaria: e.target.value } })} style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Secundária</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={(radioInfo.tema?.corSecundaria) || '#0D47A1'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corSecundaria: e.target.value } })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="admin-input" value={(radioInfo.tema?.corSecundaria) || '#0D47A1'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corSecundaria: e.target.value } })} style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Fundo</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={(radioInfo.tema?.corFundo) || '#F0F4F8'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corFundo: e.target.value } })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="admin-input" value={(radioInfo.tema?.corFundo) || '#F0F4F8'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corFundo: e.target.value } })} style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                  </div>
                </div>
                <div className="admin-prog-row" style={{ marginTop: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Cards</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={(radioInfo.tema?.corCards) || '#FFFFFF'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corCards: e.target.value } })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="admin-input" value={(radioInfo.tema?.corCards) || '#FFFFFF'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corCards: e.target.value } })} style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Texto</label>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={(radioInfo.tema?.corTexto) || '#1a1a1a'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corTexto: e.target.value } })} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                      <input className="admin-input" value={(radioInfo.tema?.corTexto) || '#1a1a1a'} onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, corTexto: e.target.value } })} style={{ flex: 1, marginBottom: 0 }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Arredondamento</label>
                    <select
                      className="admin-input"
                      value={(radioInfo.tema?.borderRadius) || '15px'}
                      onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, borderRadius: e.target.value } })}
                      style={{ marginBottom: 0 }}
                    >
                      <option value="0px">Quadrado</option>
                      <option value="6px">Sutil</option>
                      <option value="10px">Médio</option>
                      <option value="15px">Padrão</option>
                      <option value="20px">Arredondado</option>
                      <option value="30px">Muito arredondado</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Fontes */}
              <div className={`admin-card${!temFeature(plano, 'fontesCustom') ? ' admin-feature-locked' : ''}`}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12 }}>🔤 Fontes</h4>
                <div className="admin-prog-row">
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Fonte Principal</label>
                    <select
                      className="admin-input"
                      value={(radioInfo.tema?.fontePrincipal) || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, fontePrincipal: e.target.value } })}
                      style={{ marginBottom: 0 }}
                    >
                      <option value="">Padrão do sistema</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Nunito">Nunito</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Source Sans 3">Source Sans 3</option>
                      <option value="PT Sans">PT Sans</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="admin-field-label">Fonte dos Títulos</label>
                    <select
                      className="admin-input"
                      value={(radioInfo.tema?.fonteTitulos) || ''}
                      onChange={(e) => setRadioInfo({ ...radioInfo, tema: { ...radioInfo.tema, fonteTitulos: e.target.value } })}
                      style={{ marginBottom: 0 }}
                    >
                      <option value="">Mesma da principal</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Merriweather">Merriweather</option>
                      <option value="Oswald">Oswald</option>
                      <option value="Bebas Neue">Bebas Neue</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview compacto */}
              <div className="admin-card">
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>👁️ Preview</h4>
                <div style={{
                  background: radioInfo.tema?.corFundo || '#F0F4F8',
                  padding: 14,
                  borderRadius: radioInfo.tema?.borderRadius || '15px',
                  border: '1px solid #ddd',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'stretch',
                }}>
                  <div style={{
                    background: radioInfo.tema?.corPrimaria || '#1565C0',
                    color: '#fff',
                    padding: '10px 14px',
                    borderRadius: radioInfo.tema?.borderRadius || '15px',
                    fontFamily: radioInfo.tema?.fonteTitulos || radioInfo.tema?.fontePrincipal || 'inherit',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                  }}>
                    {radioInfo.nome || 'Rádio'}
                  </div>
                  <div style={{
                    background: radioInfo.tema?.corCards || '#fff',
                    padding: '10px 14px',
                    borderRadius: radioInfo.tema?.borderRadius || '15px',
                    color: radioInfo.tema?.corTexto || '#1a1a1a',
                    fontFamily: radioInfo.tema?.fontePrincipal || 'inherit',
                    fontSize: '0.82rem',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                    <span>Texto de exemplo</span>
                    <span style={{
                      background: radioInfo.tema?.corSecundaria || '#0D47A1',
                      color: '#fff',
                      borderRadius: '12px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>Botão</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== NOTÍCIAS ===== */}
          {aba === 'noticias' && (
            <div>
              <div className="admin-secao-header">
                <h3>Notícias</h3>
                <button className="admin-btn-add" onClick={addNoticia}>+ Adicionar</button>
              </div>
              {noticias.map((n, idx) => (
                <div key={idx} className="admin-card">
                  <div className="admin-card-header">
                    <span className="admin-card-num">#{idx + 1}</span>
                    <label className="admin-destaque-label">
                      <input
                        type="checkbox"
                        checked={!!n.destaque}
                        onChange={(e) => updateNoticia(idx, 'destaque', e.target.checked)}
                      />
                      Destaque
                    </label>
                    <button className="admin-btn-remove" onClick={() => removeNoticia(idx)}>✕</button>
                  </div>
                  <label className="admin-field-label">Título</label>
                  <input
                    className="admin-input"
                    value={n.titulo}
                    onChange={(e) => updateNoticia(idx, 'titulo', e.target.value)}
                    placeholder="Título da notícia"
                  />
                  <label className="admin-field-label">Resumo</label>
                  <textarea
                    className="admin-input admin-textarea"
                    value={n.resumo}
                    onChange={(e) => updateNoticia(idx, 'resumo', e.target.value)}
                    placeholder="Resumo da notícia"
                    rows={2}
                  />
                  <label className="admin-field-label">Imagem</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <input
                      className="admin-input"
                      value={n.img_url || n.img || ''}
                      onChange={(e) => updateNoticia(idx, 'img_url', e.target.value)}
                      placeholder="URL da imagem ou faça upload →"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <label className="admin-btn-upload">
                      📁
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const url = await uploadImage(file, 'noticias');
                          if (url) updateNoticia(idx, 'img_url', url);
                        }}
                      />
                    </label>
                  </div>
                  {(n.img_url || n.img) && (
                    <img src={n.img_url || n.img} alt="preview" className="admin-img-preview" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ===== PROGRAMAÇÃO ===== */}
          {aba === 'programacao' && (
            <div>
              <div className="admin-secao-header">
                <h3>Programação</h3>
                <button className="admin-btn-add" onClick={() => addProg(diaSel)}>+ Adicionar</button>
              </div>
              <div className="admin-dias-tabs">
                {DIAS_LABEL.map((d, i) => (
                  <button
                    key={i}
                    className={`admin-dia-tab${i === diaSel ? ' ativo' : ''}`}
                    onClick={() => setDiaSel(i)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {(programacao[diaSel] || []).map((item, idx) => (
                <div key={idx} className="admin-card admin-card-prog">
                  <div className="admin-card-header">
                    <span className="admin-card-num">#{idx + 1}</span>
                    <button className="admin-btn-remove" onClick={() => removeProg(diaSel, idx)}>✕</button>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Horário</label>
                      <input
                        className="admin-input"
                        value={item.time}
                        onChange={(e) => updateProg(diaSel, idx, 'time', e.target.value)}
                        placeholder="00:00 – 00:00"
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Programa</label>
                      <input
                        className="admin-input"
                        value={item.show}
                        onChange={(e) => updateProg(diaSel, idx, 'show', e.target.value)}
                        placeholder="Nome do programa"
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Locutor</label>
                      <input
                        className="admin-input"
                        value={item.locutor}
                        onChange={(e) => updateProg(diaSel, idx, 'locutor', e.target.value)}
                        placeholder="Deixe vazio para Auto DJ"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== LOCUTORES ===== */}
          {aba === 'locutores' && (
            <div>
              <div className="admin-secao-header">
                <h3>Locutores</h3>
                <button className="admin-btn-add" onClick={addLocutor}>+ Adicionar</button>
              </div>
              {locutores.map((l, idx) => (
                <div key={idx} className="admin-card">
                  <div className="admin-card-header">
                    <span className="admin-card-num">#{idx + 1}</span>
                    <button className="admin-btn-remove" onClick={() => removeLocutor(idx)}>✕</button>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Nome</label>
                      <input
                        className="admin-input"
                        value={l.nome}
                        onChange={(e) => updateLocutor(idx, 'nome', e.target.value)}
                        placeholder="Nome do locutor"
                      />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Função</label>
                      <input
                        className="admin-input"
                        value={l.funcao}
                        onChange={(e) => updateLocutor(idx, 'funcao', e.target.value)}
                        placeholder="Ex: Locutor / Apresentador"
                      />
                    </div>
                  </div>
                  <label className="admin-field-label">Descrição</label>
                  <textarea
                    className="admin-input admin-textarea"
                    value={l.descricao}
                    onChange={(e) => updateLocutor(idx, 'descricao', e.target.value)}
                    placeholder="Breve descrição do locutor"
                    rows={2}
                  />
                  <label className="admin-field-label">Programas (separados por vírgula)</label>
                  <input
                    className="admin-input"
                    value={(l.programas || []).join(', ')}
                    onChange={(e) => updateLocutor(idx, 'programas', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Programa 1, Programa 2"
                  />
                  <label className="admin-field-label">Foto</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <input
                      className="admin-input"
                      value={l.foto_url || ''}
                      onChange={(e) => updateLocutor(idx, 'foto_url', e.target.value)}
                      placeholder="URL ou faça upload →"
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <label className="admin-btn-upload">
                      📁
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleLocutorFoto(idx, file);
                        }}
                      />
                    </label>
                  </div>
                  {l.foto_url && (
                    <img src={l.foto_url} alt="preview" className="admin-img-preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ===== PATROCINADORES ===== */}
          {aba === 'patrocinadores' && (
            <div>
              <div className="admin-secao-header">
                <h3>Apoio Cultural / Patrocinadores</h3>
                <button className="admin-btn-add" onClick={addPat}>+ Adicionar</button>
              </div>
              {patrocinadores.map((p, idx) => (
                <div key={idx} className="admin-card">
                  <div className="admin-card-header">
                    <span className="admin-card-num" style={{ background: p.cor }}>#{idx + 1}</span>
                    <button className="admin-btn-remove" onClick={() => removePat(idx)}>✕</button>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: '0 0 60px' }}>
                      <label className="admin-field-label">Emoji</label>
                      <input className="admin-input" value={p.emoji} onChange={(e) => updatePat(idx, 'emoji', e.target.value)} placeholder="🏪" />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Nome</label>
                      <input className="admin-input" value={p.nome} onChange={(e) => updatePat(idx, 'nome', e.target.value)} placeholder="Nome do patrocinador" />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Slogan</label>
                      <input className="admin-input" value={p.slogan} onChange={(e) => updatePat(idx, 'slogan', e.target.value)} placeholder="Slogan" />
                    </div>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Cor</label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={p.cor} onChange={(e) => updatePat(idx, 'cor', e.target.value)} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="admin-input" value={p.cor} onChange={(e) => updatePat(idx, 'cor', e.target.value)} style={{ flex: 1 }} />
                      </div>
                    </div>
                    <div style={{ flex: 3 }}>
                      <label className="admin-field-label">Link (site ou WhatsApp)</label>
                      <input className="admin-input" value={p.href} onChange={(e) => updatePat(idx, 'href', e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ===== COMERCIAL ===== */}
          {aba === 'comercial' && (
            <div>
              <div className="admin-secao-header">
                <h3>Planos Comerciais</h3>
                <button className="admin-btn-add" onClick={() => setPlanosComerciais([...planosComerciais, { nome: '', descricao: '', preco: '', itens: [], destaque: false }])}>+ Adicionar</button>
              </div>
              {planosComerciais.map((p, idx) => (
                <div key={idx} className="admin-card">
                  <div className="admin-card-header">
                    <span className="admin-card-num">#{idx + 1}</span>
                    <label className="admin-destaque-label">
                      <input
                        type="checkbox"
                        checked={!!p.destaque}
                        onChange={(e) => {
                          const arr = [...planosComerciais];
                          arr[idx] = { ...arr[idx], destaque: e.target.checked };
                          setPlanosComerciais(arr);
                        }}
                      />
                      Destaque
                    </label>
                    <button className="admin-btn-remove" onClick={() => setPlanosComerciais(planosComerciais.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Nome do Plano</label>
                      <input
                        className="admin-input"
                        value={p.nome}
                        onChange={(e) => {
                          const arr = [...planosComerciais];
                          arr[idx] = { ...arr[idx], nome: e.target.value };
                          setPlanosComerciais(arr);
                        }}
                        placeholder="Ex: Apoio Cultural"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Preço</label>
                      <input
                        className="admin-input"
                        value={p.preco}
                        onChange={(e) => {
                          const arr = [...planosComerciais];
                          arr[idx] = { ...arr[idx], preco: e.target.value };
                          setPlanosComerciais(arr);
                        }}
                        placeholder="R$ 150/mês"
                      />
                    </div>
                  </div>
                  <label className="admin-field-label">Descrição</label>
                  <input
                    className="admin-input"
                    value={p.descricao}
                    onChange={(e) => {
                      const arr = [...planosComerciais];
                      arr[idx] = { ...arr[idx], descricao: e.target.value };
                      setPlanosComerciais(arr);
                    }}
                    placeholder="Breve descrição do plano"
                  />
                  <label className="admin-field-label">Itens inclusos (um por linha)</label>
                  <textarea
                    className="admin-input admin-textarea"
                    value={(p.itens || []).join('\n')}
                    onChange={(e) => {
                      const arr = [...planosComerciais];
                      arr[idx] = { ...arr[idx], itens: e.target.value.split('\n').filter(Boolean) };
                      setPlanosComerciais(arr);
                    }}
                    rows={4}
                    placeholder={"Item 1\nItem 2\nItem 3"}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ===== BANNERS (Premium) ===== */}
          {aba === 'banners' && (
            <div>
              <div className="admin-secao-header">
                <h3>Banners de Publicidade</h3>
                <button className="admin-btn-add" onClick={() => setBanners([...banners, { titulo: '', subtitulo: '', cta: '', href: '#', cor: '#1565C0', cor_texto: '#ffffff', tag: 'PUBLICIDADE', imagem_url: '' }])}>+ Adicionar</button>
              </div>
              {banners.map((b, idx) => (
                <div key={idx} className="admin-card">
                  <div className="admin-card-header">
                    <span className="admin-card-num">#{idx + 1}</span>
                    <button className="admin-btn-remove" onClick={() => setBanners(banners.filter((_, i) => i !== idx))}>✕</button>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Título / Empresa</label>
                      <input className="admin-input" value={b.titulo} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], titulo: e.target.value }; setBanners(arr); }} placeholder="Nome do anunciante" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Tag</label>
                      <input className="admin-input" value={b.tag} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], tag: e.target.value }; setBanners(arr); }} placeholder="PUBLICIDADE" />
                    </div>
                  </div>
                  <label className="admin-field-label">Subtítulo / Oferta</label>
                  <input className="admin-input" value={b.subtitulo} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], subtitulo: e.target.value }; setBanners(arr); }} placeholder="Descrição curta da promoção" />
                  <div className="admin-prog-row">
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Botão CTA</label>
                      <input className="admin-input" value={b.cta} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], cta: e.target.value }; setBanners(arr); }} placeholder="Ex: Saiba mais" />
                    </div>
                    <div style={{ flex: 2 }}>
                      <label className="admin-field-label">Link</label>
                      <input className="admin-input" value={b.href} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], href: e.target.value }; setBanners(arr); }} placeholder="https://..." />
                    </div>
                  </div>
                  <div className="admin-prog-row">
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Cor de Fundo</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={b.cor || '#1565C0'} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], cor: e.target.value }; setBanners(arr); }} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="admin-input" value={b.cor} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], cor: e.target.value }; setBanners(arr); }} style={{ flex: 1, marginBottom: 0 }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="admin-field-label">Cor do Texto</label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="color" value={b.cor_texto || '#ffffff'} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], cor_texto: e.target.value }; setBanners(arr); }} style={{ width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                        <input className="admin-input" value={b.cor_texto} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], cor_texto: e.target.value }; setBanners(arr); }} style={{ flex: 1, marginBottom: 0 }} />
                      </div>
                    </div>
                  </div>
                  <label className="admin-field-label">Imagem (opcional — substitui cor/texto)</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <input className="admin-input" value={b.imagem_url || ''} onChange={(e) => { const arr = [...banners]; arr[idx] = { ...arr[idx], imagem_url: e.target.value }; setBanners(arr); }} placeholder="URL da imagem ou faça upload →" style={{ flex: 1, marginBottom: 0 }} />
                    <label className="admin-btn-upload">
                      📁
                      <input type="file" accept="image/*" hidden onChange={async (e) => { const file = e.target.files[0]; if (!file) return; const url = await uploadImage(file, 'banners'); if (url) { const arr = [...banners]; arr[idx] = { ...arr[idx], imagem_url: url }; setBanners(arr); } }} />
                    </label>
                  </div>
                  {/* Preview */}
                  <div style={{ borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
                    {b.imagem_url ? (
                      <img src={b.imagem_url} alt="preview" style={{ width: '100%', height: 60, objectFit: 'cover' }} />
                    ) : b.titulo && (
                      <div style={{ background: b.cor, color: b.cor_texto, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          {b.tag && <div style={{ fontSize: '0.6rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>{b.tag}</div>}
                          <strong style={{ fontSize: '0.85rem' }}>{b.titulo}</strong>
                          {b.subtitulo && <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>{b.subtitulo}</div>}
                        </div>
                        {b.cta && <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: '4px 10px', fontSize: '0.72rem', fontWeight: 700 }}>{b.cta} →</div>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="admin-footer">
          💡 Alterações são salvas no servidor e ficam disponíveis pra todos os visitantes.
        </div>
      </div>
    </div>
  );
}
